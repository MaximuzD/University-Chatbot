# AI Agent Guidance: Astryx Design System & Modern Web Guidance

This repository uses **Astryx Design System** (`@astryxdesign/core`) along with **Modern Web Guidance** best practices.

## Guidelines for UI/UX Code Generation
1. **Design System & Components**:
   - Prefer standard components from `@astryxdesign/core` (`Container`, `Card`, `Button`, `Heading`, `Text`, etc.).
   - Follow semantic HTML hierarchy (`main`, `header`, `nav`, `section`, `footer`).
2. **Themes & Styling**:
   - Astryx uses theme CSS variables decoupled across dark/light mode via `@astryxdesign/theme-neutral`.
   - Never hardcode rigid colors when design system tokens or CSS custom properties can be used.
3. **Accessibility & Responsive Design**:
   - Ensure color contrast ratios conform to WCAG 2.1 AA standards.
   - All interactive controls must support keyboard navigation (`:focus-visible`) and proper ARIA roles.
