# Content Management

This folder contains markdown articles for the wiki.

## Structure

```
content/
├── ARTICLE_TEMPLATE.md     # Template for new articles
├── README.md               # This file
└── articles/
    └── pz/
        └── build-41/
            └── modding/
                ├── items/
                ├── recipes/
                ├── lua-api/
                └── ...
```

## Creating New Articles

1. Copy `ARTICLE_TEMPLATE.md`
2. Fill in the YAML frontmatter
3. Write your content in markdown
4. Save as `your-article-slug.md`
5. Run sync script (handled by dev)

## Workflow

- **Write**: Create/edit markdown files here
- **Sync**: Dev tooling syncs to Supabase
- **Version Control**: Commit markdown files to Git
- **Live Site**: Reads from Supabase database

## Notes

- Markdown files are the source of truth
- Database is generated from markdown
- Dev is handling the sync tooling
