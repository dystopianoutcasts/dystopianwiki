#!/usr/bin/env python3
"""
Fix leftover text fragments after code blocks in converted markdown files.

Targets patterns like:
     
     
     

And removes everything after the closing code fence.
"""

import re
import sys
from pathlib import Path

def fix_file(filepath: Path, dry_run: bool = True):
    """Fix leftover fragments at end of file."""
    with open(filepath, 'r', encoding='utf-8', newline=None) as f:
        content = f.read()

    # Normalize line endings
    original_content = content
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Find closing code fence followed by leftover text
    # Match: ``` at end followed by anything that isn't just whitespace
    # We want to keep the ```, remove everything after it except one newline
    pattern = r'(```)\n?(build-\d+|20\d{2}-\d{2}-\d{2}|- \*\*.*?)[\s\S]*$'

    if re.search(pattern, content):
        # Replace with just the closing fence and one newline
        new_content = re.sub(pattern, r'\1\n', content)

        if new_content != content:
            if dry_run:
                print(f"✓ Would fix: {filepath.name}")
                # Show what would be removed
                removed = content[len(new_content):]
                if removed:
                    print(f"  Would remove: {repr(removed[:100])}")
                return True
            else:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ Fixed: {filepath.name}")
                return True

    return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Fix leftover markdown fragments')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing')
    parser.add_argument('--path', default='_archive-v1/public/api/pz/v1/build-41/modding', help='Path to scan')
    args = parser.parse_args()

    base_path = Path(args.path)
    if not base_path.exists():
        print(f"Error: Path not found: {base_path}")
        sys.exit(1)

    md_files = list(base_path.rglob('*.md'))

    print(f"\n{'='*60}")
    print(f"Leftover Fragment Cleanup")
    print(f"{'='*60}")

    if args.dry_run:
        print("DRY RUN MODE - No files will be modified\n")
    else:
        print("LIVE MODE - Files will be modified\n")

    print(f"Scanning {len(md_files)} files...\n")

    fixed = 0
    for filepath in md_files:
        if fix_file(filepath, args.dry_run):
            fixed += 1

    print(f"\n{'='*60}")
    if args.dry_run:
        print(f"Would fix {fixed} files")
        print("\nRun without --dry-run to apply fixes")
    else:
        print(f"Fixed {fixed} files")
        print("Cleanup complete!")

if __name__ == '__main__':
    main()
