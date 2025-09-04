# 1. Template and Framework Selection

This project uses **Nuxt 3.16.2** with **Vue 3.5.13** as the established frontend framework. The architecture analysis reveals:

**Current Template Status**: Existing Nuxt 3 project with established patterns rather than a starter template scenario.

**Key Architecture Decisions:**
- **Framework**: Nuxt 3 over vanilla Vue, gaining SSR capabilities, file-based routing, and auto-imports
- **Content Management**: Nuxt Content for file-based CMS with automatic routing
- **State Management**: Pinia configured for reactive state management
- **Styling**: CSS Layer methodology with custom CSS architecture
- **Components**: Custom component system with `ccm` prefix for consistent naming
- **Build Tool**: Vite integration via Nuxt for fast development and optimized bundling

---
