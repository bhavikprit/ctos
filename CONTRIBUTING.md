# Contributing to CTOS

First off, thank you for considering contributing to CTOS! 🎉 Every contribution — whether it's a bug fix, new feature, documentation improvement, or idea — helps make this project better for the chemical terminal operations community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behavior by opening an issue.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? We'd love to squash it. Please:

1. **Search existing issues** to make sure it hasn't already been reported
2. Open a new issue using the **Bug Report** template
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Your environment (OS, Node version, browser)

### 💡 Suggesting Features

Have an idea? We'd love to hear it:

1. **Check the [PRD](./CTOS_PRD.md)** to see if it's already planned
2. **Check existing issues** for similar suggestions
3. Open a new issue using the **Feature Request** template
4. Describe the use case and why it would be valuable

### 📝 Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear wording
- Add examples or clarifications
- Improve inline code comments
- Update the README or guides

### 🔧 Contributing Code

Ready to write code? Here's how:

1. Pick an issue labeled `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Follow the development setup below
4. Submit a Pull Request

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (or npm ≥ 9)
- **PostgreSQL** 14+ (local or hosted)
- **Git**

### 1. Fork & Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/ctos.git
cd ctos
git remote add upstream https://github.com/bhavikprit/ctos.git
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Database

```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your PostgreSQL connection string

cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Dev Servers

```bash
pnpm dev   # Starts both frontend and backend
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### 5. Verify Setup

Open http://localhost:3000, click any user card to log in, and verify the dashboard loads.

---

## Project Structure

```
ctos/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   │   └── src/
│   │       ├── app/          # Pages (App Router)
│   │       ├── components/   # React components
│   │       ├── hooks/        # Custom hooks
│   │       ├── lib/          # API client, utils
│   │       └── stores/       # Zustand stores
│   └── api/          # Express + TypeScript backend
│       └── src/
│           ├── routes/       # API endpoints
│           ├── middleware/   # Auth, RBAC
│           ├── lib/          # Prisma, utils
│           └── prisma/       # Schema + seeds
├── packages/
│   └── shared/       # Shared types & constants
└── docs/             # Additional documentation
```

### Where to Add Code

| What | Where |
|------|-------|
| New API endpoint | `apps/api/src/routes/` |
| New UI page | `apps/web/src/app/(dashboard)/` |
| Shared UI component | `apps/web/src/components/common/` |
| Domain-specific component | `apps/web/src/components/{domain}/` |
| Custom hook | `apps/web/src/hooks/` |
| Shared types | `packages/shared/src/` |
| Database schema changes | `apps/api/src/prisma/schema.prisma` |

---

## Coding Guidelines

### Frontend (TypeScript / React)

- Use **functional components** with hooks
- Add `'use client'` directive for client components
- Use **TanStack Query** for API data fetching — no raw `fetch` in components
- Use **Zustand** for client-only UI state
- Use **React Hook Form + Zod** for form handling
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Import icons from `lucide-react` only

### Backend (TypeScript / Express)

- Use **Prisma** for all database operations
- Validate request bodies with **Zod**
- Handle errors in try/catch blocks and return proper HTTP status codes
- Log events through the TransferEvent model — never mutate or delete events
- Apply RBAC middleware on routes that modify data

### General

- Write TypeScript — no `any` types unless absolutely necessary
- Keep files focused — one component or route handler per file
- Use descriptive variable names
- Add comments for complex business logic (e.g., variance calculations, state machine transitions)

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, white-space (no code change) |
| `refactor` | Code restructuring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build, CI, dependencies, tooling |

### Examples

```
feat(transfers): add emergency stop button to transfer control panel
fix(tanks): correct fill percentage calculation when tank is empty
docs(readme): add deployment instructions for Railway
refactor(api): extract transfer state machine into service layer
```

---

## Pull Request Process

### Before Submitting

1. **Sync your fork** with upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Run linting**: `pnpm lint`
3. **Test your changes** manually — log in, navigate to the affected feature
4. **Check the build**: `pnpm build`

### PR Requirements

- [ ] Follows the coding guidelines above
- [ ] Has a clear, descriptive title using conventional commit format
- [ ] Includes a description of what changed and why
- [ ] Links to the related issue (if applicable)
- [ ] Does not break existing functionality
- [ ] Screenshots included for UI changes

### Review Process

1. Submit your PR against the `main` branch
2. A maintainer will review within a few days
3. Address any requested changes
4. Once approved, a maintainer will merge your PR

---

## Issue Guidelines

### Labels

| Label | Description |
|-------|------------|
| `bug` | Something isn't working |
| `feature` | New feature request |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `documentation` | Docs improvements |
| `wontfix` | Will not be addressed |
| `duplicate` | Already reported |
| `enhancement` | Improvement to existing feature |

### Priority Labels

| Label | Description |
|-------|------------|
| `P0-critical` | System down, data loss risk |
| `P1-high` | Major feature broken |
| `P2-medium` | Minor feature broken, workaround exists |
| `P3-low` | Nice-to-have improvement |

---

## Recognition

All contributors will be recognized in the project. We value every contribution, no matter how small.

---

## Questions?

- Open a [Discussion](https://github.com/bhavikprit/ctos/discussions) for general questions
- Open an [Issue](https://github.com/bhavikprit/ctos/issues) for bugs or features

Thank you for helping make CTOS better! 🙏
