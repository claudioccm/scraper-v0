# MVP Scope

## Core Features (Must Have)

- **Complete Component Library:** Full atomic design hierarchy (30 components)
  - All atoms, molecules, and organisms from technical specification
  - Standardized ccm-* naming convention
  - LLM-optimized documentation format
  - Consistent prop APIs and variant systems

- **Design Token System (PRIORITY):** Complete theming infrastructure foundation
  - Utopia.fyi integration for spaces and sizes
  - CSS custom property hierarchy (base → theme → component levels)
  - HSL-based color system with tints/shades (10% increments + 3%, 5%, 7%)
  - System color aliases (success=green, error=red, warning=yellow, info=blue)
  - Token validation and semantic naming structure

- **AI Documentation Framework:** Documentation optimized for LLM consumption
  - Structured markdown with AI guidance sections
  - Prompt templates for common scenarios
  - Code examples with context explanations

- **Content Engine Integration:** Complete boilerplate foundation for new projects
  - **Project Scaffolding System:** One-command setup creates new themed project
  - **Content Template Library:** Pre-built page templates (homepage, about, blog, portfolio)
  - **Theme-Content Coordination:** Content rendering automatically adapts to active theme
  - **Brand-Specific Content:** Support for brand-customized copy and messaging
  - **Content Management Workflow:** Git-based content updates with theme-aware previews
  - **Multi-Brand Deployment:** Single codebase supports multiple branded instances
  - **Related Content System (Epic):** Composable functions for tag/category-based content relationships
    - Content filtering and browsing by categories/tags
    - Related posts functionality across all content types
    - Tag archive pages and content discovery features
    - Reusable composables for any content relationship needs

- **Developer Experience Tools:** Essential tooling for both humans and AI
  - Component registry/index for discovery
  - Clear documentation for manual token editing

## Component Scope for MVP (Complete Atomic Design Hierarchy)

**Atoms (6 components):**
- **ccmButton** - Primary action trigger
- **ccmIcon** - Visual symbols and recognition
- **ccmChip** - Status, tags, counts
- **ccmToggleButton** - On/off state control
- **ccmInputText** - Single-line text entry
- **ccmInputRadio** - Mutually exclusive options
- **ccmInputCheckbox** - Multi-select boolean
- **ccmSelect** - Dropdown option selection
- **ccmTextarea** - Multi-line text entry
- **ccmLabel** - Form control association

**Molecules (8 components):**
- **ccmSearchBar** - Composed search interface
- **ccmAlert** - Dismissible notifications
- **ccmFormField** - Label, control, helper text bundle
- **ccmDropdownMenu** - Action list disclosure
- **ccmPagination** - Content page navigation
- **ccmTabNavigation** - Section switching tabs
- **ccmTooltip** - Contextual help overlay
- **ccmMenuButton** - ARIA menu disclosure

**Organisms (16 components):**
- **ccmTopbar** - Global navigation header
- **ccmFooter** - Site links and metadata
- **ccmHero** - Prominent intro section
- **ccmPostHero** - Article header with meta
- **ccmSection** - Content wrapper and spacing
- **ccmCard** - Reusable content preview
- **ccmCallout** - Highlighted content block
- **ccmProseSection** - Rich text content area
- **ccmProseHgroup** - Heading groups
- **ccmDataTable** - Accessible data tables
- **ccmSidebar** - Vertical navigation/content
- **ccmModal** - Overlay focused tasks
- **ccmTabbedInterface** - Tabs with panels
- **ccmContentSlider** - Horizontal carousel
- **ccmCollapsibleSection** - Expand/collapse regions
- **ccmMenu** - ARIA menu with commands

*Detailed component specifications will be maintained in `docs/components-spec.md`*

## Out of Scope for MVP
- Advanced theme editor UI (web interface)
- Multiple deployment targets (focus on Nuxt/Vercel initially)
- Complex animation systems
- Multi-language/i18n support
- Enterprise SSO integration
- Advanced analytics/tracking systems
- **MCP Integration** (moved to Phase 2)
- **LLM Testing Framework** (moved to Phase 2)
- **Machine-readable schemas** (moved to Phase 2)

## MVP Success Criteria
- **Component Coverage:** 30 production-ready components following atomic design hierarchy
- **Token System Foundation:** Complete design token architecture (Utopia + CSS custom properties)
- **Boilerplate Functionality:** Clone-to-deployed workflow works in under 30 minutes
- **Content Template Library:** Complete set of page templates (homepage, about, blog, portfolio)
- **Manual Theming:** Design token editing creates working branded site
- **Documentation Quality:** Human developers can implement without additional support
- **Performance Baseline:** Generated sites achieve 90+ Lighthouse scores
