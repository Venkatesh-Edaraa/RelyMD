# RelyMD - Collaborative Notebook App

A full-stack Next.js application demonstrating multi-user authentication, shared resources with granular permissions, and CRUD operations.

## Overview

RelyMD is a collaborative notebook application where users can:

- **Create personal accounts** with email and password authentication
- **Create and manage notebooks** as individually owned resources
- **Share notebooks** with other users with three permission levels:
  - **Owner**: Full control (create/edit/delete notes, manage members)
  - **Editor**: Can create and edit notes
  - **Viewer**: Read-only access
- **Create, read, update, delete notes** within shared notebooks
- **View shared member list** with their roles

## Key Features

### 1. Multi-User Authentication
- Secure credential-based authentication using NextAuth.js v5
- User registration and login system
- Session management with JWT tokens
- Protected API routes and pages

### 2. Granular Permission System
The app goes beyond "users only see their own data" with a three-tier permission model:

- **NotebookUser junction table**: Links users to notebooks with specific roles
- **Role-based access control**: Different actions allowed per role
- **Resource-level permissions**: Edit access controlled per notebook
- **Query-level filtering**: Users can only see notebooks they have access to

### 3. CRUD Operations
Complete note management within notebooks:

- **Create**: Add new notes to a notebook (OWNER/EDITOR only)
- **Read**: View notes in shared notebooks (all roles)
- **Update**: Edit notes you created (author only)
- **Delete**: Remove notes you created (author only)

### 4. Data Relationships
```
User
├── ownedNotebooks → NotebookUser (OWNER)
├── sharedNotebooks → NotebookUser (EDITOR/VIEWER)
└── notes → Note

Notebook
├── members → NotebookUser (with roles)
└── notes → Note

NotebookUser (Permission Junction)
├── role: OWNER | EDITOR | VIEWER
├── user → User
└── notebook → Notebook

Note
├── user → User (creator)
└── notebook → Notebook
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, NextAuth.js v5 |
| **Database** | SQLite with Prisma ORM (no external dependencies) |
| **Validation** | Zod for schema validation |
| **Authentication** | NextAuth.js with Credentials provider |

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd relymd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment** (already configured for SQLite in-memory)
   ```bash
   # .env.local is already set up for local SQLite development
   # No external database needed!
   ```

4. **Create database and run migrations**
   ```bash
   npm run db:push
   ```

5. **Seed demo data** (optional but recommended)
   ```bash
   npm run db:seed
   ```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

After seeding:
- **Sarah Chen** (Owner/Lead)
  - Email: sarah.chen@techcorp.com
  - Password: password123

- **Marcus Johnson** (Lead Engineer)
  - Email: marcus.johnson@techcorp.com
  - Password: password123

- **Jessica Park** (Design Lead)
  - Email: jessica.park@techcorp.com
  - Password: password123

- **Alex Rodriguez** (Full-Stack Engineer)
  - Email: alex.rodriguez@techcorp.com
  - Password: password123

Create a new account to test the registration flow.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration & routes
│   │   ├── auth/register/          # User registration endpoint
│   │   ├── notebooks/              # Notebook CRUD endpoints
│   │   └── notes/                  # Note CRUD endpoints
│   ├── auth/
│   │   ├── signin/page.tsx         # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── dashboard/page.tsx          # User's notebook list
│   ├── notebooks/
│   │   ├── new/page.tsx            # Create notebook form
│   │   └── [id]/page.tsx           # Notebook detail with notes
│   ├── layout.tsx                  # Root layout with providers
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Global styles
├── components/
│   ├── providers.tsx               # SessionProvider wrapper
│   └── notebook-detail-client.tsx  # Interactive notes UI
├── lib/
│   ├── db.ts                       # Prisma singleton
│   ├── auth-types.ts               # TypeScript types for auth
│   ├── permissions.ts              # Permission checking utilities
│   └── api-helpers.ts              # API response helpers
└── prisma/
    ├── schema.prisma               # Data model
    └── seed.js                     # Demo data seeder
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login (NextAuth)
- `POST /api/auth/signout` - Logout (NextAuth)
- `POST /api/auth/register` - Register new account

### Notebooks
- `POST /api/notebooks` - Create notebook (authenticated)
- `GET /api/notebooks` - List user's notebooks
- `GET /api/notebooks/[id]` - Get notebook details

### Notes
- `POST /api/notes` - Create note (OWNER/EDITOR)
- `PUT /api/notes/[id]` - Update note (author only)
- `DELETE /api/notes/[id]` - Delete note (author only)

## Tradeoffs & Limitations

### What Was Left Out

1. **Advanced Sharing Features**
   - No invite system - sharing is manual via direct role assignment
   - No sharing links or public notebooks
   - No bulk user management

2. **Real-time Collaboration**
   - No WebSocket connections for live updates
   - No conflict resolution for concurrent edits
   - Notes are single-author

3. **Rich Text Editing**
   - Plain text only (no markdown rendering in display)
   - No rich text editor interface
   - No code syntax highlighting

4. **Security Hardening**
   - Passwords use basic Base64 encoding (not bcrypt)
   - No rate limiting on API endpoints
   - No CSRF protection configured
   - No input sanitization for XSS

5. **Production Features**
   - No error logging or monitoring
   - No audit trails or activity logs
   - No backup/restore functionality
   - No email notifications
   - No dark mode or user preferences

6. **Testing**
   - No unit tests
   - No integration tests
   - No E2E test coverage

### Why These Tradeoffs

- **Time**: Building end-to-end requires prioritizing core workflow
- **Complexity**: Real-time and rich editing add significant overhead
- **Security**: Demo password hashing is obvious security anti-pattern but acceptable for take-home
- **Scope**: The goal is to demonstrate architecture, not exhaustive features

## Design Decisions

### 1. Permission Model
Used a **NotebookUser junction table** (many-to-many with attributes) rather than:
- Simple ownership model: Allows multiple users with different roles ✓
- Flat permission lists: Cleaner queries and index management ✓
- Role-based access control: Flexible and scalable ✓

### 2. Authentication
Chose **NextAuth.js with Credentials provider** because:
- Minimal setup for credential-based auth
- Secure session management out-of-the-box
- Easy to swap for OAuth providers later
- TypeScript support for better DX

### 3. Form Handling
Built **client-side form components** with fetch API instead of:
- Form actions: More explicit control over loading/error states
- React Hook Form: Simpler validation with inline Zod
- Server mutations: Better for this demo's complexity level

### 4. Database
**Prisma ORM** chosen for:
- Type-safe database access
- Easy migrations and schema evolution
- Built-in relation loading
- Developer experience with TypeScript

### 5. UI Framework
**TailwindCSS only** (no component library) for:
- Minimal dependencies
- Full control over styling
- Demonstration of CSS capabilities
- Fast prototyping

## Performance Considerations

- **N+1 Query Prevention**: API routes use `include` to load relations
- **Caching**: Session tokens cached in browser cookies
- **Lazy Loading**: Notes loaded with notebook, not paginated (assume <100 notes per notebook)
- **Indexing**: Database indexes on userId, notebookId, and unique constraints

## Security Notes

⚠️ **This is a demo application. The following security issues should be addressed before production:**

1. **Password Storage**: Uses Base64 encoding instead of bcrypt
2. **Input Validation**: Only basic Zod validation, no sanitization
3. **SQL Injection**: Protected by Prisma ORM, but input cleaning recommended
4. **CSRF**: No CSRF token implementation
5. **Rate Limiting**: No API rate limiting
6. **HTTPS/TLS**: Not enforced in development
7. **Session Security**: Default NextAuth session settings used

For production, implement:
- bcrypt or Argon2 for password hashing
- DOMPurify for HTML/XSS prevention
- CSRF middleware (SameSite cookies)
- Rate limiting middleware
- Input sanitization
- Security headers middleware
- HTTPS enforcement

## How AI Was Used

This project was built with Claude (Cursor/Claude Code) as the primary development tool:

1. **Architecture Planning**: Validated data model and API design
2. **Code Generation**: Generated Prisma schema, API routes, React components
3. **TypeScript Types**: Created auth types and permission utilities
4. **Component Development**: Built interactive notebook UI with form handling
5. **Troubleshooting**: Debugged NextAuth configuration and API integration
6. **Documentation**: Generated this README and inline code comments

Workflow:
- Used Claude for initial scaffolding and component templates
- Iterated on design based on feedback
- Used AI for code patterns and best practices
- Made manual adjustments for project-specific requirements

## Next Steps to Enhance

1. Add note sharing/comments
2. Implement rich text editing with editor.js or slate
3. Add real-time collaboration with WebSockets & Yjs
4. Create member management UI with invite links
5. Add notebook templates and markdown support
6. Implement soft deletes and activity logs
7. Add search across notebooks and notes
8. Create team/workspace grouping
9. Add browser-based PDF export
10. Implement proper password hashing and security hardening

## Testing the App

### User Flow

```
1. Visit http://localhost:3000
2. Click "Create Account" to register
3. Or use demo account: sarah.chen@techcorp.com / password123
4. Dashboard shows your notebooks and their member counts
5. Create a new notebook or enter existing one
6. Create, edit, and delete notes within notebook
7. View notebook members and their permission levels
8. Try different demo accounts to see permission restrictions
```

### Permission Testing

Test the permission system with the seeded demo data:

1. **Login as Sarah (Owner)**
   - Email: sarah.chen@techcorp.com
   - Can view Q2-Q3 Product Roadmap with full edit access
   - Can see Marcus (Editor) and Jessica (Viewer)

2. **Login as Marcus (Editor)**
   - Email: marcus.johnson@techcorp.com
   - Can edit Product Roadmap and API Documentation
   - Cannot delete Sarah's notes (author-only restriction)

3. **Login as Jessica (Viewer on Roadmap, Owner of Design System)**
   - Email: jessica.park@techcorp.com
   - Read-only access to Product Roadmap
   - Full control of Design System notebook

4. **Test Permission Boundaries**
   - Try editing another user's note - should fail with permission error
   - Switch between accounts to see notebook visibilities
   - Viewer role should prevent note creation in roadmap
```

## Database Schema

SQLite database with the following tables:

```sql
-- Users table
CREATE TABLE "users" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notebooks table
CREATE TABLE "notebooks" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notebook members with roles (permission junction table)
CREATE TABLE "notebook_users" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  notebookId TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, notebookId),
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(notebookId) REFERENCES notebooks(id)
);

-- Notes within notebooks
CREATE TABLE "notes" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notebookId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(notebookId) REFERENCES notebooks(id),
  FOREIGN KEY(userId) REFERENCES users(id)
);
```

Database file location: `prisma/dev.db`

## License

MIT
