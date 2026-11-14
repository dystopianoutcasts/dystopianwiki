# Build 42 Reference generator

Turns the Project Zomboid 42.22 engine indexes into draft wiki pages: every engine Java class,
every vanilla Lua file, every script block type and field, event, global function, sandbox option,
translation file and native method. Standard library only. Deterministic: the same input gives
byte-identical output, with no timestamps.

## Regenerate

Run from the repository root (`R:\Dystopian_Wiki`, or `/r/Dystopian_Wiki` in Git Bash):

```bash
python -I scripts/reference/generate.py \
  --api /r/DystopianOutcasts/GAME/PZ_Engine_Records/B42_3d39148846/api \
  --out content/drafts/pz/build-42/reference

python -I scripts/reference/check.py \
  --api /r/DystopianOutcasts/GAME/PZ_Engine_Records/B42_3d39148846/api \
  --out content/drafts/pz/build-42/reference \
  --articles content/articles/pz/build-42
```

`generate.py` deletes and rewrites the output folder (it refuses any folder not named `reference`).
Output goes to `content/drafts/`, which is gitignored and never synced. To publish, move the folder
to `content/articles/pz/build-42/reference`, run `npm run nav`, then sync. The generator never
syncs, imports or connects to Supabase.

Optional input: `scripts/reference/purposes.jsonl`, one line per class,
`{"c": "zombie.iso.IsoGridSquare", "purpose": "text"}` (or `--purposes <file>`). A class with a line gets
a "What it is" bullet; a class without one gets none.

## What each category holds

| Category | Contents |
|---|---|
| `overview` | Start page, Java package index, Lua folder index, bundled third-party libraries (counts per library) |
| `java-<top package>` | One category per engine package (`java-iso`, `java-characters`, `java-kahlua` ...). A page per package or subpackage with a section per class: super, interfaces, Lua tier, field and method tables with source citations, events fired, natives called, top 10 callers and callees |
| `lua-client`, `lua-server`, `lua-shared` | A page per vanilla Lua folder, a section per file: lines, requires, tables, functions, events hooked, globals written |
| `scripts` | A page per script block type with every field (count, example, first site), the block type index, and the fields outside a known block |
| `events` | Every event and hook in alphabetical parts, plus an index |
| `globals` | Every global Lua function in alphabetical parts, with signature and source line |
| `sandbox-options` | Every sandbox option, a page per settings page |
| `translations` | A page per translation file type with key counts per language and prefixes, plus an index |
| `natives` | A page per native library with every native method, evidence and Java callers |

Slugs all start with `ref-`, so they never collide with existing articles.
Links look like `/pz/build-42/reference/<category>/<slug>`.

## Size limits

- A page holds at most 60 Java classes and 12,000 words (`check.py` fails above either).
- The generator packs to about 10,500 words, in a stable alphabetical order, so the split is the same every run.
- A class that alone passes the limit (for example the script key classes with thousands of members) gets its own page series: its section starts on part 1 and the member tables continue on later parts.
- Excerpts are 200 characters or less.

## What check.py verifies

- Every engine and Kahlua class appears under exactly one `## \`Class\`` heading; every Lua file, block type, event, global and sandbox option exactly once.
- Every internal link and `related_articles` entry resolves to a generated page.
- No slug or id repeats, and no slug collides with an existing article under `content/articles/pz/build-42/`.
- Page size limits, required frontmatter, and the `_section.json` and `_category.json` files.

It prints the counts and exits 1 on any failure.

## Known quirks

- `lua_globals.jsonl` has 726 names: 725 engine plus 1 declared inside the Kahlua exposer. All 726 are listed.
- A native method bound to two libraries appears on both library pages.
- The events a class fires are matched by source file, so nested classes share their file's list.
