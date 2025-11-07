# Face Age Estimation and Ranking Application

## Overview

This is a web-based face age estimation application that allows users to capture photos via webcam and receive AI-based age analysis. The application follows a guided, step-by-step workflow designed for workplace/professional contexts, requiring users to authenticate with company credentials before proceeding through a structured capture and analysis process.

The application is built with a modern React frontend and Express backend, featuring a clean Material Design 3-inspired interface with Korean language support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Component Library:** Shadcn/ui (Radix UI primitives) with Tailwind CSS for styling

**Routing:** Wouter (lightweight client-side routing)

**State Management:** 
- React Query (TanStack Query) for server state management
- Local component state for UI flows

**Design System:**
- Material Design 3 principles with productivity app influences (Linear, Notion)
- Custom Tailwind configuration with HSL-based color system
- Typography using Inter (Latin) and Noto Sans KR (Korean) fonts
- Progressive disclosure pattern - single action per screen
- Responsive design with mobile-first approach

**Key Frontend Components:**
- `LoginForm` - Initial authentication screen
- `WelcomeScreen` - User greeting after login
- `CaptureGuide` - Instructions before webcam capture
- `WebcamCapture` - Webcam interface with countdown timer
- `LoadingAnalysis` - Analysis in-progress state
- `ResultDisplay` - Final age estimation results

**Workflow Steps:**
1. Login (company + employee ID)
2. Welcome screen
3. Capture guide/instructions
4. Webcam capture with countdown
5. Loading/analysis
6. Results display

### Backend Architecture

**Framework:** Express.js with TypeScript

**Server Configuration:**
- Development: tsx for hot reloading
- Production: esbuild bundled ESM output
- Middleware: JSON parsing with raw body preservation, request logging

**API Endpoints:**
- `POST /api/user/lookup` - Validates company/employee credentials and returns user data

**Data Validation:** Zod schemas for request/response validation

**Development Tools:**
- Vite middleware mode for HMR in development
- Custom logging with timestamps
- Replit-specific plugins for development banner and cartographer

### Data Storage

**ORM:** Drizzle ORM with TypeScript-first schema definition

**Database:** PostgreSQL via Neon serverless driver (configured but not actively used)

**Current Implementation:** In-memory storage (`MemStorage` class) with mock user data for development

**Schema Design:**
- `users` table with fields: id (UUID), company, employeeId, name, realAge
- Zod validation schemas derived from Drizzle schema

**Migration Strategy:** Drizzle Kit configured for schema migrations to `./migrations` directory

### External Dependencies

**Core Libraries:**
- `@tanstack/react-query` - Server state and caching
- `drizzle-orm` & `@neondatabase/serverless` - Database ORM and PostgreSQL connection
- `wouter` - Lightweight routing
- `react-webcam` - Webcam access and capture
- `zod` - Runtime type validation

**UI Component Dependencies:**
- `@radix-ui/*` - Headless UI primitives (accordion, dialog, dropdown, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library

**Development Dependencies:**
- `vite` - Frontend build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production build bundler
- `drizzle-kit` - Database migration toolkit

**Third-Party Services:**
- Google Fonts CDN - Inter and Noto Sans KR typography
- Neon Database - PostgreSQL hosting (configured for future use)

**Notable Architectural Decisions:**

1. **Separation of Storage Interface:** `IStorage` interface allows swapping between in-memory and database implementations without changing business logic

2. **Path Aliasing:** Configured `@/`, `@shared/`, and `@assets/` aliases for clean imports across client and server

3. **Monorepo Structure:** Client and server code in same repository with shared schema definitions in `shared/` directory

4. **Session Management:** Prepared for connect-pg-simple for PostgreSQL-backed sessions (dependency installed but not implemented)

5. **Type Safety:** Full TypeScript coverage with strict mode, shared types between frontend and backend via Drizzle schemas

6. **Static Asset Serving:** Vite handles development, production builds serve from `dist/public`