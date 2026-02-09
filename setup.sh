#!/bin/bash
# Script untuk setup dan instalasi aplikasi Parkir

echo "================================"
echo "🚀 Setup Aplikasi Parkir - Bagian 1"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstall. Silakan install Node.js terlebih dahulu."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
echo "📥 Installing backend dependencies..."
npm install

# Copy .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  File .env telah dibuat. Silakan edit dengan konfigurasi database Anda."
fi

echo "✅ Backend setup completed!"
echo ""

# Go back to root
cd ..

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
echo "📥 Installing frontend dependencies..."
npm install

# Copy .env.local file
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ File .env.local telah dibuat."
fi

echo "✅ Frontend setup completed!"
echo ""

# Go back to root
cd ..

echo "================================"
echo "✅ Setup Selesai!"
echo "================================"
echo ""
echo "📝 Langkah Selanjutnya:"
echo "1. Edit 'backend/.env' dengan konfigurasi MySQL Anda"
echo "2. Setup Database MySQL:"
echo "   CREATE DATABASE parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo ""
echo "🚀 Menjalankan aplikasi:"
echo "Terminal 1 (Backend):  cd backend && npm run dev"
echo "Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "🌐 Akses aplikasi:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
