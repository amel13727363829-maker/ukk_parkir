# 📋 COMMAND REFERENCE - Aplikasi Parkir

## 🚀 QUICK START

### Windows Users
```batch
cd c:\laragon\www\parkir
setup.bat
```

### Linux/Mac Users
```bash
cd /path/to/c/laragon/www/parkir
bash setup.sh
```

---

## 📥 Manual Installation

### Backend Setup
```bash
cd backend
npm install
copy .env.example .env
# Edit .env dengan konfigurasi MySQL Anda
```

### Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env.local
# Sudah default ke http://localhost:5000/api/v1
```

---

## 🗄️ Database Setup

### Create Database
```sql
CREATE DATABASE parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Run Migrations (Bagian 2)
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## 💻 Development Commands

### Terminal 1 - Backend Server

```bash
cd backend

# Install dependencies
npm install

# Start development server (with hot-reload)
npm run dev

# Expected output:
# Server running on http://localhost:5000
```

### Terminal 2 - Frontend App

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Expected output:
# ➜ Local:        http://localhost:3000
```

---

## 🧪 Testing Commands

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.js

# Watch mode
npm test -- --watch
```

---

## 🔨 Build & Production

### Frontend Build

```bash
cd frontend

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📦 Database Commands (Bagian 2)

### Sequelize Migrations

```bash
cd backend

# Create new migration
npx sequelize-cli migration:create --name name_of_migration

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migrations status
npx sequelize-cli db:migrate:status
```

### Sequelize Seeders

```bash
cd backend

# Create seeder
npx sequelize-cli seed:create --name name_of_seeder

# Run seeders
npx sequelize-cli db:seed:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed name_of_seeder

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

---

## 🔧 Configuration Files

### Backend Environment (.env)

Located in: `backend/.env`

```ini
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parkir_db
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment (.env.local)

Located in: `frontend/.env.local`

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Aplikasi Parkir
```

---

## 📁 Project Structure Overview

### Backend Folders

```
src/
├── config/           # Database configuration
├── controllers/      # API endpoints logic
├── models/          # Sequelize models
├── routes/          # API routes
├── middleware/      # Auth, validation middleware
├── services/        # Business logic
├── validators/      # Input validation schemas
└── utils/           # Helper functions
```

### Frontend Folders

```
src/
├── app/             # Next.js pages & routes
├── components/      # Reusable React components
├── services/        # API service calls
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
├── styles/          # Global CSS & Tailwind
└── utils/           # Helper functions
```

---

## 🌐 Access Points

Once development servers are running:

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| MySQL | localhost | 3306 |

---

## 📝 File Editing Tips

### Backend: Create New Controller

```bash
# Example: Create kendaraan controller
cd backend/src/controllers
# Create file: kendaraanController.js
```

### Backend: Create New Route

```bash
# Example: Create kendaraan routes
cd backend/src/routes
# Create file: kendaraan.js
# Add to routes/index.js
```

### Frontend: Create New Page

```bash
# Example: Create kendaraan page
cd frontend/src/app/dashboard
# Create folder: kendaraan
# Create file: page.tsx
```

### Frontend: Create New Component

```bash
# Example: Create KendaraanForm component
cd frontend/src/components
# Create folder: kendaraan
# Create file: KendaraanForm.tsx
```

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use

```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Issue: MySQL Connection Error

```bash
# Check MySQL is running
# Windows: Check Services for MySQL
# Linux/Mac: brew services list

# Test connection
mysql -u root -p

# Create database if not exists
CREATE DATABASE parkir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue: Node Module Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📚 NPM Scripts Available

### Backend Scripts
```bash
npm run dev          # Start dev server
npm test             # Run tests
npm run test:coverage # Test coverage
npm start            # Start production server
```

### Frontend Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🔄 Git Commands

### Initialize Repository

```bash
cd c:\laragon\www\parkir

# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial setup - Part 1 structure and libraries"
```

### Create Feature Branch

```bash
# Bagian 2 development
git checkout -b feature/bagian-2

# Make changes and commit
git add .
git commit -m "Implement [feature name]"

# Merge back to main
git checkout main
git merge feature/bagian-2
```

---

## 📦 Adding New Dependencies

### Backend

```bash
cd backend

# Add production dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Update package
npm update package-name
```

### Frontend

```bash
cd frontend

# Add production dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name
```

---

## 🔒 Security Checklist

Before Production:

```
[ ] Change JWT_SECRET in .env
[ ] Change database password
[ ] Set NODE_ENV=production
[ ] Enable HTTPS
[ ] Update CORS_ORIGIN to production domain
[ ] Remove debug logs
[ ] Setup proper error handling
[ ] Implement rate limiting
[ ] Setup backup strategy
```

---

## 📞 Documentation Files

```
README.md                    # Project overview
START_HERE.md               # Visual quick start
STRUKTUR_DAN_LIBRARY.md    # Detailed structure
QUICK_REFERENCE.md         # Quick commands
SETUP_CHECKLIST.md         # Verification list
RINGKASAN_BAGIAN_1.md      # Part 1 summary
FINAL_SUMMARY.md           # Complete summary
COMMAND_REFERENCE.md       # This file
```

---

## ✅ Pre-Development Checklist

Before starting development, ensure:

```
[ ] Node.js & npm installed
[ ] MySQL installed & running
[ ] Environment variables configured (.env files)
[ ] Database created (parkir_db)
[ ] npm install completed for both backend & frontend
[ ] No port conflicts (3000, 5000)
[ ] Git initialized (if using version control)
```

---

## 🚀 Ready to Start?

1. **Run Setup**: `setup.bat` (Windows) or `bash setup.sh` (Linux/Mac)
2. **Configure Database**: Create `parkir_db` in MySQL
3. **Edit .env Files**: Configure database credentials
4. **Install Dependencies**: `npm install` in both folders
5. **Start Servers**: 
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm run dev`
6. **Access Apps**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

---

**Status**: ✅ Ready for Development
**Next Phase**: Bagian 2 - Implementation

For detailed information, refer to other documentation files in the project root.
