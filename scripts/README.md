# Scripts Directory

## migrations/
One-time data migration and cleanup scripts. These were used during the transition from v1 to v2 (Supabase migration).

**Status:** Archived - Do not run unless you know what you're doing.

### Scripts:
- `convert_metadata_to_frontmatter.py` - Converted old JSON metadata to YAML frontmatter
- `cleanup_leftover_metadata.py` - Removed stray metadata after conversion
- `fix_yaml_frontmatter.py` - Fixed malformed YAML frontmatter
- `fix_leftover_fragments.py` - Cleaned up markdown fragments
- `import_to_supabase.py` - Initial Supabase import script
- `import_markdown_to_supabase.py` - Re-import with corrected data

**When to use:** Never, unless restoring from backup or re-running initial setup.

## Development Scripts

All active development scripts are managed through `package.json` in the packages/web directory:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
