# Dystopian Outcasts Wiki

A community-driven wiki for Project Zomboid modding, powered by Supabase and React.

## Quick Start

1. **Setup:** Install dependencies and configure environment
   ```bash
   cd packages/web
   npm install
   cp .env.example .env  # Configure your Supabase credentials
   ```

2. **Development:** Start the dev server
   ```bash
   npm run dev
   ```

3. **Testing:** See [docs/guides/testing-guide.md](docs/guides/testing-guide.md)

## Documentation

### For Content Contributors

📝 **[Creating Articles Guide](docs/CREATING_ARTICLES.md)** - Complete guide for writing and publishing articles
⚡ **[Quick Reference](content/README.md)** - Quick start for content creators
🤝 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

### For Developers

All technical documentation is in the [`docs/`](docs/) directory:
- `/docs/guides` - Setup and usage guides
- `/docs/planning` - Active planning documents
- `/docs/archive` - Completed phase documentation

See [docs/README.md](docs/README.md) for the complete documentation index.

## Project Structure

```
dystopianwiki/
├── docs/              # All documentation
│   ├── planning/     # Active planning documents
│   ├── guides/       # Setup and usage guides
│   └── archive/      # Completed work documentation
│
├── packages/
│   ├── shared/       # Shared types, API service
│   └── web/          # React frontend
│
├── supabase/         # Database migrations and config
│
└── scripts/          # Utility scripts
    └── migrations/   # One-time migration scripts (archived)
```

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **State:** React Query (TanStack Query)
- **Styling:** Custom CSS with design tokens
- **Authentication:** Email/password + OAuth (Discord, Google)

## Features

### Phase 1 - Content Structure ✅
- Markdown content with YAML frontmatter
- Version/Section/Category hierarchy
- Learning paths and difficulty levels
- Search functionality

### Phase 2 - User Features ✅
- Authentication (Email/password + OAuth)
- User bookmarks
- Settings page
- Persistent sessions

### Phase 3 - Enhanced Auth (In Progress)
- Separate signup form with username
- Password confirmation
- Terms of Service acceptance
- Password reset flow
- Client-side validation
- Email verification

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines (TBD).

## License

[License TBD]
