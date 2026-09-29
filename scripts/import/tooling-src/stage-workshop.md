# stage-workshop.ps1

## What it is for

Stages one Outcast mod as a real COPY under `Zomboid\Workshop\`, ready for the
in-game Workshop uploader. It is mod-agnostic: one script serves the whole
family, discovering the mod id from `Contents\mods\` rather than assuming it
matches the repo folder name (`OutcastAdvancedCrafts\` ships
`Contents\mods\OutcastAdvCrft`, for example).

It copies deliberately, rather than linking with a junction, because a
junctioned mod that ships `media/AnimSets` makes the client fail to join ANY
multiplayer server: `AdvancedAnimator.loadModMedia` resolves the junction with
`File.getCanonicalFile()` while `ZomboidFileSystem.getCanonicalFile()` does
not, so the two paths never agree and the lookup throws. Single-player never
exercises that path, which is why the fault stays hidden until the first MP
test.

There are two separate name spaces this script has to respect:
`Zomboid\Workshop\<RepoFolder>` (the staging area, and also a load path) and
`Zomboid\mods\<ModId>` (where `install-junctions.ps1` links for local dev).

## How to invoke it

Run from PowerShell against a mod repo folder; see the script's own
`.PARAMETER` blocks for the exact switches (mod path, and an overwrite/force
option for an existing staged copy).

## Inputs and outputs

- Input: a mod repo folder in the standard `Contents\mods\<ModId>` layout.
- Output: a full copy of the repo's Workshop-relevant contents under
  `Zomboid\Workshop\<RepoFolder>`, plus console progress lines. It calls
  `check-workshop-item.py` as a pre-flight check and surfaces its failures.

## Exit codes

`exit 0` on success; `exit 1` when the pre-flight `check-workshop-item.py`
check fails and staging is aborted.
