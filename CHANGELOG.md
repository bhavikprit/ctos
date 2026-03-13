# Changelog

All notable changes to the CTOS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project scaffold with monorepo structure (pnpm workspaces + Turborepo)
- Next.js 14 frontend with App Router, TailwindCSS, Radix UI
- Express + TypeScript backend with Prisma ORM
- PostgreSQL database schema with 25+ models
- JWT authentication with role-based access control (6 roles)
- Login page with role selector (dev mode — click to log in)
- Dashboard with stats grid, active transfers, activity feed, quick actions
- Vessel calls list page with search, status badges, berth info
- Transfers list page with state machine status, flow rate, volume progress
- Tank farm overview with visual fill gauges and HLA/HHLA alarm markers
- API: Vessel call CRUD with berth conflict detection
- API: Parcel management with tank allocation (compatibility + capacity checks)
- API: Tank recommendation engine (scored by capacity fit)
- API: Transfer state machine with 9 states and validated transitions
- API: Emergency stop with audit logging
- API: ISGOTT checklist creation (23 items, ISGOTT 7th Edition)
- API: Ullage reading entry (opening/current/closing)
- API: Ship figure recording
- API: Ship vs. shore variance calculation with tolerance alerts
- API: Transfer closure with variance resolution guard
- API: Communication log per transfer
- Comprehensive seed data (terminal, 6 users, 12 tanks, 6 products, valves, pumps, vessel calls, transfers)
- Shared types package for frontend/backend consistency
- Open-source project files (README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
