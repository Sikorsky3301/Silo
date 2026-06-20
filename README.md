<div align="center">
  <img src="public/logo.svg" width="48" height="48" alt="Silo" />

  # Silo

  **Describe what you want. Silo builds it.**

  An AI-powered app generator that writes, runs, and previews full-stack Next.js apps from a single prompt.

  ![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## Overview

Silo is a Bolt.new-style AI code builder. You type a prompt, and a GPT-4.1 agent spins up a real cloud sandbox, writes all the code, installs dependencies, and streams back a live preview — all without any local setup on your end.

## Tech Stack

- **Framework** — Next.js 15 (App Router), React 19, TypeScript
- **AI** — OpenAI GPT-4.1 via Inngest Agent Kit
- **Sandboxes** — E2B Code Interpreter (isolated cloud containers)
- **Jobs** — Inngest (durable background execution)
- **API** — tRPC v11 + TanStack Query
- **Database** — PostgreSQL via Prisma ORM
- **UI** — shadcn/ui, Tailwind CSS v4, next-themes

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key (GPT-4.1 access)
- E2B API key + a sandbox template named `silo-nextjs-rishi`
- Inngest CLI

### Install

```bash
git clone https://github.com/Sikorsky3301/silo.git
cd silo
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
OPENAI_API_KEY="sk-..."
E2B_API_KEY="e2b_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run

Three terminals are required:

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Inngest job queue
npx inngest-cli@latest dev

# Terminal 3 — (optional) Prisma Studio
npx prisma studio
```

App runs at `http://localhost:3000` · Inngest dashboard at `http://localhost:8288`

## License

MIT
