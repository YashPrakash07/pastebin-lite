# Pastebin Lite

A lightweight pastebin application built with Next.js and Vercel KV (Redis).

## Features

- **Create Pastes**: Store text snippets simply.
- **TTL Expiry**: Optionally set time-to-live in seconds.
- **View Limits**: Optionally set a maximum number of views (burn after reading).
- **Secure**: Pastes are removed precisely when constraints are met.
- **API**: Full API support for automation.

## Persistence Layer

This project uses **Vercel KV (Redis)** for persistence.
Choice Rationale:

- **Performance**: Redis offers sub-millisecond latency for high-speed read/write access.
- **Atomic Operations**: Essential for handling exact view counts ("burn after reading") without race conditions, utilizing Lua scripts (`eval`).
- **Serverless Friendly**: Works perfectly with Next.js edge/serverless functions where persistent connection pools might be tricky.
- **TTL Support**: Native Expiry simplifies garbage collection.

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

   Required variables found in `.env.example`:

   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

4. Run the development server.

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing

The application supports deterministic time testing via the `x-test-now-ms` header when `TEST_MODE=1` environment variable is set.

## API Documentation

### Create Paste

`POST /api/pastes`

```json
{
  "content": "Hello World",
  "ttl_seconds": 60,
  "max_views": 5
}
```

### Get Paste Metadata

`GET /api/pastes/:id`

### Health Check

`GET /api/healthz`
