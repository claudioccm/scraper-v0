# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 3 website project with client-side rendering (SSR disabled) that uses Vue 3 composition API. The project follows a component-based architecture with custom CSS using CSS layers and is CMS agnostic.

## Common Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run generate` - Generate static site

### Code Quality
- ESLint is configured via `eslint.config.mjs` using Nuxt's built-in config
- No specific lint command defined in package.json - use standard eslint commands

## Architecture Overview

### Layout System
- **Default Layout**: `layouts/default.vue` uses a master grid system with layered components
- **Master Grid**: `components/ccmMasterGrid.vue` provides responsive 12-column CSS Grid layout
- **Grid Structure**: Uses CSS custom properties and responsive breakpoints (321px, 769px)

### Component System
- All components follow `ccm` prefix naming convention
- Components are auto-imported from `~/components` directory without path prefix
- Base components include:
  - `ccmMasterGrid.vue` - Main layout grid system
  - `ccmTopbar.vue` - Navigation/header component
  - `ccmHero.vue` - Hero section component  
  - `ccmFooter.vue` - Footer component
  - `ccmBaseSection.vue` - Section wrapper
  - `ccmButton.vue` - Button component
  - `ccmByLine.vue` - Byline/attribution component

### CSS Architecture
- Uses CSS `@layer` methodology with layers: reset, defaults, utils, overrides
- Organized in `/public/css/` with modular structure:
  - `base/` - Reset, fonts, typography, layout systems
  - `vars/` - CSS custom properties for colors, spacing, variables
  - `utils/` - Utility classes for colors, spacing
- Main entry point: `public/css/styles.css`

### Configuration
- **Nuxt Config**: Client-side rendering only (`ssr: false`) with experimental client fallback
- **Content Management**: Uses Nuxt Content for file-based content management
- **Dependencies**: Includes Vimeo player, Vue carousel, YouTube integration

### Content Management
- **Nuxt Content**: File-based CMS using Markdown files in `content/` directory
- **Automatic Routing**: `.md` files automatically become accessible routes
- **Frontmatter Support**: YAML frontmatter for metadata (title, date, author, etc.)
- **Directory Structure**:
  - `content/index.md` → accessible at `/`
  - `content/about.md` → accessible at `/about`
  - `content/blog/first-post.md` → accessible at `/blog/first-post`

## Development Notes

- Project uses Vue 3 with Composition API
- TypeScript support configured
- PostCSS configured for CSS processing
- Development tools enabled in Nuxt config
- Material Symbols font loaded from Google Fonts