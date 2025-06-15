diff --git a//dev/null b/README.md
index 0000000000000000000000000000000000000000..95caf3e6376d253d2a86028e180a24a271321b2d 100644
--- a//dev/null
+++ b/README.md
@@ -0,0 +1,29 @@
+# Timenest

- +This project uses Next.js with Supabase as a backend. Follow the steps below to configure your local environment and run the SQL setup.
- +## Environment variables
- +Create a `.env.local` file in the project root with the following keys from your Supabase project:
- +`
+NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
+NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
+`
- +## Database setup
- +1. Log in to the Supabase dashboard.
  +2. Open the **SQL editor** and create a new query.
  +3. Copy the contents of `scripts/create-tables.sql` and run it. This will create all required tables, enable row level security and policies.
- +## Development
- +Install dependencies with your preferred package manager and start the dev server:
- +`bash
+pnpm install      # or npm install
+pnpm dev          # or npm run dev
+`
- +The app will be available at `http://localhost:3000`.
