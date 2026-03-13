# CTOS — Chemical Terminal Operating System

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/status-alpha-orange.svg" alt="Status: Alpha" />
  <img src="https://img.shields.io/badge/next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/express-4-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/postgresql-16-336791?logo=postgresql" alt="PostgreSQL" />
</p>

**CTOS** is an open-source Chemical Terminal Operating System for managing chemical shipment transfers — from pre-arrival planning through live execution, reconciliation, and closure. Built for terminal operators, vessel agents, and operations teams who handle bulk liquid chemical movements.

---

## ✨ Features

### 🚢 Vessel Call Management
- Track vessel arrivals, berth assignments, and ETAs
- Manage cargo parcels with product specs, quality requirements, and nominated volumes
- Upload and organize voyage documents (BOL, NOR, manifests)

### 🏗️ Tank Farm Operations
- Visual tank overview with real-time fill levels
- HLA (High Level Alarm) and HHLA (High-High Level Alarm) monitoring
- Smart tank recommendation engine based on compatibility, capacity, and proximity
- Product compatibility tracking per tank

### 🔄 Transfer Lifecycle Engine
- Full 9-state transfer workflow: `Planned → Awaiting Checklist → Ready → In Progress → Paused → Completing → Pending Closure → Completed`
- **Emergency Stop** with recording and audit trail
- Flow rate monitoring and pipeline route management
- Supports 7 transfer types: Ship↔Tank, Tank↔Tank, Tank↔Truck, Tank↔IBC, Cross-Terminal

### ✅ ISGOTT Safety Checklists
- Digital Ship/Shore Safety Checklist (ISGOTT 7th Edition)
- Two-part form (Part A: Joint, Part B: Terminal)
- Mandatory comments for non-compliant items
- Co-signature workflow with timestamps

### 📊 Monitoring & Reconciliation
- Manual ullage reading entry with opening/current/closing types
- Ship figure recording from vessel
- Running ship vs. shore variance calculation with tolerance alerts
- Three-way reconciliation (BOL vs. Shore vs. Ship)

### 📋 Event Log & Communication
- Append-only event timeline for full audit trail
- Ship-shore communication log
- PDF/CSV export capability

### 📜 Quantity Certificate
- Auto-populated from transfer data
- Volume correction to 15°C reference temperature
- Digital signature workflow
- PDF generation

### 🔐 Role-Based Access Control
Six pre-defined roles with granular permissions:

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access and configuration |
| **Terminal Manager** | Approve operations, manage terminal settings |
| **Operations Manager** | Monitor transfers, manage live operations |
| **Planner** | Create vessel calls, allocate tanks, plan transfers |
| **Field Operator** | Execute field tasks, record readings |
| **Viewer** | Read-only access to all data |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Styling** | [TailwindCSS 3](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) |
| **Tables** | [TanStack Table v8](https://tanstack.com/table) |
| **Diagrams** | [React Flow](https://reactflow.dev/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend** | [Express](https://expressjs.com/) + TypeScript |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Auth** | JWT + bcrypt |
| **Monorepo** | pnpm workspaces + [Turborepo](https://turbo.build/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (or npm ≥ 9)
- **PostgreSQL** 14+ (local or hosted)

### 1. Clone the Repository

```bash
git clone https://github.com/bhavikprit/ctos.git
cd ctos
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install --workspaces
```

### 3. Set Up Environment Variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database connection string
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ctos"
JWT_SECRET="your-secret-key"
PORT=8000
FRONTEND_URL="http://localhost:3000"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
cd apps/api && npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data
npx prisma db seed
```

### 5. Start Development Servers

```bash
# From the root directory
pnpm dev

# Or start individually:
cd apps/web && npm run dev    # Frontend → http://localhost:3000
cd apps/api && npm run dev    # Backend  → http://localhost:8000
```

### 6. Open the App

Navigate to [http://localhost:3000](http://localhost:3000). You'll see the **login screen** with 6 pre-seeded users. Click any user card to log in as that role.

---

## 📁 Project Structure

```
ctos/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── (auth)/     # Login page
│   │   │   │   └── (dashboard)/ # Authenticated pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # API client, utilities
│   │   │   ├── stores/         # Zustand state stores
│   │   │   └── types/          # TypeScript types
│   │   └── tailwind.config.ts  # Design system tokens
│   └── api/                    # Express + TypeScript backend
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── middleware/     # Auth, RBAC, error handling
│       │   ├── lib/            # Prisma client, utilities
│       │   └── prisma/
│       │       ├── schema.prisma  # Database schema
│       │       └── seed.ts        # Demo data seeder
│       └── .env.example
├── packages/
│   └── shared/                 # Shared types & constants
├── turbo.json                  # Turborepo pipeline
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root scripts
```

---

## 🗺️ Roadmap

CTOS is built in phases. See the full [Product Requirements Document](./CTOS_PRD.md) for detailed specs.

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Core transfer engine (vessel calls, tank allocation, transfer workflow, ISGOTT, ullage, event log, certificates, closure) | 🟡 In Progress |
| **Phase 2** | Live monitoring (WebSocket telemetry, real-time flow, automated alarms, live diagram) | ⬜ Planned |
| **Phase 3** | Analytics & reporting (dashboards, historical trends, performance KPIs, template library) | ⬜ Planned |
| **Phase 4** | Advanced features (cross-terminal, mobile app, AI predictions, ERP integration) | ⬜ Planned |

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's fixing a bug, adding a feature, or improving the docs — every contribution matters.

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

### Quick Start for Contributors

1. Fork the repo and clone your fork
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with clear commit messages
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Repository:** [github.com/bhavikprit/ctos](https://github.com/bhavikprit/ctos)
- **Issues:** [github.com/bhavikprit/ctos/issues](https://github.com/bhavikprit/ctos/issues)
- **PRD:** [CTOS_PRD.md](./CTOS_PRD.md)

---

## 💬 Community

- 🐛 Found a bug? [Open an issue](https://github.com/bhavikprit/ctos/issues/new?template=bug_report.md)
- 💡 Have a feature idea? [Request a feature](https://github.com/bhavikprit/ctos/issues/new?template=feature_request.md)
- 💬 Want to discuss? [Start a discussion](https://github.com/bhavikprit/ctos/discussions)

---

<p align="center">
  Built with ❤️ for the chemical terminal operations community
</p>
