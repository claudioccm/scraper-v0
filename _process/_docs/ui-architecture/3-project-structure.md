# 3. Project Structure

```
ccm-website-7/
├── .nuxt/                     # Auto-generated Nuxt files (ignored)
├── .output/                   # Build output directory
├── .bmad-core/               # BMAD agent configurations
├── assets/                   # Source assets (images, fonts, etc.)
├── components/               # Auto-imported Vue components
│   ├── content/              # Nuxt Content prose components
│   │   ├── proseHgroup.vue   # Content heading groups
│   │   ├── Callout.vue       # Content callouts
│   │   └── proseSection.vue  # Content sections
│   └── ccm*.vue             # Project-specific components (ccm prefix)
├── composables/             # Auto-imported composition functions
├── content/                 # Markdown content files (CMS)
│   ├── index.md            # Homepage content
│   └── [subdirectories]/   # Content organization
├── docs/                   # Project documentation
│   ├── architecture/       # System architecture documentation
│   ├── brief/              # Project brief (sharded documentation)
│   │   ├── index.md        # Brief table of contents
│   │   ├── executive-summary.md
│   │   ├── problem-statement.md
│   │   ├── proposed-solution.md
│   │   ├── target-users.md
│   │   ├── goals-success-metrics.md
│   │   ├── mvp-scope.md
│   │   └── post-mvp-vision.md
│   ├── prd/               # Product requirements documentation
│   ├── stories/           # User stories and scenarios
│   ├── ui-architecture/    # UI architecture documentation (sharded)
│   │   ├── index.md        # Architecture table of contents
│   │   ├── 1-template-and-framework-selection.md
│   │   ├── 2-frontend-tech-stack.md
│   │   ├── 3-project-structure.md
│   │   ├── 4-component-standards.md
│   │   ├── 5-state-management.md
│   │   ├── 6-api-integration.md
│   │   ├── 7-routing.md
│   │   ├── 8-styling-guidelines.md
│   │   ├── 9-testing-requirements.md
│   │   ├── 10-environment-configuration.md
│   │   ├── 11-frontend-developer-standards.md
│   │   ├── change-log.md
│   │   └── summary.md
│   ├── accessibility-standards.md  # WCAG 2.1 AA compliance guidelines
│   ├── brief.md            # Project brief main document
│   ├── components-spec.md  # Component specifications and status
│   ├── documentation-standards.md  # LLM-optimized documentation format
│   ├── seo-optimization.md # Search engine optimization standards
│   └── ui-architecture.md  # Complete UI architecture (single file)
├── ds-docs/               # Design system documentation
├── layouts/               # Nuxt layout components
│   └── default.vue        # Main application layout
├── middleware/            # Route middleware
├── pages/                 # File-based routing (if needed)
├── plugins/               # Nuxt plugins
├── public/                # Static assets served at root
│   ├── css/              # CSS architecture
│   │   ├── base/         # Reset, typography, layout
│   │   ├── vars/         # CSS custom properties
│   │   ├── utils/        # Utility classes
│   │   └── components/   # Component-specific styles
│   └── images/           # Static images
├── server/                # Server-side code (API routes)
├── stores/                # Pinia store modules
├── types/                 # TypeScript type definitions
├── utils/                 # Auto-imported utility functions
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

**Key Architecture Decisions:**
- **Auto-import Strategy**: Components, composables, and utils are auto-imported without path prefixes
- **Content-Driven**: Content directory serves as the primary CMS with automatic routing
- **CSS Architecture**: Sophisticated layer-based CSS organization in public/css/
- **Component Naming**: Consistent `ccm` prefix for project-specific components
- **Documentation Focus**: Multiple documentation directories for different purposes
- **Type Safety**: Dedicated types directory for TypeScript definitions

**AI Tool Guidance:**
- New components go in `components/` with `ccm` prefix
- Content files in `content/` automatically become routes
- CSS follows layer methodology in `public/css/`
- Store modules in `stores/` follow Pinia patterns
- Types in `types/` for shared interfaces
- Follow documentation standards in `docs/documentation-standards.md`
- Implement accessibility requirements from `docs/accessibility-standards.md`
- Apply SEO optimization from `docs/seo-optimization.md`
- Check component specifications in `docs/components-spec.md`
- Refer to project brief in `docs/brief/` for context

---
