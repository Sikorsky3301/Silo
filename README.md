<div align="center">

# 🏗️ Silo — AI Code Builder

**Describe what you want. Silo builds it.**

A full-stack AI-powered application generator that writes, deploys, and previews complete Next.js apps in real time — powered by GPT-4.1, E2B cloud sandboxes, and Inngest durable agent execution.

</div>

---

## 📖 Table of Contents

- [What is Silo?](#-what-is-silo)
- [Screenshots](#-screenshots)
- [Architecture Overview](#-architecture-overview)
- [Full Request Pipeline](#-full-request-pipeline)
- [Tech Stack](#-tech-stack)
- [Data Model](#-data-model)
- [Project Structure](#-project-structure)
- [How the AI Agent Works](#-how-the-ai-agent-works)
- [Key Design Decisions](#-key-design-decisions)
- [Setup & Running Locally](#-setup--running-locally)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)

---

## 🤔 What is Silo?

Silo is an **AI code builder** — think Bolt.new or v0.dev, built from scratch. You type a prompt like *"Build me a personal finance dashboard"* and within seconds an AI agent:

1. Spins up a **real cloud sandbox** running Next.js
2. **Writes all the code** — components, pages, types, utilities
3. **Installs dependencies** it needs via npm
4. **Hot-reloads** the running app in the sandbox
5. Streams back a **live preview** you can interact with right in the browser
6. Shows you the **generated source files** with a built-in code viewer

Everything runs in an isolated container — no local environment needed, no setup for the end user.

---

## 🖼️ Screenshots

### Home Page — Dark Mode
The minimal landing page with a natural-language prompt input and quick-start suggestion chips.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🛡 Silo                                                        ☀️  │
│                                                                     │
│                                                                     │
│              What do you want to build?                             │
│        Describe your app and Silo will build it in seconds.         │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Build me a Kanban board with drag and drop, labels...      │   │
│   │                                                             │   │
│   │                                                             │   │
│   │  ⌘ Enter  to submit                                    [↑]  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Build a Kanban board]  [Create a personal finance dashboard]      │
│  [Make a Pomodoro timer]  [Design an e-commerce product page]       │
│  [Build a markdown notes app]  [Create a weather app]               │
└─────────────────────────────────────────────────────────────────────┘
```

### Project View — Live Preview + Code
A resizable split-panel layout. Left: conversation with the AI. Right: live iframe preview with tabbed code viewer.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← icy-student                                                          ☀️ │
├───────────────────────────┬────────────────────────────────────────────────┤
│  Create a personal        │  [Preview] [<> Code]                  Open ↗  │
│  finance dashboard        ├────────────────────────────────────────────────┤
│                           │                                                │
│  ┌────────────────────┐   │   Personal Finance Dashboard                   │
│  │ Silo               │   │                                                │
│  │ Created a fully    │   │   FinDash    Overview                          │
│  │ functional finance │   │             ┌──────────┐┌──────────┐           │
│  │ dashboard with     │   │   Dashboard │ Balance  ││ Income   │           │
│  │ sidebar, overview  │   │   Transactions│$8,250  ││$3,200    │           │
│  │ cards, interactive │   │   Budgets   └──────────┘└──────────┘           │
│  │ transactions...    │   │   Settings                                     │
│  └────────────────────┘   │   Transactions          Budgets                │
│  </> Fragment  >          │   Date  Description     Food    $120/$400       │
│      Preview              │   06-01 Salary +$3200   Housing $900/$900       │
│                           │   06-03 Groceries -$150 Health  $45/$100        │
│                           │                                                │
│  What would you like      │                                                │
│  to build?            [↑] │                                                │
└───────────────────────────┴────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  ┌──────────────────┐          ┌──────────────────────────────────┐ │
│  │   Chat Panel     │          │   Preview / Code Panel           │ │
│  │  (Messages UI)   │          │                                  │ │
│  │                  │          │  ┌────────────┐  ┌────────────┐  │ │
│  │  [User message]  │          │  │  Preview   │  │    Code    │  │ │
│  │  [AI response ]  │          │  │  (iframe)  │  │   Viewer   │  │ │
│  │  [Fragment card] │          │  │            │  │            │  │ │
│  │                  │          │  └────────────┘  └────────────┘  │ │
│  │  [Text input   ] │          │                                  │ │
│  └──────────────────┘          └──────────────────────────────────┘ │
└──────────────────┬─────────────────────────┬────────────────────────┘
                   │ tRPC mutation            │ iframe src=sandboxUrl
                   ▼                          ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│       NEXT.JS SERVER         │  │       E2B CLOUD SANDBOX          │
│                              │  │                                  │
│  ┌────────────────────────┐  │  │  ┌────────────────────────────┐  │
│  │  tRPC Router           │  │  │  │  Next.js 15 Dev Server     │  │
│  │  projects.create       │  │  │  │  (running on port 3000)    │  │
│  │  messages.create       │  │  │  │                            │  │
│  │  messages.getmany      │  │  │  │  app/page.tsx              │  │
│  └──────────┬─────────────┘  │  │  │  components/...            │  │
│             │                │  │  └────────────────────────────┘  │
│  ┌──────────▼─────────────┐  │  │                                  │
│  │  Prisma ORM            │  │  │  Template: silo-nextjs-rishi     │
│  │  PostgreSQL            │  │  │  (shadcn/ui + Tailwind pre-built)│
│  └────────────────────────┘  │  └──────────────────────────────────┘
│                              │
│  ┌────────────────────────┐  │
│  │  Inngest Client        │  │
│  │  inngest.send(event)   │  │
│  └──────────┬─────────────┘  │
└─────────────┼────────────────┘
              │ event: code-agent/run
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      INNGEST DEV SERVER                             │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    codeAgentFunction                          │  │
│  │                                                               │  │
│  │  step.run("get-sandbox-id") ──► Sandbox.create(template)     │  │
│  │                                                               │  │
│  │  network.run(prompt) ─────────► GPT-4.1 Agent Loop           │  │
│  │                                  ├─ Terminal tool             │  │
│  │                                  ├─ createOrUpdateFiles tool  │  │
│  │                                  └─ readFiles tool            │  │
│  │                                                               │  │
│  │  step.run("get-sandbox-url") ──► sandbox.getHost(3000)       │  │
│  │                                                               │  │
│  │  step.run("save-result") ─────► prisma.message.create(...)   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Full Request Pipeline

The exact sequence from prompt submission to live preview:

```
USER TYPES PROMPT & SUBMITS
            │
            │  ⌘+Enter / Send button
            ▼
┌───────────────────────────────────────────────────────────┐
│  1. tRPC Mutation: projects.create                        │
│                                                           │
│  • Generate random project name  →  "icy-student"        │
│  • INSERT Project row            →  PostgreSQL            │
│  • INSERT Message (role: USER)   →  PostgreSQL            │
│  • inngest.send("code-agent/run") → job queue            │
│  • Return projectId              →  browser redirects    │
│    to /projects/[projectId]                              │
└──────────────────────────┬────────────────────────────────┘
                           │
                           │  Page loads + starts polling every 3s
                           │  (waiting for ASSISTANT message to appear)
                           ▼
┌───────────────────────────────────────────────────────────┐
│  2. Inngest picks up event (durable, async)               │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  STEP 1 · "get-sandbox-id"                          │  │
│  │                                                     │  │
│  │  Sandbox.create("silo-nextjs-rishi")                │  │
│  │    → Provisions an isolated Linux container         │  │
│  │    → Next.js 15 is pre-installed                    │  │
│  │    → shadcn/ui + Tailwind are pre-installed         │  │
│  │    → Dev server already running on port 3000        │  │
│  │    → Returns sandboxId (persisted by Inngest)       │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│  3. AI Agent Network (up to 15 iterations)                │
│                                                           │
│  Each iteration, GPT-4.1 receives:                        │
│  • Full system prompt (rules + environment context)       │
│  • User's original natural language prompt                │
│  • All tool results from previous iterations              │
│                                                           │
│  GPT-4.1 picks one tool and calls it:                     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  🔧 Terminal                                        │  │
│  │     sandbox.commands.run(command)                   │  │
│  │     Used for: npm install, reading directories      │  │
│  │     Example: "npm install recharts --yes"           │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📝 createOrUpdateFiles                             │  │
│  │     sandbox.files.write(path, content)              │  │
│  │     Used for: writing all components + pages        │  │
│  │     → Next.js hot-reloads the preview immediately   │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📖 readFiles                                       │  │
│  │     sandbox.files.read(path)                        │  │
│  │     Used for: checking shadcn component APIs        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Loop exits when GPT-4.1 outputs:                         │
│       <task_summary>...</task_summary>                    │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐  │
│  │  STEP 2 · "get-sandbox-url"                         │  │
│  │                                                     │  │
│  │  sandbox.getHost(3000)                              │  │
│  │    → Returns live preview URL                       │  │
│  │    → Format: https://3000-[sandboxId].e2b.app       │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  STEP 3 · "save-result"                             │  │
│  │                                                     │  │
│  │  prisma.message.create({                            │  │
│  │    role: "ASSISTANT",                               │  │
│  │    type: "RESULT",                                  │  │
│  │    content: task_summary_text,                      │  │
│  │    fragment: {                                      │  │
│  │      sandboxUrl,                                    │  │
│  │      files: { "app/page.tsx": "...", ... }          │  │
│  │    }                                                │  │
│  │  })                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────┘
                           │
                           │  Next 3-second poll fires
                           ▼
┌───────────────────────────────────────────────────────────┐
│  4. UI Automatically Updates                              │
│                                                           │
│  • messages.getmany detects new ASSISTANT message         │
│  • Fragment card appears in the chat panel                │
│  • Right panel loads sandboxUrl in an iframe             │
│  • Code tab shows every generated file with a file tree   │
│  • User can interact with the live app immediately        │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.3.4 | React framework with App Router + server components |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type safety throughout the codebase |
| **Tailwind CSS** | 4 | Utility-first styling |
| **shadcn/ui** | Latest | Pre-built accessible component library built on Radix UI |
| **Lucide React** | 0.541 | Consistent icon set |
| **next-themes** | 0.4.6 | System-aware dark/light mode |
| **react-resizable-panels** | 3.0 | Resizable split-panel layout |
| **react-textarea-autosize** | 8.5 | Auto-expanding prompt textarea |

### API Layer

| Technology | Version | Purpose |
|---|---|---|
| **tRPC** | 11.5 | End-to-end type-safe API without REST boilerplate |
| **TanStack Query** | 5 | Data fetching, caching, and 3-second polling |
| **Zod** | 4 | Runtime schema validation for all API inputs |
| **SuperJSON** | 2.2 | tRPC serialization (handles Dates, Maps, etc.) |

### Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** | — | Primary relational database |
| **Prisma** | 6.14 | Type-safe ORM with migration history |

### AI & Agent Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| **Inngest** | 3.54.2 | Durable background job execution with step checkpointing |
| **Inngest Agent Kit** | 0.13.2 | Agent / tool / network abstraction layer over LLMs |
| **@inngest/ai** | 0.1.5 | OpenAI adapter for agent-kit |
| **OpenAI GPT-4.1** | API | The LLM that thinks, plans, and writes all the code |
| **E2B Code Interpreter** | 2.0 | Isolated cloud sandbox that runs the generated app |

---

## 🗄️ Data Model

```
┌──────────────────────────────────────────────────────────┐
│                        Project                           │
├──────────────────────────────────────────────────────────┤
│  id          String   @id @default(uuid())               │
│  name        String   "icy-student" (random kebab slug)  │
│  createdAt   DateTime @default(now())                    │
│  updatedAt   DateTime @updatedAt                         │
│                                                          │
│  messages    Message[]                                   │
└───────────────────────────┬──────────────────────────────┘
                            │  1 ──► many
                            ▼
┌──────────────────────────────────────────────────────────┐
│                        Message                           │
├──────────────────────────────────────────────────────────┤
│  id          String                                      │
│  content     String   (prompt text or AI summary)        │
│  role        Enum     USER | ASSISTANT                   │
│  type        Enum     RESULT | ERROR                     │
│  projectId   String   → Project                          │
│  createdAt   DateTime                                    │
│  updatedAt   DateTime                                    │
│                                                          │
│  fragment    Fragment?  (only on ASSISTANT/RESULT)       │
└───────────────────────────┬──────────────────────────────┘
                            │  1 ──► 0..1
                            ▼
┌──────────────────────────────────────────────────────────┐
│                       Fragment                           │
├──────────────────────────────────────────────────────────┤
│  id          String                                      │
│  messageId   String   @unique → Message                  │
│  sandboxUrl  String   "https://3000-[id].e2b.app"       │
│  title       String   "Fragment"                         │
│  files       Json     { "app/page.tsx": "...", ... }    │
│  createdAt   DateTime                                    │
│  updatedAt   DateTime                                    │
└──────────────────────────────────────────────────────────┘
```

**Key relationships:**
- Each **Project** has one conversation thread of **Messages**
- USER messages are prompts; ASSISTANT messages are AI responses
- Each successful ASSISTANT message links to a **Fragment**
- A **Fragment** holds the live sandbox URL + all generated files as a JSON map (`{ path → content }`)

---

## 📁 Project Structure

```
silo/
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Optional seed data
│   └── migrations/                # SQL migration history
│
├── src/
│   │
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root: TRPCReactProvider + ThemeProvider
│   │   ├── page.tsx               # Home: hero + prompt + suggestion chips
│   │   ├── globals.css            # Tailwind base + CSS vars (light/dark theme)
│   │   ├── projects/[projectId]/
│   │   │   └── page.tsx           # Project page: prefetches + renders ProjectView
│   │   └── api/
│   │       ├── trpc/[trpc]/       # tRPC HTTP handler
│   │       └── inngest/           # Inngest webhook (GET + POST + PUT)
│   │
│   ├── modules/                   # Feature-based modules
│   │   ├── projects/
│   │   │   ├── server/
│   │   │   │   └── procedures.ts  # projects.create + projects.getOne
│   │   │   └── ui/
│   │   │       ├── views/
│   │   │       │   └── project-view.tsx      # Root view: header + panels
│   │   │       └── components/
│   │   │           ├── project-header.tsx    # Nav: name, back, theme toggle
│   │   │           ├── messages-container.tsx # Chat list + scroll + polling
│   │   │           ├── message-card.tsx       # USER bubble / AI message
│   │   │           ├── message-form.tsx       # Chat input textarea
│   │   │           ├── fragment-view.tsx      # Preview/Code tab panel
│   │   │           └── code-view.tsx          # File tree + code display
│   │   │
│   │   └── messages/
│   │       └── server/
│   │           └── procedures.ts  # messages.create + messages.getmany
│   │
│   ├── inngest/
│   │   ├── client.ts              # Inngest client singleton
│   │   ├── functions.ts           # codeAgentFunction — the full AI pipeline
│   │   └── utils.ts               # getsandbox() + lastAssistantTextMessageContent()
│   │
│   ├── trpc/
│   │   ├── init.ts                # tRPC instance + baseProcedure
│   │   ├── client.tsx             # TRPCReactProvider + useTRPC hook
│   │   ├── server.tsx             # Server-side tRPC caller for prefetching
│   │   ├── query-client.ts        # TanStack QueryClient singleton
│   │   └── routers/_app.ts        # Root router: merges projects + messages
│   │
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton (dev-safe)
│   │   └── utils.ts               # cn() = clsx + tailwind-merge
│   │
│   ├── prompt.ts                  # System prompt sent to GPT-4.1
│   ├── components/ui/             # shadcn/ui component library
│   └── generated/prisma/          # Auto-generated Prisma client + types
│
├── next.config.ts                 # Next.js config (minimal)
├── package.json
├── tsconfig.json
└── .env                           # Environment variables
```

---

## 🤖 How the AI Agent Works

### The System Prompt (`src/prompt.ts`)

The 100-line system prompt is the single most important piece of the project. It gives GPT-4.1 a precise operating contract:

| Rule Category | What it specifies |
|---|---|
| **Environment** | Inside `/home/user` in a sandboxed Next.js 15 env |
| **File paths** | Always relative (`app/page.tsx`), never absolute |
| **Server** | Dev server already running — never run `npm run dev` |
| **Packages** | Use `npm install --yes` before any import of a new library |
| **Styling** | Only Tailwind CSS classes — no raw CSS, no SCSS |
| **Components** | shadcn/ui from `@/components/ui/*`, `cn()` from `@/lib/utils` |
| **Quality** | No TODOs, no stubs, no placeholders — ship-ready code only |
| **Termination** | Must end with `<task_summary>...</task_summary>` exactly once |

### The Three Tools

```typescript
// 1. Terminal — runs shell commands in the E2B sandbox
Terminal({ command: "npm install recharts --yes" })
// stdout and stderr returned to the agent

// 2. createOrUpdateFiles — writes files to the sandbox filesystem
createOrUpdateFiles({
  files: [
    { path: "app/page.tsx", content: "..." },
    { path: "app/chart.tsx", content: "..." },
  ]
})
// Next.js hot-reloads the running app immediately after each write
// State accumulated in network.state.data.files for final save

// 3. readFiles — reads existing files for context
readFiles({ files: ["/home/user/components/ui/button.tsx"] })
// Used to inspect shadcn component APIs before using them
```

### The Network Router

The agent runs inside an Inngest `Network<AgentState>` with a custom routing function:

```typescript
router: async ({ network }) => {
  // Task is done — summary tag was detected in lifecycle hook
  if (network.state.data.summary) return;
  // Otherwise keep running the same agent
  return codeAgent;
}
```

This loops up to **15 iterations**. Simple UIs finish in 3–5; complex multi-page apps use 10–15.

### State Tracking Across Iterations

```typescript
interface AgentState {
  summary: string;           // Set when <task_summary> is detected
  files: {                   // Accumulates as files are written
    [path: string]: string;
  };
}
```

The `lifecycle.onResponse` hook inspects every assistant message:

```typescript
onResponse: async ({ result, network }) => {
  const lastMessage = lastAssistantTextMessageContent(result);
  if (lastMessage?.includes("<task_summary>")) {
    network.state.data.summary = lastMessage;  // triggers router to stop
  }
}
```

---

## 🎯 Key Design Decisions

### Why Inngest for the Agent?

Normal serverless functions timeout after **10–30 seconds**. A GPT-4.1 agent with 15 iterations, E2B sandbox I/O, and npm installs can take **2–5 minutes**. Inngest solves this with:

- **Durable steps** — each `step.run()` is checkpointed; if the server restarts, execution resumes from the last completed step
- **No timeout ceiling** — the function can run for as long as it needs
- **Automatic retries** — individual steps retry on transient failures without re-running the whole pipeline
- **Observability** — every step, its inputs, outputs, and timing are visible in the Inngest dashboard

### Why E2B Sandboxes?

- **True isolation** — each project gets its own container; no shared state
- **Real execution** — the generated app actually runs; nothing is simulated
- **Hot reload** — `sandbox.files.write()` triggers Next.js HMR; the preview updates in real time
- **Pre-built template** — `silo-nextjs-rishi` has Next.js, shadcn/ui, and Tailwind pre-installed, saving 30–60 seconds per run

### Why tRPC Instead of REST?

- **End-to-end types** — the client knows exactly what shape each procedure returns at compile time, with zero codegen
- **Zero boilerplate** — no manual `fetch()`, no JSON parsing, no HTTP status handling
- **TanStack Query integration** — `useSuspenseQuery` and `useMutation` with automatic cache invalidation

### Why 3-Second Polling Instead of WebSockets?

The agent runs asynchronously via Inngest — there is no persistent server connection to push through. The simplest reliable pattern is polling `messages.getmany` every 3 seconds. When the AI finishes and writes the result to the database, the next poll delivers it. WebSockets or SSE would add infrastructure complexity for minimal benefit at this scale.

### Why a Separate Fragment Model?

A `Fragment` is kept as a separate table (1:1 with Message) rather than embedding the data in `Message` because:
- The `files` JSON blob can be large (10–50KB of code) — keeping it separate keeps `messages.getmany` queries lightweight
- It makes the active fragment selection independent of message rendering
- It's easier to extend (e.g., adding version history per fragment later)

---

## ⚙️ Setup & Running Locally

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** database — local, [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.
- **OpenAI API key** with GPT-4.1 model access
- **E2B API key** + a sandbox template named `silo-nextjs-rishi`
- **Inngest CLI** for local development

### Step 1 — Clone & Install

```bash
git clone https://github.com/Sikorsky3301/silo.git
cd silo
npm install
```

### Step 2 — Configure Environment Variables

Create `.env` in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# OpenAI — https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# E2B — https://e2b.dev/dashboard
E2B_API_KEY="e2b_..."

# Public URL (localhost in dev)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3 — Run Database Migrations

```bash
npx prisma migrate dev
```

This creates the `Project`, `Message`, and `Fragment` tables.

### Step 4 — Start All Three Services

You need **three terminals** running simultaneously:

**Terminal 1 — Next.js (the app)**

```bash
npm run dev
```

App available at `http://localhost:3000`

**Terminal 2 — Inngest Dev Server (the job queue)**

```bash
npx inngest-cli@latest dev
```

Dashboard available at `http://localhost:8288`

Inngest auto-discovers the `/api/inngest` endpoint and registers `code-agent`. You'll see:

```
INF apps synced, disabling auto-discovery
```

**Terminal 3 — (optional) Prisma Studio**

```bash
npx prisma studio
```

Database GUI at `http://localhost:5555`

### Step 5 — Use It

1. Open `http://localhost:3000`
2. Type a prompt — e.g. *"Create a personal finance dashboard"*
3. Hit **⌘ Enter** or click the send button
4. Watch the chat panel — a message appears, then an AI response with a Fragment card
5. Click the Fragment card or wait for it to auto-activate
6. Switch between **Preview** (live iframe) and **Code** (all generated files) tabs

---

## 🔐 Environment Variables

| Variable | Required | Where to get it |
|---|---|---|
| `DATABASE_URL` | ✅ | Your PostgreSQL connection string |
| `OPENAI_API_KEY` | ✅ | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `E2B_API_KEY` | ✅ | [e2b.dev/dashboard](https://e2b.dev/dashboard) |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` in dev |

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `sdk_version_denied` | Inngest SDK blocked by CVE-2026-42047 | Already fixed — using `inngest@3.54.2` |
| `Cannot read properties of undefined (reading 'step')` | asyncCtx API mismatch between inngest and agent-kit | Already fixed — using `@inngest/agent-kit@0.13.2` |
| `Module not found: inngest/components/InngestFunction` | Old agent-kit using removed inngest internal paths | Already fixed — `@inngest/agent-kit@0.13.2` no longer uses them |
| `invalid status code: 500` from Inngest | Missing `OPENAI_API_KEY` or `E2B_API_KEY` | Add both keys to your `.env` file |
| Sandbox creation fails | E2B template `silo-nextjs-rishi` doesn't exist | Create the template in your E2B dashboard |
| Preview iframe is blank or shows error | E2B sandbox expired (free tier time limit) | Re-submit the prompt to create a new sandbox |
| `windows imports are not implemented yet` | Old Turbopack config with absolute Windows paths | Already fixed — aliases no longer needed in `next.config.ts` |
| `prisma.user` does not exist | `prisma/seed.ts` references a User model not in schema | Safe to ignore — seed is not used |

---

## 🗺️ Known Limitations & Roadmap

### Current Limitations

- **No authentication** — all projects are public; anyone with the URL can view them
- **Sandbox expiry** — E2B sandboxes expire; the preview URL may stop working after some time
- **No follow-up context** — subsequent prompts in the same project don't pass conversation history to the agent
- **Polling only** — messages update every 3 seconds, not in real time
- **No in-browser editing** — you can view generated code but can't edit it directly

### Potential Next Steps

- [ ] **Authentication** — Clerk or NextAuth for user accounts and project ownership
- [ ] **Conversation context** — pass the full message history to the agent for iterative refinement
- [ ] **In-browser Monaco editor** — edit generated files directly in the UI
- [ ] **Sandbox persistence** — keep sandboxes alive longer; serialize/restore state on re-open
- [ ] **Real-time updates** — replace polling with Server-Sent Events or WebSockets
- [ ] **One-click deploy** — push the generated app to Vercel or Netlify from the preview panel
- [ ] **Project gallery** — browse and fork publicly shared projects

---

## 📦 Dependency Summary

```
Production
├── next@15.3.4 + react@19                    Core framework
├── @prisma/client@6.14                        Database
├── @trpc/* @11.5 + @tanstack/react-query@5   API layer
├── zod@4 + superjson@2.2                      Validation + serialization
├── inngest@3.54.2                             Durable jobs
├── @inngest/agent-kit@0.13.2                  AI agent framework
├── @inngest/ai@0.1.5                          OpenAI adapter
├── @e2b/code-interpreter@2.0                  Cloud sandboxes
├── tailwindcss@4 + next-themes@0.4.6          Styling + theming
├── [40+ @radix-ui/* packages]                 Accessible UI primitives
├── react-hook-form@7.62 + @hookform/resolvers Forms
├── lucide-react@0.541                         Icons
└── sonner@2.0                                 Toast notifications

Development
├── prisma@6.14                                Schema + migrations CLI
├── tsx@4.20                                   TS execution for scripts
└── eslint@9 + eslint-config-next             Linting
```

---

<div align="center">

Built with Next.js · Inngest · E2B · GPT-4.1 · shadcn/ui · TypeScript

</div>
