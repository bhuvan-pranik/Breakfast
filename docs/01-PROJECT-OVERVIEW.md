# Project Overview: QR-Based Breakfast Counter System

## Executive Summary
A Vue.js 3 single-page application (SPA) for managing employee breakfast attendance through QR code scanning. The system supports role-based access control (RBAC) with three user types: Admins, Scanners, and Employees.

## Business Requirements

### Core Functionality
1. **Employee Management**: Admins create and manage employee records with unique QR codes
2. **QR Code Generation**: Permanent QR codes generated using phone + name + environment salt
3. **Attendance Tracking**: One scan per employee per day allowed
4. **Multi-Scanner Support**: Multiple scanner devices can operate simultaneously
5. **Real-time Validation**: Instant feedback on scan success/failure

### User Roles & Permissions

#### Admin
- Full system access
- Create/Edit/Update employee details
- Bulk upload employees (CSV/XLS)
- Activate/Deactivate employees (soft delete)
- Generate/Regenerate QR codes for employees
- Create/Manage scanner accounts
- View attendance reports (daily, date range)
- Access all system features

#### Scanner/Staff
- Login required for access
- Scan QR codes using device camera
- View employee name on successful scan
- View success/fail messages with reasons
- No access to admin features
- Cannot view reports or manage data

#### Employee (Implicit Role)
- No system login required
- Receive QR code for scanning
- Passive participants (present QR at counter)

### Data Requirements

#### Employee Record
- Phone Number (unique identifier, primary key)
- Full Name
- Department
- Gender
- QR Code String (generated)
- Active/Inactive Status (boolean)
- Created Date
- Updated Date

#### Scanner Account
- Username (unique)
- Password (hashed)
- Active Status
- Created Date
- Last Login

#### Attendance Record
- Scan ID (auto-generated)
- Employee Phone (foreign key)
- Scanner Username (foreign key)
- Scan Timestamp
- Scan Date (indexed for daily queries)
- Status (success/duplicate/invalid)

### Business Rules

1. **QR Code Uniqueness**: Each employee has one permanent QR code
2. **Daily Limit**: One successful scan per employee per day
3. **Duplicate Detection**: System prevents multiple scans on same day
4. **QR Validation**: QR codes validated against algorithm (phone + name + salt)
5. **Soft Delete**: Employee deactivation preserves historical data
6. **Scanner Access**: All scanners must authenticate before use
7. **Always Online**: System requires internet connectivity (Supabase dependency)

### Technical Constraints

1. **Hosting**: GitHub Pages (static site hosting)
2. **Backend**: Supabase (BaaS - Backend as a Service)
3. **Authentication**: Supabase Auth with username/password
4. **Database**: PostgreSQL via Supabase
5. **Offline**: Not supported (always online required)
6. **Browser Support**: Modern browsers with camera API support

## Project Phases

### Phase I (MVP)
- User authentication (Admin/Scanner)
- Employee CRUD operations
- QR code generation and scanning
- Daily attendance tracking
- Basic validation and error handling
- Scanner account management

### Phase II (Enhancements)
- Attendance reports (daily, date range)
- Bulk employee upload (CSV/XLS)
- Advanced filtering and search
- Export capabilities
- Analytics dashboard

## Success Criteria

1. **Performance**: QR scan validation < 2 seconds
2. **Reliability**: 99.5% uptime (dependent on Supabase)
3. **Usability**: Scanner flow completes in < 5 seconds
4. **Security**: All routes protected by authentication
5. **Scalability**: Support 500+ employees, 10+ concurrent scanners

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Vue 3 (Composition API) | UI framework |
| Build Tool | Vite | Development and build tooling |
| Language | TypeScript | Type safety |
| State Management | Pinia | Centralized state |
| Routing | Vue Router 4 | SPA navigation |
| UI Library | TBD (Vuetify/PrimeVue/Custom) | Component library |
| QR Generation | qrcode | Generate QR codes |
| QR Scanning | html5-qrcode | Camera-based scanning |
| Backend/Database | Supabase | BaaS, PostgreSQL, Auth |
| Authentication | Supabase Auth | User authentication |
| Hosting | GitHub Pages | Static site hosting |
| Version Control | Git/GitHub | Code repository |

## Key Technical Decisions

1. **SPA Architecture**: Single-page application for better UX
2. **Composition API**: Modern Vue 3 pattern for better code organization
3. **TypeScript**: Type safety and better developer experience
4. **Pinia over Vuex**: Official recommendation for Vue 3
5. **Supabase**: Reduces backend development, provides real-time capabilities
6. **Static Hosting**: Cost-effective, leveraging GitHub Pages
7. **Client-side QR Generation**: No server processing needed
8. **Environment Salt**: Stored in environment variables for security
