'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiMenu, FiX, FiPrinter, FiAlertCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

interface CheckInData {
  nomor_plat: string;
  jenis_parkir: string;
  waktu_masuk: string;
  id_arf: string;
}

interface StrukData {
  nomor_transaksi: string;
  nomor_plat: string;
  jenis_parkir: string;
  waktu_masuk: string;
  area_parkir?: string;
}

interface JenisParkir {
  id_jenis_parkir: number;
  nama_jenis: string;
  deskripsi: string;
}

const TARIF = {
  motor: { awal: 2000, perjam: 1000 },
  mobil: { awal: 5000, perjam: 2000 },
};

// Map display `nama_jenis` to internal key used in form (`motor`, `mobil`, `vip`, etc.)
const mapNamaJenisToKey = (name: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('motor')) return 'motor';
  if (lower.includes('muatan')) return 'mobil_muatan';
  if (lower.includes('mobil')) return 'mobil';
  if (lower.includes('vip')) return 'vip';
  // fallback: slugify
  return lower.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
};

export default function PetugasParkirPage() {
  const router = useRouter();
  const { isAuthenticated, user, isChecking } = useProtectedRoute();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const [formData, setFormData] = useState<CheckInData>({
    nomor_plat: '',
    jenis_parkir: '',
    waktu_masuk: new Date().toISOString().slice(0, 16),
    id_arf: '',
  });

  const [strukData, setStrukData] = useState<StrukData | null>(null);
  const [showStruk, setShowStruk] = useState(false);
  const [arfList, setArfList] = useState<any[]>([]);
  const [jenisParkir, setJenisParkir] = useState<JenisParkir[]>([]);
   const [occupancyByJenis, setOccupancyByJenis] = useState<Record<string, { kapasitas: number; occupied: number; remaining: number }>>({});

  useEffect(() => {
    if (isChecking) return;
    
    if (user && user.role !== 'petugas') {
      router.push(`/dashboard/${user.role}`);
    }
    // Fetch area parkir and jenis parkir
    fetchArf();
    fetchJenisParkir();
    fetchOccupancyByJenis();
  }, [user, router, isChecking]);

  // Refresh area occupancy when selected jenis changes
  useEffect(() => {
    // only refetch occupancy if a jenis is selected
    fetchArf();
  }, [formData.jenis_parkir]);

  // Auto-select area when arfList updates
  useEffect(() => {
    if (arfList.length > 0 && !formData.id_arf) {
      // If jenis_parkir is already selected, find matching area
      if (formData.jenis_parkir) {
        const jenis = formData.jenis_parkir as 'motor' | 'mobil';
        const chosen = arfList.find(a =>
          Array.isArray(a.jenis_parkir_yang_didukung) &&
          a.jenis_parkir_yang_didukung.includes(jenis)
        );
        if (chosen) {
          setFormData(prev => ({ ...prev, id_arf: String(chosen.id_arf) }));
        }
      }
    }
    // Clear error when areas loaded successfully
    setError(null);
    setSubmitAttempted(false);
  }, [arfList]);

  const fetchArf = async () => {
    // Fetch occupancy info from backend and filter client-side based on jenis
    const requiredAreas = [
      { id_arf: 6, nama_area: 'Area Outdoor', kapasitas: 81, jenis_parkir_yang_didukung: ['motor', 'mobil', 'mobil_muatan'], status: 'aktif', createdAt: new Date(), updatedAt: new Date(), occupied: 0, remaining: 81 },
      { id_arf: 7, nama_area: 'Area VIP', kapasitas: 90, jenis_parkir_yang_didukung: ['motor', 'mobil'], status: 'aktif', createdAt: new Date(), updatedAt: new Date(), occupied: 0, remaining: 90 },
      { id_arf: 8, nama_area: 'Area Motor Depan', kapasitas: 150, jenis_parkir_yang_didukung: ['motor'], status: 'aktif', createdAt: new Date(), updatedAt: new Date(), occupied: 0, remaining: 150 },
      { id_arf: 9, nama_area: 'Area Mobil Basement', kapasitas: 129, jenis_parkir_yang_didukung: ['mobil'], status: 'aktif', createdAt: new Date(), updatedAt: new Date(), occupied: 0, remaining: 129 },
    ];

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const tokenValue = parsed?.token ?? parsed?.state?.token ?? parsed?.auth?.token ?? parsed;
          if (typeof tokenValue === 'string' && tokenValue.length > 0) {
            headers.Authorization = `Bearer ${tokenValue}`;
            console.log('[fetchArf] Token parsed successfully');
          }
        } catch (e) {
          console.error('[fetchArf] Error parsing token:', e);
          if (typeof raw === 'string' && raw.length > 0) {
            headers.Authorization = `Bearer ${raw}`;
            console.log('[fetchArf] Using raw token as fallback');
          }
        }
      } else {
        console.warn('[fetchArf] No token found in localStorage');
      }

      console.log('[fetchArf] Fetching from:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/arf/occupancy`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/arf/occupancy`,
        { headers }
      );

      const areas = response.data.data || [];
      console.log('[fetchArf] API returned', areas.length, 'areas');

      // Merge with requiredAreas to guarantee presence
      const finalMap: Record<number, any> = {};
      requiredAreas.forEach((r) => { finalMap[r.id_arf] = { ...r }; });
      areas.forEach((a: any) => {
        finalMap[a.id_arf] = { ...finalMap[a.id_arf], ...a };
      });

      const finalList = Object.values(finalMap);
      console.log('✅ Fetched parking areas occupancy:', finalList.map((a: any) => `${a.nama_area} (remaining:${a.remaining})`));
      setArfList(finalList);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error fetching area occupancy from API:', error?.response?.status, error?.message);
      console.log('⚠️  Using fallback areas');
      setArfList(requiredAreas);
    }
  };

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });

  // Derived list filtered by selected jenis_parkir (for dropdown)
  const filteredArfList = (() => {
    if (!formData.jenis_parkir) return arfList;
    const chosenJenis = formData.jenis_parkir.toLowerCase();
    return arfList.filter((a: any) => {
      const supported = Array.isArray(a.jenis_parkir_yang_didukung)
        ? a.jenis_parkir_yang_didukung
        : (a.jenis_parkir_yang_didukung ? JSON.parse(a.jenis_parkir_yang_didukung) : []);

      if (chosenJenis.includes('vip')) {
        // VIP can be both motor and mobil areas; include areas that support either OR have VIP in name
        return supported.includes('motor') || supported.includes('mobil') || (a.nama_area || '').toLowerCase().includes('vip');
      }
      return supported.includes(chosenJenis);
    });
  })();

  apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
    if (token) {
      try {
        const { state } = JSON.parse(token);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    return config;
  });

  const fetchJenisParkir = async () => {
    try {
      const response = await apiClient.get('/jenis-parkir?limit=100');
      const data = response.data.data || [];
      // Filter to only show Motor and Mobil
      const filtered = data.filter((j: JenisParkir) => 
        j.nama_jenis.toLowerCase().includes('motor') || j.nama_jenis.toLowerCase().includes('mobil')
      );
      setJenisParkir(filtered);
      console.log('✅ Fetched jenis parkir:', filtered.map((j: JenisParkir) => j.nama_jenis));
    } catch (error) {
      console.error('❌ Error fetching jenis parkir:', error);
    }
  };

  const fetchOccupancyByJenis = async () => {
    try {
      const response = await apiClient.get('/jenis-parkir/occupancy', { params: { limit: 100 } });
      const data = response.data.data || [];
      const occupancy: Record<string, { kapasitas: number; occupied: number; remaining: number }> = {};
      
      data.forEach((j: any) => {
        occupancy[j.nama_jenis] = {
          kapasitas: j.kapasitas || 0,
          occupied: j.occupied || 0,
          remaining: (j.kapasitas || 0) - (j.occupied || 0),
        };
      });
      
      setOccupancyByJenis(occupancy);
      console.log('✅ Fetched occupancy:', occupancy);
    } catch (error) {
      console.error('❌ Error fetching occupancy:', error);
      // Fallback: set default values from jenisParkir
      const fallback: Record<string, { kapasitas: number; occupied: number; remaining: number }> = {};
      jenisParkir.forEach((j) => {
        fallback[j.nama_jenis] = {
          kapasitas: j.kapasitas || 0,
          occupied: 0,
          remaining: j.kapasitas || 0,
        };
      });
      setOccupancyByJenis(fallback);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const findAreaForJenis = (jenis: 'motor' | 'mobil' | 'mobil_muatan') => {
    console.log(`🔍 Finding area for jenis: ${jenis}, available areas:`, arfList.map(a => ({ nama: a.nama_area, jenis: a.jenis_parkir_yang_didukung })));
    
    // Untuk mobil_muatan, auto-select Area Outdoor
    if (jenis === 'mobil_muatan') {
      const outdoor = arfList.find(a => 
        (a.nama_area || '').toLowerCase().includes('outdoor')
      );
      console.log(`  - Mobil muatan auto-select: ${outdoor?.nama_area || 'none'}`);
      return outdoor;
    }
    
    // Cari area yang nama_area-nya mengandung kata jenis (prioritas)
    const preferred = arfList.find(a =>
      Array.isArray(a.jenis_parkir_yang_didukung) &&
      a.jenis_parkir_yang_didukung.includes(jenis) &&
      (a.nama_area || '').toLowerCase().includes(jenis)
    );
    console.log(`  - Preferred match: ${preferred?.nama_area || 'none'}`);
    
    // Fallback: pilih area pertama yang mendukung jenis
    const fallback = arfList.find(a =>
      Array.isArray(a.jenis_parkir_yang_didukung) &&
      a.jenis_parkir_yang_didukung.includes(jenis)
    );
    console.log(`  - Fallback match: ${fallback?.nama_area || 'none'}`);
    
    const result = preferred || fallback;
    console.log(`  ✓ Final result: ${result?.nama_area} (id: ${result?.id_arf})`);
    return result;
  };

  const findJenisForArea = (selectedArea: any) => {
    if (!selectedArea || !Array.isArray(selectedArea.jenis_parkir_yang_didukung)) {
      return ''; // default kosong
    }
    const supportedTypes = selectedArea.jenis_parkir_yang_didukung;
    // Jika hanya support 1 jenis, set otomatis
    if (supportedTypes.length === 1) {
      return supportedTypes[0];
    }
    // Jika support 2+ jenis, jangan set otomatis (biarkan user pilih)
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user makes changes
    setError(null);

    // Jika area parkir berubah, auto-set jenis parkir
    if (name === 'id_arf') {
      if (value) {
        const selectedArea = arfList.find(a => a.id_arf === parseInt(value));
        const newJenis = findJenisForArea(selectedArea);
        setFormData(prev => ({ ...prev, [name]: value, jenis_parkir: newJenis }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Jika jenis parkir berubah, auto-set area
    if (name === 'jenis_parkir' && value) {
      const jenis = value as 'motor' | 'mobil' | 'mobil_muatan';
      const chosen = findAreaForJenis(jenis);
      setFormData(prev => ({
        ...prev,
        jenis_parkir: jenis,
        id_arf: chosen ? String(chosen.id_arf) : prev.id_arf,
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!formData.nomor_plat) {
      setError('Nomor plat harus diisi');
      return;
    }

    if (!formData.jenis_parkir) {
      setError('Jenis kendaraan harus dipilih');
      return;
    }

    // If area not set, try to auto-select based on jenis_parkir
    let areaId = formData.id_arf;
    if (!areaId && formData.jenis_parkir) {
      const jenis = formData.jenis_parkir as 'motor' | 'mobil' | 'mobil_muatan';
      const chosen = findAreaForJenis(jenis);
      if (chosen) {
        areaId = String(chosen.id_arf);
      } else {
        setError(`Tidak ada area parkir yang tersedia untuk ${formData.jenis_parkir}`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Hit API check-in with automatic current time
      // IMPORTANT: Database mapping is:
      //   id_jenis_parkir = 1 → "Parkir Mobil" (mobil)
      //   id_jenis_parkir = 2 → "Parkir Motor" (motor)
      //   id_jenis_parkir = 6 → "Parkir Mobil Muatan" (mobil_muatan)
      let jenisId = 1; // default mobil
      if (formData.jenis_parkir === 'motor') jenisId = 2;
      else if (formData.jenis_parkir === 'mobil_muatan') jenisId = 6;
      
      const payload: any = {
        nomor_plat: formData.nomor_plat.toUpperCase(),
        id_jenis_parkir: jenisId,
      };
      
      // Ensure id_arf is sent as number if available
      if (areaId) {
        const numAreaId = parseInt(areaId);
        if (!isNaN(numAreaId)) {
          payload.id_arf = numAreaId;
          console.log('📤 Payload to send:', payload);
        }
      }

      const response = await apiClient.post('/transaksi/checkin', payload);

      if (response.data.success) {
        const tarif = TARIF[formData.jenis_parkir as keyof typeof TARIF];
        const selectedArf = arfList.find(a => a.id_arf === parseInt(formData.id_arf));
        
        let jenisDisplay = 'Mobil';
        if (formData.jenis_parkir === 'motor') jenisDisplay = 'Motor';
        else if (formData.jenis_parkir === 'mobil_muatan') jenisDisplay = 'Mobil Muatan';
        
        setStrukData({
          nomor_transaksi: response.data.data.id_transaksi || 'TRX' + Date.now(),
          nomor_plat: formData.nomor_plat.toUpperCase(),
          jenis_parkir: jenisDisplay,
          waktu_masuk: new Date(response.data.data.waktu_masuk).toLocaleString('id-ID'),
          area_parkir: selectedArf?.nama_area || undefined,
        });

        setShowStruk(true);
        setSuccess('Check-in berhasil!');
        
        // Reset form
        setFormData({
          nomor_plat: '',
          jenis_parkir: '',
          waktu_masuk: new Date().toISOString().slice(0, 16),
          id_arf: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal check-in. Silakan coba lagi.');
      console.error('Check-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintStruk = () => {
    if (!strukData) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const tanggal = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Struk Parkir</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 10px;
                background: white;
                width: 80mm;
                margin: 0;
              }
              .struk {
                width: 100%;
                padding: 10px 0;
                margin: 0 auto;
              }
              .header-date {
                text-align: center;
                font-size: 11px;
                margin-bottom: 10px;
              }
              .separator {
                text-align: center;
                font-size: 11px;
                letter-spacing: 2px;
                margin: 5px 0;
              }
              .title {
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                margin: 5px 0;
              }
              .address {
                text-align: center;
                font-size: 10px;
                margin-bottom: 10px;
              }
              .section {
                margin: 10px 0;
                font-size: 11px;
              }
              .line {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
              }
              .label {
                width: 120px;
              }
              .value {
                text-align: right;
                flex: 1;
              }
              .section-divider {
                border-top: 1px dashed #333;
                margin: 5px 0;
              }
              .status {
                text-align: center;
                font-weight: bold;
                margin: 10px 0;
                font-size: 11px;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 10px;
                line-height: 1.4;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  width: 80mm;
                }
              }
            </style>
          </head>
          <body>
                <div class="line">
                  <span class="label">Jenis Kendaraan :</span>
                  <span class="value">${strukData.jenis_parkir.charAt(0).toUpperCase() + strukData.jenis_parkir.slice(1)}</span>
                </div>
                <div class="line">
                  <span class="label">Waktu Masuk</span>
                  <span class="value">: ${strukData.waktu_masuk}</span>
                </div>
                <div class="line">
                  <span class="label">Area Parkir</span>
                  <span class="value">: ${strukData.area_parkir || '-'}</span>
                </div>
                  <span class="label">Waktu Masuk</span>
                  <span class="value">: ${strukData.waktu_masuk}</span>
                </div>
                <div class="line">
                  <span class="label">Area Parkir</span>
                  <span class="value">: ${strukData.area_parkir || '-'}</span>
                </div>
              </div>

              <div class="separator">=================================</div>

              <div class="footer">
                <p>Terima kasih telah parkir</p>
                <p>di PARKIR PLUS</p>
              </div>

              <div class="separator">=================================</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const menuItems = [
    { label: 'Check-in Parkir', href: '/dashboard/petugas', icon: '🚗' },
    { label: 'Check-out Parkir', href: '/dashboard/petugas/checkout', icon: '🚪' },
    { label: 'Riwayat Transaksi', href: '/dashboard/transaksi', icon: '📋' },
  ];

  if (!isAuthenticated || user?.role !== 'petugas' || isChecking) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-orange-900 to-orange-800 text-white transition-all duration-300 overflow-hidden fixed left-0 top-0 h-screen z-30 flex flex-col`}
      >
        <div className="p-6 border-b border-orange-700 flex-shrink-0">
          <h1 className="text-2xl font-bold">Parkir Plus</h1>
          <p className="text-orange-200 text-sm">Petugas Parkir</p>
        </div>

        <nav className="mt-6 space-y-2 px-4 overflow-y-auto flex-1 min-h-0">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors text-orange-100 hover:text-white"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Check-in Parkir</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user?.nama_lengkap}</p>
                <p className="text-xs text-orange-600 font-semibold uppercase">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Check-in */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📝 Form Check-in Parkir</h3>

                {error && submitAttempted && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p className="text-green-700">{success}</p>
                  </div>
                )}

                <form onSubmit={handleCheckIn} className="space-y-4">
                  {/* Nomor Plat */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Plat *
                    </label>
                    <input
                      type="text"
                      name="nomor_plat"
                      value={formData.nomor_plat}
                      onChange={handleInputChange}
                      placeholder="Contoh: B 1234 ABC"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  {/* Jenis Parkir */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Kendaraan {formData.id_arf && formData.jenis_parkir && <span className="text-xs text-orange-600">(Otomatis sesuai area)</span>}
                    </label>
                    {/* Cek apakah area dipilih dan hanya support 1 jenis */}
                    {formData.id_arf && arfList.find(a => a.id_arf === parseInt(formData.id_arf))?.jenis_parkir_yang_didukung?.length === 1 ? (
                      // Tampilkan sebagai display ketika area hanya support 1 jenis (otomatis)
                      <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                        {jenisParkir.find(j => j.nama_jenis.toLowerCase().includes(formData.jenis_parkir.toLowerCase()))?.nama_jenis || formData.jenis_parkir}
                      </div>
                    ) : (
                      // Tampilkan dropdown untuk area belum dipilih atau area support 2+ jenis
                      <select
                        name="jenis_parkir"
                        value={formData.jenis_parkir}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required={submitAttempted && !formData.jenis_parkir}
                      >
                        <option value="">-- Pilih Jenis Kendaraan --</option>
                        {jenisParkir.map((jenis) => (
                          <option key={jenis.id_jenis_parkir} value={mapNamaJenisToKey(jenis.nama_jenis)}>
                            {jenis.nama_jenis}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Waktu Masuk (Read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Waktu Masuk
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleString('id-ID')}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Area Parkir */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area Parkir (opsional)
                    </label>
                    <select
                      name="id_arf"
                      value={formData.id_arf}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">-- Pilih Area Parkir --</option>
                      {Array.isArray(filteredArfList) && filteredArfList.length > 0 ? (
                        filteredArfList.map((arf: any) => (
                          <option key={arf?.id_arf || 'default'} value={arf?.id_arf || ''}>
                            {arf?.nama_area || 'Unnamed Area'} — {typeof arf.remaining === 'number' ? `${arf.remaining} slot tersisa` : 'memuat...'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {arfList?.length === 0 ? 'Tidak ada area parkir' : 'Memuat area parkir...'}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6"
                  >
                    {loading ? 'Memproses...' : '✓ Check-in Kendaraan'}
                  </button>
                </form>
              </div>

              {/* Struk Parkir */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">🎫 Struk Parkir</h3>

                {showStruk && strukData ? (
                  <div className="space-y-4">
                    {/* Preview Struk */}
                    <div className="border-2 dashed border-orange-300 rounded-lg p-6 bg-orange-50">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-orange-900">PARKIR PLUS</h4>
                        <p className="text-xs text-orange-700">Sistem Manajemen Parkir Modern</p>
                      </div>

                      <div className="space-y-3 text-sm font-mono">
                        <div className="flex justify-between">
                          <span>No. Transaksi:</span>
                          <span className="font-bold">{strukData.nomor_transaksi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Jenis:</span>
                          <span className="font-bold">{strukData.jenis_parkir}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plat Nomor:</span>
                          <span className="font-bold">{strukData.nomor_plat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Area Parkir:</span>
                          <span className="font-bold">{strukData.area_parkir}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waktu Masuk:</span>
                          <span className="font-bold">{strukData.waktu_masuk}</span>
                        </div>
                        {/* Tarif will be calculated at checkout */}
                      </div>

                      <div className="text-center mt-6 text-xs text-orange-700">
                        <p>Terima kasih telah mempercayai kami</p>
                        <p>Simpan struk ini sebagai bukti parkir</p>
                      </div>
                    </div>

                    {/* Print Button */}
                    <button
                      onClick={handlePrintStruk}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPrinter size={20} />
                      Cetak Struk
                    </button>

                    {/* New Check-in Button */}
                    <button
                      onClick={() => {
                        setShowStruk(false);
                        setSuccess(null);
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      Check-in Kendaraan Baru
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">📋</p>
                    <p>Struk akan muncul setelah check-in berhasil</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-pink-50 border border-pink-200 rounded-lg p-6">
              <h4 className="font-bold text-pink-900 mb-3">📌 Informasi Tarif</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-pink-900">🏍️ Motor</p>
                  <p className="text-pink-800">• Tarif Awal: Rp 2.000</p>
                  <p className="text-pink-800">• Per Jam: Rp 1.000</p>
                </div>
                <div>
                  <p className="font-semibold text-pink-900">🚗 Mobil</p>
                  <p className="text-pink-800">• Tarif Awal: Rp 5.000</p>
                  <p className="text-pink-800">• Per Jam: Rp 2.000</p>
                </div>
                <div>
                  <p className="font-semibold text-pink-900">⭐ VIP</p>
                  <p className="text-pink-800">• Tarif Awal: Rp 50.000</p>
                  <p className="text-pink-800">• Per Jam: Rp 10.000</p>
                </div>
                <div>
                  <p className="font-semibold text-pink-900">🌳 Outdoor</p>
                  <p className="text-pink-800">• Tarif Awal: Rp 10.000</p>
                  <p className="text-pink-800 text-xs italic">• (hanya dihitung per hari)</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
