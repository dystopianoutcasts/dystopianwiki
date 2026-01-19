#!/usr/bin/env python3
"""
Import markdown articles with YAML frontmatter to Supabase.

Reads .md files from _archive-v1/public/api/pz/v1/build-41/modding/
Parses YAML frontmatter and markdown content
Imports to Supabase articles table

Usage:
    python scripts/import_markdown_to_supabase.py --dry-run    # Preview only
    python scripts/import_markdown_to_supabase.py              # Import to Supabase

Requirements:
    pip install supabase pyyaml

    Set environment variables:
    export SUPABASE_URL="https://xxxxx.supabase.co"
    export SUPABASE_SERVICE_KEY="your-service-key"
"""

import os
import sys
import yaml
import argparse
from pathlib import Path
from typing import Dict, Optional, List
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase package not found. Install with: pip install supabase")
    sys.exit(1)

# ANSI colors
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

def parse_yaml_frontmatter(content: str) -> tuple[Optional[Dict], str]:
    """
    Extract YAML frontmatter and markdown content.

    Returns:
        (frontmatter_dict, markdown_content)
    """
    if not content.startswith('---\n'):
        return None, content

    # Find closing ---
    parts = content.split('---\n', 2)
    if len(parts) < 3:
        return None, content

    try:
        frontmatter = yaml.safe_load(parts[1])
        markdown_content = parts[2].strip()
        return frontmatter, markdown_content
    except yaml.YAMLError as e:
        log_error(f"YAML parsing error: {e}")
        return None, content

def transform_to_supabase_schema(filepath: Path, frontmatter: Dict, content: str) -> Dict:
    """
    Transform markdown article to Supabase schema.

    Expected frontmatter fields:
        id, slug, title, excerpt, game, version, section, category,
        subcategory, difficulty, tags, last_updated
    """
    return {
        'id': frontmatter.get('id', filepath.stem),
        'slug': frontmatter.get('slug', filepath.stem),
        'title': frontmatter.get('title', filepath.stem.replace('-', ' ').title()),
        'content': content,
        'excerpt': frontmatter.get('excerpt', ''),
        'game': frontmatter.get('game', 'pz'),
        'version': frontmatter.get('version', 'build-41'),
        'section': frontmatter.get('section', 'modding'),
        'category': frontmatter.get('category', 'general'),
        'subcategory': frontmatter.get('subcategory'),
        'difficulty': frontmatter.get('difficulty'),
        'tags': frontmatter.get('tags', []),
        'related_articles': frontmatter.get('related_articles', []),
        'table_of_contents': frontmatter.get('table_of_contents', []),
        'next_steps': frontmatter.get('next_steps', []),
        'last_updated': frontmatter.get('last_updated', datetime.now().strftime('%Y-%m-%d')),
    }

def import_markdown_file(
    filepath: Path,
    supabase: Optional[Client],
    dry_run: bool = True
) -> bool:
    """
    Import a single markdown file to Supabase.

    Returns:
        True if successful or skipped appropriately
        False if error occurred
    """
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse frontmatter
        frontmatter, markdown_content = parse_yaml_frontmatter(content)

        if not frontmatter:
            log_warning(f"  Skipping {filepath.name} (no valid frontmatter)")
            return True

        # Transform to Supabase schema
        article_data = transform_to_supabase_schema(filepath, frontmatter, markdown_content)

        if dry_run:
            log_info(f"  Would import: {article_data['title']}")
            print(f"    ID: {article_data['id']}")
            print(f"    Category: {article_data['category']}")
            print(f"    Tags: {', '.join(article_data['tags'][:3])}...")
            print(f"    Content length: {len(article_data['content'])} chars")
            return True
        else:
            # Import to Supabase (upsert = insert or update)
            if not supabase:
                log_error("Supabase client not initialized")
                return False

            result = supabase.table('articles').upsert(article_data).execute()
            log_success(f"  Imported: {article_data['title']}")
            return True

    except Exception as e:
        log_error(f"  Error importing {filepath.name}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Import markdown articles to Supabase',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview imports without writing to database'
    )
    parser.add_argument(
        '--path',
        type=str,
        default='_archive-v1/public/api/pz/v1/build-41/modding',
        help='Path to markdown files (default: _archive-v1/public/api/pz/v1/build-41/modding)'
    )

    args = parser.parse_args()

    # Check environment variables
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

    if not args.dry_run and (not SUPABASE_URL or not SUPABASE_SERVICE_KEY):
        log_error("Missing required environment variables:")
        log_error("  SUPABASE_URL")
        log_error("  SUPABASE_SERVICE_KEY")
        print("\nSet them with:")
        print('  export SUPABASE_URL="https://xxxxx.supabase.co"')
        print('  export SUPABASE_SERVICE_KEY="your-service-key"')
        sys.exit(1)

    # Initialize Supabase client (only if not dry-run)
    supabase = None
    if not args.dry_run:
        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            log_success(f"Connected to Supabase: {SUPABASE_URL}")
        except Exception as e:
            log_error(f"Failed to connect to Supabase: {e}")
            sys.exit(1)

    # Find markdown files
    base_path = Path(args.path)
    if not base_path.exists():
        log_error(f"Path not found: {base_path}")
        sys.exit(1)

    # Find all .md files, excluding backups and index files
    md_files = [
        f for f in base_path.rglob('*.md')
        if '.backup' not in str(f) and f.name != 'index.md'
    ]

    if not md_files:
        log_warning(f"No markdown files found in {base_path}")
        sys.exit(0)

    print(f"\n{Colors.BOLD}Markdown → Supabase Import{Colors.RESET}")
    print(f"{'='*60}")

    if args.dry_run:
        log_warning("DRY RUN MODE - No data will be written to Supabase")
    else:
        log_info("LIVE MODE - Data will be imported to Supabase")

    print(f"\nFound {len(md_files)} markdown files in {base_path}\n")

    # Process files
    imported_count = 0
    skipped_count = 0
    error_count = 0

    for filepath in sorted(md_files):
        relative_path = filepath.relative_to(base_path.parent)
        print(f"\n{Colors.BOLD}{relative_path}{Colors.RESET}")

        success = import_markdown_file(filepath, supabase, dry_run=args.dry_run)

        if success:
            imported_count += 1
        else:
            error_count += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"{Colors.BOLD}Summary{Colors.RESET}")
    print(f"  Total files: {len(md_files)}")

    if args.dry_run:
        print(f"  Would import: {imported_count}")
    else:
        print(f"  Imported: {imported_count}")

    print(f"  Errors: {error_count}")

    if args.dry_run:
        print(f"\n{Colors.YELLOW}Run without --dry-run to import to Supabase{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}Import complete!{Colors.RESET}")
        print(f"\nVerify in Supabase dashboard:")
        print(f"  {SUPABASE_URL}/project/_/editor")

if __name__ == '__main__':
    main()
