# Breakfast Counter System

A Vue.js 3 single-page application for managing employee breakfast attendance through QR code scanning with role-based access control.

## 🚀 Features

- **Role-Based Access Control**: Admin and Scanner roles with distinct capabilities
- **QR Code Management**: Generate permanent employee QR codes using SHA-256
- **Scanner Interface**: Tablet-optimized scanning interface with real-time feedback
- **Employee Management**: Full CRUD operations for employee records
- **Attendance Tracking**: One scan per employee per day with audit trail
- **Modern Stack**: Vue 3 (Composition API), TypeScript, Pinia, Supabase

## 📋 Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase account (free tier works)
- Modern web browser with camera support

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Breakfast-v3
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your credentials:

```env
# Supabase Configuration (from Supabase Dashboard → Settings → API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# QR Code Salt (generate using: openssl rand -base64 32)
VITE_QR_SALT=your-super-secret-salt-min-32-chars

# Optional: App Configuration
VITE_APP_NAME=Breakfast Counter System
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 4. Set Up Supabase Database

1. Create a new Supabase project
2. Run the SQL scripts in order (see `/docs/03-DATABASE-SCHEMA.md`):
   - Create tables (`employees`, `scanner_accounts`, `attendance_records`)
   - Create indexes
   - Set up Row Level Security (RLS) policies
   - Create database functions

3. Create your first admin user:
```sql
-- In Supabase SQL Editor
-- First, sign up a user manually in Authentication → Users
-- Then insert into scanner_accounts:
INSERT INTO scanner_accounts (user_id, username, role, is_active)
VALUES (
  'user-id-from-auth-users',
  'admin',
  'admin',
  true
);
```

### 5. Run Development Server

Using Bun:
```bash
bun run dev
```

Or using npm:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Default Login

After setting up your admin account in Supabase:
- **Username**: admin (or whatever you set)
- **Password**: (password you set during user creation)

## 🏗️ Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Vue components
│   ├── common/      # Shared components
│   ├── employee/    # Employee-specific components
│   ├── scanner/     # Scanner components
│   ├── admin/       # Admin components
│   └── layout/      # Layout components
├── composables/     # Vue composables
├── config/          # Configuration files
├── layouts/         # Page layouts
├── router/          # Vue Router setup
├── services/        # API services
├── stores/          # Pinia stores
├── types/           # TypeScript definitions
├── utils/           # Utility functions
└── views/           # Page components
```

## 🔑 User Roles

### Admin
- Full system access
- Create/manage employees
- Generate/regenerate QR codes
- Manage scanner accounts
- View attendance reports
- Access all features

### Scanner
- Login required
- Scan QR codes using device camera
- View scan success/failure messages
- Limited to scanning functionality

## 🎯 Core Workflows

### Creating an Employee
1. Login as Admin
2. Navigate to Employees → Create Employee
3. Fill in: Phone, Name, Department, Gender
4. QR code is auto-generated using SHA-256(phone + name + salt)
5. Employee can download/print their QR code

### Scanning QR Codes
1. Login as Scanner (or Admin)
2. Navigate to Scanner interface
3. Allow camera permissions
4. Scan employee QR code
5. System validates:
   - QR code validity
   - Employee active status
   - Daily scan limit (1 per day)
6. Display result (Success or Error with reason)

## 🏗️ Build for Production

```bash
# Using Bun
bun run build

# Using npm
npm run build
```

Built files will be in the `dist/` directory.

## 🚀 Deployment

### GitHub Pages

1. Update `.env.local` for production:
```env
VITE_BASE_URL=/Breakfast-v3/
```

2. Push to GitHub
3. GitHub Actions will automatically deploy to GitHub Pages

### Manual Deployment

```bash
bun run build
# Upload dist/ folder to your hosting provider
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [01-PROJECT-OVERVIEW.md](docs/01-PROJECT-OVERVIEW.md) - Executive summary and requirements
- [02-VUE-APPLICATION-ARCHITECTURE.md](docs/02-VUE-APPLICATION-ARCHITECTURE.md) - App structure
- [03-DATABASE-SCHEMA.md](docs/03-DATABASE-SCHEMA.md) - Complete database schema
- [04-SUPABASE-INTEGRATION.md](docs/04-SUPABASE-INTEGRATION.md) - Supabase setup
- [05-STATE-MANAGEMENT.md](docs/05-STATE-MANAGEMENT.md) - Pinia stores
- [06-ROUTING-SPECIFICATION.md](docs/06-ROUTING-SPECIFICATION.md) - Router config
- [07-QR-CODE-IMPLEMENTATION.md](docs/07-QR-CODE-IMPLEMENTATION.md) - QR code specs
- [08-COMPONENT-ARCHITECTURE.md](docs/08-COMPONENT-ARCHITECTURE.md) - Component design
- [09-ENVIRONMENT-CONFIGURATION.md](docs/09-ENVIRONMENT-CONFIGURATION.md) - Environment setup
- [10-SECURITY-SPECIFICATIONS.md](docs/10-SECURITY-SPECIFICATIONS.md) - Security details
- [11-ERROR-HANDLING-VALIDATION.md](docs/11-ERROR-HANDLING-VALIDATION.md) - Error handling
- [12-IMPLEMENTATION-CHECKLIST.md](docs/12-IMPLEMENTATION-CHECKLIST.md) - Build checklist

## 🔐 Security

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- SHA-256 hashing for QR codes with secret salt
- Role-based access control (RBAC)
- Secure session management

## 📝 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Vue 3 | Frontend framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Pinia | State management |
| Vue Router | Routing |
| Supabase | Backend/Database/Auth |
| QRCode | QR generation |
| html5-qrcode | QR scanning |
| Crypto-js | SHA-256 hashing |

## 🐛 Troubleshooting

### Environment validation error
- Ensure all required env variables are set in `.env.local`
- QR_SALT must be at least 32 characters

### Supabase connection error
- Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify network connection

### Login fails
- Ensure scanner account exists in database
- Check username/password are correct
- Verify RLS policies are properly configured

## 📄 License

Internal use only

## 👥 Support

For issues and questions, please refer to the documentation in `/docs` or contact the development team.

---

**Version**: 1.0.0  
**Status**: In Development  
**Last Updated**: January 3, 2026
