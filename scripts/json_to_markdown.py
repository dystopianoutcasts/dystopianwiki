#!/usr/bin/env python3
"""
Batch convert JSON articles to Markdown with YAML frontmatter.

Features:
- Dry-run mode (preview changes)
- Batch conversion of directories
- ASCII-only output (no Unicode characters)
- Automatic directory creation
- Detailed logging

Usage:
    python scripts/json_to_markdown.py --dry-run                          # Preview all
    python scripts/json_to_markdown.py                                    # Convert all
    python scripts/json_to_markdown.py --file path/to/article.json       # Single file
    python scripts/json_to_markdown.py --source-branch feature/branch    # From branch
"""

import json
import sys
import argparse
import subprocess
from pathlib import Path
from typing import Dict, Optional, List

class Colors:
    """ASCII-safe color codes for terminal output."""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_info(msg: str):
    print(f"{Colors.BLUE}[INFO]{Colors.RESET} {msg}")

def log_success(msg: str):
    print(f"{Colors.GREEN}[OK]{Colors.RESET} {msg}")

def log_warning(msg: str):
    print(f"{Colors.YELLOW}[WARN]{Colors.RESET} {msg}")

def log_error(msg: str):
    print(f"{Colors.RED}[ERROR]{Colors.RESET} {msg}")

def extract_from_git_branch(branch: str, json_path: str) -> Optional[str]:
    """Extract JSON file from a git branch."""
    try:
        result = subprocess.run(
            ['git', 'show', f'{branch}:{json_path}'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to extract {json_path} from branch {branch}")
        log_error(f"Git error: {e.stderr}")
        return None

def convert_json_to_markdown(json_data: Dict, game: str = 'pz') -> str:
    """
    Convert JSON article data to Markdown with YAML frontmatter.
    Returns complete markdown content as string.
    """
    lines = ['---']

    # Required fields
    lines.append(f'id: {json_data.get("id", "unknown")}')
    lines.append(f'slug: {json_data.get("slug", "unknown")}')

    # Title - escape quotes
    title = json_data.get('title', 'Untitled').replace('"', '\\"')
    lines.append(f'title: "{title}"')

    lines.append(f'game: {game}')
    lines.append(f'version: {json_data.get("version", "build-41")}')
    lines.append(f'section: {json_data.get("section", "modding")}')
    lines.append(f'category: {json_data.get("category", "general")}')
    lines.append(f'subcategory: {json_data.get("subcategory", "null")}')

    # Difficulty
    if 'difficulty' in json_data:
        lines.append(f'difficulty: {json_data["difficulty"]}')

    # Tags
    lines.append('tags:')
    tags = json_data.get('tags', [])
    if tags:
        for tag in tags:
            lines.append(f'  - {tag}')
    else:
        lines.append('  []')

    # Excerpt - escape quotes and normalize whitespace
    excerpt = json_data.get('excerpt', 'No description available.')
    excerpt = excerpt.replace('\n', ' ').replace('"', '\\"')
    lines.append(f'excerpt: "{excerpt}"')

    # Related articles
    related = json_data.get('relatedArticles', [])
    if related:
        lines.append('related_articles:')
        for article in related:
            lines.append(f'  - {article}')

    # Table of contents
    toc = json_data.get('tableOfContents', [])
    if toc:
        lines.append('table_of_contents:')
        for item in toc:
            text = item.get('text', '').replace('"', '\\"')
            link = item.get('id', '')
            lines.append(f'  - text: "{text}"')
            lines.append(f'    link: "#{link}"')

    # Next steps
    next_steps = json_data.get('nextSteps', [])
    if next_steps:
        lines.append('next_steps:')
        for step in next_steps:
            step_title = step.get('title', '').replace('"', '\\"')
            # Handle both 'url' and 'path' keys
            step_path = step.get('url', step.get('path', ''))
            lines.append(f'  - title: "{step_title}"')
            lines.append(f'    path: {step_path}')

    # Last updated
    lines.append(f'last_updated: {json_data.get("lastUpdated", "2026-01-28")}')

    lines.append('---')
    lines.append('')

    # Content
    content = json_data.get('content', '').strip()
    lines.append(content)
    lines.append('')

    return '\n'.join(lines)

def generate_output_path(json_data: Dict, game: str = 'pz') -> Path:
    """Generate output path from JSON metadata."""
    base_dir = Path('content/articles')

    return base_dir / game / json_data.get('version', 'build-41') / \
           json_data.get('section', 'modding') / json_data.get('category', 'general') / \
           f"{json_data.get('slug', 'article')}.md"

def convert_file(json_path: Path, output_path: Optional[Path] = None,
                game: str = 'pz', dry_run: bool = True) -> bool:
    """
    Convert a single JSON file to Markdown.

    Args:
        json_path: Path to JSON file
        output_path: Optional output path (auto-generated if None)
        game: Game identifier (default: pz)
        dry_run: If True, don't write files

    Returns:
        True if successful, False otherwise
    """
    try:
        # Read JSON
        with open(json_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)

        # Generate output path if not provided
        if output_path is None:
            output_path = generate_output_path(json_data, game)

        # Convert
        markdown_content = convert_json_to_markdown(json_data, game)

        if dry_run:
            log_info(f"Would convert: {json_path.name}")
            log_info(f"  Output: {output_path}")
            return True
        else:
            # Create directory if needed
            output_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)

            log_success(f"Converted: {json_path.name} -> {output_path}")
            return True

    except Exception as e:
        log_error(f"Failed to convert {json_path.name}: {e}")
        return False

def find_json_files(directory: Path) -> List[Path]:
    """Find all JSON article files in directory (excluding index.json)."""
    json_files = []
    for json_file in directory.rglob('*.json'):
        # Skip index files
        if json_file.name == 'index.json':
            continue
        json_files.append(json_file)
    return json_files

def main():
    parser = argparse.ArgumentParser(
        description='Convert JSON articles to Markdown with YAML frontmatter',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without writing files'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Convert a single file'
    )
    parser.add_argument(
        '--directory',
        type=str,
        default='_archive-v1/public/api/pz/v1/build-41/modding',
        help='Directory to scan for JSON files (default: _archive-v1/...)'
    )
    parser.add_argument(
        '--game',
        type=str,
        default='pz',
        help='Game identifier (default: pz)'
    )
    parser.add_argument(
        '--source-branch',
        type=str,
        help='Extract files from git branch (e.g., feature/v3-article-standards)'
    )

    args = parser.parse_args()

    print(f"\n{Colors.BOLD}JSON to Markdown Converter{Colors.RESET}")
    print("=" * 60)

    if args.dry_run:
        log_warning("DRY RUN MODE - No files will be written")
    else:
        log_info("LIVE MODE - Files will be created")

    print()

    success_count = 0
    fail_count = 0

    if args.file:
        # Single file conversion
        json_path = Path(args.file)
        if not json_path.exists():
            log_error(f"File not found: {json_path}")
            sys.exit(1)

        success = convert_file(json_path, game=args.game, dry_run=args.dry_run)
        if success:
            success_count = 1
        else:
            fail_count = 1

    elif args.source_branch:
        # Extract from git branch
        log_info(f"Extracting JSON files from branch: {args.source_branch}")

        # Find JSON files in branch
        try:
            result = subprocess.run(
                ['git', 'ls-tree', '-r', '--name-only', args.source_branch],
                capture_output=True,
                text=True,
                check=True
            )

            all_files = result.stdout.strip().split('\n')
            json_files = [f for f in all_files if f.endswith('.json') and 'index.json' not in f]

            log_info(f"Found {len(json_files)} JSON articles in branch")
            print()

            for json_path in json_files:
                # Extract file content
                content = extract_from_git_branch(args.source_branch, json_path)
                if not content:
                    fail_count += 1
                    continue

                # Parse JSON
                try:
                    json_data = json.loads(content)

                    # Generate output path
                    output_path = generate_output_path(json_data, args.game)

                    # Convert
                    markdown_content = convert_json_to_markdown(json_data, args.game)

                    if args.dry_run:
                        log_info(f"Would convert: {Path(json_path).name}")
                        log_info(f"  Output: {output_path}")
                        success_count += 1
                    else:
                        output_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(output_path, 'w', encoding='utf-8') as f:
                            f.write(markdown_content)
                        log_success(f"Converted: {Path(json_path).name} -> {output_path}")
                        success_count += 1

                except Exception as e:
                    log_error(f"Failed to convert {json_path}: {e}")
                    fail_count += 1

        except subprocess.CalledProcessError as e:
            log_error(f"Git command failed: {e.stderr}")
            sys.exit(1)

    else:
        # Batch directory conversion
        directory = Path(args.directory)
        if not directory.exists():
            log_error(f"Directory not found: {directory}")
            sys.exit(1)

        json_files = find_json_files(directory)

        if not json_files:
            log_warning(f"No JSON files found in {directory}")
            sys.exit(0)

        log_info(f"Found {len(json_files)} JSON articles")
        print()

        for json_file in json_files:
            success = convert_file(json_file, game=args.game, dry_run=args.dry_run)
            if success:
                success_count += 1
            else:
                fail_count += 1

    # Summary
    print()
    print("=" * 60)
    print(f"{Colors.BOLD}Summary{Colors.RESET}")
    print(f"  Converted: {success_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total: {success_count + fail_count}")

    if args.dry_run:
        print(f"\n{Colors.YELLOW}Run without --dry-run to perform actual conversion{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}Conversion complete!{Colors.RESET}")

    sys.exit(0 if fail_count == 0 else 1)

if __name__ == '__main__':
    main()
