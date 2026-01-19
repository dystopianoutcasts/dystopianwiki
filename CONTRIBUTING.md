# Contributing to Dystopian Wiki

Thank you for contributing! This document will guide you through the process.

## Table of Contents

- [Creating Articles](#creating-articles)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)

## Creating Articles

**📖 Full Guide:** [`docs/CREATING_ARTICLES.md`](docs/CREATING_ARTICLES.md)
**⚡ Quick Reference:** [`content/README.md`](content/README.md)

### Quick Start

```bash
# 1. Copy the template
cp content/ARTICLE_TEMPLATE.md content/articles/pz/build-41/modding/items/my-article.md

# 2. Edit the file - fill in YAML frontmatter and write markdown content

# 3. Preview (no changes made)
npm run sync:dry-run

# 4. Publish to database
npm run sync
```

### Important Rules

✅ **DO:**
- Use the article template (`content/ARTICLE_TEMPLATE.md`)
- Write in markdown (`.md` files)
- Follow the file structure: `content/articles/{game}/{version}/{section}/{category}/article-name.md`
- Include all required YAML frontmatter fields
- Run `npm run sync` to publish articles

❌ **DON'T:**
- Create JSON files for articles
- Edit files in `_archive-v1/` directory
- Follow old v1 documentation
- Manually insert into Supabase dashboard
- Use spaces or special characters in filenames

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dystopianwiki.git
cd dystopianwiki

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for web app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Required for sync script
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Running the Development Server

```bash
# Start web app
npm run web

# Start mobile app (requires Expo)
npm run mobile
```

## Code Style

### File Naming

- Use kebab-case for filenames: `my-article.md`, `item-properties.ts`
- No spaces or special characters
- Lowercase only

### Markdown Style

- One H1 (`#`) per article
- Use H2 (`##`) for major sections
- Use H3 (`###`) for subsections
- Always specify language in code blocks:
  ````markdown
  ```lua
  -- Lua code here
  ```
  ````

### Git Commit Messages

Use conventional commits format:

```
<type>: <description>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `content`: Article/content changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build/tooling changes

**Examples:**
```
content: add weapon creation guide

Add comprehensive guide for creating custom weapons in PZ Build 41.
Includes item properties, stats, and testing instructions.

feat: add article sync script

Create sync-articles.ts to upload markdown articles to Supabase.
Supports dry-run mode and single file syncing.

docs: update article creation guide

Clarify YAML frontmatter requirements and add more examples.
```

## Submitting Changes

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b content/my-new-article
   # or
   git checkout -b fix/article-typo
   ```

2. **Make your changes:**
   - Create/edit articles in `content/articles/`
   - Test with `npm run sync:dry-run`
   - Sync with `npm run sync`

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "content: add weapon basics guide"
   ```

4. **Push to GitHub:**
   ```bash
   git push origin content/my-new-article
   ```

5. **Create a Pull Request:**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Describe your changes
   - Wait for review

### Pull Request Checklist

- [ ] Article follows template structure
- [ ] All required YAML frontmatter fields present
- [ ] Markdown is well-formatted
- [ ] Code blocks specify language
- [ ] Links are working
- [ ] Ran `npm run sync:dry-run` successfully
- [ ] Tested article on local development site

## Project Structure

```
dystopianwiki/
├── content/
│   ├── ARTICLE_TEMPLATE.md       # Article template
│   ├── README.md                 # Quick reference
│   └── articles/                 # All articles go here
│       └── pz/build-41/modding/...
│
├── docs/
│   ├── CREATING_ARTICLES.md      # Comprehensive article guide
│   └── guides/                   # Other documentation
│
├── packages/
│   ├── web/                      # React web app
│   ├── mobile/                   # React Native mobile app
│   └── shared/                   # Shared backend logic
│
├── scripts/
│   └── sync-articles.ts          # Sync script (markdown → Supabase)
│
├── supabase/
│   └── migrations/               # Database migrations
│
└── _archive-v1/                  # Old version (DO NOT EDIT)
```

## Need Help?

- **Article Creation:** Read [`docs/CREATING_ARTICLES.md`](docs/CREATING_ARTICLES.md)
- **Quick Reference:** Check [`content/README.md`](content/README.md)
- **Questions:** Open an issue on GitHub
- **Chat:** Join our Discord (link)

## License

By contributing, you agree that your contributions will be licensed under the project's license.
