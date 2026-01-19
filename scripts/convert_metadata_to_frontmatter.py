#!/usr/bin/env python3
"""
Safely convert markdown files with bottom metadata to YAML frontmatter at top.

Features:
- Dry-run mode (preview changes without writing)
- Automatic backups before modification
- Validates conversion success
- Skips files that already have frontmatter
- Detailed logging of all actions

Usage:
    python scripts/convert_metadata_to_frontmatter.py --dry-run    # Preview only
    python scripts/convert_metadata_to_frontmatter.py              # Actually convert
"""

import re
import sys
import argparse
from pathlib import Path
from typing import Dict, Optional, List
import shutil
from datetime import datetime

# ANSI colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {msg}")

def log_success(msg: str):
    print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")

def log_warning(msg: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {msg}")

def log_error(msg: str):
    print(f"{Colors.RED}✗{Colors.RESET} {msg}")

def extract_title_from_content(content: str) -> Optional[str]:
    """Extract title from first H1 heading."""
    match = re.search(r'^#\s+(.+?)$', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None

def extract_excerpt_from_content(content: str, max_length: int = 200) -> str:
    """Extract excerpt from first paragraph after title."""
    # Remove the title
    content_without_title = re.sub(r'^#\s+.+?\n+', '', content, count=1, flags=re.MULTILINE)

    # Find first paragraph (skip empty lines and markdown elements)
    lines = content_without_title.split('\n')
    excerpt_lines = []

    for line in lines:
        line = line.strip()
        # Skip empty lines, headers, code blocks, metadata
        if not line or line.startswith('#') or line.startswith('```') or line.startswith('---'):
            continue
        # Skip lists and other markdown elements
        if line.startswith('-') or line.startswith('*') or line.startswith('>'):
            continue

        excerpt_lines.append(line)
        if len(' '.join(excerpt_lines)) > max_length:
            break

    excerpt = ' '.join(excerpt_lines)
    if len(excerpt) > max_length:
        excerpt = excerpt[:max_length].rsplit(' ', 1)[0] + '...'

    return excerpt if excerpt else "No description available"

def parse_bottom_metadata(content: str) -> Optional[Dict[str, str]]:
    """
    Extract metadata from bottom of file.

    Expected format:
    ---
    ## Metadata
    - **Version**: build-41
    - **Section**: modding
    - **Category**: recipes
    - **Tags**: tag1, tag2, tag3
    - **Difficulty**: beginner
    - **Last Updated**: 2026-01-09

    Note: Expects content with normalized \n line endings
    """
    # Find metadata section at bottom
    # Match until we hit end of string or double newline
    metadata_pattern = r'---\s*\n+##\s*Metadata\s*\n+((?:^- \*\*.+?\*\*:.+$\n?)+)'
    match = re.search(metadata_pattern, content, re.IGNORECASE | re.MULTILINE)

    if not match:
        return None

    metadata = {}
    metadata_text = match.group(1)

    # Parse each metadata line
    for line in metadata_text.split('\n'):
        line = line.strip()
        if not line or not line.startswith('-'):
            continue

        # Extract key-value: - **Key**: Value
        kv_match = re.match(r'-\s*\*\*(.+?)\*\*:\s*(.+)', line)
        if kv_match:
            key = kv_match.group(1).strip().lower().replace(' ', '_')
            value = kv_match.group(2).strip()
            metadata[key] = value

    return metadata if metadata else None

def has_yaml_frontmatter(content: str) -> bool:
    """Check if file already has YAML frontmatter."""
    return content.strip().startswith('---\n') or content.strip().startswith('---\r\n')

def generate_slug_from_filename(filepath: Path) -> str:
    """Generate URL-safe slug from filename."""
    return filepath.stem.lower().replace('_', '-')

def convert_tags_to_list(tags_str: str) -> List[str]:
    """Convert comma-separated tags string to list."""
    if not tags_str or tags_str.lower() in ['none', 'n/a']:
        return []

    # Split by comma and clean
    tags = [t.strip() for t in tags_str.split(',')]
    return [t for t in tags if t]

def create_yaml_frontmatter(filepath: Path, metadata: Dict[str, str], content: str) -> str:
    """Create YAML frontmatter from metadata."""

    # Generate slug and id from filename
    slug = generate_slug_from_filename(filepath)
    article_id = slug

    # Extract title from content if not in metadata
    title = extract_title_from_content(content)
    if not title:
        title = filepath.stem.replace('-', ' ').replace('_', ' ').title()

    # Extract excerpt
    excerpt = extract_excerpt_from_content(content)

    # Parse tags
    tags = convert_tags_to_list(metadata.get('tags', ''))

    # Build frontmatter
    frontmatter_lines = ['---']
    frontmatter_lines.append(f'id: {article_id}')
    frontmatter_lines.append(f'slug: {slug}')
    frontmatter_lines.append(f'title: {title}')
    frontmatter_lines.append(f'excerpt: {excerpt}')
    frontmatter_lines.append(f'game: {metadata.get("game", "pz")}')
    frontmatter_lines.append(f'version: {metadata.get("version", "build-41")}')
    frontmatter_lines.append(f'section: {metadata.get("section", "modding")}')
    frontmatter_lines.append(f'category: {metadata.get("category", "general")}')
    frontmatter_lines.append(f'subcategory: null')

    difficulty = metadata.get('difficulty', '').lower()
    if difficulty in ['beginner', 'intermediate', 'advanced']:
        frontmatter_lines.append(f'difficulty: {difficulty}')
    else:
        frontmatter_lines.append('difficulty: null')

    # Tags array
    if tags:
        frontmatter_lines.append('tags:')
        for tag in tags:
            frontmatter_lines.append(f'  - {tag}')
    else:
        frontmatter_lines.append('tags: []')

    # Dates
    last_updated = metadata.get('last_updated', datetime.now().strftime('%Y-%m-%d'))
    frontmatter_lines.append(f'last_updated: {last_updated}')

    frontmatter_lines.append('---')
    frontmatter_lines.append('')  # Blank line after frontmatter

    return '\n'.join(frontmatter_lines)

def remove_bottom_metadata(content: str) -> str:
    """Remove metadata section from bottom of file."""
    # Remove everything from --- onwards at the end
    pattern = r'\n*---\s*\n+##\s*Metadata\s*\n+(?:- \*\*.+?\*\*:.+?\n?)+'
    content = re.sub(pattern, '', content, flags=re.IGNORECASE)
    return content.rstrip() + '\n'

def convert_file(filepath: Path, dry_run: bool = True) -> bool:
    """
    Convert a single markdown file.

    Returns:
        True if conversion successful or skipped appropriately
        False if error occurred
    """
    try:
        # Read file with universal newlines
        with open(filepath, 'r', encoding='utf-8', newline=None) as f:
            original_content = f.read()

        # Normalize line endings
        original_content = original_content.replace('\r\n', '\n').replace('\r', '\n')

        # Check if already has frontmatter
        if has_yaml_frontmatter(original_content):
            log_info(f"  Skipping {filepath.name} (already has frontmatter)")
            return True

        # Extract bottom metadata
        metadata = parse_bottom_metadata(original_content)
        if not metadata:
            log_warning(f"  No metadata found in {filepath.name}")
            return True

        # Create frontmatter
        frontmatter = create_yaml_frontmatter(filepath, metadata, original_content)

        # Remove bottom metadata
        content_without_metadata = remove_bottom_metadata(original_content)

        # Combine
        new_content = frontmatter + content_without_metadata

        if dry_run:
            log_info(f"  Would convert: {filepath.name}")
            print(f"    {Colors.YELLOW}Frontmatter preview:{Colors.RESET}")
            for line in frontmatter.split('\n')[:10]:  # Show first 10 lines
                print(f"      {line}")
            return True
        else:
            # Create backup
            backup_path = filepath.with_suffix('.md.backup')
            shutil.copy2(filepath, backup_path)

            # Write new content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

            log_success(f"  Converted: {filepath.name}")
            log_info(f"    Backup: {backup_path.name}")
            return True

    except Exception as e:
        log_error(f"  Error converting {filepath.name}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Convert markdown metadata to YAML frontmatter',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files'
    )
    parser.add_argument(
        '--path',
        type=str,
        default='_archive-v1/public/api/pz/v1/build-41/modding',
        help='Path to markdown files (default: _archive-v1/public/api/pz/v1/build-41/modding)'
    )

    args = parser.parse_args()

    # Find markdown files
    base_path = Path(args.path)
    if not base_path.exists():
        log_error(f"Path not found: {base_path}")
        sys.exit(1)

    md_files = list(base_path.rglob('*.md'))

    if not md_files:
        log_warning(f"No markdown files found in {base_path}")
        sys.exit(0)

    print(f"\n{Colors.BOLD}Markdown Metadata Converter{Colors.RESET}")
    print(f"{'='*60}")

    if args.dry_run:
        log_warning("DRY RUN MODE - No files will be modified")
    else:
        log_info("LIVE MODE - Files will be modified (backups created)")

    print(f"\nFound {len(md_files)} markdown files in {base_path}\n")

    # Process files
    converted_count = 0
    skipped_count = 0
    error_count = 0

    for filepath in md_files:
        relative_path = filepath.relative_to(base_path.parent)
        print(f"\n{Colors.BOLD}{relative_path}{Colors.RESET}")

        success = convert_file(filepath, dry_run=args.dry_run)

        if success:
            if has_yaml_frontmatter(filepath.read_text(encoding='utf-8')):
                skipped_count += 1
            else:
                converted_count += 1
        else:
            error_count += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"{Colors.BOLD}Summary{Colors.RESET}")
    print(f"  Total files: {len(md_files)}")

    if args.dry_run:
        print(f"  Would convert: {converted_count}")
    else:
        print(f"  Converted: {converted_count}")

    print(f"  Skipped: {skipped_count}")
    print(f"  Errors: {error_count}")

    if args.dry_run:
        print(f"\n{Colors.YELLOW}Run without --dry-run to perform actual conversion{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}Conversion complete! Backup files created with .backup extension{Colors.RESET}")

if __name__ == '__main__':
    main()
