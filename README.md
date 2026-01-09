# Modern E-Commerce Application

A production-grade, full-stack e-commerce platform with mobile app, web dashboard, and robust backend API.

## 🏗️ Architecture

This monorepo contains three main applications:

- **Backend** - Node.js + Express + PostgreSQL + Prisma
- **Web Dashboard** - Next.js + TypeScript + Tailwind CSS
- **Mobile App** - React Native (Expo) + TypeScript

## 🚀 Features

### Core Features
- 🔐 Advanced authentication (JWT + Refresh Tokens + RBAC)
- 📦 Product management with variants and inventory tracking
- 🛒 Shopping cart and checkout system
- 📱 Cross-platform mobile app (iOS & Android)
- 🎨 Dynamic theme system controlled from dashboard
- ✨ Glassmorphism UI design
- 🎭 Smooth animations (Framer Motion + Reanimated)
- 📊 Analytics dashboard with insights
- 🔔 Notification system (Email + Push)
- 💳 Payment gateway integration ready

### Tech Stack

#### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Role-based access control

#### Web Dashboard
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Glass UI components
- ShadCN UI

#### Mobile App
- React Native (Expo)
- TypeScript
- NativeWind (Tailwind for React Native)
- Reanimated 3
- Zustand state management
- React Query

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Expo CLI (for mobile development)
- Git

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-monorepo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Backend

```bash
cd apps/backend

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
# JWT_SECRET="your-secret-key"
# JWT_REFRESH_SECRET="your-refresh-secret"

# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

### 4. Set up Web Dashboard

```bash
cd apps/web-dashboard

# Copy environment template
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

Dashboard will run on `http://localhost:3000`

### 5. Set up Mobile App

```bash
cd apps/mobile-app

# Copy environment template
cp .env.example .env

# Edit .env
# EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Start Expo
npm run start
```

Scan QR code with Expo Go app to run on your device.

## 📱 Running the Applications

From the root directory:

```bash
# Run backend
npm run backend

# Run web dashboard
npm run web

# Run mobile app
npm run mobile

# Build all projects
npm run build:all
```

## 🗄️ Database Schema

### Main Models
- **User** - User accounts with role-based permissions
- **Role** - User roles (SuperAdmin, StoreAdmin, Vendor, Customer)
- **Product** - Product catalog with variants
- **Category** - Product categories and subcategories
- **Order** - Customer orders with status tracking
- **OrderItem** - Individual items in orders
- **Payment** - Payment records
- **Theme** - Customizable theme configurations
- **Setting** - Application settings

## 🔐 User Roles

1. **Super Admin** - Full system access
2. **Store Admin** - Manage products, orders, settings
3. **Vendor** - Manage own products (optional)
4. **Customer** - Browse and purchase products

## 🎨 Theme System

The application features a dynamic theme system where:
- Admins can customize colors, fonts, and UI elements from the dashboard
- Changes apply instantly to the mobile app
- Supports light/dark mode
- Glass UI effects are configurable

## 📦 Project Structure

```
ecommerce-monorepo/
├── apps/
│   ├── backend/          # Node.js API
│   ├── web-dashboard/    # Next.js admin panel
│   └── mobile-app/       # React Native app
├── packages/             # Shared packages
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
└── package.json
```

## 🚀 Deployment

### Backend
- Deploy to any Node.js hosting (AWS, DigitalOcean, Railway, Render)
- Ensure PostgreSQL is accessible
- Set environment variables

### Web Dashboard
- Deploy to Vercel, Netlify, or any static host
- Set `NEXT_PUBLIC_API_URL` to production backend URL

### Mobile App
- Build with EAS Build
- Submit to App Store and Google Play
- Configure OTA updates

## 🔒 Security

- JWT with refresh token rotation
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- SQL injection prevention via Prisma
- XSS protection

## 📊 API Documentation

API endpoints are documented with OpenAPI/Swagger.
Access at: `http://localhost:3001/api-docs`

## 🧪 Testing

```bash
# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=web-dashboard

# Run mobile tests
npm run test --workspace=mobile-app
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Support

For support, email support@example.com or create an issue in the repository.
