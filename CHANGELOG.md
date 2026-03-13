# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] — 2026-03-13

### Added

#### Frontend (21 pages)
- **Login** — Role-selector cards with offline fallback (works without backend)
- **Dashboard** — Stat cards, active transfers, event timeline, mini tank farm, quick actions
- **Vessel Calls** — List with search, vessel detail with parcels, new vessel form
- **Transfers** — List with status badges, transfer detail (9-state machine, operational controls, event timeline), new transfer form
- **Transfer Sub-Pages** — ISGOTT checklist (Part A/B, Y/N/NA, signatures), quantity certificate (volume table, temp correction, variance), transfer closure (3-way reconciliation)
- **Tank Farm** — Grid of tanks with fill gauges, HLA/HHLA alarms, clickable to detail
- **Tank Detail** — Visual fill level gauge with markers, specs, compatible products, allocation, readings, alarms
- **Terminal Diagram** — CSS-based berth → pump → tank visualization with active flow indicators
- **Reports** — 6 report types with category filters, generate/download actions
- **Notifications** — Severity-based notifications with read/unread filter, mark-read, dismiss
- **Settings** — Terminal config, users & roles, notification toggles, appearance preferences

#### Backend API
- Express + TypeScript API with Prisma ORM
- JWT authentication with role-based access control (6 roles)
- Vessel calls, parcels, tanks, and transfers CRUD
- Transfer state machine with 9 states and valid transitions
- ISGOTT checklist, ullage readings, variance, closure endpoints
- Event logging, communication log, quantity certificates
- Seed script with demo data (12 tanks, 3 berths, 6 users, 2 vessels)

#### Infrastructure
- Monorepo (pnpm + Turborepo)
- Prisma schema with 25+ models
- Open-source licensing (MIT), README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, PR template, issue templates
- Vercel deployment configuration
- `.env.example` files for frontend and backend

#### UI Components
- Button (8 CVA variants), Badge (12 variants), Card, Input
- Collapsible sidebar with 7 navigation items
- Dark theme sidebar, clean content area, notification bell
