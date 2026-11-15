# Brief: reports can be marked read, and archived (put away, never deleted)

2026-11-15. The owner, on the admin dashboard's Reports section (the "Report a problem" reports):

> "There is no way to mark reports as read. There should be an archive, where they can be put away but are not
> deleted."

## Today

- **Table:** `public.article_reports` (`supabase/migrations/048_article_reports.sql`, `049_...`). RLS is on, there are no
  policies and no table grants. Access is only through SECURITY DEFINER functions with an admin check:
  - `article_reports_admin(p_status, p_limit)`;
  - `article_report_update(p_id, p_status, p_note)`;
  - `article_report_delete(p_id)`;
  - `article_reports_new_count()`.
- **Fields:** `status` is the triage (new, confirmed, fixed, not_a_problem). There is no read state and no archive.
  Delete is permanent.
- **UI:**
  - `packages/web/src/components/admin/ReportsSection.tsx` and `ReportsViews.tsx` (with `reportsViews.test.ts`);
  - client `packages/web/src/lib/articleReportsClient.ts` and `articleReportsAdmin.ts` (with tests);
  - the tab count is in `packages/web/src/pages/AdminDashboardPage.tsx` (~line 205).

## What to build

**Migration `050_article_reports_read_archive.sql`.** Keep 048's security model exactly:

1. **New columns:** `read_at timestamptz`, `read_by uuid`, `archived_at timestamptz`, `archived_by uuid`, all nullable.
   Add an index that serves the inbox list (not archived, newest first).
2. **New functions,** SECURITY DEFINER, with the same admin check, search_path and revoke/grant pattern as 048. Each
   returns `ok`, `denied`, `invalid` or `not_found` like `article_report_update`:
   - `article_report_mark_read(p_id uuid, p_read boolean)` sets or clears `read_at`/`read_by`.
   - `article_report_archive(p_id uuid, p_archived boolean)` sets or clears `archived_at`/`archived_by`.
3. **The list function shows inbox or archive.**
   - Add a box argument, `inbox` (default, not archived) or `archived`. Changing the signature means a DROP plus CREATE
     with grants redone, or a new function; choose and say why.
   - Return `read_at` and `archived_at`.
4. **The tab count counts unread inbox reports** (not read, not archived). The tab badge should mean "needs a look". If
   you keep `article_reports_new_count` for compatibility, say what it counts now.
5. **Old reports start unread,** except that reports already triaged (status other than `new`) are marked read with
   `read_at = reviewed_at`. Say what you chose.
6. **Archive is never a delete.** Delete stays as it is, separate, and confirms by the report's article title, as the
   owner's UI rule requires.
7. **SQL tests:** if 048 and 049 have SQL test scripts (see commit `b835977`, "Report tests: end on a result row the SQL
   editor shows"), add the same kind for 050:
   - a non-admin gets `denied` and zero rows;
   - mark read and unread works;
   - archive and unarchive works;
   - an archived report leaves the inbox list and shows in the archive list;
   - the count changes;
   - nothing is deleted.

**The UI, in the Reports section.** The jobs, as first-time steps; these are the owner's test list:

1. **See what's new.**
   - An unread report looks different from a read one: bold, plus a visible "Unread" label, not color alone.
   - The Reports tab badge counts unread reports in the inbox.
2. **Mark one read.**
   - Each report has a "Mark as read" button. Once read, it says "Mark as unread".
   - Opening or expanding a report does NOT mark it read on its own; the owner asked for a way to mark, so keep it
     explicit.
3. **Mark several read.** A "Mark all as read" button for the reports shown, which says how many it will change.
4. **Archive one.**
   - An "Archive" button on each report. The report leaves the inbox at once.
   - A line says "Archived. It is in Archive, not deleted." with an "Undo" button.
5. **Find the archive.** A clearly labeled "Inbox / Archive" switch (tabs or buttons with words), each showing its
   count. The Archive view lists archived reports, newest first, with the same details.
6. **Put one back.** In Archive, each report has "Move back to inbox".
7. **Delete stays separate.** It confirms by name and says it cannot be undone, and that Archive is the way to put
   something away.

Every button is labeled with words, works with keyboard and mouse, and has a visible focus ring. The UI says what
happened after each action, and if the server refuses (`denied`, `not_found`), it says why in plain words. The
project's accessibility and security standards apply (`~/.claude/references/professional-security-standards.md`). In
particular, authorization stays on the server; the client never decides who is an admin.

## How the migration reaches the database

Find how 048 and 049 were applied (`docs/HANDOFF.md`, the commits around `3459eca`, `7b0cc7a`, `b835977`):
- **If it is the owner pasting into the Supabase SQL editor,** do NOT apply it. Report the exact steps for the owner.
- **If a CLI path is used,** also do not apply it. Report the command.

The coordinator decides.

## Rules

- **Repo:** `R:\Dystopian_Wiki`. Other sessions work here too.
  - Uncommitted files you did not touch are theirs: today, articles under `content\` and
    `packages/web/src/components/wiki/fieldNotes.test.ts`. Leave them.
  - Commit only your files, with explicit paths: `git commit -m "..." -- <paths>`. Never `git add .`, `-A`, a folder or
    a wildcard; never `commit -a`, `--amend` or push. The coordinator pushes and deploys.
- **Never read any `.env` file.** For the build, `npm run build` in `packages/web` reads it by itself; that is fine.
- **Tests:** run the web tests (`npm test` in `packages/web`, which runs tsx's test runner over `src/**/*.test.ts`) and
  the type check (`npx tsc -b` in `packages/web`). Both must pass. Mutation-check the important rules and report what
  turned red.
- **Writing:** American English, no emoji. Follow the existing code's patterns (`ReportsViews`, `articleReportsAdmin`).

## Report back (under 300 words)

- Commits.
- Test counts, and the type check result.
- The migration file, and how the owner applies it (exact steps).
- Your choices (signature change, the count, old reports' read state).
- The mutations and what each turned red.
