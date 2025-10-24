# Silo Project - Complete Knowledge Documentation

## Project Overview
**Silo** is a Next.js 15.3.4 application that serves as an AI-powered code generation platform. It uses Inngest for background job processing, tRPC for type-safe API communication, Prisma for database management, and E2B for sandboxed code execution. The project enables users to request code generation through a simple interface, which triggers AI agents to create and execute code in isolated environments.

## Architecture Summary
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, and Shadcn UI
- **Backend**: tRPC for type-safe API communication
- **Database**: PostgreSQL with Prisma ORM
- **Background Jobs**: Inngest for async processing
- **Code Execution**: E2B sandboxed environments
- **AI Integration**: OpenAI GPT-4 with custom agent framework

---

## Configuration Files

### Root Configuration

#### `package.json`
**Purpose**: Project dependencies and scripts configuration
**Key Dependencies**:
- Next.js 15.3.4 with React 19
- tRPC for type-safe APIs
- Prisma for database ORM
- Inngest for background jobs
- E2B for code execution
- Shadcn UI components with Radix UI primitives
- Tailwind CSS for styling
- Zod for validation

**Scripts**:
- `dev`: Development server with Turbopack
- `build`: Production build
- `start`: Production server
- `lint`: ESLint checking

#### `next.config.ts`
**Purpose**: Next.js configuration
**Content**: Basic Next.js config with no custom options currently set

#### `tsconfig.json`
**Purpose**: TypeScript configuration
**Key Settings**:
- Target: ES2017
- Module resolution: bundler
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled
- JSX preserve mode

#### `components.json`
**Purpose**: Shadcn UI configuration
**Settings**:
- Style: "new-york"
- RSC (React Server Components) enabled
- Tailwind CSS with CSS variables
- Component aliases configured
- Lucide React for icons

#### `eslint.config.mjs`
**Purpose**: ESLint configuration for code quality
**Setup**: Next.js ESLint config with TypeScript support

#### `postcss.config.mjs`
**Purpose**: PostCSS configuration for Tailwind CSS processing

---

## Database Layer

### Prisma Configuration

#### `prisma/schema.prisma`
**Purpose**: Database schema definition
**Key Models**:

**Message Model**:
- `id`: UUID primary key
- `content`: Message text content
- `role`: USER or ASSISTANT (enum)
- `type`: RESULT or ERROR (enum)
- `createdAt/updatedAt`: Timestamps
- `fragment`: Optional relation to Fragment

**Fragment Model**:
- `id`: UUID primary key
- `messageId`: Foreign key to Message
- `sandboxUrl`: URL to E2B sandbox
- `title`: Fragment title
- `files`: JSON array of file contents
- `createdAt/updatedAt`: Timestamps

**Enums**:
- `MessageRole`: USER, ASSISTANT
- `MessageType`: RESULT, ERROR

#### `prisma/seed.ts`
**Purpose**: Database seeding script
**Note**: Contains example User/Post data (legacy from Prisma template)

### Database Migrations

#### `prisma/migrations/20250824172602_/migration.sql`
**Purpose**: Initial migration creating User and Post tables
**Status**: Legacy - tables were later dropped

#### `prisma/migrations/20251014203015_message_fragment/migration.sql`
**Purpose**: Migration creating Message and Fragment tables
**Changes**:
- Dropped User and Post tables
- Created Message and Fragment tables
- Added MessageRole and MessageType enums
- Fixed typo: "contnet" → "content"

#### `prisma/migrations/20251014204253_message_fragment/migration.sql`
**Purpose**: Fixed content column typo
**Changes**: Corrected "contnet" to "content" in Message table

---

## Source Code Structure

### Application Layer

#### `src/app/layout.tsx`
**Purpose**: Root layout component
**Features**:
- Geist font family setup (Sans & Mono)
- TRPCReactProvider wrapper
- Sonner toast notifications
- Global CSS imports
- Metadata configuration

#### `src/app/page.tsx`
**Purpose**: Main application page
**Features**:
- User input for code generation requests
- tRPC integration for API calls
- Message display with JSON formatting
- Toast notifications for success/error states
- React Query for data fetching

#### `src/app/globals.css`
**Purpose**: Global styles and Tailwind configuration
**Features**:
- Tailwind CSS imports
- Custom CSS variables for theming
- Dark mode support
- Component-specific styling
- Chart color definitions

### API Routes

#### `src/app/api/trpc/[trpc]/route.ts`
**Purpose**: tRPC API endpoint handler
**Features**:
- Fetch request handler for tRPC
- Context creation
- Router integration

#### `src/app/api/inngest/route.ts`
**Purpose**: Inngest webhook endpoint
**Features**:
- Serves Inngest functions
- Code agent integration
- Event handling

### Database Layer

#### `src/lib/db.ts`
**Purpose**: Prisma client configuration
**Features**:
- Global Prisma client instance
- Development environment handling
- Type-safe database access

#### `src/lib/utils.ts`
**Purpose**: Utility functions
**Features**:
- `cn()` function for conditional class names
- Combines clsx and tailwind-merge

### tRPC Configuration

#### `src/trpc/init.ts`
**Purpose**: tRPC initialization
**Features**:
- Context creation with user ID
- Superjson transformer for serialization
- Base procedure setup

#### `src/trpc/client.tsx`
**Purpose**: Client-side tRPC setup
**Features**:
- React Query integration
- HTTP batch linking
- Browser/server query client management
- TRPCProvider component

#### `src/trpc/server.tsx`
**Purpose**: Server-side tRPC setup
**Features**:
- Server-only imports
- Query client caching
- tRPC options proxy
- Caller creation

#### `src/trpc/query-client.ts`
**Purpose**: React Query client configuration
**Features**:
- Query client factory
- Default options setup

#### `src/trpc/routers/_app.ts`
**Purpose**: Main tRPC router
**Features**:
- App router definition
- Messages router integration
- Type export for client

### Business Logic

#### `src/modules/messages/server/procedures.ts`
**Purpose**: Message-related tRPC procedures
**Features**:
- `getmany`: Fetch all messages (ordered by updatedAt desc)
- `create`: Create new user message and trigger Inngest job
- Input validation with Zod
- Database operations with Prisma

### Background Processing

#### `src/inngest/client.ts`
**Purpose**: Inngest client configuration
**Features**:
- Inngest instance creation
- Event sending capabilities

#### `src/inngest/functions.ts`
**Purpose**: Background job functions
**Features**:
- `codeAgent`: Main AI code generation function
- E2B sandbox integration
- OpenAI GPT-4 integration
- File system operations
- Terminal command execution
- Database result storage

**Key Tools**:
- Terminal: Execute shell commands
- createorupdatefiles: Write files to sandbox
- readFiles: Read files from sandbox

#### `src/inngest/utils.ts`
**Purpose**: Inngest utility functions
**Features**:
- `getsandbox()`: Connect to E2B sandbox
- `lastAssistantTextMessageContent()`: Extract AI response content

### AI Configuration

#### `src/prompt.ts`
**Purpose**: AI agent system prompt
**Features**:
- Comprehensive coding instructions
- Environment specifications
- Tool usage guidelines
- File system rules
- Runtime execution rules
- Task completion format

### UI Components

#### `src/components/ui/` (Shadcn UI Components)
**Purpose**: Reusable UI components
**Key Components**:
- `button.tsx`: Button component with variants
- `input.tsx`: Input field component
- `sonner.tsx`: Toast notification component
- Plus 30+ other components (accordion, alert, avatar, etc.)

**Features**:
- Radix UI primitives
- Class Variance Authority for variants
- Tailwind CSS styling
- TypeScript support
- Accessibility features

#### `src/hooks/use-mobile.ts`
**Purpose**: Mobile detection hook
**Features**:
- Responsive breakpoint detection
- Window resize handling
- Media query listener

### Generated Code

#### `src/generated/prisma/`
**Purpose**: Prisma-generated client code
**Contents**:
- TypeScript types and interfaces
- Database client implementation
- Query engine binaries
- Runtime files

---

## Sandbox Templates

### `sandbox-templates/nextjs/`
**Purpose**: E2B sandbox configuration for Next.js
**Files**:
- `e2b.Dockerfile`: Docker configuration for sandbox
- `e2b.toml`: E2B sandbox settings
- `compile_page.sh`: Build script for sandbox

---

## Public Assets

### `public/` Directory
**Purpose**: Static assets
**Contents**:
- SVG icons (file, globe, next, vercel, window)
- Favicon

---

## Development Files

### `next-env.d.ts`
**Purpose**: Next.js TypeScript declarations

### `reminder.txt`
**Purpose**: Development notes/reminders

---

## Project Workflow

### User Interaction Flow
1. User enters code request in main page
2. tRPC `create` procedure saves user message
3. Inngest event triggers `codeAgent` function
4. AI agent processes request in E2B sandbox
5. AI generates and executes code
6. Results saved to database with sandbox URL
7. User sees results and can access sandbox

### Technical Stack Integration
- **Frontend**: Next.js → tRPC → React Query → UI Components
- **Backend**: tRPC → Prisma → PostgreSQL
- **Background**: Inngest → E2B → OpenAI → Database
- **Styling**: Tailwind CSS → Shadcn UI → Radix UI

### Key Features
- Type-safe API communication (tRPC)
- Real-time background processing (Inngest)
- Sandboxed code execution (E2B)
- AI-powered code generation (OpenAI)
- Modern UI components (Shadcn UI)
- Responsive design (Tailwind CSS)
- Database persistence (Prisma + PostgreSQL)

---

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- E2B account for sandbox access
- OpenAI API key

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_API_URL`: API base URL
- OpenAI API key (for Inngest functions)
- E2B API key (for sandbox access)

### Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npx prisma migrate dev`: Run database migrations
- `npx prisma generate`: Generate Prisma client
- `npx prisma db seed`: Seed database

This project represents a modern, full-stack application with AI integration, providing a complete solution for AI-powered code generation in a sandboxed environment.
