# KardexCare - Comprehensive Service Management System

A full-featured service management platform built with **Next.js 14** (App Router), **Node.js/Express**, and **PostgreSQL** with comprehensive role-based access control and real-time tracking capabilities.

## Overview

KardexCare is an enterprise-grade service management system designed for technical service companies. It provides complete ticket management, asset tracking, service person monitoring, customer management, and comprehensive reporting with business hours calculations.

## Key Features

### Multi-Role Dashboard System

- **Admin Dashboard**: Complete system oversight and management
- **Zone Manager Dashboard**: Zone-specific operations and reporting  
- **Service Person Dashboard**: Field work management and tracking
- **External User Dashboard**: Customer ticket creation and monitoring

### Advanced Ticket Management

- Real-time ticket status tracking with GPS verification
- Automated SLA monitoring with business hours calculations
- Photo capture for onsite verification
- Comprehensive ticket lifecycle management
- Priority-based routing and assignment

### User Management & Access Control

- **Admin**: Full system access and user management
- **Zone Manager**: Zone-specific operations and team management
- **Service Person**: Field operations and ticket handling
- **External User**: Customer ticket creation during non-business hours
- **Customer Owner/Contact**: Asset and ticket visibility

### Business Intelligence & Reporting

- Executive dashboards with KPI tracking
- Service person performance analytics
- Machine downtime analysis with business hours calculations
- Zone-wise performance metrics
- PDF/Excel export capabilities with professional formatting

### Mobile-First Design

- Fully responsive across all device sizes
- Touch-optimized interactions
- Mobile-specific components and layouts
- Progressive Web App capabilities

### Asset & Customer Management

- Comprehensive asset tracking with warranty management
- Customer relationship management
- Service zone assignments
- Contact management with role-based access

## Technical Architecture

### Frontend Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Shadcn/ui with custom mobile-responsive components
- **State Management**: React hooks with context API
- **Authentication**: JWT-based with role-based routing

### Backend Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Local storage for photo management (kept within company network)
- **Location Services**: LocationIQ for geocoding

### Key Integrations

- **GPS Tracking**: Enhanced location capture with accuracy validation
- **Photo Storage**: Local filesystem storage with automatic compression
- **Geocoding**: LocationIQ for address resolution
- **PDF Generation**: Custom PDF generator with professional styling
- **Excel Export**: Advanced Excel generation with formatting

## Project Structure

```
KardexCare/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Authentication & authorization
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions & generators
│   │   └── prisma/         # Database schema & migrations
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # App Router pages & layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utility libraries & configurations
│   │   ├── services/     # API service functions
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json
├── .gitignore           # Git ignore rules
└── README.md           # Project documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database

- LocationIQ API key (for geocoding)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/kardexcare"
JWT_SECRET="your-jwt-secret"
PHOTO_UPLOAD_DIR="./storage/images" # Local storage path
LOCATIONIQ_API_KEY="your-locationiq-key"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
# Local storage is used via backend API
```

## Core Functionalities

### Ticket Management

- Create, assign, and track service tickets
- Real-time status updates with GPS verification
- Photo capture for onsite verification
- Automated SLA monitoring with business hours
- Priority-based routing and escalation

### Service Person Tracking

- GPS-based attendance with accuracy validation
- Activity logging with stage tracking
- Performance analytics and reporting
- Mobile-optimized field operations interface

### Business Intelligence

- Executive dashboards with real-time KPIs
- Service performance analytics
- Machine downtime analysis
- Zone-wise performance metrics
- Professional PDF/Excel reporting

### Customer Management

- Multi-customer support with data isolation
- Asset tracking with warranty management
- Contact management with role-based access
- Service zone assignments

## Business Hours Integration

All time-based calculations use **business hours only** (9 AM - 5 PM, Monday-Saturday):
- Response time calculations
- Resolution time tracking
- Machine downtime analysis
- SLA compliance monitoring
- Performance metrics

*Travel times use real elapsed time for accuracy.*

## Security Features

- **JWT-based authentication** with role validation
- **Role-based access control** across all endpoints
- **Customer data isolation** preventing cross-customer access
- **GPS accuracy validation** for location tracking
- **Photo verification** for onsite service confirmation
- **Input validation** and sanitization
- **Secure password hashing** with bcrypt

## Mobile Responsiveness

- **Mobile-first design** with touch-optimized interactions
- **Responsive breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Mobile-specific components**: MobileCard, MobileTable, MobileModal
- **Touch-friendly buttons** with 44px minimum touch targets
- **Progressive Web App** capabilities

## Development Features

- **TypeScript** for type safety across frontend and backend
- **Prisma ORM** for type-safe database operations
- **Custom mobile-responsive components** library
- **Professional PDF generation** with custom styling
- **Advanced Excel export** with formatting
- **Comprehensive error handling** and logging

## Performance Optimizations

- **Server-side rendering** with Next.js App Router
- **Database query optimization** with Prisma
- **Image optimization** with sharp-based local compression
- **Lazy loading** for large datasets
- **Mobile-optimized** bundle sizes

## Contributing

This is a private enterprise project. For development guidelines and contribution processes, please contact the development team.

## License

Private/Proprietary - All rights reserved.