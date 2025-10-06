# Contributing Guide

## Welcome!

Thank you for your interest in contributing to Scraper-v0! This guide will help you get started with development and explain our workflows.

---

## Quick Start

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/your-username/scraper-v0.git
cd scraper-v0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials (optional for basic dev)
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Development Workflow

### Branch Strategy

```bash
# Create a feature branch from main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### Making Changes

1. **Write code** following our [style guide](#code-style)
2. **Test locally** to ensure it works
3. **Write tests** for new functionality (when test infrastructure exists)
4. **Update documentation** if you changed behavior
5. **Commit** with [clear messages](#commit-messages)

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples**:

```bash
# Good
git commit -m "feat(scraper): add proxy support for scraping"
git commit -m "fix(cards): prevent duplicate card creation"
git commit -m "docs(readme): update installation instructions"

# Bad
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
```

### Pull Requests

1. **Push your branch**:
```bash
git push origin feature/your-feature-name
```

2. **Create PR** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Link to related issue (if applicable)
   - Screenshots (for UI changes)

3. **PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] No console errors
```

4. **Respond to review** feedback and update PR

5. **Merge** - Maintainers will merge when approved

---

## Code Style

### TypeScript

```typescript
// ✅ Good
interface UserProps {
  name: string
  email: string
}

async function createUser(props: UserProps): Promise<User> {
  const user = await db.users.create(props)
  return user
}

// ❌ Bad
async function createUser(name, email) {
  return await db.users.create({ name, email })
}
```

**Guidelines**:
- Use TypeScript for type safety
- Define interfaces for data structures
- Use `async/await` over promises
- Avoid `any` type unless absolutely necessary
- Use meaningful variable names

### Vue/Nuxt

```vue
<!-- ✅ Good -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
  </div>
</template>

<style scoped>
.component {
  padding: var(--space-m);
}
</style>
```

**Guidelines**:
- Use Composition API (`<script setup>`)
- Define props with TypeScript
- Use scoped styles
- Follow `ccm` naming for components

### CSS

```css
/* ✅ Good */
@layer utils {
  .card {
    padding: var(--space-m);
    border-radius: var(--border-radius-m);
    background: var(--color-neutral-10);
  }
}

/* ❌ Bad */
.card {
  padding: 16px;
  border-radius: 8px;
  background: #f5f5f5;
}
```

**Guidelines**:
- Use CSS custom properties (variables)
- Respect CSS @layer hierarchy
- Use semantic class names
- Avoid inline styles unless dynamic

### File Organization

```
components/
  ccmButton.vue          # Component file
  ccmCard.vue

composables/
  useScraper.ts          # Composable file
  useWorkflowCards.ts

server/
  api/
    cards/
      index.get.ts       # GET /api/cards
      index.post.ts      # POST /api/cards
      [id].patch.ts      # PATCH /api/cards/:id
  utils/
    cardWorkflow.ts      # Server utility

types/
  workflow-card.ts       # Type definitions
```

---

## Testing (When Available)

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { validateUrl } from '~/utils/validation'

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(validateUrl('not a url')).toBe(false)
  })
})
```

### Component Tests

```typescript
import { mount } from '@vue/test-utils'
import ccmButton from '~/components/ccmButton.vue'

describe('ccmButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(ccmButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(ccmButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

**Run tests**:
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## Documentation

### Code Comments

```typescript
/**
 * Scrape a URL and extract content
 *
 * @param url - URL to scrape
 * @param options - Scraping options
 * @returns Scrape result with extracted content
 * @throws {Error} If URL is invalid or scraping fails
 *
 * @example
 * const result = await scrape('https://example.com', {
 *   returnHtml: true
 * })
 */
export async function scrape(
  url: string,
  options?: ScrapeOptions
): Promise<ScrapeResult> {
  // Implementation
}
```

### Markdown Docs

Update relevant docs when changing:
- API endpoints → `content/docs/api/endpoints.md`
- Modules → `content/docs/modules/*.md`
- Components → `content/docs/frontend/components.md`
- Architecture → `content/docs/architecture.md`

---

## What to Contribute

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- UI/UX polish
- Bug fixes
- Test coverage

### High-Impact Areas

**1. Testing**
- Add unit tests for modules
- Add integration tests for API
- Add E2E tests for workflows

**2. Database Migration**
- Design schema
- Implement migrations
- Update API to use database

**3. Authentication**
- User registration/login
- Role-based access
- Session management

**4. UI/UX Improvements**
- Dark mode
- Mobile responsiveness
- Accessibility
- Loading states

**5. Documentation**
- Code examples
- Video tutorials
- API guides
- Architecture diagrams

---

## Code Review Process

### For Contributors

**Before requesting review**:
- [ ] Code is self-reviewed
- [ ] All tests pass (when available)
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Follows style guide

**During review**:
- Be responsive to feedback
- Ask questions if unclear
- Make requested changes promptly
- Mark conversations as resolved

### For Reviewers

**Review checklist**:
- [ ] Code solves stated problem
- [ ] Follows project conventions
- [ ] Tests cover new functionality
- [ ] Documentation is clear
- [ ] No obvious bugs or edge cases
- [ ] Performance is acceptable

**Review tone**:
- Be respectful and constructive
- Explain *why* changes are needed
- Suggest alternatives
- Praise good work

---

## Development Tools

### Recommended VSCode Extensions

```json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### ESLint

```bash
# Run linter
npx eslint .

# Fix auto-fixable issues
npx eslint . --fix
```

### TypeScript

```bash
# Type check
npx nuxi typecheck
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Create handler file**:
```typescript
// server/api/your-endpoint.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Handle request
  return { success: true }
})
```

2. **Add types**:
```typescript
// types/your-feature.ts
export interface YourRequest {
  field: string
}

export interface YourResponse {
  success: boolean
}
```

3. **Update docs**:
```markdown
<!-- content/docs/api/endpoints.md -->
### POST /api/your-endpoint
Description...
```

### Adding a New Component

1. **Create component**:
```vue
<!-- components/ccmYourComponent.vue -->
<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="your-component">
    {{ title }}
  </div>
</template>

<style scoped>
.your-component {
  /* styles */
}
</style>
```

2. **Document it**:
```markdown
<!-- content/docs/frontend/components.md -->
### ccmYourComponent
Description...
```

3. **Use it**:
```vue
<template>
  <ccm-your-component title="Hello" />
</template>
```

### Adding a New Module

1. **Create module structure**:
```
modules/
  your-module/
    module.ts           # Module definition
    runtime/
      composables/      # Client composables
      server/           # Server code
      types.ts          # Type definitions
```

2. **Define module**:
```typescript
// modules/your-module/module.ts
export default defineNuxtModule({
  meta: {
    name: 'your-module',
    configKey: 'yourModule'
  },
  setup(options, nuxt) {
    // Setup logic
  }
})
```

3. **Register in nuxt.config.ts**:
```typescript
modules: [
  './modules/your-module'
]
```

---

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general chat
- **Discord** (if available): Real-time chat

### Asking Questions

**Good question**:
```
I'm trying to implement X feature. I've looked at Y code and
tried Z approach, but I'm getting error E. How should I
approach this?

Here's my code: [code snippet]
Expected: [what you expect]
Actual: [what happens]
```

**Bad question**:
```
It doesn't work. Help?
```

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation (for major contributions)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and harassment-free environment for everyone.

### Our Standards

**Positive behaviors**:
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behaviors**:
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to [maintainer email]

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## Related Documentation

- [**Current Status**](status) - What's implemented
- [**Roadmap**](roadmap) - Future plans
- [**Architecture**](architecture) - Technical design
- [**Setup Guide**](setup) - Getting started
