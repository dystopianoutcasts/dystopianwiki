# install-junctions.ps1

## What it is for

Points Project Zomboid at a mod's working tree via directory junctions instead
of a copy step, so there is no way to accidentally test a stale build. It
creates two junctions: `%USERPROFILE%\Zomboid\mods\<ModId>` pointing at
`Contents\mods\<ModId>` (the game's local mod loader), and
`%USERPROFILE%\Zomboid\Workshop\<RepoName>` pointing at the repo root (the
in-game Workshop uploader). The mod id is discovered from `Contents\mods\`,
never assumed from the folder name, because folder and mod id genuinely
differ for some mods (`OutcastAdvancedCrafts\` ships `Contents\mods\
OutcastAdvCrft`).

This is the CANONICAL COPY, vendored into each mod's `scripts\` folder at dev
time; `validate-data.ps1` checksums vendored copies against this file and
fails on mismatch. Junctions need no administrator rights (unlike symlinks)
and survive git operations, because git rewrites files rather than the
directory node.

**These links must come off before joining any multiplayer server** -- see
`unstage-all.ps1`. A linked mod with `media/AnimSets`, or any linked mod that
re-opens an entity it does not own, breaks the MP join in two independently
confirmed ways; the client cannot join at all.

## How to invoke it

```
.\install-junctions.ps1            # create the junctions
.\install-junctions.ps1 -Remove    # remove them instead
```

## Inputs and outputs

- Input: the mod repo's `Contents\mods\<ModId>` layout.
- Output: the two junctions described above. An existing junction at either
  path is replaced on re-run; an existing real directory is left untouched
  and the script stops instead of overwriting it.

## Exit codes

Uses `$ErrorActionPreference = 'Stop'`: any failure (for example a real
directory already occupying a junction's target path) throws and stops the
script rather than partially linking.
