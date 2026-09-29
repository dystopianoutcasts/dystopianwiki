# Build 42 import tools

Two scripts that turn locally held Build 42 reference documents into wiki articles:

- `import-b42.ts` reads the manifests in `manifests/`, converts each source markdown file
  into one or more articles with frontmatter, and rewrites links between them to site paths.
- `check-links.ts` checks every internal `/pz/...` link in the Build 42 articles and drafts,
  and checks that slugs are unique per version.

This tool never syncs; run npm run sync:dry-run yourself after importing.

## CLI

There are no npm aliases yet; run the scripts with `npx tsx` from the repo root.

```
npx tsx scripts/import/import-b42.ts [--manifest <file>]... [--out <dir>] [--dry-run] [--verbose]
```

| Option | Effect |
|---|---|
| `--manifest <file>` | Load this manifest. Repeatable. With none, every `*.json` in `scripts/import/manifests/` is loaded except files whose name starts with `_`. |
| `--out <dir>` | Content root to write into. Default: the repo's `content/` folder. Articles land in `<out>/articles/...`, drafts in `<out>/drafts/...`. |
| `--dry-run` | Print every planned output path and every link rewrite; write nothing. |
| `--verbose` | On a real run, also print each written path and its link rewrites. |

Every manifest is loaded and validated, and every source parsed, before anything is
written. Any validation error prints the full list of errors and exits 1 with nothing
written. A successful run ends with a summary:
`N manifests, N entries, N articles written, N links rewritten, N links downgraded to local references`
(split parts and index articles are counted as articles).

```
npx tsx scripts/import/check-links.ts [--root <content dir>] [--version <id>]
```

Walks `content/articles/pz/<version>/**/*.md` (version defaults to `build-42`) and
`content/drafts/**/*.md`. For every markdown link whose target starts with `/pz/` it checks:

| Target shape | Must exist |
|---|---|
| `/pz/{version}/{section}/{category}/{slug}` | `content/articles/pz/{version}/{section}/{category}/{slug}.md` |
| `/pz/{version}`, `/pz/{version}/{section}`, `/pz/{version}/{section}/{category}` | the matching folder under `content/articles/pz/` |

A target found only under `content/drafts/pz/...` is listed as a "draft target" and does
not fail the run. Dead links print as `file:line -> target`. Two article files under the
same version with the same slug (frontmatter `slug`, or the file name) are an error in every
version under `content/articles/pz/`; a draft whose slug is already taken is a warning.
Exit code 1 on any dead link or duplicate slug.

Fixture test (imports into a temporary folder, runs both scripts, removes the folder):

```
npx tsx scripts/import/fixtures/run.ts
```

## Manifests

One JSON file per source group in `scripts/import/manifests/`. `manifests/_example.json` is
a working example; its underscore prefix keeps it out of a default run. The schema is
contract C4 of the Build 42 content plan.

### Top level

| Key | Required | Meaning |
|---|---|---|
| `sources_root` | yes | Folder the entry `source` paths are relative to. Absolute, or relative to the manifest file. |
| `defaults` | no | Values used by every entry that does not set them: `game`, `version`, `difficulty`, `target`, `provenance`, and also `section`, `category`, `tags` (default tags are merged with entry tags). |
| `entries` | yes | Non-empty array of entries (below). |
| `link_overrides` | no | `{ "file.md": "/pz/..." }`. The key is resolved against `sources_root`; any link to that file, from any manifest, goes to the given site path (anchor preserved). Takes precedence over the entry lookup. |
| `description` | no | Free text, ignored. |

Keys starting with `_` or `$` are comments and are ignored everywhere. Any other unknown key
is a validation error, so a typo such as `skip_heading` fails loudly instead of being ignored.

### Entry

| Key | Required | Meaning |
|---|---|---|
| `source` | yes | Source file, relative to `sources_root`. Read as markdown. |
| `section`, `category` | yes (or in defaults) | Path segments; must match `^[a-z0-9]+(-[a-z0-9]+)*$`. |
| `slug` | yes | Article slug (the index slug for a split entry); same pattern. |
| `title` | yes | Article title (the index title for a split entry). |
| `split` | yes | `"none"` or `"h2"` (see Split rules). |
| `tags` | no | Array of strings. |
| `difficulty` | yes (or in defaults) | `beginner`, `intermediate` or `advanced`. |
| `target` | no | `"articles"` (default) or `"drafts"`. |
| `game`, `version` | yes (or in defaults) | Normally `pz` and `build-42`. |
| `provenance` | yes (or in defaults) | `{ "compiled": "...", "game_version": "..." }`; entry keys override the defaults key by key. |
| `strip_header_until` | no | Regex. Every line up to and including the first matching line is dropped. It is an error if no line matches. |
| `skip_headings` | no | H2 sections to drop. |
| `only_headings` | no | Emit only these H2 sections; ignore every other H2 and the text before the first H2. |
| `parts` | no | `split: "h2"` only. `{ "<H2 heading>": { "slug": "...", "title": "..." } }` overrides a part's slug and/or title. |

Validation also rejects: `skip_headings` and `only_headings` on the same entry; a
`skip_headings`, `only_headings` or `parts` name that matches no H2 in the source; a missing
source file; two entries (in any manifests) writing the same output path; the same slug used
twice in one version (the id `{version}-{slug}` would collide, across articles and drafts);
and a source mapped by more than one entry without `only_headings`.

Heading names in `skip_headings`, `only_headings` and `parts` are matched after trimming,
case-insensitively, with any leading `N.` or `N)` numbering removed and inline markdown
(backticks, emphasis) ignored. `"table of contents"` matches `## 3. Table of Contents`.

### One source, two categories

The same source may appear in several entries when every entry but one uses
`only_headings`. Entry A maps the document with `skip_headings: ["X"]`; entry B maps it
into another category with `only_headings: ["X"]` and a different slug. Links into that
source resolve like this: a link with an anchor goes to whichever entry emits that heading;
a bare link (no anchor) goes to the entry without `only_headings`.

## Split rules

- Source text is split on lines that start with `## `, outside fenced code blocks. Fences
  (three or more backticks or tildes, also indented or inside a blockquote) are tracked, so
  a `## ` line inside a code block never splits.
- Header stripping happens first. With `strip_header_until`, lines through the first match
  go. Without it, only a leading H1 equal to the title is dropped; if the source starts with
  a different H1 the tool keeps it and warns (set `strip_header_until: "^# "` to drop it).
- `split: "none"` writes one article. Without filters the body is the source (after header
  stripping) unchanged. With `skip_headings` the listed sections are removed. With
  `only_headings` only the listed sections are kept; when exactly one section is kept its
  H2 line is dropped because the article H1 replaces it.
- `split: "h2"` writes one article per kept H2 plus an index article at the entry `slug`.
  - Part slug: the heading with leading `N.` / `N)` numbering or a bare leading number
    (`1 The inventory`) stripped, and any trailing bracketed groups (`[CONFIRMED ...]`,
    `(see note)`), plain or wrapped in backticks, removed, then slugified (lowercase, runs of non-alphanumerics become one
    hyphen, trimmed). `parts` overrides it.
  - Part title: the same text as the slug is derived from. `parts` overrides it. The
    article's H1 keeps the bracketed text (only the numbering is stripped).
  - The part's H2 becomes the article's H1. Nothing is demoted: H3s inside the part stay
    H3, so a part goes H1 then H3 with no H2. This is a known imperfection the styling
    phase can revisit.
  - Index article: H1 = entry title, the provenance line, the text before the first H2,
    then an ordered list linking every part by site path in source order.
  - `related_articles` of each part lists its sibling parts; the index lists all parts.
- Every article body is: `# Title`, a blank line, the provenance blockquote, a blank line,
  the content. Provenance line:
  `> Source: {source} (compiled {compiled}, verified against Project Zomboid {game_version}). Imported {today}. Confidence tags in the text are the original author's.`
- Everything else is preserved as written: tables, blockquotes, nested lists, confidence
  tags, code. Nothing is reflowed.

### Output

- Path: `<out>/{target}/{game}/{version}/{section}/{category}/{slug}.md`.
- Frontmatter: `id` (`{version}-{slug}`, so `build-42-{slug}`), `slug`, `title`, `game`,
  `version`, `section`, `category`, `difficulty`, `tags`, `excerpt`, `last_updated` (the
  day of the run), and `related_articles` for split entries.
- Excerpt: the first prose paragraph after the provenance line (headings, rules, tables,
  code and HTML are skipped), with markdown stripped, cut at 200 characters on a word
  boundary. An index with no intro text gets "Title, in N parts: ...".
- Idempotent: a run overwrites exactly the paths derived from the manifests and never
  deletes anything. A removed or renamed entry leaves its old file behind; delete it by hand.

## Link rules

Applied to inline links `[text](target "title")` (also when the text wraps a line) and to
reference definitions `[label]: target`, outside fenced code and inline code spans.

| Link | Result |
|---|---|
| External (`http:`, `https:`, `mailto:`, any scheme, `//host`) | Untouched. |
| Site-absolute (`/pz/...`) | Untouched. |
| Image `![alt](src)` | Untouched. |
| Relative link to a `.md` file that is a `source` in any loaded manifest | Rewritten to that entry's site path, `#anchor` preserved. |
| ... whose entry is split | Anchor equal to a part's H2 -> that part (anchor dropped). Anchor of a heading inside a part -> that part plus the anchor. Otherwise -> the index. |
| Relative link to a `.md` file in no manifest | Plain text: `text (local reference: filename)`. |
| Same-file `#anchor` in a split or twice-mapped source | Resolved like a link into that source; left as written when it points into the same article. |
| Same-file `#anchor` in an unsplit source | Untouched. |
| Relative link to a non-`.md` file | Left as written; counted in a warning. |

Links are resolved relative to the source file's folder, so `../B42_UI/01-ui.md` in one
manifest finds an entry in another. Anchors are compared against the heading ids the site's
renderer produces (rehype-slug) and against the slugified heading with and without numbering.
Link targets always use the article path even when the entry's target is `drafts`; such
links are dead on the site until the draft is published, and `check-links.ts` lists them as
"draft target".

## Known imperfections

- No heading demotion in split parts (H1 followed by H3), as described above.
- An `only_headings` entry with several sections keeps their H2s under its H1.
- Split parts and the index lose trailing horizontal rules (`---`) and blank lines at the
  end of each section, since they only separated sections in the source.
- Line endings are normalized to LF and a leading byte-order mark is removed.
- A reference definition that points at an unmapped `.md` file is left as written (a
  definition cannot become plain text); the run warns about it.
- Relative links to non-markdown files (scripts, images in other folders) are left as
  written and will be dead on the site.
- Sources are always read as markdown; a non-markdown source (for example `workshop.txt`)
  is copied through as text.
- Removing an entry never removes its previously written file.
