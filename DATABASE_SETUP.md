# 🗄️ Database Setup Guide

## Prerequisites
- MySQL Server 8.0+ running
- Node.js installed
- Backend dependencies installed (`npm install`)

## Setup Steps

### Option 1: Using Node.js Seeding Script (Recommended)

1. **Ensure MySQL is running**
   ```bash
   # For Laragon, MySQL starts automatically
   # Check if running: http://localhost/adminer or use Laragon control panel
   ```

2. **Configure database connection**
   - Make sure `.env` file has correct MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=parkir_db
   DB_PORT=3306
   ```

3. **Run the seeding script**
   ```bash
   cd backend
   npm run seed
   ```

   This will:
   - Create `parkir_db` database
   - Sync all Sequelize models to create tables
   - Insert initial data (users, parking types, areas, tariffs, sample vehicles)
   - Log test credentials

### Option 2: Manual SQL Setup

1. **Open MySQL client** (via Laragon's Adminer or MySQL command line)

2. **Create database**
   ```bash
   mysql -u root < database/schema.sql
   ```

3. **Seed data**
   ```bash
   mysql -u root parkir_db < database/seed.sql
   ```

4. **Set bcrypt passwords via API or update manually** (see credentials below)

## Test Credentials

After seeding, you can login with:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Operator | `operator1` | `operator123` |
| Manager | `manager1` | `manager123` |

## Database Schema

### Tables Created:

1. **m_user** - User accounts with roles (admin, operator, manager)
2. **m_kendaraan** - Vehicle registry
3. **m_jenis_parkir** - Parking type categories
4. **m_tarif_parkir** - Pricing rules linked to parking types
5. **tb_arf** - Parking areas/zones
6. **transaksi** - Parking transactions (check-in/check-out)
7. **tb_log_aktivitas** - Activity audit logs

### Initial Data Inserted:

#### Users (3 accounts):
- Admin user
- Operator user
- Manager user

#### Parking Types (4 types):
- Mobil (Hourly: Rp5.000, Daily: Rp30.000, Monthly: Rp400.000)
- Motor (Hourly: Rp2.000, Daily: Rp15.000, Monthly: Rp200.000)
- Truk (Hourly: Rp10.000, Daily: Rp60.000, Monthly: Rp800.000)
- Bus (Hourly: Rp15.000, Daily: Rp100.000, Monthly: Rp1.200.000)

#### Parking Areas (5 areas):
- Area A - Lantai 1 (50 capacity)
- Area B - Lantai 2 (50 capacity)
- Area C - Lantai 3 (40 capacity)
- Area D - Outdoor (100 capacity)
- Area E - VIP (20 capacity)

#### Sample Vehicles (5 vehicles):
- B 1234 ABC (Mobil - Toyota Avanza)
- B 5678 DEF (Motor - Honda Vario)
- B 9012 GHI (Mobil - Daihatsu Xenia)
- B 3456 JKL (Motor - Yamaha Nmax)
- B 7890 MNO (Truk - Hino Lohan)

## Verify Setup

### Check database via Adminer (Laragon)
1. Open http://localhost/adminer
2. Login with MySQL credentials
3. Select `parkir_db` database
4. View tables and data

### Test Backend Connection
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Database connected successfully!
🚀 Server running on http://localhost:5000
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
- MySQL is not running
- Check `.env` DB_HOST and DB_PORT
- Verify MySQL credentials

### Error: "database doesn't exist"
- Run seed script again: `npm run seed`
- Or manually create: `CREATE DATABASE parkir_db;`

### Error: "ER_DUPLICATE_ENTRY"
- Database already seeded
- Skip this error or reset database:
  ```sql
  DROP DATABASE parkir_db;
  ```
  Then run seed again

### Passwords not hashing on manual SQL insert
- Manual SQL inserts use bcrypt hash (see seed.sql)
- Better to use Node.js seeding for proper password hashing
- Or use the API to create users with proper encryption

## Next Steps

1. **Start backend server**
   ```bash
   npm run dev
   ```

2. **Test API endpoints**
   - Login: `POST http://localhost:5000/api/v1/auth/login`
   - Get vehicles: `GET http://localhost:5000/api/v1/kendaraan`

3. **Continue with frontend setup** (Next.js)

## Database Backups

To backup database:
```bash
mysqldump -u root parkir_db > backup.sql
```

To restore:
```bash
mysql -u root parkir_db < backup.sql
```
