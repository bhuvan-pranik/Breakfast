# Breakfast Counter System - Technical Documentation

## Overview

This documentation provides comprehensive technical specifications for building a QR-based breakfast counter system using Vue.js 3, Supabase, and GitHub Pages.

**Project Purpose**: Enable employees to scan QR codes at a breakfast counter, with administrators managing employees and scanners, while scanner staff handle daily attendance tracking.

---

## Documentation Index

### 1. [Project Overview](./01-PROJECT-OVERVIEW.md)
- Executive summary
- Business requirements
- User roles and permissions
- Core functionality
- Technology stack
- Project phases

### 2. [Vue Application Architecture](./02-VUE-APPLICATION-ARCHITECTURE.md)
- Project folder structure
- Component organization strategy
- Composition API patterns
- State management architecture
- Service layer design
- Routing architecture
- Build configuration
- Performance optimization

### 3. [Database Schema](./03-DATABASE-SCHEMA.md)
- Complete table definitions
- Relationships and constraints
- Indexes for performance
- Row Level Security (RLS) policies
- Database functions
- Data migration considerations

### 4. [Supabase Integration](./04-SUPABASE-INTEGRATION.md)
- Supabase setup and configuration
- Authentication flow
- Database operations
- Real-time subscriptions
- Service layer implementation
- Error handling
- Performance optimization

### 5. [State Management (Pinia)](./05-STATE-MANAGEMENT.md)
- Store organization
- Auth store
- Employee store
- Scanner store
- Attendance store
- UI store
- State persistence strategy
- Cross-store communication

### 6. [Routing Specification](./06-ROUTING-SPECIFICATION.md)
- Route definitions
- Navigation guards
- Role-based access control
- Route meta fields
- Lazy loading strategy
- GitHub Pages configuration

### 7. [QR Code Implementation](./07-QR-CODE-IMPLEMENTATION.md)
- QR code generation algorithm
- Scanner library integration
- Validation logic
- Security considerations
- Component specifications
- Browser compatibility

### 8. [Component Architecture](./08-COMPONENT-ARCHITECTURE.md)
- Common components
- Employee components
- Scanner components
- Admin components
- Layout components
- Component design patterns
- Testing strategy
- Accessibility guidelines

### 9. [Environment & Configuration](./09-ENVIRONMENT-CONFIGURATION.md)
- Environment variables
- Vite configuration
- TypeScript configuration
- ESLint and Prettier
- GitHub Actions deployment
- Build scripts

### 10. [Security Specifications](./10-SECURITY-SPECIFICATIONS.md)
- Authentication security
- Authorization (RBAC)
- Data security
- QR code security
- HTTPS and transport security
- Environment variable protection
- Audit logging
- Security checklist

### 11. [Error Handling & Validation](./11-ERROR-HANDLING-VALIDATION.md)
- Validation architecture
- Error handling patterns
- User feedback systems
- Form validation
- Error recovery strategies
- Accessibility considerations

---

## Quick Start Guide

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- GitHub account (for deployment)
- Modern browser with camera support

### Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/Breakfast-v3.git
   cd Breakfast-v3
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials and QR salt
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

### Supabase Setup

1. Create new Supabase project
2. Run database schema from `03-DATABASE-SCHEMA.md`
3. Configure RLS policies
4. Create database functions
5. Set up authentication (email provider)
6. Copy project URL and anon key to `.env.local`

### GitHub Pages Deployment

1. Configure GitHub repository settings
2. Add secrets (Supabase URL, anon key, QR salt)
3. Push to main branch
4. GitHub Actions automatically builds and deploys

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Vue 3 (Composition API) | Modern, reactive, excellent TypeScript support |
| Build Tool | Vite | Fast HMR, optimized builds, modern tooling |
| State Management | Pinia | Official Vue 3 recommendation, simple API |
| Backend | Supabase | Complete BaaS, PostgreSQL, built-in auth, RLS |
| Database | PostgreSQL (via Supabase) | Robust, ACID compliant, powerful queries |
| Authentication | Supabase Auth | Secure JWT-based auth, session management |
| Hosting | GitHub Pages | Free, HTTPS, CI/CD via Actions |
| QR Generation | qrcode | Popular, reliable, browser-compatible |
| QR Scanning | html5-qrcode | Native camera access, no app required |
| QR Security | SHA-256 + Salt | Cryptographically secure, collision-resistant |
| Language | TypeScript | Type safety, better DX, fewer runtime errors |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Admin     │  │   Scanner    │  │   Employee   │          │
│  │  Dashboard   │  │     App      │  │  (QR Code)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    VUE.JS APPLICATION                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Router     │  │    Pinia     │  │  Components  │          │
│  │  (Guards)    │  │   (Stores)   │  │   (Views)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Service Layer                       │          │
│  │  Auth | Employee | Scanner | Attendance | QRCode │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth API   │  │  PostgreSQL  │  │  Real-time   │          │
│  │    (JWT)     │  │    (RLS)     │  │ (Optional)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Employees   │  │   Scanners   │  │  Attendance  │          │
│  │   (Table)    │  │   (Table)    │  │   (Table)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Development Workflow

### Phase I (MVP) - Weeks 1-4

**Week 1: Foundation**
- Project setup (Vite, Vue 3, TypeScript)
- Supabase configuration
- Database schema implementation
- Authentication flow

**Week 2: Core Features**
- Employee CRUD operations
- QR code generation
- Scanner account management
- Route configuration

**Week 3: Scanning**
- QR scanner implementation
- Attendance recording
- Validation logic
- Success/error feedback

**Week 4: Polish & Deploy**
- UI refinement
- Error handling
- Testing
- GitHub Pages deployment

### Phase II (Enhancements) - Weeks 5-6

**Week 5: Reports**
- Daily attendance reports
- Date range filtering
- Export functionality

**Week 6: Advanced Features**
- Bulk employee upload (CSV)
- Analytics dashboard
- Performance optimization

---

## Technology Stack Details

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | 3.4+ | UI Framework |
| TypeScript | 5.0+ | Type Safety |
| Vite | 5.0+ | Build Tool |
| Vue Router | 4.0+ | Routing |
| Pinia | 2.1+ | State Management |
| qrcode | 1.5+ | QR Generation |
| html5-qrcode | 2.3+ | QR Scanning |
| crypto-js | 4.2+ | Hashing (SHA-256) |

### Backend (Supabase)

| Service | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Row Level Security | Authorization |
| Realtime (Optional) | Live Updates |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Prettier | Code Formatting |
| TypeScript | Type Checking |
| GitHub Actions | CI/CD |

---

## Security Highlights

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Row-Level Security (RLS) in database
3. **QR Codes**: SHA-256 hash with secret salt
4. **Transport**: HTTPS only (GitHub Pages + Supabase)
5. **Validation**: Frontend + backend validation
6. **Secrets**: Environment variables, GitHub Secrets
7. **Session**: Secure localStorage with auto-refresh

---

## Performance Considerations

1. **Code Splitting**: Route-level lazy loading
2. **Lazy Loading**: Components loaded on demand
3. **Caching**: Pinia stores cache data
4. **Pagination**: Limit database queries
5. **Indexes**: Database indexes on frequent queries
6. **Debouncing**: Search and scan operations
7. **Bundle Size**: Optimized with Vite rollup

---

## Testing Strategy

### Unit Tests
- Composables (useAuth, useValidation, etc.)
- Utility functions (validators, formatters)
- Store actions and getters

### Component Tests
- Form components
- Button interactions
- Modal behavior
- Table rendering

### Integration Tests
- Authentication flow
- Employee CRUD operations
- QR scanning flow
- Route navigation

### E2E Tests (Optional)
- Complete user workflows
- Admin dashboard
- Scanner operations

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Supabase database schema deployed
- [ ] RLS policies enabled
- [ ] QR salt generated (32+ characters)
- [ ] GitHub Secrets configured
- [ ] Build successful locally

### Post-Deployment
- [ ] Application accessible via GitHub Pages
- [ ] Login works for admin
- [ ] Login works for scanner
- [ ] Employee creation works
- [ ] QR code generation works
- [ ] QR scanning works
- [ ] Attendance recording works
- [ ] Reports accessible (Phase II)

---

## Maintenance & Support

### Regular Tasks
- Update npm dependencies monthly
- Review Supabase logs weekly
- Rotate QR salt annually (if needed)
- Audit user accounts quarterly
- Review RLS policies quarterly

### Monitoring
- Supabase dashboard for database health
- GitHub Actions for build status
- Browser console for client errors
- User feedback for UX issues

---

## Contributing Guidelines

### Code Style
- Follow ESLint and Prettier configurations
- Use TypeScript for all new code
- Write descriptive commit messages
- Add JSDoc comments for complex functions

### Git Workflow
- Branch from `main` for new features
- Use descriptive branch names: `feature/employee-bulk-upload`
- Create pull requests for review
- Squash commits before merging

### Documentation
- Update relevant .md files for any changes
- Add inline comments for complex logic
- Update README for new features

---

## Troubleshooting

### Common Issues

**Issue**: Environment variables not loading
**Solution**: Ensure `.env.local` exists and restart dev server

**Issue**: Supabase connection fails
**Solution**: Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

**Issue**: QR scanner not working
**Solution**: Check camera permissions and HTTPS

**Issue**: Build fails on GitHub Actions
**Solution**: Verify all GitHub Secrets are configured

**Issue**: 404 on routes in production
**Solution**: Check base URL in vite.config.ts matches repo name

---

## Resources

### Official Documentation
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vue Router Documentation](https://router.vuejs.org/)

### Libraries
- [qrcode npm package](https://www.npmjs.com/package/qrcode)
- [html5-qrcode GitHub](https://github.com/mebjas/html5-qrcode)
- [crypto-js Documentation](https://cryptojs.gitbook.io/)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

## Support & Contact

For questions or issues:
1. Check this documentation first
2. Review specific topic documentation
3. Check Supabase documentation
4. Review Vue.js documentation
5. Create issue in GitHub repository

---

## License

[Specify your license here]

---

## Changelog

### Version 1.0.0 (Phase I)
- Initial release
- Employee management (CRUD)
- QR code generation
- Scanner account management
- QR scanning and attendance tracking
- Admin dashboard
- Role-based access control

### Version 1.1.0 (Phase II) - Planned
- Attendance reports (daily, date range)
- Bulk employee upload (CSV/XLS)
- Analytics dashboard
- Export functionality
- Advanced filtering

---

**Last Updated**: 2026-01-03
**Documentation Version**: 1.0.0
