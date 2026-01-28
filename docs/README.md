# Dystopian Wiki - Documentation

**Current Version:** v1.2 (Mobile Phase 1 Complete)
**Last Updated:** January 28, 2026

---

## 📋 Start Here

**New to the project?** Read these first:

1. **[HANDOFF.md](HANDOFF.md)** - Complete project overview, architecture, and status
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick lookup for commands, tokens, and common tasks
3. **[ROADMAP.md](ROADMAP.md)** - Project timeline, completed work, and future plans

---

## 📁 Documentation Structure

### `/` - Project Overview
- **[HANDOFF.md](HANDOFF.md)** - Complete handoff document (what's built, how it works, what's next)
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card for developers
- **[CREATING_ARTICLES.md](CREATING_ARTICLES.md)** - How to write and add articles

### `/planning` - Work In Progress
Active planning documents for features currently being designed or implemented.

- **[MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md)** - Complete mobile design specification (177 pages)
- [mobile-design/](planning/mobile-design/) - Design system broken into sections
- [phase1-plan.md](planning/phase1-plan.md) - Initial setup and content structure
- [phase2-plan.md](planning/phase2-plan.md) - Authentication and user features

### `/guides` - How-To Documentation
Permanent guides and setup instructions. Keep these updated as the project evolves.

- [testing-guide.md](guides/testing-guide.md) - Test authentication and features
- [supabase-email-template.md](guides/supabase-email-template.md) - Configure email templates

### `/archive` - Completed Work
Historical documentation of completed phases and features. For reference only.

- [phase2-complete.md](archive/phase2-complete.md) - Phase 2 completion summary (auth system)
- [phase2-status.md](archive/phase2-status.md) - Phase 2 progress tracking

### `/legal`
- [privacy-policy.md](legal/privacy-policy.md) - Privacy policy

---

## 🚀 Quick Start

### For Developers

```bash
# Install dependencies
npm install

# Web development
cd packages/web && npm run dev
# → http://localhost:5173

# Mobile development
cd packages/mobile && npm start
# → Press 'a' for Android, 'i' for iOS
```

See [HANDOFF.md](HANDOFF.md) for complete setup instructions.

---

## 📚 Key Documents by Task

### Understanding the Project
- [HANDOFF.md](HANDOFF.md) - Start here for complete overview
- [ROADMAP.md](ROADMAP.md) - Project timeline and future plans
- [phase2-complete.md](archive/phase2-complete.md) - Web app features summary

### Design & UI
- [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md) - Complete mobile design spec
- [mobile-design/](planning/mobile-design/) - Design system sections

### Development
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commands, tokens, common tasks
- [HANDOFF.md#tech-stack](HANDOFF.md#tech-stack) - Technology overview
- [HANDOFF.md#architecture](HANDOFF.md#architecture) - System architecture

### Content Creation
- [CREATING_ARTICLES.md](CREATING_ARTICLES.md) - Write and publish articles

### Testing
- [testing-guide.md](guides/testing-guide.md) - Testing procedures

---

## 🎯 Current Status

| Area | Status | Document |
|------|--------|----------|
| Web App | ✅ Production | [phase2-complete.md](archive/phase2-complete.md) |
| Mobile - Design System | ✅ Complete | [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md) |
| Mobile - Phase 0 | ✅ Complete | [HANDOFF.md#phase-0-foundations](HANDOFF.md#phase-0-foundations---complete) |
| Mobile - Phase 1 | ✅ Complete | [HANDOFF.md#phase-1-navigation](HANDOFF.md#phase-1-navigation---complete) |
| Mobile - Phase 2 | 🔄 Next | [HANDOFF.md#whats-next](HANDOFF.md#whats-next) |

---

## 🔍 Find What You Need

**"How do I...?"**
- Get started developing? → [HANDOFF.md#getting-started](HANDOFF.md#getting-started)
- Use design tokens? → [QUICK_REFERENCE.md#design-tokens-mobile](QUICK_REFERENCE.md#design-tokens-mobile)
- Add a new screen? → [QUICK_REFERENCE.md#add-new-screen](QUICK_REFERENCE.md#add-new-screen)
- Create an article? → [CREATING_ARTICLES.md](CREATING_ARTICLES.md)
- Run tests? → [testing-guide.md](guides/testing-guide.md)

**"What is...?"**
- The project architecture? → [HANDOFF.md#architecture](HANDOFF.md#architecture)
- The tech stack? → [HANDOFF.md#tech-stack](HANDOFF.md#tech-stack)
- The design system? → [MOBILE_UI_DESIGN_SYSTEM_V3.md](planning/MOBILE_UI_DESIGN_SYSTEM_V3.md)

**"Where is...?"**
- The color palette? → [QUICK_REFERENCE.md#colors](QUICK_REFERENCE.md#colors)
- The component library? → `packages/mobile/src/components/`
- The database schema? → `supabase/migrations/`

---

## 📞 Support

- **Questions?** Check [HANDOFF.md](HANDOFF.md) first
- **Quick lookup?** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Issues?** Use GitHub Issues
- **Community:** Discord (Dystopian Outcasts)

---

## 📝 Contributing

When adding documentation:
1. **Planning docs** → Put in `/planning` until feature is complete
2. **How-to guides** → Put in `/guides` for permanent reference
3. **Completed work** → Move planning docs to `/archive`
4. **Update this README** → Add links to new documents

---

**Last Updated:** January 28, 2026
**Project Version:** v1.2 (Mobile Phase 1 Complete)
