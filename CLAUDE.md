# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sophisticated Next.js-based investment advisory website for Zenith Capital Advisors (ZenCap), a financial services company specializing in premium financial modeling and investment advisory services. The platform serves as both a content management system and e-commerce platform for high-value financial models ($2,985-$4,985).

## Commands

### Development
- `npm run dev` - Start development server (typically runs on localhost:3001 if 3000 is occupied)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Management
- Access `/api/init-db` to initialize database tables
- Access `/api/migrate-db` for database migrations
- See `DATABASE_SETUP.md` for complete setup instructions

## Architecture

### Tech Stack
- **Framework**: Next.js 15.2.3 (Pages Router architecture)
- **Database**: PostgreSQL via Vercel Postgres (@vercel/postgres)
- **Styling**: Tailwind CSS with custom navy/teal brand colors
- **Email**: SendGrid integration for transactional emails
- **Rich Text**: TipTap editor for content management
- **Excel Processing**: Multiple libraries (ExcelJS, XLSX, xlsx-js-style) for spreadsheet functionality
- **Animation**: Framer Motion for page transitions and UI effects

### Directory Structure
```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout, Navbar
│   ├── ui/              # 23+ reusable UI components
│   └── utility/         # Analytics, SEO, Performance components
├── pages/
│   ├── api/             # 14 API endpoints for full backend functionality
│   ├── models/          # Financial model pages (private-equity, public-equity)
│   ├── insights/        # Investment insights with rich content
│   ├── solutions/       # Service offering pages
│   ├── admin/           # Admin dashboard for content management
│   └── [core pages]     # Home, About, Contact, 404
├── utils/
│   ├── database.js      # PostgreSQL utilities and queries
│   ├── email.js         # SendGrid email templates
│   ├── formHandlers.js  # Form processing utilities
│   └── motionVariants.js # Framer Motion animation presets
```

### Database Schema
Five main tables: `leads`, `newsletter_subscribers`, `form_submissions`, `insights`, `models`
- Database utilities in `src/utils/database.js`
- All tables have comprehensive CRUD operations via API endpoints

### Key Features

#### Premium Excel Viewer System
- Custom React component in `src/components/ui/ExcelJSViewer.js`
- Multi-viewer system: Premium view, Interactive (Luckysheet), Simple table view
- Handles .xlsx and .xlsm files with macro support and formatting preservation
- Upload endpoint: `/api/upload-excel`

#### Content Management
- Admin dashboard at `/admin` for managing insights and financial models
- TipTap rich text editor integration for professional content formatting
- Dynamic content pages with database-driven content

#### Financial Models Catalog
- **Private Equity Models**: Real estate models ($4,985 each) - multifamily, mixed-use, commercial, hospitality
- **Public Equity Models**: Analytical tools ($2,985-$4,985) - company-specific models, DCF tools
- Model data structure documented in `MODEL_REFERENCE_DATA.md`

### API Architecture
Complete backend with 14 endpoints:
- `/api/insights` - CRUD for investment insights
- `/api/models` - CRUD for financial models
- `/api/contact` - Contact form with email integration
- `/api/newsletter` - Newsletter subscription management
- `/api/upload-excel` - Excel file processing
- `/api/analytics` - Custom analytics tracking

### Email System
- SendGrid integration with professional branded templates
- Automated workflows for contact confirmations and newsletter welcome emails
- Fallback to Formspree if database operations fail
- Templates in `src/utils/email.js`

### Performance Optimizations
- Advanced Next.js config in `next.config.mjs` with image optimization
- Code splitting for ExcelJS library
- Dynamic imports for non-critical components
- Framer Motion page transitions with route-specific animations

### Brand Guidelines
- Primary colors: Navy blue (#1e3a8a) and Teal (#0d9488)
- Professional financial services aesthetic
- Consistent branding across all components and emails

### Environment Variables
See `env.example` for required configuration:
- Database: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`
- Email: `SENDGRID_API_KEY`, `FROM_EMAIL`
- Analytics: `NEXT_PUBLIC_GA_ID`

### Path Aliases
- `@/*` maps to `src/*` (configured in `jsconfig.json`)

### Important Documentation
- `DATABASE_SETUP.md` - Complete setup guide for PostgreSQL and SendGrid
- `PREMIUM_EXCEL_VIEWER.md` - Excel viewer component documentation
- `MODEL_REFERENCE_DATA.md` - Financial model data structure and pricing
- `IMPLEMENTATION_SUMMARY.md` - Professional insight optimization project details