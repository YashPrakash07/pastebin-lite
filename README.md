# Pastebin Lite

A secure, lightweight, and modern pastebin application built with Next.js 15, Tailwind CSS v4, and Vercel KV (Redis).

## Features

- **Store & Share**: Create text snippets instantly with a clean, distraction-free UI.
- **Secure Persistence**: Powered by Vercel KV (Redis) for fast, low-latency storage.
- **Privacy First**:
  - **Password Protection**: Secure your pastes with bcrypt-hashed passwords.
  - **TTL Expiry**: Set pastes to auto-expire after a specific duration (e.g., 60 seconds).
  - **Burn After Reading**: Set a maximum view limit (e.g., 5 views) after which the paste is deleted.
  - **Manual Deletion**: Receive a unique token to delete your paste whenever you want.
- **Developer Friendly**:
  - **Syntax Highlighting**: Supports 15+ languages including TypeScript, Python, Go, and Rust.
  - **API First**: Full REST API support for automation and cli tools.
- **Modern UI/UX**:
  - **Dark Mode**: Fully supported dark/light themes.
  - **Responsive Design**: Mobile-optimized interface.
  - **Glassmorphism**: Sleek, modern aesthetics.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (Redis)
- **Authentication**: Custom Password Protection (bcryptjs)
- **Theming**: `next-themes`
- **Icons**: `lucide-react`

## Getting Started

### Prerequisites

- Node.js 18+
- A Vercel KV instance (or any Redis instance).

### Installation

1. Clone the repository.

   ```bash
   git clone <repo-url>
   cd pastebin-lite
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Configure Environment Variables.
   Copy `.env.example` to `.env.local` and add your Vercel KV credentials.

   ```bash
   cp .env.example .env.local
   ```

   **Required variables**:

   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

4. Run the development server.

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Documentation

### Create Paste

`POST /api/pastes`

**Body:**

```json
{
  "content": "console.log('Hello World');",
  "language": "javascript", // Optional: defaults to 'plaintext'
  "ttl_seconds": 3600, // Optional: expires in 1 hour
  "max_views": 10, // Optional: deletes after 10 views
  "password": "my-secret-pw" // Optional: protects the paste
}
```

**Response:**

```json
{
  "id": "abc-123",
  "url": "https://your-domain.com/p/abc-123",
  "delete_token": "del_xyz_789" // Save this to delete the paste later!
}
```

### Get Paste Content

`GET /api/pastes/:id`

Returns the raw content and metadata.

### Delete Paste

`DELETE /api/pastes/:id`

**Body:**

```json
{
  "delete_token": "del_xyz_789"
}
```

### Health Check

`GET /api/healthz`

## License

MIT
