# blog-posts-nextjs-app

A blog post viewer built with Next.js 16 App Router. Lists 100 posts seeded from JSONPlaceholder, supports filtering by author, and allows permanent deletion with confirmation. Designed to handle slow and unstable network connections without external dependencies.

## Stack

- Next.js 16 App Router (Server Components, Server Actions)
- Prisma 7 + SQLite via `better-sqlite3`
- Tailwind CSS + shadcn/ui
- TypeScript strict mode

## Setup

```bash
./setup.sh
```

Installs dependencies, runs migrations, seeds the database from JSONPlaceholder, and starts the dev server. Open [http://localhost:3000/posts](http://localhost:3000/posts).

To reset the database and reseed from scratch:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

## Architecture decisions

### Server Actions instead of REST endpoints

There are no API routes. Data fetching and mutations go through Next.js Server Actions called directly from Server Components and Client Components. Since the only consumer is the Next.js frontend itself, adding a REST layer would introduce an unnecessary HTTP round trip — the server already has direct access to the database.

### Server-side caching as the network resilience strategy

`getPosts` uses the `'use cache'` directive with `cacheTag('posts')`. On slow or unreliable connections, the cached response is served instantly without hitting the database. When a post is deleted, `updateTag('posts')` invalidates only that cache entry so the next load reflects the change.

### Two-layer error handling on delete

Expected failures (database errors) are returned as typed values `{ error: string }` from the Server Action and shown as toasts. Network-level failures — where the fetch itself throws before reaching the server — are caught by a `try/catch` in the client component and also shown as toasts. Without the second layer, going offline while deleting crashes the page to the error boundary instead of showing a recoverable message.

### Filter via URL params

The author filter pushes `?userId=X` to the URL and lets the server re-render with the filtered query applied at the database level. No client-side state, no stale data, and the filtered URL is shareable.

## Design decisions and scope

See [assumptions.md](assumptions.md) for the full reasoning behind product and technical decisions, including why authentication is out of scope, how the word "user" is interpreted in the brief, and what was deliberately left out.
