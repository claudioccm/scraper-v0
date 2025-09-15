# Accessibility Standards

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2025-01-09  

## Overview

This document defines comprehensive accessibility standards for all components in the White Label Design System, ensuring WCAG 2.1 AA compliance and optimal user experience for users with disabilities.

## WCAG Compliance Framework

### Compliance Level
- **Target:** WCAG 2.1 AA compliance (minimum)
- **Aspiration:** WCAG 2.1 AAA where feasible
- **Testing:** Automated + manual validation required

### Four Principles of Accessibility

#### 1. Perceivable
**Information and UI components must be presentable to users in ways they can perceive.**

**Color & Contrast:**
- **Text contrast minimum:** 4.5:1 for normal text, 3:1 for large text (18pt+)
- **UI element contrast:** 3:1 for interactive elements and graphics
- **Color independence:** Never rely solely on color to convey information

**Alternative Text:**
- **Images:** Alt text for informative images, empty alt="" for decorative
- **Icons:** Accessible names via aria-label or sr-only text
- **Complex graphics:** Longer descriptions via aria-describedby

**Responsive Design:**
- **Zoom support:** Content readable and functional at 200% zoom
- **Text scaling:** Support browser text size adjustments
- **Mobile accessibility:** Touch targets minimum 44px × 44px

#### 2. Operable
**UI components and navigation must be operable.**

**Keyboard Navigation:**
- **Full keyboard access:** All functionality available via keyboard
- **Logical tab order:** Sequential, predictable navigation flow
- **Visible focus indicators:** Clear, high-contrast focus states
- **Skip links:** "Skip to main content" and section navigation

**Timing & Motion:**
- **No time limits** on essential functions (or user-controllable)
- **Pause/stop controls** for auto-playing content
- **Reduced motion support:** Respect prefers-reduced-motion
- **No seizure triggers:** No flashing content >3Hz

#### 3. Understandable
**Information and operation of UI must be understandable.**

**Text Clarity:**
- **Plain language:** Clear, concise content appropriate for audience
- **Reading level:** Appropriate complexity for intended users
- **Language attributes:** lang attributes for screen readers
- **Abbreviations:** Expansions provided on first use

**Predictable Interface:**
- **Consistent navigation:** Same locations across pages
- **Consistent identification:** Same elements labeled consistently
- **Change notification:** Alert users to context changes
- **Error prevention:** Input validation and confirmation for critical actions

#### 4. Robust
**Content must be robust enough for interpretation by assistive technologies.**

**Valid Markup:**
- **Semantic HTML:** Proper heading hierarchy, landmarks, lists
- **Valid code:** HTML validation, proper nesting
- **ARIA compliance:** Correct ARIA roles, properties, and states
- **Progressive enhancement:** Graceful degradation support

## Component-Level Standards

### Atoms (Interactive Elements)

#### ccmButton
**Requirements:**
- **Semantic HTML:** `<button>`, `<a>`, or `role="button"`
- **Accessible name:** Via `aria-label`, `aria-labelledby`, or text content
- **Focus management:** Visible focus indicator, logical tab order
- **State indication:** `aria-pressed` for toggle buttons, `aria-expanded` for disclosure
- **Keyboard support:** Enter/Space activation, Esc to cancel
- **Touch targets:** Minimum 44px × 44px interactive area

**Testing checklist:**
- [ ] Screen reader announces button purpose
- [ ] Keyboard navigation works
- [ ] Focus indicator visible
- [ ] Touch target meets size requirements
- [ ] Color contrast meets 3:1 ratio

#### Form Controls (ccmInput, ccmSelect, ccmCheckbox, etc.)
**Requirements:**
- **Labels:** Associated via `<label for>` or `aria-labelledby`
- **Required indication:** `required` attribute + visual/text indicator
- **Error handling:** `aria-describedby` linking to error messages
- **Help text:** `aria-describedby` for additional instructions
- **Fieldset grouping:** Related controls in `<fieldset>` with `<legend>`

### Molecules (Composite Elements)

#### ccmCard
**Requirements:**
- **Semantic structure:** Proper heading hierarchy within cards
- **Link purpose:** Clear link text or `aria-label` for "Read more" links
- **Image accessibility:** Alt text for informative images
- **Focus management:** Logical tab order through card content

#### ccmNavigation
**Requirements:**
- **Landmark roles:** `role="navigation"` with `aria-label`
- **Current page indication:** `aria-current="page"` for active links
- **Submenu disclosure:** `aria-expanded` for dropdown states
- **Mobile menu:** Proper focus trap and Esc key handling

### Organisms (Complex Components)

#### ccmModal
**Requirements:**
- **Focus trap:** Focus contained within modal when open
- **Keyboard handling:** Esc key closes modal
- **Screen reader:** `role="dialog"`, `aria-labelledby`, `aria-describedby`
- **Background interaction:** Inert background content
- **Return focus:** Focus returns to trigger element on close

#### ccmDataTable
**Requirements:**
- **Table structure:** Proper `<th>` headers with `scope` attributes
- **Caption:** `<caption>` describing table purpose
- **Complex headers:** `headers` attribute for multi-level headers
- **Sorting indication:** `aria-sort` for sortable columns
- **Row selection:** `aria-selected` for selectable rows

## Design Token Accessibility

### Color System Requirements
```css
/* Ensure sufficient contrast ratios */
--color-text-primary: /* 4.5:1 contrast against backgrounds */
--color-text-secondary: /* 4.5:1 contrast against backgrounds */
--color-focus-outline: /* High contrast focus indicator */
--color-error: /* Distinguishable from other states */
--color-success: /* Distinguishable from error/warning */
```

### Typography Standards
```css
/* Readable font sizes and line heights */
--font-size-body: clamp(1rem, 2.5vw, 1.125rem); /* Minimum 16px */
--line-height-body: 1.5; /* Minimum 1.5x for readability */
--letter-spacing: normal; /* Avoid excessive spacing */
```

### Motion & Animation
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Requirements

### Automated Testing Tools
- **axe-core:** Component-level accessibility testing
- **Lighthouse:** Page-level accessibility auditing
- **eslint-plugin-jsx-a11y:** Code-level accessibility linting

### Manual Testing Procedures
1. **Keyboard-only navigation:** Test all functionality without mouse
2. **Screen reader testing:** NVDA (Windows), VoiceOver (Mac), JAWS
3. **High contrast mode:** Windows High Contrast, browser extensions
4. **Zoom testing:** 200% zoom, browser text scaling
5. **Mobile accessibility:** Screen reader on mobile devices

### Component Testing Template
```typescript
// Accessibility test example for ccmButton
describe('ccmButton accessibility', () => {
  it('has accessible name', () => {
    const wrapper = mount(ccmButton, { props: { label: 'Submit' } })
    expect(wrapper.find('button').attributes('aria-label') || wrapper.text()).toBeTruthy()
  })

  it('has sufficient color contrast', async () => {
    const wrapper = mount(ccmButton, { props: { variant: 'primary' } })
    const button = wrapper.find('button')
    // Use automated contrast checking tool
    expect(await checkContrast(button)).toBeGreaterThan(3)
  })

  it('supports keyboard interaction', async () => {
    const wrapper = mount(ccmButton, { props: { label: 'Click me' } })
    await wrapper.find('button').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## LLM Integration Guidelines

### AI-Generated Component Requirements
When LLMs generate components, they must include:

1. **Accessibility Props:** Required ARIA attributes and roles
2. **Semantic HTML:** Proper element selection for component purpose
3. **Testing Notes:** Specific accessibility tests to implement
4. **Usage Examples:** Accessible implementation examples

### Prompt Templates for Accessibility
```markdown
## Accessibility Requirements for {ComponentName}
- WCAG Level: AA compliance required
- Screen Reader: Must announce component purpose and state
- Keyboard: Full keyboard navigation support required
- Focus: Visible focus indicators with 3:1 contrast minimum
- Color: Cannot rely solely on color for information
- Touch: Minimum 44px touch targets on mobile
```

## Compliance Verification

### Pre-Release Checklist
- [ ] Automated axe-core tests pass
- [ ] Manual keyboard navigation complete
- [ ] Screen reader testing complete
- [ ] Color contrast verified (4.5:1 text, 3:1 UI)
- [ ] Mobile accessibility tested
- [ ] Focus indicators visible and sufficient contrast

### Ongoing Monitoring
- Monthly accessibility audits of live components
- User feedback collection from assistive technology users
- Regular updates to standards as WCAG evolves

## Resources & References

### Official Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Resources](https://webaim.org/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Free)](https://www.nvaccess.org/download/)
- [VoiceOver (Mac)](https://support.apple.com/guide/voiceover/)
- [JAWS (Commercial)](https://www.freedomscientific.com/products/software/jaws/)

This document ensures all White Label Design System components meet accessibility standards and provide excellent user experience for all users, including those using assistive technologies.