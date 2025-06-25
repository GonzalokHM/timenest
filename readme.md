# Timenest

This project uses Next.js with Supabase as a backend. Follow the steps below to configure your local environment and run the SQL setup.

## Environment variables

Create a `.env.local` file in the project root with the following keys from your Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

ZOOM_CLIENT_ID – OAuth client ID for your Zoom app.
ZOOM_CLIENT_SECRET – OAuth client secret for your Zoom app.
ZOOM_REDIRECT_URL` – URL Zoom redirects to after authorization.
```

## Database setup

1. Log in to the Supabase dashboard.
2. Open the **SQL editor** and create a new query.
3. Copy the contents of `scripts/create-tables.sql` and run it. This will create all required tables, enable row level security and policies.

## Development

Install dependencies with your preferred package manager and start the dev server:

```bash
  npm install
  npm run dev
```

The app will be available at `http://localhost:3000`.
