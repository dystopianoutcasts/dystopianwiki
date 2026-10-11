# Field Notes Article Style

Field notes is the Dystopian Outcasts article look: copper section headings, coloured callouts, card grids, badges and meters, with an optional EYES ONLY banner. It comes in two layers:

| Layer | What it is | What you do |
|-------|------------|-------------|
| **Every article** | Labelled callouts, copper H2 headings, rounded tables | Nothing. Existing articles already get it. |
| **Full field notes** | Cover header, numbered sections, plus the components below | Put `::field-notes` on its own line at the top of the body |

The syntax rules live in `packages/shared/field-notes` and the renderer in `packages/web/src/components/wiki/fieldNotes.ts`. The styles are in `styles/components/field-notes.css`, and their colours come from the `--fn-*` tokens in `variables.css`.

## Callouts (every article)

A quote that **opens with a bold label ending in a colon** becomes a callout:

```markdown
> **Key Takeaway:** Cache lookups outside the loop.
> **Warning:** Back up your save first.
> **Mod design idea:** Make ammo type a mechanic.
```

The label picks the colour:

| Kind | Labels |
|------|--------|
| **Warning** (orange) | Warning, Caution, Danger, Important, Read this first |
| **Design** (purple) | Tip, Idea, Design idea, Mod design idea, Next step(s) |
| **Proof** (light blue) | Proof |
| **Key** (blue) | Every other label: Key Takeaway, Note, and so on |

The label stays in the text, so screen readers and copy-paste keep it. A bold label longer than 40 characters is treated as a bold sentence, not a label.

## Components (any article; full look with `::field-notes`)

These use [remark-directive](https://github.com/remarkjs/remark-directive) syntax. A container opens with `:::name` and closes with `:::`. When containers are nested, the outer one gets **more** colons (`::::cards` around `:::card`).

````markdown
::field-notes

::eyes-only[Dystopian Outcasts members]

:::callout[Read this first]{kind=warn}
A callout with any label. Kinds: key, warn, design, proof.
:::

::::cards
:::card[How common?]{accent=orange}
**Rare.** Few civilians owned one.
:::
:::card[Movie quiet?]{accent=purple}
**No.** Ammo type matters.
:::
::::

:::facts
- **Legal status** Legal since 1934.
- **State law** Kentucky allowed ownership.
:::

:::chips
- Gun shop
- Police station
:::

::meter[Suppressed .22, subsonic]{value=1 max=5 text="Quietest"}
::bar[1993]{value=8 max=100 text="Est. tens of thousands" accent=blue}

| Can | On a rifle |
|-----|------------|
| Pistol can | :badge[No] can't take the pressure |
| Rifle can | :badge[Yes] |
````

| Directive | Attributes | Notes |
|-----------|------------|-------|
| `::field-notes` | none | Turns on the full look. It renders nothing. |
| `::eyes-only[text]` | none | The hazard-stripe banner. The text defaults to "Dystopian Outcasts members". |
| `:::callout[label]` | `kind` = key, warn, design or proof | The label defaults to the kind's name. |
| `::::cards` / `:::card[label]` | `accent` = orange, purple, blue or cream | A responsive grid; it becomes one column on phones. |
| `:::facts` | none | Wraps a list. Each item starts with `**Key**`. |
| `:::chips` | none | Wraps a list. |
| `::meter[name]` | `value`, `max` (whole numbers, max 10), `text` | It always shows "text: value of max" in words. |
| `::bar[name]` | `value`, `max` (default 100), `text`, `accent` | Its width is value / max. |
| `:badge[word]` | `kind` = yes, no, maybe, t1, t2, t3 or rare | `Yes` and `No` choose their own colour. Other words default to `maybe`. |

## Rules

- **Colour never carries meaning alone.** Every badge has its word, every meter its text, every callout its label. Keep it that way: no empty badges.
- **No emoji.** The site's `noEmoji` test and the KB style guide forbid them.
- A meter or bar whose numbers don't add up is shown as the text you wrote, so a mistake is visible on the page.
- `:something` that isn't one of the directives above is left as written, so ordinary text like "Note:this" or "10:30" is safe.
- **EYES ONLY is styling, not security.** Anything synced to the site can be read by anyone who can open the article. Don't publish members-only material just because it has the banner.

## Mobile app

The app has no field-notes components. It reads `fieldNotesToPlainMarkdown(content)` instead, where:
- callouts become quotes that start with the bold label
- card labels become bold lines
- meters and bars become their words
- badges become bold words
- the markers disappear

After changing `packages/shared/field-notes`, rebuild the shared package with `npm run shared:build`. `dist/` is ignored by git, so add the new files with `git add -f packages/shared/dist/field-notes/*`.

## Previewing before you sync

```bash
cd packages/web
npx tsx scripts/field-notes-preview.ts ../../content/articles/<path>/my-article.md preview.html
```

This writes a standalone page with the site's article styles and a Dark/Light switch. Open it in VS Code's Simple Browser, or any browser, through a local server such as `python -m http.server`.

## Tests

`src/components/wiki/fieldNotes.test.ts` covers:
- every directive and callout kind
- the mobile plain-Markdown output
- AA contrast for every `--fn-*` colour pair in both themes
- a regression check that renders every article under `content/articles/` with and without field notes, and requires them to match apart from the callouts
