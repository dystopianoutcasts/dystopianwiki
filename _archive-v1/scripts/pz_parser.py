#!/usr/bin/env python3
"""
Project Zomboid Script Parser
============================
Parses PZ .txt script files (items, recipes, fixing, etc.) and generates
wiki article JSON files.

Usage:
    python pz_parser.py --help
    python pz_parser.py parse items_weapons.txt
    python pz_parser.py generate-all
    python pz_parser.py stats
"""

import os
import re
import json
import hashlib
import argparse
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from datetime import datetime

# =============================================================================
# Configuration
# =============================================================================

PZ_SCRIPTS_PATH = Path(r"R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts")
WIKI_DATA_PATH = Path(__file__).parent.parent / "public" / "data" / "build-41" / "modding" / "vanilla-reference"

# Category metadata for weapons
WEAPON_CATEGORIES = {
    'Axe': {'order': 1, 'skill': 'Axe', 'desc': 'Axes excel at chopping trees and can deal devastating critical hits.'},
    'LongBlade': {'order': 2, 'skill': 'Long Blade', 'desc': 'Long bladed weapons like katanas and machetes. High damage.'},
    'SmallBlade': {'order': 3, 'skill': 'Short Blade', 'desc': 'Knives, cleavers, and other small cutting weapons. Fast attacks.'},
    'Blunt': {'order': 4, 'skill': 'Long Blunt', 'desc': 'Large blunt weapons like baseball bats. Good knockback.'},
    'SmallBlunt': {'order': 5, 'skill': 'Short Blunt', 'desc': 'Hammers, pipes, and other small blunt weapons.'},
    'Spear': {'order': 6, 'skill': 'Spear', 'desc': 'Spears have excellent range but are fragile.'},
    'Improvised': {'order': 7, 'skill': None, 'desc': 'Improvised weapons not designed for combat.'},
    'Unarmed': {'order': 8, 'skill': None, 'desc': 'Items that enhance unarmed combat.'},
}

# Item type categories for general items
ITEM_TYPES = {
    'Food': {'icon': 'utensils', 'desc': 'Consumable food items'},
    'Drainable': {'icon': 'droplet', 'desc': 'Items that drain with use'},
    'Weapon': {'icon': 'sword', 'desc': 'Melee and ranged weapons'},
    'Clothing': {'icon': 'shirt', 'desc': 'Wearable clothing and armor'},
    'Container': {'icon': 'box', 'desc': 'Containers and bags'},
    'Literature': {'icon': 'book', 'desc': 'Books, magazines, and skill books'},
    'Normal': {'icon': 'cube', 'desc': 'General items'},
}

# Recipe categories
RECIPE_CATEGORIES = {
    'Cooking': {'desc': 'Food preparation and cooking recipes'},
    'Carpentry': {'desc': 'Woodworking and construction recipes'},
    'Survivalist': {'desc': 'Survival crafting recipes'},
    'Metalworking': {'desc': 'Metal working recipes'},
    'Electrical': {'desc': 'Electronics and electrical recipes'},
    'Mechanics': {'desc': 'Vehicle and mechanical recipes'},
    'Farming': {'desc': 'Agriculture and farming recipes'},
    'Tailoring': {'desc': 'Clothing and fabric recipes'},
}

# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class ParsedItem:
    """Represents a single parsed item/definition from a PZ script file."""
    module: str
    name: str
    item_type: str
    properties: Dict[str, Any]
    source_file: str
    line_number: int

    @property
    def full_name(self) -> str:
        return f"{self.module}.{self.name}"

    def get(self, key: str, default: Any = None) -> Any:
        return self.properties.get(key, default)

    def get_list(self, key: str) -> List[str]:
        """Get a property as a list (handles semicolon-separated values)."""
        val = self.properties.get(key)
        if val is None:
            return []
        if isinstance(val, list):
            return val
        return [val]


@dataclass
class ParsedModule:
    """Represents a module containing items."""
    name: str
    items: List[ParsedItem] = field(default_factory=list)


@dataclass
class ParsedRecipe:
    """Represents a parsed recipe from a PZ script file."""
    module: str
    name: str
    recipe_type: str  # 'recipe' or 'evolvedrecipe'
    ingredients: List[str]
    properties: Dict[str, Any]
    source_file: str
    line_number: int

    @property
    def full_name(self) -> str:
        return f"{self.module}.{self.name}"

    def get(self, key: str, default: Any = None) -> Any:
        return self.properties.get(key, default)

    @property
    def result(self) -> str:
        return self.properties.get('Result', self.properties.get('ResultItem', 'Unknown'))

    @property
    def category(self) -> str:
        return self.properties.get('Category', 'Uncategorized')

    @property
    def time(self) -> str:
        return self.properties.get('Time', '?')


@dataclass
class ParsedFixing:
    """Represents a parsed fixing entry from a PZ script file."""
    module: str
    name: str
    require: str  # The item type this fixing applies to
    fixers: List[Dict[str, Any]]  # List of fixer options
    properties: Dict[str, Any]
    source_file: str
    line_number: int

    @property
    def full_name(self) -> str:
        return f"{self.module}.{self.name}"


@dataclass
class ParsedSound:
    """Represents a parsed sound definition from a PZ script file."""
    module: str
    name: str
    category: str  # Item, Object, Player, Zombie, World, UI, etc.
    clips: List[str]  # List of FMOD event paths
    properties: Dict[str, Any]
    source_file: str
    line_number: int

    @property
    def full_name(self) -> str:
        return f"{self.module}.{self.name}"


@dataclass
class WikiArticle:
    """Represents a wiki article in JSON format."""
    id: str
    title: str
    slug: str
    version: str
    section: str
    category: str
    tags: List[str]
    difficulty: str
    content: str
    excerpt: str
    lastUpdated: str
    relatedArticles: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# =============================================================================
# Parser
# =============================================================================

class PZScriptParser:
    """Parses Project Zomboid .txt script files."""

    def __init__(self, scripts_path: Path = PZ_SCRIPTS_PATH):
        self.scripts_path = scripts_path

    def parse_file(self, filename: str) -> List[ParsedModule]:
        """Parse a single script file and return list of modules."""
        filepath = self.scripts_path / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Script file not found: {filepath}")

        content = filepath.read_text(encoding='utf-8', errors='replace')
        return self._parse_content(content, filename)

    def _parse_content(self, content: str, source_file: str) -> List[ParsedModule]:
        """Parse script content into modules and items."""
        modules = []
        lines = content.split('\n')

        current_module: Optional[ParsedModule] = None
        current_item: Optional[Dict] = None
        brace_depth = 0
        item_start_line = 0
        in_imports = False
        imports_depth = 0

        for i, line in enumerate(lines, 1):
            trimmed = line.strip()

            # Skip comments and empty lines
            if not trimmed or trimmed.startswith('/*') or trimmed.startswith('//') or trimmed.startswith('*'):
                continue

            # Handle imports block (skip it)
            if trimmed == 'imports':
                in_imports = True
                continue
            if in_imports:
                if trimmed == '{':
                    imports_depth += 1
                    continue
                elif trimmed == '}':
                    imports_depth -= 1
                    if imports_depth <= 0:
                        in_imports = False
                        imports_depth = 0
                    continue
                else:
                    continue  # Skip content inside imports

            # Module declaration
            module_match = re.match(r'^module\s+(\w+)\s*$', trimmed)
            if module_match:
                current_module = ParsedModule(name=module_match.group(1))
                modules.append(current_module)
                continue

            # Opening brace for module
            if trimmed == '{' and current_module and brace_depth == 0:
                brace_depth = 1
                continue

            # Item/recipe/fixing declaration
            item_match = re.match(r'^(item|recipe|fixing)\s+(\w+)\s*$', trimmed)
            if item_match and current_module and brace_depth == 1:
                current_item = {
                    'type': item_match.group(1),
                    'name': item_match.group(2),
                    'properties': {},
                    'line': i,
                }
                item_start_line = i
                continue

            # Opening brace for item
            if trimmed == '{' and current_item and brace_depth == 1:
                brace_depth = 2
                continue

            # Inside item - parse properties
            if current_item and brace_depth == 2:
                # Closing brace for item
                if trimmed in ('}', '},'):
                    brace_depth = 1

                    item = ParsedItem(
                        module=current_module.name,
                        name=current_item['name'],
                        item_type=current_item['properties'].get('Type', current_item['type']),
                        properties=current_item['properties'],
                        source_file=source_file,
                        line_number=item_start_line,
                    )
                    current_module.items.append(item)
                    current_item = None
                    continue

                # Parse property
                prop_match = re.match(r'^(\w+)\s*=\s*(.+?),?\s*$', trimmed)
                if prop_match:
                    key = prop_match.group(1)
                    value = prop_match.group(2).strip().rstrip(',')

                    # Handle semicolon-separated lists
                    if ';' in value:
                        current_item['properties'][key] = [v.strip() for v in value.split(';')]
                    else:
                        current_item['properties'][key] = value

            # Closing brace for module
            if trimmed == '}' and brace_depth == 1:
                brace_depth = 0
                current_module = None

        return modules

    def get_all_items(self, filename: str) -> List[ParsedItem]:
        """Parse file and return flat list of all items."""
        modules = self.parse_file(filename)
        return [item for module in modules for item in module.items]

    def get_stats(self) -> Dict[str, int]:
        """Get item counts for all script files."""
        stats = {}
        for f in self.scripts_path.glob('*.txt'):
            try:
                items = self.get_all_items(f.name)
                stats[f.name] = len(items)
            except Exception as e:
                stats[f.name] = f"error: {e}"
        return stats

    def parse_recipes(self, filename: str) -> List[ParsedRecipe]:
        """Parse recipe file and return list of recipes."""
        filepath = self.scripts_path / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Script file not found: {filepath}")

        content = filepath.read_text(encoding='utf-8', errors='replace')
        return self._parse_recipes_content(content, filename)

    def _parse_recipes_content(self, content: str, source_file: str) -> List[ParsedRecipe]:
        """Parse recipe content."""
        recipes = []
        lines = content.split('\n')

        current_module = "Base"
        current_recipe: Optional[Dict] = None
        brace_depth = 0
        recipe_start_line = 0
        in_comment = False

        for i, line in enumerate(lines, 1):
            trimmed = line.strip()

            # Handle multi-line comments
            if '/*' in trimmed:
                in_comment = True
            if '*/' in trimmed:
                in_comment = False
                continue
            if in_comment:
                continue

            # Skip single-line comments and empty
            if not trimmed or trimmed.startswith('//'):
                continue

            # Module declaration
            module_match = re.match(r'^module\s+(\w+)\s*$', trimmed)
            if module_match:
                current_module = module_match.group(1)
                continue

            # Opening brace for module
            if trimmed == '{' and brace_depth == 0:
                brace_depth = 1
                continue

            # Recipe declaration (recipe or evolvedrecipe)
            recipe_match = re.match(r'^(recipe|evolvedrecipe)\s+(.+?)\s*$', trimmed)
            if recipe_match and brace_depth == 1:
                current_recipe = {
                    'type': recipe_match.group(1),
                    'name': recipe_match.group(2),
                    'ingredients': [],
                    'properties': {},
                    'line': i,
                }
                recipe_start_line = i
                continue

            # Opening brace for recipe
            if trimmed == '{' and current_recipe and brace_depth == 1:
                brace_depth = 2
                continue

            # Inside recipe
            if current_recipe and brace_depth == 2:
                # Closing brace
                if trimmed in ('}', '},'):
                    brace_depth = 1
                    recipe = ParsedRecipe(
                        module=current_module,
                        name=current_recipe['name'],
                        recipe_type=current_recipe['type'],
                        ingredients=current_recipe['ingredients'],
                        properties=current_recipe['properties'],
                        source_file=source_file,
                        line_number=recipe_start_line,
                    )
                    recipes.append(recipe)
                    current_recipe = None
                    continue

                # Parse property (uses colon)
                prop_match = re.match(r'^(\w+):(.+?),?\s*$', trimmed)
                if prop_match:
                    key = prop_match.group(1)
                    value = prop_match.group(2).strip().rstrip(',')
                    current_recipe['properties'][key] = value
                    continue

                # Otherwise it's an ingredient line
                if trimmed.endswith(','):
                    trimmed = trimmed[:-1]
                if trimmed:
                    current_recipe['ingredients'].append(trimmed)

            # Closing brace for module
            if trimmed == '}' and brace_depth == 1:
                brace_depth = 0

        return recipes

    def parse_fixing(self, filename: str = 'fixing.txt') -> List[ParsedFixing]:
        """Parse fixing file and return list of fixing entries."""
        filepath = self.scripts_path / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Script file not found: {filepath}")

        content = filepath.read_text(encoding='utf-8', errors='replace')
        return self._parse_fixing_content(content, filename)

    def _parse_fixing_content(self, content: str, source_file: str) -> List[ParsedFixing]:
        """Parse fixing content."""
        fixings = []
        lines = content.split('\n')

        current_module = "Base"
        current_fixing: Optional[Dict] = None
        brace_depth = 0
        fixing_start_line = 0
        in_comment = False

        for i, line in enumerate(lines, 1):
            trimmed = line.strip()

            # Handle multi-line comments
            if '/*' in trimmed:
                in_comment = True
            if '*/' in trimmed:
                in_comment = False
                continue
            if in_comment:
                continue

            # Skip single-line comments and empty
            if not trimmed or trimmed.startswith('//'):
                continue

            # Module declaration
            module_match = re.match(r'^module\s+(\w+)\s*$', trimmed)
            if module_match:
                current_module = module_match.group(1)
                continue

            # Opening brace for module
            if trimmed == '{' and brace_depth == 0:
                brace_depth = 1
                continue

            # Fixing declaration
            fixing_match = re.match(r'^fixing\s+(.+?)\s*$', trimmed)
            if fixing_match and brace_depth == 1:
                current_fixing = {
                    'name': fixing_match.group(1),
                    'require': None,
                    'fixers': [],
                    'properties': {},
                    'line': i,
                }
                fixing_start_line = i
                continue

            # Opening brace for fixing
            if trimmed == '{' and current_fixing and brace_depth == 1:
                brace_depth = 2
                continue

            # Inside fixing
            if current_fixing and brace_depth == 2:
                # Closing brace
                if trimmed in ('}', '},'):
                    brace_depth = 1
                    fixing = ParsedFixing(
                        module=current_module,
                        name=current_fixing['name'],
                        require=current_fixing['require'] or 'Unknown',
                        fixers=current_fixing['fixers'],
                        properties=current_fixing['properties'],
                        source_file=source_file,
                        line_number=fixing_start_line,
                    )
                    fixings.append(fixing)
                    current_fixing = None
                    continue

                # Parse Require
                require_match = re.match(r'^Require\s*:\s*(.+?),?\s*$', trimmed)
                if require_match:
                    current_fixing['require'] = require_match.group(1).strip().rstrip(',')
                    continue

                # Parse Fixer line
                fixer_match = re.match(r'^Fixer\s*:\s*(.+?),?\s*$', trimmed)
                if fixer_match:
                    fixer_str = fixer_match.group(1).strip().rstrip(',')
                    # Parse fixer: "Item=count; Skill=level" or "Item=count" or just "Item"
                    fixer_parts = fixer_str.split(';')
                    fixer_entry = {'items': [], 'skills': []}
                    for part in fixer_parts:
                        part = part.strip()
                        if '=' in part:
                            key, val = part.split('=', 1)
                            key = key.strip()
                            val = val.strip()
                            # Check if it's a skill
                            if key in ('Woodwork', 'Mechanics', 'Metalworking', 'Electrical', 'Tailoring'):
                                fixer_entry['skills'].append({'skill': key, 'level': int(val)})
                            else:
                                fixer_entry['items'].append({'item': key, 'count': int(val)})
                        else:
                            # Just an item name without count
                            fixer_entry['items'].append({'item': part, 'count': 1})
                    current_fixing['fixers'].append(fixer_entry)
                    continue

                # Parse GlobalModifier or ConditionModifier
                prop_match = re.match(r'^(\w+)\s*:\s*(.+?),?\s*$', trimmed)
                if prop_match:
                    key = prop_match.group(1)
                    value = prop_match.group(2).strip().rstrip(',')
                    current_fixing['properties'][key] = value

            # Closing brace for module
            if trimmed == '}' and brace_depth == 1:
                brace_depth = 0

        return fixings

    def parse_evolved_recipes(self, filename: str = 'evolvedrecipes.txt') -> List[ParsedRecipe]:
        """Parse evolved recipes file."""
        filepath = self.scripts_path / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Script file not found: {filepath}")

        content = filepath.read_text(encoding='utf-8', errors='replace')
        return self._parse_evolved_recipes_content(content, filename)

    def _parse_evolved_recipes_content(self, content: str, source_file: str) -> List[ParsedRecipe]:
        """Parse evolved recipe content."""
        recipes = []
        lines = content.split('\n')

        current_module = "Base"
        current_recipe: Optional[Dict] = None
        brace_depth = 0
        recipe_start_line = 0
        in_comment = False

        for i, line in enumerate(lines, 1):
            trimmed = line.strip()

            # Handle multi-line comments
            if '/*' in trimmed:
                in_comment = True
            if '*/' in trimmed:
                in_comment = False
                continue
            if in_comment:
                continue

            # Skip single-line comments and empty
            if not trimmed or trimmed.startswith('//'):
                continue

            # Module declaration
            module_match = re.match(r'^module\s+(\w+)\s*$', trimmed)
            if module_match:
                current_module = module_match.group(1)
                continue

            # Opening brace for module
            if trimmed == '{' and brace_depth == 0:
                brace_depth = 1
                continue

            # Evolved recipe declaration
            recipe_match = re.match(r'^evolvedrecipe\s+(.+?)\s*$', trimmed)
            if recipe_match and brace_depth == 1:
                current_recipe = {
                    'name': recipe_match.group(1),
                    'properties': {},
                    'line': i,
                }
                recipe_start_line = i
                continue

            # Opening brace for recipe
            if trimmed == '{' and current_recipe and brace_depth == 1:
                brace_depth = 2
                continue

            # Inside recipe
            if current_recipe and brace_depth == 2:
                # Closing brace
                if trimmed in ('}', '},'):
                    brace_depth = 1
                    recipe = ParsedRecipe(
                        module=current_module,
                        name=current_recipe['name'],
                        recipe_type='evolvedrecipe',
                        ingredients=[],  # Evolved recipes don't have fixed ingredients
                        properties=current_recipe['properties'],
                        source_file=source_file,
                        line_number=recipe_start_line,
                    )
                    recipes.append(recipe)
                    current_recipe = None
                    continue

                # Parse property (uses colon like regular recipes)
                prop_match = re.match(r'^(\w+):(.+?),?\s*$', trimmed)
                if prop_match:
                    key = prop_match.group(1)
                    value = prop_match.group(2).strip().rstrip(',')
                    current_recipe['properties'][key] = value
                    continue

                # Also try equals sign (some evolved recipes use this)
                prop_match2 = re.match(r'^(\w+)\s*=\s*(.+?),?\s*$', trimmed)
                if prop_match2:
                    key = prop_match2.group(1)
                    value = prop_match2.group(2).strip().rstrip(',')
                    current_recipe['properties'][key] = value

            # Closing brace for module
            if trimmed == '}' and brace_depth == 1:
                brace_depth = 0

        return recipes

    def parse_clothing_folder(self) -> List[ParsedItem]:
        """Parse all clothing files from the clothing/ subfolder."""
        clothing_path = self.scripts_path / 'clothing'
        if not clothing_path.exists():
            return []

        all_items = []
        for file in clothing_path.glob('*.txt'):
            try:
                modules = self.parse_file(f'clothing/{file.name}')
                for module in modules:
                    all_items.extend(module.items)
            except Exception as e:
                print(f"  Warning: Could not parse {file.name}: {e}")

        return all_items

    def parse_sounds(self, filename: str) -> List[ParsedSound]:
        """Parse sound definitions from a sound script file."""
        filepath = self.scripts_path / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Script file not found: {filepath}")

        content = filepath.read_text(encoding='utf-8', errors='replace')
        return self._parse_sounds_content(content, filename)

    def _parse_sounds_content(self, content: str, source_file: str) -> List[ParsedSound]:
        """Parse sound definition content."""
        sounds = []
        lines = content.split('\n')

        current_module = "Base"
        current_sound: Optional[Dict] = None
        brace_depth = 0
        sound_start_line = 0
        in_clip = False
        in_comment = False

        for i, line in enumerate(lines, 1):
            trimmed = line.strip()

            # Handle multi-line comments
            if '/*' in trimmed:
                in_comment = True
            if '*/' in trimmed:
                in_comment = False
                continue
            if in_comment:
                continue

            # Skip single-line comments and empty
            if not trimmed or trimmed.startswith('//'):
                continue

            # Module declaration
            module_match = re.match(r'^module\s+(\w+)\s*$', trimmed)
            if module_match:
                current_module = module_match.group(1)
                continue

            # Opening brace for module
            if trimmed == '{' and brace_depth == 0:
                brace_depth = 1
                continue

            # Sound declaration
            sound_match = re.match(r'^sound\s+(\w+)\s*$', trimmed)
            if sound_match and brace_depth == 1:
                current_sound = {
                    'name': sound_match.group(1),
                    'category': '',
                    'clips': [],
                    'properties': {},
                    'line': i,
                }
                sound_start_line = i
                continue

            # Opening brace for sound
            if trimmed == '{' and current_sound and brace_depth == 1:
                brace_depth = 2
                continue

            # Inside sound definition
            if current_sound and brace_depth >= 2:
                # Closing brace for sound
                if trimmed in ('}', '},') and brace_depth == 2 and not in_clip:
                    brace_depth = 1
                    sound = ParsedSound(
                        module=current_module,
                        name=current_sound['name'],
                        category=current_sound['category'],
                        clips=current_sound['clips'],
                        properties=current_sound['properties'],
                        source_file=source_file,
                        line_number=sound_start_line,
                    )
                    sounds.append(sound)
                    current_sound = None
                    continue

                # Clip block start
                if trimmed == 'clip':
                    in_clip = True
                    continue

                # Opening brace for clip
                if trimmed == '{' and in_clip:
                    brace_depth = 3
                    continue

                # Closing brace for clip
                if trimmed in ('}', '},') and in_clip:
                    brace_depth = 2
                    in_clip = False
                    continue

                # Parse property inside clip (event = path)
                if in_clip and brace_depth == 3:
                    event_match = re.match(r'^event\s*=\s*(.+?),?\s*$', trimmed)
                    if event_match:
                        current_sound['clips'].append(event_match.group(1).strip().rstrip(','))
                    continue

                # Parse sound properties (category = X)
                prop_match = re.match(r'^(\w+)\s*=\s*(.+?),?\s*$', trimmed)
                if prop_match:
                    key = prop_match.group(1)
                    value = prop_match.group(2).strip().rstrip(',')
                    if key == 'category':
                        current_sound['category'] = value
                    else:
                        current_sound['properties'][key] = value
                    continue

            # Closing brace for module
            if trimmed == '}' and brace_depth == 1:
                brace_depth = 0

        return sounds

    def parse_all_sounds(self) -> List[ParsedSound]:
        """Parse all sound files and return combined list."""
        sound_files = [
            'sounds_item.txt',
            'sounds_object.txt',
            'sounds_player.txt',
            'sounds_zombie.txt',
            'sounds_world.txt',
            'sounds_ui.txt',
            'sounds_meta.txt',
            'sounds_music.txt',
        ]

        all_sounds = []
        for filename in sound_files:
            try:
                sounds = self.parse_sounds(filename)
                all_sounds.extend(sounds)
            except FileNotFoundError:
                print(f"  Warning: {filename} not found")
            except Exception as e:
                print(f"  Warning: Could not parse {filename}: {e}")

        return all_sounds


# =============================================================================
# Article Generators
# =============================================================================

class WeaponsArticleGenerator:
    """Generates wiki articles for weapons."""

    def __init__(self, items: List[ParsedItem]):
        self.items = items

    def categorize(self) -> Dict[str, List[ParsedItem]]:
        """Group weapons by primary category."""
        categories = {}
        for item in self.items:
            cats = item.get_list('Categories')
            primary = cats[0] if cats else 'Uncategorized'
            if primary not in categories:
                categories[primary] = []
            categories[primary].append(item)
        return categories

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive weapons overview article."""
        categories = self.categorize()

        lines = [
            '# Vanilla Weapons Reference',
            '',
            f'Complete reference for all **{len(self.items)} vanilla weapons** in Project Zomboid Build 41.',
            '',
            '## Understanding Weapon Stats',
            '',
            '| Stat | Description |',
            '|------|-------------|',
            '| **Damage** | Min-Max damage per hit |',
            '| **Crit** | Critical hit chance (%) |',
            '| **Speed** | Attack speed (1.0 = normal) |',
            '| **Range** | Maximum attack distance |',
            '| **Durability** | Hits before breaking |',
            '| **Weight** | Inventory weight |',
            '',
            '## Quick Navigation',
            '',
        ]

        # Sort categories
        sorted_cats = sorted(
            categories.items(),
            key=lambda x: WEAPON_CATEGORIES.get(x[0], {}).get('order', 99)
        )

        # TOC
        for cat, items in sorted_cats:
            lines.append(f'- [{cat}](#{cat.lower()}) ({len(items)} weapons)')
        lines.append('')

        # Each category
        for cat, items in sorted_cats:
            info = WEAPON_CATEGORIES.get(cat, {'desc': f'{cat} weapons.'})
            skill = info.get('skill')

            lines.append(f'## {cat}')
            lines.append('')
            lines.append(info['desc'])
            if skill:
                lines.append(f' Affected by **{skill}** skill.')
            lines.append('')

            # Sort by max damage
            items.sort(key=lambda x: float(x.get('MaxDamage', 0)), reverse=True)

            lines.append('| Weapon | Damage | Crit | Speed | Range | Durability | Weight |')
            lines.append('|--------|--------|------|-------|-------|------------|--------|')

            for item in items:
                name = item.get('DisplayName', item.name)
                min_dmg = item.get('MinDamage', '0')
                max_dmg = item.get('MaxDamage', '0')
                crit = item.get('CriticalChance', '0')
                speed = item.get('BaseSpeed', '1')
                rng = item.get('MaxRange', '1')
                dur = item.get('ConditionMax', '?')
                weight = item.get('Weight', '?')

                lines.append(f'| **{name}** | {min_dmg}-{max_dmg} | {crit}% | {speed} | {rng} | {dur} | {weight} |')

            lines.append('')

        # Property reference
        lines.extend([
            '---',
            '',
            '## Property Reference',
            '',
            '### Combat Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `MinDamage` / `MaxDamage` | Damage range per hit |',
            '| `CriticalChance` | % chance for critical hit |',
            '| `CritDmgMultiplier` | Damage multiplier on crit |',
            '| `MaxHitCount` | Max zombies hit per swing |',
            '| `KnockdownMod` | Knockdown chance modifier |',
            '| `PushBackMod` | Push back force |',
            '',
            '### Range & Speed',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `MinRange` / `MaxRange` | Attack range |',
            '| `BaseSpeed` | Attack speed multiplier |',
            '| `SwingTime` | Swing duration |',
            '',
            '### Durability',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `ConditionMax` | Maximum durability |',
            '| `ConditionLowerChanceOneIn` | 1-in-X chance to lose condition |',
            '',
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/items_weapons.txt`',
        ])

        return WikiArticle(
            id='vanilla-weapons-reference',
            title='Vanilla Weapons Reference',
            slug='vanilla-weapons-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'weapons', 'vanilla', 'items'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.items)} vanilla weapons, organized by category with full stats.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['item-anatomy', 'weapon-repair-system-overview'],
        )


class FoodArticleGenerator:
    """Generates wiki articles for food items."""

    def __init__(self, items: List[ParsedItem]):
        # Filter to food items only
        self.items = [i for i in items if i.item_type == 'Food' or i.get('IsCookable') == 'TRUE']

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive food reference article."""
        lines = [
            '# Vanilla Food Reference',
            '',
            f'Complete reference for all **{len(self.items)} vanilla food items** in Project Zomboid Build 41.',
            '',
            '## Food Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| **Hunger** | Hunger reduction (negative = fills you up) |',
            '| **Thirst** | Thirst change |',
            '| **Calories** | Caloric content |',
            '| **Carbs/Protein/Fat** | Nutritional values |',
            '| **Unhappy** | Unhappiness change |',
            '| **Boredom** | Boredom change |',
            '',
            '## All Food Items',
            '',
            '| Food | Hunger | Calories | Perishable | Weight |',
            '|------|--------|----------|------------|--------|',
        ]

        # Sort by name
        self.items.sort(key=lambda x: x.get('DisplayName', x.name))

        for item in self.items:
            name = item.get('DisplayName', item.name)
            hunger = item.get('HungerChange', '0')
            calories = item.get('Calories', '?')
            perishable = 'Yes' if item.get('DaysFresh') else 'No'
            weight = item.get('Weight', '?')

            lines.append(f'| **{name}** | {hunger} | {calories} | {perishable} | {weight} |')

        lines.extend([
            '',
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/items_food.txt`',
        ])

        return WikiArticle(
            id='vanilla-food-reference',
            title='Vanilla Food Reference',
            slug='vanilla-food-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'food', 'vanilla', 'items'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.items)} vanilla food items with nutritional values.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['item-anatomy'],
        )


class RecipeArticleGenerator:
    """Generates wiki articles for recipes."""

    def __init__(self, recipes: List[ParsedRecipe]):
        self.recipes = recipes

    def categorize(self) -> Dict[str, List[ParsedRecipe]]:
        """Group recipes by category."""
        categories = {}
        for recipe in self.recipes:
            cat = recipe.category
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(recipe)
        return categories

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive recipe overview article."""
        categories = self.categorize()

        lines = [
            '# Vanilla Recipes Reference',
            '',
            f'Complete reference for all **{len(self.recipes)} vanilla recipes** in Project Zomboid Build 41.',
            '',
            '## Recipe Syntax',
            '',
            'Recipes in PZ use a colon (`:`) for properties, unlike items which use equals (`=`):',
            '',
            '```',
            'recipe Make Stake',
            '{',
            '    TreeBranch,                           // Ingredient (consumed)',
            '    keep [Recipe.GetItemTypes.SharpKnife], // Kept tool (not consumed)',
            '',
            '    Result:Stake,                         // Output item',
            '    Time:80.0,                            // Crafting time',
            '    Category:Survivalist,                 // Recipe category',
            '    OnGiveXP:Recipe.OnGiveXP.WoodWork5,   // XP callback',
            '}',
            '```',
            '',
            '## Recipe Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `Result` | Item produced by the recipe |',
            '| `Time` | Base crafting time in ticks |',
            '| `Category` | UI category (Cooking, Carpentry, etc.) |',
            '| `SkillRequired` | Required skill and level (e.g., `Woodwork=2`) |',
            '| `OnCreate` | Lua callback when recipe completes |',
            '| `OnCanPerform` | Lua callback to check if recipe can be made |',
            '| `OnGiveXP` | Lua callback for XP rewards |',
            '| `NeedToBeLearn` | Recipe must be learned from schematic |',
            '| `AnimNode` | Animation to play during crafting |',
            '| `Sound` | Sound to play during crafting |',
            '',
            '## Ingredient Syntax',
            '',
            '| Syntax | Meaning |',
            '|--------|---------|',
            '| `ItemName` | Consume 1 of the item |',
            '| `ItemName=3` | Consume 3 of the item |',
            "| `keep ItemName` | Use but don't consume the item |",
            '| `destroy ItemName` | Destroy the item (for containers) |',
            '| `Item1/Item2/Item3` | Any of these items works |',
            '| `[Recipe.GetItemTypes.X]` | Dynamic item type lookup |',
            '',
            '## Quick Navigation',
            '',
        ]

        # Sort categories
        sorted_cats = sorted(categories.items(), key=lambda x: (-len(x[1]), x[0]))

        # TOC
        for cat, recipes in sorted_cats:
            lines.append(f'- [{cat}](#{cat.lower().replace(" ", "-")}) ({len(recipes)} recipes)')
        lines.append('')

        # Each category
        for cat, recipes in sorted_cats:
            info = RECIPE_CATEGORIES.get(cat, {'desc': f'{cat} recipes.'})

            lines.append(f'## {cat}')
            lines.append('')
            lines.append(info.get('desc', f'Recipes in the {cat} category.'))
            lines.append('')

            # Sort by name
            recipes.sort(key=lambda x: x.name)

            lines.append('| Recipe | Result | Time | Skill Required |')
            lines.append('|--------|--------|------|----------------|')

            for recipe in recipes:
                name = recipe.name
                result = recipe.result
                time = recipe.time
                skill = recipe.get('SkillRequired', '-')

                lines.append(f'| {name} | {result} | {time} | {skill} |')

            lines.append('')

        lines.extend([
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/recipes.txt`',
        ])

        return WikiArticle(
            id='vanilla-recipes-reference',
            title='Vanilla Recipes Reference',
            slug='vanilla-recipes-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'recipes', 'vanilla', 'crafting'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.recipes)} vanilla crafting recipes, organized by category.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['item-anatomy'],
        )


class FixingArticleGenerator:
    """Generates wiki articles for the fixing/repair system."""

    def __init__(self, fixings: List['ParsedFixing']):
        self.fixings = fixings

    def categorize_by_item_type(self) -> Dict[str, List['ParsedFixing']]:
        """Group fixings by the type of item they repair (based on item name patterns)."""
        categories = {
            'Axes': [],
            'Blunt Weapons': [],
            'Bladed Weapons': [],
            'Tools': [],
            'Instruments': [],
            'Firearms': [],
            'Other': [],
        }

        for fixing in self.fixings:
            name_lower = fixing.name.lower()
            req_lower = fixing.require.lower()

            if 'axe' in name_lower or 'axe' in req_lower:
                categories['Axes'].append(fixing)
            elif any(w in name_lower for w in ['bat', 'hammer', 'crowbar', 'sledge', 'stick', 'racket']):
                categories['Blunt Weapons'].append(fixing)
            elif any(w in name_lower for w in ['knife', 'machete', 'blade', 'cleaver', 'katana', 'sword']):
                categories['Bladed Weapons'].append(fixing)
            elif any(w in name_lower for w in ['shovel', 'rake', 'hoe', 'broom', 'saw', 'screwdriver']):
                categories['Tools'].append(fixing)
            elif any(w in name_lower for w in ['guitar', 'banjo', 'violin', 'saxophone', 'trumpet']):
                categories['Instruments'].append(fixing)
            elif any(w in name_lower for w in ['gun', 'pistol', 'rifle', 'shotgun', 'revolver']):
                categories['Firearms'].append(fixing)
            else:
                categories['Other'].append(fixing)

        # Remove empty categories
        return {k: v for k, v in categories.items() if v}

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive fixing system overview article."""
        categories = self.categorize_by_item_type()

        lines = [
            '# Vanilla Fixing (Repair) System Reference',
            '',
            f'Complete reference for all **{len(self.fixings)} fixing entries** in Project Zomboid Build 41.',
            '',
            '## How the Fixing System Works',
            '',
            'The `fixing` system allows players to repair items using consumable materials. Unlike `recipe`, fixing entries:',
            '',
            "- **Don't create new items** - they restore condition to existing items",
            '- **Support multiple repair options** - each `Fixer` line is an alternative way to repair',
            '- **Can require skills** - some repair methods need skill levels',
            '',
            '## Fixing Syntax',
            '',
            '```',
            'fixing Fix Baseball Bat',
            '{',
            '    Require : BaseballBat,              // Item type this repairs',
            '',
            '    Fixer : Woodglue=2; Woodwork=2,     // Option 1: 2 woodglue + Woodwork level 2',
            '    Fixer : DuctTape=2,                 // Option 2: 2 duct tape (no skill needed)',
            '    Fixer : Glue=2,                     // Option 3: 2 glue',
            '    Fixer : Scotchtape=4,               // Option 4: 4 scotch tape',
            '}',
            '```',
            '',
            '## Fixer Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `Require` | The item type ID this fixing entry applies to |',
            '| `Fixer` | A repair option: `Item=count` or `Item=count; Skill=level` |',
            '',
            '## Common Repair Materials',
            '',
            '| Material | Common Uses |',
            '|----------|-------------|',
            '| **Duct Tape** | Universal repair, works on most items |',
            '| **Woodglue** | Wooden items (often needs Woodwork skill) |',
            '| **Glue** | General purpose, weaker than Woodglue |',
            '| **Scotchtape** | Emergency repairs, needs more units |',
            '| **Nails** | Nailed weapons specifically |',
            '',
            '## Quick Navigation',
            '',
        ]

        # Sort categories
        sorted_cats = sorted(categories.items(), key=lambda x: (-len(x[1]), x[0]))

        # TOC
        for cat, fixings in sorted_cats:
            lines.append(f'- [{cat}](#{cat.lower().replace(" ", "-")}) ({len(fixings)} items)')
        lines.append('')

        # Each category
        for cat, fixings in sorted_cats:
            lines.append(f'## {cat}')
            lines.append('')

            # Sort by name
            fixings.sort(key=lambda x: x.name)

            lines.append('| Item | Repair Options |')
            lines.append('|------|----------------|')

            for fixing in fixings:
                name = fixing.name
                # Format fixer options
                options = []
                for fixer in fixing.fixers:
                    parts = []
                    for item in fixer['items']:
                        if item['count'] > 1:
                            parts.append(f"{item['item']}×{item['count']}")
                        else:
                            parts.append(item['item'])
                    for skill in fixer['skills']:
                        parts.append(f"{skill['skill']} {skill['level']}")
                    options.append(' + '.join(parts))

                options_str = ' **OR** '.join(options) if options else '-'
                lines.append(f'| {name} | {options_str} |')

            lines.append('')

        lines.extend([
            '---',
            '',
            '## Fixing vs Recipe vs Evolved Recipe',
            '',
            '| System | Purpose | Creates New Item? |',
            '|--------|---------|-------------------|',
            '| `fixing` | Repair existing items | No |',
            '| `recipe` | Craft new items | Yes |',
            '| `evolvedrecipe` | Combine ingredients dynamically | Yes |',
            '',
            '## Adding Custom Repair Options',
            '',
            'To make your custom weapon repairable, create a `fixing` entry:',
            '',
            '```',
            'module MyMod',
            '{',
            '    fixing Fix My Custom Sword',
            '    {',
            '        Require : MyCustomSword,',
            '',
            '        Fixer : DuctTape=3,',
            '        Fixer : WeldingRods=1; Metalworking=2,',
            '    }',
            '}',
            '```',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/fixing.txt`',
        ])

        return WikiArticle(
            id='vanilla-fixing-reference',
            title='Vanilla Fixing (Repair) System Reference',
            slug='vanilla-fixing-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'fixing', 'repair', 'vanilla', 'maintenance'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for the fixing (repair) system with all {len(self.fixings)} vanilla repair entries.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['weapon-properties-guide', 'vanilla-weapons-reference'],
        )


class EvolvedRecipeArticleGenerator:
    """Generates wiki articles for evolved recipes."""

    def __init__(self, recipes: List[ParsedRecipe]):
        self.recipes = recipes

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive evolved recipe overview article."""
        lines = [
            '# Vanilla Evolved Recipes Reference',
            '',
            f'Complete reference for all **{len(self.recipes)} evolved recipes** in Project Zomboid Build 41.',
            '',
            '## What are Evolved Recipes?',
            '',
            'Evolved recipes are **dynamic crafting recipes** that allow players to combine multiple ingredients into a single dish. Unlike regular recipes with fixed ingredients, evolved recipes:',
            '',
            '- Accept **any valid ingredient** from a large pool',
            '- Allow **multiple ingredients** (up to MaxItems)',
            '- Track nutritional values from all ingredients',
            '- Support **cooking** (making raw dishes cookable)',
            '',
            '## Evolved Recipe Syntax',
            '',
            '```',
            'evolvedrecipe Soup',
            '{',
            '    BaseItem:WaterPot,       // Starting container',
            '    MaxItems:6,              // Max ingredients',
            '    ResultItem:PotOfSoupRecipe,  // Output item',
            '    Cookable:true,           // Can be cooked',
            '    Name:Prepare Soup,       // Display name',
            '}',
            '```',
            '',
            '## Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `BaseItem` | The container/base item to start with |',
            '| `MaxItems` | Maximum number of ingredients allowed |',
            '| `ResultItem` | The item produced |',
            '| `Cookable` | Whether the result can be cooked |',
            '| `Name` | Display name in crafting menu |',
            '| `CanAddSpicesEmpty` | Allow spices even with no other ingredients |',
            '| `AddIngredientIfCooked` | Only add ingredients if base is cooked |',
            '',
            '## How Items Become Ingredients',
            '',
            'Food items declare which evolved recipes they can be added to using the `EvolvedRecipe` property:',
            '',
            '```',
            'item Tomato',
            '{',
            '    Type = Food,',
            '    EvolvedRecipe = Soup:12;Stew:12;Salad:6;Sandwich:6,',
            '    // ...',
            '}',
            '```',
            '',
            'The number after the colon is the **hunger value** contributed when added.',
            '',
            '## All Evolved Recipes',
            '',
            '| Recipe | Base Item | Result | Max Items | Cookable |',
            '|--------|-----------|--------|-----------|----------|',
        ]

        # Sort by name
        sorted_recipes = sorted(self.recipes, key=lambda x: x.name)

        for recipe in sorted_recipes:
            name = recipe.get('Name', recipe.name)
            base = recipe.get('BaseItem', '?')
            result = recipe.get('ResultItem', '?')
            max_items = recipe.get('MaxItems', '?')
            cookable = 'Yes' if recipe.get('Cookable', '').lower() == 'true' else 'No'

            lines.append(f'| {name} | `{base}` | `{result}` | {max_items} | {cookable} |')

        lines.extend([
            '',
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/evolvedrecipes.txt`',
        ])

        return WikiArticle(
            id='vanilla-evolved-recipes-reference',
            title='Vanilla Evolved Recipes Reference',
            slug='vanilla-evolved-recipes-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'recipes', 'evolved', 'vanilla', 'cooking'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.recipes)} evolved recipes - dynamic crafting for soups, stews, sandwiches, and more.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['vanilla-recipes-reference', 'vanilla-food-reference'],
        )


class ClothingArticleGenerator:
    """Generates wiki articles for clothing items."""

    def __init__(self, items: List[ParsedItem]):
        self.items = items

    def categorize_by_body_location(self) -> Dict[str, List[ParsedItem]]:
        """Group clothing by body location."""
        categories = {}
        for item in self.items:
            location = item.get('BodyLocation', 'Unknown')
            if location not in categories:
                categories[location] = []
            categories[location].append(item)
        return categories

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive clothing overview article."""
        categories = self.categorize_by_body_location()

        lines = [
            '# Vanilla Clothing Reference',
            '',
            f'Complete reference for all **{len(self.items)} vanilla clothing items** in Project Zomboid Build 41.',
            '',
            '## Clothing Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `BodyLocation` | Where the item is worn |',
            '| `Insulation` | Cold protection (higher = warmer) |',
            '| `WindResistance` | Wind protection |',
            '| `BiteDefense` | Protection against zombie bites |',
            '| `ScratchDefense` | Protection against scratches |',
            '| `FabricType` | Material type (Cotton, Denim, Leather, etc.) |',
            '| `BloodLocation` | Where blood splatters appear |',
            '',
            '## Body Locations',
            '',
            'PZ uses a layered clothing system. Common body locations:',
            '',
            '| Location | Description |',
            '|----------|-------------|',
            '| `Shirt` | Long-sleeve shirts |',
            '| `ShortSleeveShirt` | T-shirts, tanks |',
            '| `Sweater` | Sweaters, hoodies |',
            '| `Jacket` | Outer jackets, coats |',
            '| `Pants` | Trousers, jeans |',
            '| `Shoes` | Footwear |',
            '| `Hat` | Head covering |',
            '| `FullHat` | Full head coverage |',
            '| `Hands` | Gloves |',
            '',
            '## Quick Navigation',
            '',
        ]

        # Sort categories by item count
        sorted_cats = sorted(categories.items(), key=lambda x: (-len(x[1]), x[0]))

        # TOC
        for location, items in sorted_cats:
            lines.append(f'- [{location}](#{location.lower().replace(" ", "-")}) ({len(items)} items)')
        lines.append('')

        # Each category
        for location, items in sorted_cats:
            lines.append(f'## {location}')
            lines.append('')

            # Sort by name
            items.sort(key=lambda x: x.get('DisplayName', x.name))

            lines.append('| Item | Insulation | Wind Res | Bite Def | Scratch Def | Fabric |')
            lines.append('|------|------------|----------|----------|-------------|--------|')

            for item in items[:50]:  # Limit per category
                name = item.get('DisplayName', item.name)
                insulation = item.get('Insulation', '-')
                wind = item.get('WindResistance', '-')
                bite = item.get('BiteDefense', '-')
                scratch = item.get('ScratchDefense', '-')
                fabric = item.get('FabricType', '-')

                lines.append(f'| {name} | {insulation} | {wind} | {bite} | {scratch} | {fabric} |')

            if len(items) > 50:
                lines.append(f'| *... and {len(items) - 50} more* | | | | | |')
            lines.append('')

        lines.extend([
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/clothing/*.txt`',
        ])

        return WikiArticle(
            id='vanilla-clothing-reference',
            title='Vanilla Clothing Reference',
            slug='vanilla-clothing-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'clothing', 'vanilla', 'items', 'protection'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.items)} vanilla clothing items with protection values and body locations.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['item-anatomy'],
        )


class VehicleItemsGenerator:
    """Generates wiki articles for vehicle-related items."""

    # Organize vehicle items by part type
    PART_CATEGORIES = {
        'Tires': ['Tire'],
        'Brakes': ['Brake'],
        'Suspension': ['Suspension'],
        'Engines': ['Engine'],
        'Mufflers': ['Muffler'],
        'Windows': ['Window', 'Windshield'],
        'Doors': ['Door'],
        'Hoods/Trunks': ['Hood', 'Trunk', 'Lid'],
        'Batteries': ['Battery', 'CarBattery'],
        'Seats': ['Seat'],
        'Lights': ['Light', 'Headlight'],
        'Gas Tanks': ['GasTank', 'Gas'],
        'Tools': [],  # Handled by DisplayCategory
    }

    def __init__(self, items: List[ParsedItem]):
        self.items = items

    def categorize_by_display_category(self) -> Dict[str, List[ParsedItem]]:
        """Group items by their DisplayCategory property."""
        categories = {}
        for item in self.items:
            cat = item.get('DisplayCategory', 'Other')
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item)
        return categories

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive vehicle items reference article."""
        categories = self.categorize_by_display_category()

        lines = [
            '# Vanilla Vehicle Items Reference',
            '',
            f'Complete reference for all **{len(self.items)} vehicle-related items** in Project Zomboid Build 41.',
            '',
            '## Vehicle System Overview',
            '',
            'Vehicle parts in PZ use a quality tier system:',
            '',
            '| Tier | Examples | Quality |',
            '|------|----------|---------|',
            '| **Old** | Valu-Tire, Old Brake | Low quality, prone to damage |',
            '| **Normal** | Regular Tire, Regular Brake | Standard quality |',
            '| **Modern/Performance** | Performance Tire | High quality, better stats |',
            '',
            '## Key Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `VehicleType` | Vehicle class (1=standard, 2=heavy duty, 3=sport) |',
            '| `ConditionMax` | Maximum condition points |',
            '| `ConditionLowerStandard` | Wear rate on roads |',
            '| `ConditionLowerOffroad` | Wear rate off-road |',
            '| `MechanicsItem` | Appears in mechanics interface |',
            '| `WheelFriction` | Tire grip (for tires) |',
            '| `EngineLoudness` | Noise level (for engines) |',
            '| `EnginePower` | Power output (for engines) |',
            '',
            '## Quick Navigation',
            '',
        ]

        # Sort categories
        sorted_cats = sorted(categories.items(), key=lambda x: (-len(x[1]), x[0]))

        # TOC
        for cat, items in sorted_cats:
            lines.append(f'- [{cat}](#{cat.lower().replace(" ", "-")}) ({len(items)} items)')
        lines.append('')

        # Each category
        for cat, items in sorted_cats:
            lines.append(f'## {cat}')
            lines.append('')

            # Sort by name
            items.sort(key=lambda x: x.get('DisplayName', x.name))

            lines.append('| Item | Weight | Vehicle Type | ID |')
            lines.append('|------|--------|--------------|-----|')

            for item in items:
                name = item.get('DisplayName', item.name)
                weight = item.get('Weight', '?')
                vtype = item.get('VehicleType', '-')

                lines.append(f'| {name} | {weight} | {vtype} | `{item.full_name}` |')

            lines.append('')

        lines.extend([
            '---',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/vehicles/vehiclesitems.txt`',
        ])

        return WikiArticle(
            id='vanilla-vehicle-items-reference',
            title='Vanilla Vehicle Items Reference',
            slug='vanilla-vehicle-items-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'vehicles', 'vanilla', 'items', 'mechanics'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.items)} vehicle parts and maintenance items.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=['item-anatomy'],
        )


class SoundArticleGenerator:
    """Generates wiki articles for sound definitions."""

    def __init__(self, sounds: List[ParsedSound]):
        self.sounds = sounds

    def categorize_by_category(self) -> Dict[str, List[ParsedSound]]:
        """Group sounds by their category property."""
        categories = {}
        for sound in self.sounds:
            cat = sound.category or 'Uncategorized'
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(sound)
        return categories

    def categorize_by_source(self) -> Dict[str, List[ParsedSound]]:
        """Group sounds by their source file."""
        sources = {}
        for sound in self.sounds:
            src = sound.source_file
            if src not in sources:
                sources[src] = []
            sources[src].append(sound)
        return sources

    def generate_overview_article(self) -> WikiArticle:
        """Generate comprehensive sound reference article."""
        categories = self.categorize_by_category()

        lines = [
            '# Vanilla Sound Reference',
            '',
            f'Complete reference for all **{len(self.sounds)} sound definitions** in Project Zomboid Build 41.',
            '',
            '## Sound System Overview',
            '',
            'PZ uses FMOD for audio. Sound definitions map game events to FMOD events.',
            '',
            '## Sound Definition Syntax',
            '',
            '```',
            'sound OpenBag',
            '{',
            '    category = Item,',
            '    clip',
            '    {',
            '        event = Character/Foley/Bag/Open,',
            '    }',
            '}',
            '```',
            '',
            '## Properties',
            '',
            '| Property | Description |',
            '|----------|-------------|',
            '| `category` | Sound category (Item, Object, Player, Zombie, etc.) |',
            '| `clip` | Contains the FMOD event path |',
            '| `event` | Path to the FMOD event |',
            '| `loop` | Whether the sound loops |',
            '| `is3D` | Whether sound is positional |',
            '',
            '## Sound Categories',
            '',
            '| Category | Description | Count |',
            '|----------|-------------|-------|',
        ]

        # Category summary
        for cat, sounds in sorted(categories.items(), key=lambda x: (-len(x[1]), x[0])):
            desc = {
                'Item': 'Item interactions (bags, tools, crafting)',
                'Object': 'World objects (doors, windows, furniture)',
                'Player': 'Player actions (eating, drinking, movement)',
                'Zombie': 'Zombie sounds (groans, attacks)',
                'World': 'Ambient world sounds',
                'UI': 'User interface sounds',
                'VoiceGender': 'Voice variations',
                'Music': 'Background music',
                'Vehicle': 'Vehicle sounds',
            }.get(cat, f'{cat} sounds')
            lines.append(f'| **{cat}** | {desc} | {len(sounds)} |')

        lines.extend([
            '',
            '## Quick Navigation',
            '',
        ])

        # Sort categories by count
        sorted_cats = sorted(categories.items(), key=lambda x: (-len(x[1]), x[0]))

        # TOC
        for cat, sounds in sorted_cats:
            lines.append(f'- [{cat}](#{cat.lower().replace(" ", "-")}) ({len(sounds)} sounds)')
        lines.append('')

        # Each category
        for cat, sounds in sorted_cats:
            lines.append(f'## {cat}')
            lines.append('')

            # Sort by name
            sounds.sort(key=lambda x: x.name)

            lines.append('| Sound | FMOD Event | Source |')
            lines.append('|-------|------------|--------|')

            for sound in sounds[:100]:  # Limit per category
                name = sound.name
                clip = sound.clips[0] if sound.clips else '-'
                # Truncate long paths
                if len(clip) > 40:
                    clip = '...' + clip[-37:]
                src = sound.source_file.replace('sounds_', '').replace('.txt', '')

                lines.append(f'| `{name}` | {clip} | {src} |')

            if len(sounds) > 100:
                lines.append(f'| *... and {len(sounds) - 100} more* | | |')
            lines.append('')

        lines.extend([
            '---',
            '',
            '## Using Sounds in Code',
            '',
            'To play a sound in Lua:',
            '',
            '```lua',
            '-- Play a 2D sound',
            'getSoundManager():PlaySound("OpenBag", false, 1.0)',
            '',
            '-- Play a 3D sound at position',
            'getSoundManager():PlayWorldSoundImpl("ZombieThumpGeneric", nil, x, y, z, 1.0, 60, 1.0, true)',
            '```',
            '',
            '## Source',
            '',
            'Definitions from `media/scripts/sounds_*.txt`',
        ])

        return WikiArticle(
            id='vanilla-sounds-reference',
            title='Vanilla Sound Reference',
            slug='vanilla-sounds-reference',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'sounds', 'audio', 'vanilla', 'fmod'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Complete reference for all {len(self.sounds)} sound definitions with FMOD event paths.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=[],
        )


class GeneralItemsGenerator:
    """Generates wiki articles for general items."""

    def __init__(self, items: List[ParsedItem]):
        self.items = items

    def categorize_by_type(self) -> Dict[str, List[ParsedItem]]:
        """Group items by their Type property."""
        categories = {}
        for item in self.items:
            item_type = item.item_type or 'Normal'
            if item_type not in categories:
                categories[item_type] = []
            categories[item_type].append(item)
        return categories

    def generate_overview_article(self, source_file: str) -> WikiArticle:
        """Generate overview article for a source file."""
        categories = self.categorize_by_type()

        lines = [
            f'# Vanilla Items Reference ({source_file})',
            '',
            f'Complete reference for all **{len(self.items)} items** defined in `{source_file}`.',
            '',
            '## Items by Type',
            '',
        ]

        for item_type, items in sorted(categories.items()):
            lines.append(f'### {item_type} ({len(items)} items)')
            lines.append('')
            lines.append('| Item | Weight | Description |')
            lines.append('|------|--------|-------------|')

            items.sort(key=lambda x: x.get('DisplayName', x.name))
            for item in items[:50]:  # Limit to first 50 for overview
                name = item.get('DisplayName', item.name)
                weight = item.get('Weight', '?')
                # Truncate long names
                if len(name) > 30:
                    name = name[:27] + '...'
                lines.append(f'| {name} | {weight} | `{item.full_name}` |')

            if len(items) > 50:
                lines.append(f'| *... and {len(items) - 50} more* | | |')
            lines.append('')

        slug = source_file.replace('.txt', '').replace('_', '-')

        return WikiArticle(
            id=f'vanilla-{slug}',
            title=f'Vanilla Items: {source_file}',
            slug=f'vanilla-{slug}',
            version='build-41',
            section='modding',
            category='vanilla-reference',
            tags=['reference', 'vanilla', 'items'],
            difficulty='beginner',
            content='\n'.join(lines),
            excerpt=f'Reference for {len(self.items)} items from {source_file}.',
            lastUpdated=datetime.now().strftime('%Y-%m-%d'),
            relatedArticles=[],
        )


# =============================================================================
# Output
# =============================================================================

def write_article(article: WikiArticle, output_path: Path):
    """Write article to JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(article.to_dict(), f, indent=2)
    print(f"  Written: {output_path}")


def update_index(articles: List[WikiArticle], output_path: Path):
    """Update the category index.json."""
    index = {
        'articles': [
            {
                'id': a.id,
                'title': a.title,
                'slug': a.slug,
                'excerpt': a.excerpt,
                'tags': a.tags,
                'difficulty': a.difficulty,
                'lastUpdated': a.lastUpdated,
            }
            for a in articles
        ]
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)
    print(f"  Index updated: {output_path}")


# =============================================================================
# CLI
# =============================================================================

def cmd_parse(args):
    """Parse a specific file and output JSON."""
    parser = PZScriptParser()
    items = parser.get_all_items(args.file)

    print(f"Parsed {len(items)} items from {args.file}")

    output = {
        'source': args.file,
        'count': len(items),
        'items': [
            {
                'module': i.module,
                'name': i.name,
                'fullName': i.full_name,
                'type': i.item_type,
                'properties': i.properties,
                'line': i.line_number,
            }
            for i in items
        ]
    }

    output_file = Path(args.output or 'parsed-output.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    print(f"Output written to {output_file}")


def cmd_stats(args):
    """Show stats for all script files."""
    parser = PZScriptParser()
    stats = parser.get_stats()

    print("PZ Script Files:\n")
    total = 0
    for filename, count in sorted(stats.items()):
        if isinstance(count, int):
            print(f"  {filename}: {count} items")
            total += count
        else:
            print(f"  {filename}: {count}")
    print(f"\nTotal: {total} items")


def cmd_generate(args):
    """Generate wiki articles."""
    parser = PZScriptParser()
    articles = []

    print("Generating vanilla reference articles...\n")

    # Weapons
    print("Weapons:")
    weapons = parser.get_all_items('items_weapons.txt')
    gen = WeaponsArticleGenerator(weapons)
    article = gen.generate_overview_article()
    write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
    articles.append(article)

    # Food
    print("\nFood:")
    food = parser.get_all_items('items_food.txt')
    gen = FoodArticleGenerator(food)
    article = gen.generate_overview_article()
    write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
    articles.append(article)

    # General items
    for filename in ['items.txt', 'newitems.txt', 'items_literature.txt']:
        print(f"\n{filename}:")
        try:
            items = parser.get_all_items(filename)
            gen = GeneralItemsGenerator(items)
            article = gen.generate_overview_article(filename)
            write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
            articles.append(article)
        except Exception as e:
            print(f"  Error: {e}")

    # Recipes
    print("\nRecipes:")
    try:
        recipes = parser.parse_recipes('recipes.txt')
        print(f"  Found {len(recipes)} recipes")
        gen = RecipeArticleGenerator(recipes)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Fixing (Repair System)
    print("\nFixing (Repair System):")
    try:
        fixings = parser.parse_fixing('fixing.txt')
        print(f"  Found {len(fixings)} fixing entries")
        gen = FixingArticleGenerator(fixings)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Evolved Recipes
    print("\nEvolved Recipes:")
    try:
        evolved = parser.parse_evolved_recipes('evolvedrecipes.txt')
        print(f"  Found {len(evolved)} evolved recipes")
        gen = EvolvedRecipeArticleGenerator(evolved)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Clothing
    print("\nClothing:")
    try:
        clothing = parser.parse_clothing_folder()
        print(f"  Found {len(clothing)} clothing items")
        gen = ClothingArticleGenerator(clothing)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Farming items
    print("\nFarming:")
    try:
        farming = parser.get_all_items('farming.txt')
        print(f"  Found {len(farming)} farming items")
        gen = GeneralItemsGenerator(farming)
        article = gen.generate_overview_article('farming.txt')
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Bags
    print("\nBags:")
    try:
        bags = parser.get_all_items('newBags.txt')
        print(f"  Found {len(bags)} bags")
        gen = GeneralItemsGenerator(bags)
        article = gen.generate_overview_article('newBags.txt')
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Vehicle items
    print("\nVehicle Items:")
    try:
        vehicle_items = parser.get_all_items('vehicles/vehiclesitems.txt')
        print(f"  Found {len(vehicle_items)} vehicle items")
        gen = VehicleItemsGenerator(vehicle_items)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Sounds
    print("\nSounds:")
    try:
        sounds = parser.parse_all_sounds()
        print(f"  Found {len(sounds)} sound definitions")
        gen = SoundArticleGenerator(sounds)
        article = gen.generate_overview_article()
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Radio items
    print("\nRadio Items:")
    try:
        radio = parser.get_all_items('items_radio.txt')
        print(f"  Found {len(radio)} radio items")
        gen = GeneralItemsGenerator(radio)
        article = gen.generate_overview_article('items_radio.txt')
        write_article(article, WIKI_DATA_PATH / f"{article.slug}.json")
        articles.append(article)
    except Exception as e:
        print(f"  Error: {e}")

    # Update index
    print("\nUpdating index...")
    update_index(articles, WIKI_DATA_PATH / 'index.json')

    print(f"\nDone! Generated {len(articles)} articles.")


def main():
    parser = argparse.ArgumentParser(description='Project Zomboid Script Parser')
    subparsers = parser.add_subparsers(dest='command', required=True)

    # parse command
    parse_cmd = subparsers.add_parser('parse', help='Parse a script file')
    parse_cmd.add_argument('file', help='Script file to parse (e.g., items_weapons.txt)')
    parse_cmd.add_argument('-o', '--output', help='Output JSON file')
    parse_cmd.set_defaults(func=cmd_parse)

    # stats command
    stats_cmd = subparsers.add_parser('stats', help='Show stats for all script files')
    stats_cmd.set_defaults(func=cmd_stats)

    # generate command
    gen_cmd = subparsers.add_parser('generate', help='Generate wiki articles')
    gen_cmd.set_defaults(func=cmd_generate)

    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
