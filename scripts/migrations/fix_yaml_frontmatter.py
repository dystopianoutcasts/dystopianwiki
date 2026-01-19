#!/usr/bin/env python3
"""
Fix YAML frontmatter by quoting excerpt fields that contain special characters.
"""

import yaml
import re
from pathlib import Path

def fix_frontmatter(filepath: Path) -> bool:
    """Fix YAML frontmatter in a file."""
    content = filepath.read_text(encoding='utf-8')

    if not content.startswith('---\n'):
        return False

    parts = content.split('---\n', 2)
    if len(parts) < 3:
        return False

    frontmatter_text = parts[1]
    markdown_content = parts[2]

    # Try parsing - if it works, no fix needed
    try:
        yaml.safe_load(frontmatter_text)
        return False
    except yaml.YAMLError:
        pass

    # Fix excerpt line by quoting it if not already quoted
    lines = frontmatter_text.split('\n')
    fixed_lines = []

    for line in lines:
        if line.startswith('excerpt:'):
            # Extract the excerpt value
            match = re.match(r'excerpt:\s*(.+)', line)
            if match:
                excerpt = match.group(1).strip()
                # If not already quoted and contains special chars, quote it
                if not (excerpt.startswith('"') or excerpt.startswith("'")):
                    # Escape any existing quotes
                    excerpt = excerpt.replace('"', '\\"')
                    line = f'excerpt: "{excerpt}"'
            fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    new_frontmatter = '\n'.join(fixed_lines)

    # Verify it's now valid
    try:
        yaml.safe_load(new_frontmatter)
    except yaml.YAMLError as e:
        print(f"Still invalid after fix: {filepath.name}")
        print(f"  Error: {e}")
        return False

    # Write back
    new_content = f"---\n{new_frontmatter}---\n{markdown_content}"
    filepath.write_text(new_content, encoding='utf-8')

    return True

if __name__ == '__main__':
    base_path = Path('_archive-v1/public/api/pz/v1/build-41/modding')
    md_files = [f for f in base_path.rglob('*.md') if '.backup' not in str(f) and f.name != 'index.md']

    fixed_count = 0
    for filepath in md_files:
        if fix_frontmatter(filepath):
            print(f"✓ Fixed: {filepath.name}")
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")
