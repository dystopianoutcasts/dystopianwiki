#!/usr/bin/env python3
"""
Convert JSON wiki article files to markdown format.

This script reads a JSON wiki article file, extracts the markdown content,
and adds metadata at the bottom before saving as a .md file.
"""

import json
import sys
from pathlib import Path


def convert_json_to_md(json_file_path):
    """
    Convert a JSON wiki article to markdown format.
    
    Args:
        json_file_path: Path to the JSON file to convert
    """
    json_path = Path(json_file_path)
    
    # Check if file exists
    if not json_path.exists():
        print(f"Error: File not found: {json_file_path}")
        sys.exit(1)
    
    # Check if file is JSON
    if json_path.suffix != '.json':
        print(f"Error: File must be a JSON file: {json_file_path}")
        sys.exit(1)
    
    # Read JSON file
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
    
    # Extract fields
    content = data.get('content', '')
    version = data.get('version', 'N/A')
    section = data.get('section', 'N/A')
    category = data.get('category', 'N/A')
    tags = data.get('tags', [])
    difficulty = data.get('difficulty', 'N/A')
    last_updated = data.get('lastUpdated', 'N/A')
    
    # Build markdown content
    md_content = content.strip()
    
    # Add metadata section at the bottom
    md_content += "\n\n---\n\n"
    md_content += "## Metadata\n\n"
    md_content += f"- **Version**: {version}\n"
    md_content += f"- **Section**: {section}\n"
    md_content += f"- **Category**: {category}\n"
    md_content += f"- **Tags**: {', '.join(tags) if tags else 'None'}\n"
    md_content += f"- **Difficulty**: {difficulty}\n"
    md_content += f"- **Last Updated**: {last_updated}\n"
    
    # Create output file path (same name, different extension)
    md_path = json_path.with_suffix('.md')
    
    # Write markdown file
    try:
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"Successfully converted: {json_path.name} -> {md_path.name}")
        print(f"Output file: {md_path}")
    except Exception as e:
        print(f"Error writing markdown file: {e}")
        sys.exit(1)


def main():
    """Main entry point for the script."""
    if len(sys.argv) != 2:
        print("Usage: python convert_json_to_md.py <json_file_path>")
        print("\nExample:")
        print("  python convert_json_to_md.py /path/to/article.json")
        sys.exit(1)
    
    json_file_path = sys.argv[1]
    convert_json_to_md(json_file_path)


if __name__ == '__main__':
    main()
