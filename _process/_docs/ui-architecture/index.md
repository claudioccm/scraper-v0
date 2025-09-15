# ccm-website-7 Frontend Architecture Document

## Table of Contents

- [ccm-website-7 Frontend Architecture Document](#table-of-contents)
  - [Change Log](./change-log.md)
  - [1. Template and Framework Selection](./1-template-and-framework-selection.md)
  - [2. Frontend Tech Stack](./2-frontend-tech-stack.md)
  - [3. Project Structure](./3-project-structure.md)
  - [4. Component Standards](./4-component-standards.md)
    - [Component Template](./4-component-standards.md#component-template)
    - [Naming Conventions](./4-component-standards.md#naming-conventions)
  - [5. State Management](./5-state-management.md)
    - [Store Structure](./5-state-management.md#store-structure)
    - [Enhanced State Management Template](./5-state-management.md#enhanced-state-management-template)
  - [6. API Integration](./6-api-integration.md)
    - [Enhanced Service Template](./6-api-integration.md#enhanced-service-template)
    - [Enhanced API Client Configuration](./6-api-integration.md#enhanced-api-client-configuration)
  - [7. Routing](./7-routing.md)
    - [Route Configuration](./7-routing.md#route-configuration)
    - [Route Protection & Navigation Guards](./7-routing.md#route-protection-navigation-guards)
    - [Dynamic Route Generation](./7-routing.md#dynamic-route-generation)
  - [8. Styling Guidelines](./8-styling-guidelines.md)
    - [Styling Approach](./8-styling-guidelines.md#styling-approach)
    - [Global Theme Variables](./8-styling-guidelines.md#global-theme-variables)
    - [Future Implementation Notes](./8-styling-guidelines.md#future-implementation-notes)
  - [9. Testing Requirements](./9-testing-requirements.md)
    - [Component Test Template](./9-testing-requirements.md#component-test-template)
    - [Testing Best Practices](./9-testing-requirements.md#testing-best-practices)
  - [10. Environment Configuration](./10-environment-configuration.md)
    - [Required Environment Variables](./10-environment-configuration.md#required-environment-variables)
    - [Environment Management Utilities](./10-environment-configuration.md#environment-management-utilities)
  - [11. Frontend Developer Standards](./11-frontend-developer-standards.md)
    - [Critical Coding Rules](./11-frontend-developer-standards.md#critical-coding-rules)
      - [Universal Rules:](./11-frontend-developer-standards.md#universal-rules)
      - [Nuxt 3 Specific Rules:](./11-frontend-developer-standards.md#nuxt-3-specific-rules)
      - [Component Architecture Rules:](./11-frontend-developer-standards.md#component-architecture-rules)
      - [Performance Rules:](./11-frontend-developer-standards.md#performance-rules)
      - [CSS Layer Rules:](./11-frontend-developer-standards.md#css-layer-rules)
    - [Quick Reference](./11-frontend-developer-standards.md#quick-reference)
      - [Development Commands:](./11-frontend-developer-standards.md#development-commands)
      - [Key Import Patterns:](./11-frontend-developer-standards.md#key-import-patterns)
      - [Project-Specific Patterns:](./11-frontend-developer-standards.md#project-specific-patterns)
  - [Summary](./summary.md)

## Related Documentation

### Project Documentation
- **[Project Brief](../brief/)** - Complete project overview and goals
- **[Component Specifications](../components-spec.md)** - Detailed component requirements and status
- **[Accessibility Standards](../accessibility-standards.md)** - WCAG 2.1 AA compliance guidelines
- **[Documentation Standards](../documentation-standards.md)** - LLM-optimized documentation format
- **[SEO Optimization](../seo-optimization.md)** - Search engine optimization standards

### Content Management Documentation
- **[Design System Docs](../../ds-docs/)** - Component library documentation
- **[Stories](../stories/)** - User stories and scenarios
- **[Architecture](../architecture/)** - System architecture documentation

## Quick Navigation

For immediate implementation guidance:
1. **Getting Started**: [Template and Framework Selection](./1-template-and-framework-selection.md)
2. **Component Development**: [Component Standards](./4-component-standards.md) + [Component Specifications](../components-spec.md)
3. **Accessibility**: [Accessibility Standards](../accessibility-standards.md)
4. **SEO**: [SEO Optimization](../seo-optimization.md)
5. **Documentation**: [Documentation Standards](../documentation-standards.md)
