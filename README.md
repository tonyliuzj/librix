# Librix

Librix is a Next.js–powered media explorer web application that lets you index and browse files (PDF, MP4, images, audio, markdown, text, etc.) stored on one or more remote HTTP/WebDAV–style servers. You run a small VPS frontend that proxies and catalogs content in SQLite, while storage back-ends live on low-cost shared hosting or any HTTP server.

## Features

- **Full-text search** by filename across all backends
- **Explorer UI**: navigate folder hierarchies with breadcrumb navigation
- **Inline viewer** for PDFs, images, video, audio, markdown, and text files (uses HTTP Range requests)
- **Auto-rescan**: background cron job scans backends at configured intervals
- **Admin panel**: add/edit/delete backends, name them, configure auth & intervals
- **NextAuth** credentials provider: only admins can manage backends
- Guests can browse & view files without seeing backend URLs
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Prerequisites

- **Node.js** ≥18
- **npm** or **yarn**
- **VPS** or server with public HTTPS (for production)
- Shared HTTP/WebDAV storage backends with directory listing enabled

## Getting Started

### Run by script (One Click Install)

```bash
curl -sSL https://github.com/tonyliuzj/librix/releases/latest/download/librix.sh -o librix.sh && chmod +x librix.sh && bash librix.sh
```

### Manual Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/tonyliuzj/librix.git
   cd librix
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   Copy `example.env.local` to `.env.local` and fill in:

   ```
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Run in development**

   ```bash
   npm run dev
   # opens http://localhost:3000
   ```

5. **Build & start production**

   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
librix/
├── .env.local               # your secrets
├── data.db                  # SQLite database (auto-created)
├── next.config.js
├── package.json
├── src/
│   ├── instrumentation.ts   # background cron scanner (runs on server start)
│   ├── utils/
│   │   ├── db.ts            # SQLite schema and connection
│   │   └── scanner.ts       # indexer logic
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── utils.ts         # utility functions
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   └── app/
│       ├── api/
│       │   ├── auth/[...nextauth]/route.ts
│       │   ├── backends/
│       │   │   ├── route.ts
│       │   │   └── scan/route.ts
│       │   └── files/
│       │       ├── explorer/route.ts
│       │       ├── search/route.ts
│       │       └── view/route.ts
│       ├── admin/
│       │   ├── (authenticated)/
│       │   │   ├── backends/page.tsx
│       │   │   └── layout.tsx
│       │   ├── signin/page.tsx
│       │   └── page.tsx
│       ├── files/
│       │   ├── [fileId]/page.tsx    # file viewer with dynamic routing
│       │   ├── browse/page.tsx      # file explorer
│       │   └── search/page.tsx      # search interface
│       ├── nav-bar.tsx
│       ├── layout.tsx
│       └── page.tsx
└── tsconfig.json
```

## Configuration

### Backends

* **Name**: human-readable label (defaults to URL if blank)
* **URL**: root of remote directory listing
* **Auth**: optional Basic auth (username & password)
* **Auto-rescan interval**: "Never" or X minutes

### Environment Variables

| Variable          | Description                             |
| ----------------- | --------------------------------------- |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT/session (min 32 characters) |

### Initial Setup

On first run, you'll need to create an admin user in the SQLite database. The application uses credentials-based authentication stored in the `users` table.

## Usage

* **Guest users**

  * Home: `/` - Landing page with navigation
  * Search: `/files/search?q=filename` - Search for files across all backends
  * Browse: `/files/browse?backendId=<ID>&path=/<folder>/` - Navigate folder hierarchies
  * View: `/files/<fileId>` - View individual files (PDF, images, video, audio, markdown, text)

* **Admin users** (after logging in at `/admin/signin`)

  * Admin panel: `/admin/backends` - Manage storage backends
  * Add, edit, delete backends
  * Trigger manual rescans

## API Endpoints

* **`GET /api/backends`**
  Returns `[{ id, name, rescanInterval }]` to everyone.
* **`POST/PUT/DELETE /api/backends`**
  Admin-only: create, update, delete backends.
* **`POST /api/backends/scan`**
  Admin-only: trigger manual rescan of a specific backend.
* **`GET /api/files/search?q=`**
  Public: search for files by name across all backends.
* **`GET /api/files/explorer?backendId=&path=`**
  Public: list directory entries for a specific backend and path.
* **`GET /api/files/view?backendId=&path=`**
  Public: proxy and stream files (supports HTTP Range requests for video/audio).

## Security

* Backend URLs are never exposed in client bundle or JSON.
* Guests cannot access admin APIs or see raw URLs.
* Admin panel & mutating routes require NextAuth credentials.

---