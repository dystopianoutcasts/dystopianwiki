#!/usr/bin/env python3
"""
Clean up leftover metadata from bottom of converted files.
Run this after convert_metadata_to_frontmatter.py if metadata wasn't fully removed.
"""

import re
import sys
from pathlib import Path

def cleanup_file(filepath: Path, dry_run: bool = True):
    """Remove leftover metadata fragments from file."""
    with open(filepath, 'r', encoding='utf-8', newline=None) as f:
        content = f.read()

    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Pattern to match leftover metadata at end
    # Match anything after a line that ends with build-41 or similar followed by metadata
    pattern = r'(build-\d+|2025-\d{2}-\d{2}|2026-\d{2}-\d{2})\n- \*\*Section\*\*:.+$'

    if re.search(pattern, content, re.MULTILINE):
        # Remove everything from first occurrence of this pattern to end
        content = re.sub(pattern + r'[\s\S]*$', r'\1\n', content, flags=re.MULTILINE)

        if dry_run:
            print(f"  Would clean: {filepath.name}")
            return True
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Cleaned: {filepath.name}")
            return True

    return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Clean leftover metadata')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--path', default='_archive-v1/public/api/pz/v1/build-41/modding')
    args = parser.parse_args()

    base_path = Path(args.path)
    md_files = list(base_path.rglob('*.md'))

    print(f"Scanning {len(md_files)} files...")

    cleaned = 0
    for filepath in md_files:
        if cleanup_file(filepath, args.dry_run):
            cleaned += 1

    print(f"\n{'Would clean' if args.dry_run else 'Cleaned'} {cleaned} files")

if __name__ == '__main__':
    main()
