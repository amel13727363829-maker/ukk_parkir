# Aplikasi Parkir - Full Stack

Proyek ini terdiri dari Frontend (Next.js), Backend (Express.js), dan Database (MySQL).

## Struktur Folder

```
parkir/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi database dan environment
│   │   ├── controllers/     # Business logic untuk setiap route
│   │   ├── routes/          # Definisi API routes
│   │   ├── models/          # Database models (Sequelize)
│   │   ├── middleware/      # Middleware (auth, validation, error handling)
│   │   ├── services/        # Business logic tambahan
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Input validation
│   │   └── index.js         # Entry point
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/             # Next.js app directory
    │   ├── components/      # Reusable components
    │   ├── pages/           # Pages/routes
    │   ├── services/        # API services
    │   ├── hooks/           # Custom React hooks
    │   ├── styles/          # Global styles
    │   ├── types/           # TypeScript types
    │   └── utils/           # Utility functions
    ├── public/              # Static files
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── tsconfig.json
    ├── tailwind.config.js
    └── next.config.js
```

## Backend - Libraries & Purpose

### Core
- **express**: Web framework untuk Node.js
- **mysql2**: MySQL driver untuk Node.js

### Database & ORM
- **sequelize**: ORM untuk manajemen database
- **sequelize-cli**: CLI tool untuk Sequelize migrations

### Security & Authentication
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT untuk authentication
- **helmet**: Security headers middleware
- **cors**: Cross-origin resource sharing

### Validation & Error Handling
- **joi**: Schema validation library
- **express-validator**: Middleware untuk input validation

### Utility
- **dotenv**: Environment variables management

### Development & Testing
- **nodemon**: Auto-reload server saat development
- **jest**: Testing framework
- **supertest**: HTTP assertion library

## Frontend - Libraries & Purpose

### Core
- **react**: UI library
- **react-dom**: React DOM rendering
- **next**: Full-stack React framework

### State Management & Forms
- **zustand**: Lightweight state management
- **react-hook-form**: Form management with validation

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **autoprefixer**: PostCSS plugin
- **postcss**: CSS processor
- **react-icons**: Icon library
- **clsx**: Utility untuk conditional className
- **sonner**: Toast notifications

### HTTP & API
- **axios**: HTTP client

### Data Visualization & Utilities
- **chart.js**: Chart library
- **react-chartjs-2**: React wrapper untuk Chart.js
- **date-fns**: Date manipulation library

### Development
- **typescript**: Type safety
- **eslint**: Code linter

## Database - MySQL Tables (dari ERD)

1. **m_kendaraan** - Master data kendaraan
2. **m_jenis_parkir** - Master jenis parkir
3. **m_user** - Master user/admin
4. **m_tarif_parkir** - Master tarif parkir
5. **transaksi** - Transaksi parkir
6. **tb_arf** - Area parkir
7. **tb_log_aktivitas** - Log aktivitas sistem

## Instalasi & Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Server akan berjalan di:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Next Steps (Bagian 2)

1. Setup database MySQL dengan migration
2. Implementasi models & controllers backend
3. Implementasi authentication (login/register)
4. Implementasi API endpoints sesuai ERD
5. Implementasi frontend pages dan components
6. Integration testing

---
Siap untuk melanjutkan ke bagian 2! 🚀
