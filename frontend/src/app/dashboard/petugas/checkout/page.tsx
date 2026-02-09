'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiMenu, FiX, FiPrinter, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

interface CheckOutData {
  nomor_plat: string;
  waktu_masuk: string;
  waktu_keluar: string;
}

interface TransaksiDetail {
  id_transaksi: number;
  nomor_plat: string;
  jenis_parkir: string;
  waktu_masuk: string;
  waktu_keluar?: string;
  area_parkir: string;
  tarif_per_jam: number;
  tarif_awal: number;
  durasi?: number;
  total_bayar?: number;
  metode_pembayaran?: string;
  status: string;
}

const TARIF = {
  motor: { pertama: 2000, lanjutan: 2000 },
  mobil: { pertama: 5000, lanjutan: 4000 },
  truk: { pertama: 10000, lanjutan: 5000 },
  bus: { pertama: 15000, lanjutan: 7500 },
};

// Helper function to map jenis_parkir to tarif key
const getTarifKey = (jenisParkir: string): keyof typeof TARIF => {
  const lower = jenisParkir.toLowerCase();
  if (lower.includes('motor')) return 'motor';
  if (lower.includes('mobil')) return 'mobil';
  if (lower.includes('truk')) return 'truk';
  if (lower.includes('bus')) return 'bus';
  return 'mobil'; // default to mobil
};

export default function CheckOutPage() {
  const router = useRouter();
  const { isAuthenticated, user, isChecking } = useProtectedRoute();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [nomor_plat, setNomorPlat] = useState('');
  const [metode_pembayaran, setMetodePembayaran] = useState<'tunai' | 'qris'>('tunai');
  const [uangDibayar, setUangDibayar] = useState<number | ''>('');
  const [transaksiList, setTransaksiList] = useState<TransaksiDetail[]>([]);
  const [selectedTransaksi, setSelectedTransaksi] = useState<TransaksiDetail | null>(null);
  const [hitungData, setHitungData] = useState<TransaksiDetail | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isChecking) return;
    
    // Allow both 'operator' and 'petugas' roles to access the checkout page
    if (user && user.role !== 'operator' && user.role !== 'petugas') {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router, isChecking]);

  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
    headers: { 'Content-Type': 'application/json' },
  });

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fetchAktifTransaksi = async (plat: string) => {
    if (!plat) {
      setTransaksiList([]);
      setSelectedTransaksi(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/transaksi/aktif', {
        params: { nomor_plat: plat.toUpperCase() },
      });

      if (response.data.success && response.data.data) {
        const trx = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        
        // Transform API response ke format yang expected
        const transformedData = trx.map((item: any) => ({
          id_transaksi: item.id_transaksi,
          nomor_plat: item.nomor_plat || item.Kendaraan?.no_polisi || '-',
          jenis_parkir: item.jenis_parkir || item.JenisParkir?.nama_jenis || '-',
          waktu_masuk: item.waktu_masuk,
          waktu_keluar: item.waktu_keluar,
          area_parkir: item.area_parkir || item.Arf?.nama_area || '-',
          tarif_per_jam: 2000,
          tarif_awal: 5000,
        }));
        
        setTransaksiList(transformedData);
        if (transformedData.length === 1) {
          setSelectedTransaksi(transformedData[0]);
        }
      } else {
        setTransaksiList([]);
        setSelectedTransaksi(null);
        setError('Tidak ada transaksi aktif untuk nomor plat ini');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mencari transaksi aktif');
      setTransaksiList([]);
      setSelectedTransaksi(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNomorPlat(value);
    if (value.length >= 2) {
      fetchAktifTransaksi(value);
    }
  };

  const handleHitung = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTransaksi) {
      setError('Pilih transaksi terlebih dahulu');
      return;
    }

    const waktuMasuk = new Date(selectedTransaksi.waktu_masuk).getTime();
    const waktuKeluar = new Date().getTime(); // Use current time

    // Calculate durasi in hours (ceiling)
    const durasiMs = waktuKeluar - waktuMasuk;
    const durasiJam = Math.ceil(durasiMs / (1000 * 60 * 60));

    const tarifKey = getTarifKey(selectedTransaksi.jenis_parkir);
    const tarif = TARIF[tarifKey];
    // Calculate: first hour + (remaining hours * rate)
    const totalBayar = durasiJam === 1 
      ? tarif.pertama 
      : tarif.pertama + ((durasiJam - 1) * tarif.lanjutan);

    setHitungData({
      ...selectedTransaksi,
      waktu_keluar: new Date(waktuKeluar).toLocaleString('id-ID'),
      durasi: durasiJam,
      total_bayar: totalBayar,
    });

    // Generate QR Code jika QRIS
    if (metode_pembayaran === 'qris') {
      const QRCode = require('qrcode');
      const qrData = `00020126360014id.co.bri.bris0015100000000000303270215parkir${selectedTransaksi.id_transaksi}5204581553033605802id5913PARKIR PLUS6009JAKARTA62410521QRIS${totalBayar}63040623`;
      QRCode.toDataURL(qrData, { width: 150 }, (err: any, url: string) => {
        if (!err) {
          setQrCodeUrl(url);
        }
      });
    } else {
      setQrCodeUrl(null);
    }

    setShowPreview(true);
    setError(null);
  };

  const handleCheckOut = async () => {
    if (!selectedTransaksi || !hitungData) return;

    try {
      setLoading(true);
      const response = await apiClient.put(
        `/transaksi/${selectedTransaksi.id_transaksi}/checkout`,
        {
          total_bayar: hitungData.total_bayar,
          metode_pembayaran: metode_pembayaran,
        }
      );

      if (response.data.success) {
        setSuccess('Check-out berhasil!');
        // Keep hitungData and showPreview for printing, only clear nomor_plat and metode
        setNomorPlat('');
        setMetodePembayaran('tunai');
        setUangDibayar('');
        setSelectedTransaksi(null);
        setError(null);
        // Don't clear hitungData and showPreview yet - user needs these to print the struk
        // Clear success message after 2 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal check-out');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintStruk = () => {
    if (!hitungData) return;

    const metodeBayar = metode_pembayaran === 'tunai' ? 'CASH' : 'QRIS';
    // Use hitungData for printing to ensure all data is available
    const printData = hitungData;

    const strukContent = `
      <html>
      <head>
        <title>Struk Check-out</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 300px;
            margin: 0;
            padding: 10px;
            background: white;
          }
          .header {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .separator-thick {
            text-align: center;
            font-weight: bold;
            margin: 10px 0;
            letter-spacing: 2px;
          }
          .separator {
            text-align: center;
            margin: 8px 0;
            letter-spacing: 2px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .label {
            flex: 1;
          }
          .value {
            text-align: right;
            font-weight: bold;
          }
          .red-text {
            color: red;
            font-weight: bold;
          }
          .total {
            font-size: 14px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 8px;
            text-align: center;
            margin: 10px 0;
            border: 1px solid #000;
          }
          .qr-container {
            text-align: center;
            margin: 10px 0;
            padding: 10px;
            background: #f9f9f9;
            border: 1px dashed #000;
          }
          .qr-label {
            font-size: 11px;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-weight: bold;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PARKIR PLUS</div>
          <div style="font-size: 10px; margin-top: 5px;">Jl. Contoh No. 123</div>
        </div>

        <div class="row">
          <span class="label">No. Transaksi</span>
          <span class="value" style="min-width: 100px; text-align: right;">: ${String(printData.id_transaksi).padStart(6, '0')}</span>
        </div>

        <div class="row">
          <span class="label">Petugas</span>
          <span class="value" style="min-width: 100px; text-align: right;">: ${user?.nama_lengkap || 'Petugas'}</span>
        </div>

        <div class="separator">${'-'.repeat(35)}</div>

        <div class="row">
          <span class="label">Plat Nomor</span>
          <span class="value">: ${hitungData.nomor_plat}</span>
        </div>

        <div class="row">
          <span class="label">Jenis</span>
          <span class="value">: ${hitungData.jenis_parkir}</span>
        </div>

        <div class="row">
          <span class="label"><span class="red-text">Area</span></span>
          <span class="value"><span class="red-text">: ${hitungData.area_parkir}</span></span>
        </div>

        <div class="separator">${'-'.repeat(35)}</div>

        <div class="row">
          <span class="label">Masuk</span>
          <span class="value">: ${new Date(hitungData.waktu_masuk).toLocaleString('id-ID')}</span>
        </div>

        <div class="row">
          <span class="label">Keluar</span>
          <span class="value">: ${hitungData.waktu_keluar}</span>
        </div>

        <div class="row">
          <span class="label"><span class="red-text">Durasi</span></span>
          <span class="value"><span class="red-text">: ${hitungData.durasi} Jam</span></span>
        </div>

        <div class="separator">${'-'.repeat(35)}</div>

        <div class="row">
          <span class="label">Tarif Jam 1</span>
          <span class="value">: Rp ${TARIF[getTarifKey(hitungData.jenis_parkir)].pertama.toLocaleString('id-ID')}</span>
        </div>

        <div class="row">
          <span class="label">Tarif Jam Berikutnya</span>
          <span class="value">: Rp ${TARIF[getTarifKey(hitungData.jenis_parkir)].lanjutan.toLocaleString('id-ID')}</span>
        </div>

        <div class="total">
          Total Bayar : Rp ${hitungData.total_bayar?.toLocaleString('id-ID')}
        </div>

        <div class="row">
          <span class="label">Metode Bayar</span>
          <span class="value">: ${metodeBayar}</span>
        </div>

        ${metode_pembayaran === 'tunai' && uangDibayar !== '' ? `
        <div class="row">
          <span class="label">Uang Dibayar</span>
          <span class="value">: Rp ${(uangDibayar as number).toLocaleString('id-ID')}</span>
        </div>

        <div class="row">
          <span class="label"><span class="red-text">Kembalian</span></span>
          <span class="value"><span class="red-text">: Rp ${(((uangDibayar as number) - (hitungData.total_bayar || 0)) || 0).toLocaleString('id-ID')}</span></span>
        </div>
        ` : ''}

        <div class="row">
          <span class="label">Status Bayar</span>
          <span class="value"><span class="red-text">: LUNAS</span></span>
        </div>

        <div class="separator">${'-'.repeat(35)}</div>

        <div class="footer">
          Terima kasih telah parkir<br>di PARKIR PLUS
        </div>

        <div class="separator-thick">${'='.repeat(35)}</div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(strukContent);
    printWindow.document.close();

    // Reset data after print window closes (with delay to ensure window opened)
    setTimeout(() => {
      setHitungData(null);
      setShowPreview(false);
      setNomorPlat('');
      setMetodePembayaran('tunai');
      setUangDibayar('');
      setTransaksiList([]);
    }, 1000);
  };

  const menuItems = [
    { label: 'Check-in Parkir', href: '/dashboard/petugas', icon: '🚗' },
    { label: 'Check-out Parkir', href: '/dashboard/petugas/checkout', icon: '🚪' },
    { label: 'Riwayat Transaksi', href: '/dashboard/transaksi', icon: '📋' },
  ];

  // Add fallback UI during hydration checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'operator' && user?.role !== 'petugas')) {
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
              <h2 className="text-xl font-semibold text-gray-800">Check-out Parkir</h2>
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
              {/* Form Check-out */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">🚪 Form Check-out</h3>

                {error && (
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

                <form onSubmit={handleHitung} className="space-y-4">
                  {/* Nomor Plat Search */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cari Nomor Plat *
                    </label>
                    <input
                      type="text"
                      value={nomor_plat}
                      onChange={handleSearchPlat}
                      placeholder="Ketik minimal 2 karakter..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Transaksi List */}
                  {transaksiList.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pilih Transaksi *
                      </label>
                      <div className="space-y-2">
                        {transaksiList.map((trx) => (
                          <div
                            key={trx.id_transaksi}
                            onClick={() => {
                              setSelectedTransaksi(trx);
                              setError(null);
                            }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors relative ${
                              selectedTransaksi?.id_transaksi === trx.id_transaksi
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-300 hover:border-orange-300'
                            }`}
                          >
                            {/* Jenis Parkir Badge - Top Right */}
                            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              {trx.jenis_parkir}
                            </div>
                            
                            <div className="flex justify-between pr-24">
                              <span className="font-semibold text-gray-800">{trx.nomor_plat}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              Masuk: {new Date(trx.waktu_masuk).toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-gray-600">
                              Area: {trx.area_parkir}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTransaksi && (
                    <>
                      {/* Waktu Masuk (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Waktu Masuk
                        </label>
                        <input
                          type="text"
                          value={new Date(selectedTransaksi.waktu_masuk).toLocaleString('id-ID')}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>

                      {/* Waktu Keluar (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Waktu Keluar (Otomatis)
                        </label>
                        <input
                          type="text"
                          value={new Date().toLocaleString('id-ID')}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>

                      {/* Metode Pembayaran */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Metode Pembayaran *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-orange-50 transition" style={{flex: 1}}>
                            <input
                              type="radio"
                              value="tunai"
                              checked={metode_pembayaran === 'tunai'}
                              onChange={(e) => setMetodePembayaran(e.target.value as 'tunai' | 'qris')}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-gray-700 font-medium">💵 CASH</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-orange-50 transition" style={{flex: 1}}>
                            <input
                              type="radio"
                              value="qris"
                              checked={metode_pembayaran === 'qris'}
                              onChange={(e) => setMetodePembayaran(e.target.value as 'tunai' | 'qris')}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-gray-700 font-medium">📱 QRIS</span>
                          </label>
                        </div>
                      </div>

                      {/* Input Uang Dibayar - hanya tampil untuk CASH */}
                      {metode_pembayaran === 'tunai' && hitungData && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Uang yang Dibayar *
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Masukkan jumlah uang"
                            value={uangDibayar}
                            onChange={(e) => setUangDibayar(e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {uangDibayar !== '' && hitungData.total_bayar && (
                            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Total Bayar:</span>
                                <span className="font-bold text-gray-800">Rp {(hitungData.total_bayar || 0).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Uang Dibayar:</span>
                                <span className="font-bold text-gray-800">Rp {(uangDibayar as number).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between">
                                <span className="text-gray-600 font-semibold">Kembalian:</span>
                                <span className={`font-bold text-lg ${((uangDibayar as number) - (hitungData.total_bayar || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Rp {(((uangDibayar as number) - (hitungData.total_bayar || 0)) || 0).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          )}
                          {uangDibayar !== '' && ((uangDibayar as number) < (hitungData.total_bayar || 0)) && (
                            <p className="text-red-600 text-sm mt-2">⚠️ Uang tidak cukup!</p>
                          )}
                        </div>
                      )}

                      {/* Hitung Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        {loading ? 'Menghitung...' : '🧮 Hitung Tarif'}
                      </button>
                    </>
                  )}
                </form>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Detail Check-out</h3>

                {hitungData && showPreview ? (
                  <div className="space-y-4">
                    {/* Detail Box */}
                    <div className="border-2 solid border-orange-300 rounded-lg p-6 bg-orange-50 space-y-3 text-sm font-mono">
                      <div className="flex justify-between">
                        <span>Nomor Plat:</span>
                        <span className="font-bold">{hitungData.nomor_plat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jenis:</span>
                        <span className="font-bold">{hitungData.jenis_parkir}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Area Parkir:</span>
                        <span className="font-bold">{hitungData.area_parkir}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span>Waktu Masuk:</span>
                          <span className="font-bold text-xs">{new Date(hitungData.waktu_masuk).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Waktu Keluar:</span>
                          <span className="font-bold text-xs">{hitungData.waktu_keluar}</span>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg">
                          <span>Durasi:</span>
                          <span className="font-bold text-green-600">{hitungData.durasi} jam</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Tarif Jam 1:</span>
                          <span className="font-bold">
                            Rp {TARIF[getTarifKey(hitungData.jenis_parkir)].pertama.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Tarif Jam Berikutnya:</span>
                          <span className="font-bold">
                            Rp {TARIF[getTarifKey(hitungData.jenis_parkir)].lanjutan.toLocaleString('id-ID')}/jam
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-3 bg-white px-3 py-2 rounded">
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total Bayar:</span>
                          <span className="font-bold text-orange-600">
                            Rp {hitungData.total_bayar?.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span>Metode Pembayaran:</span>
                          <span className="font-bold">{metode_pembayaran === 'tunai' ? '💵 Tunai' : '📱 QRIS'}</span>
                        </div>
                      </div>

                      {/* Info Kembalian untuk CASH */}
                      {metode_pembayaran === 'tunai' && uangDibayar !== '' && (
                        <div className="border-t pt-3 bg-green-50 px-3 py-2 rounded space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Uang Dibayar:</span>
                            <span className="font-bold text-gray-800">Rp {(uangDibayar as number).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between border-t border-green-200 pt-2">
                            <span className="text-gray-700 font-semibold">Kembalian:</span>
                            <span className={`font-bold text-lg ${((uangDibayar as number) - (hitungData.total_bayar || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {(((uangDibayar as number) - (hitungData.total_bayar || 0)) || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* QR Code untuk QRIS */}
                      {metode_pembayaran === 'qris' && qrCodeUrl && (
                        <div className="border-t pt-3 flex flex-col items-center gap-3 bg-blue-50 p-4 rounded">
                          <p className="text-sm font-semibold text-gray-700">Scan untuk membayar via QRIS</p>
                          <div className="bg-white p-3 rounded border border-blue-200">
                            <img src={qrCodeUrl} alt="QRIS QR Code" width={150} height={150} />
                          </div>
                          <p className="text-xs text-gray-600 text-center">Total: Rp {hitungData?.total_bayar?.toLocaleString('id-ID')}</p>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-bold text-red-600">BELUM BAYAR</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={handleCheckOut}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✓</span> {loading ? 'Memproses...' : 'Konfirmasi Check-out'}
                    </button>

                    <button
                      onClick={handlePrintStruk}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPrinter size={18} /> Cetak Struk
                    </button>

                    <button
                      onClick={() => {
                        setShowPreview(false);
                        setHitungData(null);
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">📋</p>
                    <p>Detail check-out akan muncul setelah menghitung tarif</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section removed per request */}
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
