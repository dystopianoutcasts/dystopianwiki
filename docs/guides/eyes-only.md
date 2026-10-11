# EYES ONLY Documents and the Executive Role

EYES ONLY is a hidden area of the site for internal documents (research, studies, design notes). Only people with the **executive** role can open it. Everyone else gets the ordinary "Page Not Found" page, so the area does not reveal itself.

## Who can do what

| Account | Opens EYES ONLY | Grants or removes executives | Uploads or deletes documents |
|---------|-----------------|------------------------------|------------------------------|
| Member | No | No | No |
| Executive | Yes | No | No |
| Admin | Yes (inherited) | Yes | No |
| Superadmin (the owner) | Yes (inherited) | Yes | Yes |

- **Granting:** an admin or the superadmin opens the admin dashboard, finds the account in the **Executives** section (filter by Discord name or email) and presses **Make executive** or **Remove executive**. Admins and the superadmin show as "Executive (inherited)" and have no button. Nobody can change their own account. Every change is written to an audit table (`site_role_events`) that no website visitor can read.
- **Uploading:** only the superadmin, from the **EYES ONLY documents** section of the dashboard.
- Executives see an **EYES ONLY** option in the account menu. The pages are `/eyes-only` (the list) and `/eyes-only/<slug>` (one document). Neither is in the sitemap or `robots.txt`, and both ask search engines not to index them.

## Uploading a document

1. Build the document with the field-notes style kit (`FieldNotes_Style_Kit`, "Build an EYES ONLY browser document"). The result is one self-contained HTML file with the logo, Benny and the stylesheet built in.
2. On the dashboard, in **EYES ONLY documents**, choose the file (up to 8 MiB).
3. Enter a **slug** (lowercase letters and digits joined by single hyphens, at most 80 characters; it becomes the address), a **title** (1 to 200 characters) and an optional **summary** (up to 500 characters, shown on the card).
4. Press **Upload**. The page shows the SHA-256 of the stored HTML. Uploading an existing slug replaces that document.
5. To remove a document, press **Delete** on its row and confirm.

The document is shown exactly as uploaded, in a sandboxed frame. Its scripts run (the open and close buttons for appendices work), but it cannot reach the site's login session, storage or page.

## Where the content lives

Documents live **only in the database** (`public.eyes_only_documents`). They are never in this repository, which is public and served by GitHub Pages. Do not commit a document, a built HTML file or a copy of its text anywhere in this repo.

The tables have row level security on and no policies, with no direct privileges for website roles. Every read and write goes through database functions that check the caller's role at call time, so a demotion applies on the next request.

## Applying migration 041 (owner only)

Run from the repository root, with the **session pooler** connection string. Never use `supabase db push`.

1. Apply the migration in one transaction:

   ```bash
   psql "<session pooler connection string>" -X -v ON_ERROR_STOP=1 -1 -f supabase/migrations/041_site_executive.sql
   ```

2. Run the tests **without** `-1`. The file manages its own transaction and rolls back, so nothing is left behind:

   ```bash
   psql "<session pooler connection string>" -X -v ON_ERROR_STOP=1 -f supabase/tests/site_executive.sql
   ```

   It prints a run of `PASS ...` notices and then `ALL SITE EXECUTIVE TESTS PASSED`.

The migration depends on 024 (site roles). Keep the connection string out of the repository.
