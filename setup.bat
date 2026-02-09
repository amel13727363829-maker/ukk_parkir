@echo off
REM Script untuk setup dan instalasi aplikasi Parkir (Windows)

echo.
echo ================================
echo 🚀 Setup Aplikasi Parkir - Bagian 1
echo ================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak terinstall. Silakan install Node.js terlebih dahulu.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ NPM version:
npm --version
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
echo 📥 Installing backend dependencies...
call npm install

REM Copy .env file
if not exist .env (
    copy .env.example .env
    echo ⚠️  File .env telah dibuat. Silakan edit dengan konfigurasi database Anda.
) else (
    echo ✅ File .env sudah ada
)

echo ✅ Backend setup completed!
echo.

REM Go back to root
cd ..

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
echo 📥 Installing frontend dependencies...
call npm install

REM Copy .env.local file
if not exist .env.local (
    copy .env.example .env.local
    echo ✅ File .env.local telah dibuat.
) else (
    echo ✅ File .env.local sudah ada
)

echo ✅ Frontend setup completed!
echo.

REM Go back to root
cd ..

echo.
echo ================================
echo ✅ Setup Selesai!
echo ================================
echo.
echo 📝 Langkah Selanjutnya:
echo 1. Edit 'backend\.env' dengan konfigurasi MySQL Anda
echo 2. Setup Database MySQL:
echo    CREATE DATABASE parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
echo 🚀 Menjalankan aplikasi:
echo Terminal 1 (Backend):  cd backend ^&^& npm run dev
echo Terminal 2 (Frontend): cd frontend ^&^& npm run dev
echo.
echo 🌐 Akses aplikasi:
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
