#!/usr/bin/env python3
"""
Import existing wiki content from JSON files to Supabase.

Usage:
    python scripts/import_to_supabase.py

Requirements:
    pip install supabase python-dotenv
"""

import os
import json
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file")
    sys.exit(1)

# Initialize Supabase client with service role key (admin access)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Source directory (archived articles)
ARCHIVE_DIR = Path(__file__).parent.parent / "_archive-v1" / "public" / "data"
MODDING_DIR = ARCHIVE_DIR / "build-41" / "modding"

def transform_article(article_json: dict, game: str, version: str, section: str, category: str) -> dict:
    """Transform JSON article to Supabase database schema."""
    return {
        'id': article_json['id'],
        'slug': article_json['slug'],
        'title': article_json['title'],
        'content': article_json['content'],
        'excerpt': article_json.get('excerpt', ''),
        'game': game,
        'version': version,
        'section': section,
        'category': category,
        'subcategory': article_json.get('subcategory'),
        'difficulty': article_json.get('difficulty'),
        'tags': article_json.get('tags', []),
        'related_articles': article_json.get('relatedArticles', []),
        'table_of_contents': article_json.get('tableOfContents', []),
        'next_steps': article_json.get('nextSteps', []),
        'last_updated': article_json.get('lastUpdated', '2026-01-18'),
    }

def import_articles():
    """Import all articles from JSON files."""
    imported_count = 0
    skipped_count = 0
    error_count = 0
    errors = []

    print(f"\n{'='*70}")
    print(f"Starting import from: {MODDING_DIR}")
    print(f"{'='*70}\n")

    # Walk through all category folders
    for category_path in MODDING_DIR.iterdir():
        if not category_path.is_dir():
            continue

        category_name = category_path.name
        print(f"\n📁 Processing category: {category_name}")

        # Find all article JSON files (exclude index.json and categories.json)
        article_files = []
        for file in category_path.glob("*.json"):
            if file.name not in ['index.json', 'categories.json', 'section-info.json']:
                article_files.append(file)

        if not article_files:
            print(f"  ⚠️  No articles found")
            continue

        # Process each article
        for article_file in article_files:
            try:
                with open(article_file, 'r', encoding='utf-8') as f:
                    article_json = json.load(f)

                # Transform to database schema
                article_data = transform_article(
                    article_json,
                    game='pz',
                    version='build-41',
                    section='modding',
                    category=category_name
                )

                # Upsert to Supabase (insert or update if exists)
                result = supabase.table('articles').upsert(article_data).execute()

                print(f"  ✓ {article_data['title']}")
                imported_count += 1

            except json.JSONDecodeError as e:
                error_msg = f"JSON decode error in {article_file.name}: {e}"
                print(f"  ✗ {error_msg}")
                errors.append(error_msg)
                error_count += 1

            except KeyError as e:
                error_msg = f"Missing required field in {article_file.name}: {e}"
                print(f"  ✗ {error_msg}")
                errors.append(error_msg)
                error_count += 1

            except Exception as e:
                error_msg = f"Error importing {article_file.name}: {e}"
                print(f"  ✗ {error_msg}")
                errors.append(error_msg)
                error_count += 1

    # Summary
    print(f"\n{'='*70}")
    print(f"Import Summary")
    print(f"{'='*70}")
    print(f"✅ Successfully imported: {imported_count} articles")
    if skipped_count > 0:
        print(f"⏭️  Skipped: {skipped_count} articles")
    if error_count > 0:
        print(f"❌ Errors: {error_count}")
        print(f"\nError details:")
        for error in errors:
            print(f"  - {error}")

    return imported_count, error_count

def import_categories():
    """Import category metadata."""
    categories_file = MODDING_DIR / "categories.json"

    if not categories_file.exists():
        print("⚠️  No categories.json found, skipping category import")
        return

    print(f"\n{'='*70}")
    print(f"Importing Categories")
    print(f"{'='*70}\n")

    try:
        with open(categories_file, 'r', encoding='utf-8') as f:
            categories_data = json.load(f)

        imported = 0
        for category in categories_data.get('categories', []):
            category_record = {
                'id': category['id'],
                'game': 'pz',
                'section': 'modding',
                'name': category['name'],
                'description': category.get('description', ''),
                'icon': category.get('icon', ''),
                'display_order': category.get('displayOrder', 0),
                # article_count will be auto-calculated by trigger
            }

            supabase.table('categories').upsert(category_record).execute()
            print(f"✓ Category: {category['name']}")
            imported += 1

        print(f"\n✅ Imported {imported} categories")

    except Exception as e:
        print(f"❌ Error importing categories: {e}")

def verify_import():
    """Verify articles were imported successfully."""
    print(f"\n{'='*70}")
    print(f"Verification")
    print(f"{'='*70}\n")

    try:
        # Count total articles
        result = supabase.table('articles').select('id', count='exact').execute()
        article_count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"✓ Total articles in database: {article_count}")

        # Count by category
        result = supabase.table('articles').select('category').execute()
        categories = {}
        for article in result.data:
            cat = article['category']
            categories[cat] = categories.get(cat, 0) + 1

        print(f"\nArticles by category:")
        for cat, count in sorted(categories.items()):
            print(f"  - {cat}: {count}")

        # Test full-text search
        search_result = supabase.rpc('search_articles', {
            'p_query': 'weapon',
            'p_limit': 5
        }).execute()

        print(f"\n✓ Search function test: Found {len(search_result.data)} results for 'weapon'")

    except Exception as e:
        print(f"⚠️  Verification error: {e}")

if __name__ == '__main__':
    print("\n🚀 Dystopian Outcasts Wiki - Supabase Import")
    print(f"📍 Supabase URL: {SUPABASE_URL}")
    print(f"📂 Source: {ARCHIVE_DIR}")

    # Step 1: Import categories first
    import_categories()

    # Step 2: Import articles
    imported, errors = import_articles()

    # Step 3: Verify import
    if imported > 0:
        verify_import()

    # Exit code
    if errors > 0:
        print(f"\n⚠️  Import completed with {errors} errors")
        sys.exit(1)
    else:
        print(f"\n✅ Import completed successfully!")
        sys.exit(0)
