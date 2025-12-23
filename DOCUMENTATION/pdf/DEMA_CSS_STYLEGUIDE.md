# DEMA Group CSS Style Guide

## Table of Contents
1. [Brand Colors](#brand-colors)
2. [Typography](#typography)
3. [Layout & Grid](#layout--grid)
4. [Components](#components)
5. [Responsive Design](#responsive-design)
6. [Animations & Transitions](#animations--transitions)
7. [Best Practices](#best-practices)

## Brand Colors

### Primary Colors
```css
:root {
  /* DEMA Brand Red */
  --dema-red-50: #fef2f2;
  --dema-red-100: #fee2e2;
  --dema-red-200: #fecaca;
  --dema-red-300: #fca5a5;
  --dema-red-400: #f87171;
  --dema-red-500: #ef4444;  /* Primary Brand Color */
  --dema-red-600: #dc2626;
  --dema-red-700: #b91c1c;
  --dema-red-800: #991b1b;
  --dema-red-900: #7f1d1d;
  
  /* Fluxer Brand Blue */
  --fluxer-blue-50: #f0f9ff;
  --fluxer-blue-100: #e0f2fe;
  --fluxer-blue-200: #bae6fd;
  --fluxer-blue-300: #7dd3fc;
  --fluxer-blue-400: #38bdf8;
  --fluxer-blue-500: #0ea5e9;  /* Primary Brand Color */
  --fluxer-blue-600: #0284c7;
  --fluxer-blue-700: #0369a1;
  --fluxer-blue-800: #075985;
  --fluxer-blue-900: #0c4a6e;

  /* Beltz247 Brand Orange */
  --beltz-orange-50: #fff7ed;
  --beltz-orange-100: #ffedd5;
  --beltz-orange-200: #fed7aa;
  --beltz-orange-300: #fdba74;
  --beltz-orange-400: #fb923c;
  --beltz-orange-500: #f97316;  /* Primary Brand Color */
  --beltz-orange-600: #ea580c;
  --beltz-orange-700: #c2410c;
  --beltz-orange-800: #9a3412;
  --beltz-orange-900: #7c2d12;
}
```

### Neutral Colors
```css
:root {
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
}
```

### Semantic Colors
```css
:root {
  --success-light: #86efac;
  --success: #22c55e;
  --success-dark: #15803d;

  --warning-light: #fde047;
  --warning: #eab308;
  --warning-dark: #a16207;

  --error-light: #fca5a5;
  --error: #ef4444;
  --error-dark: #b91c1c;

  --info-light: #93c5fd;
  --info: #3b82f6;
  --info-dark: #1d4ed8;
}
```

## Typography

### Font Families
```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'Poppins', var(--font-sans);
}
```

### Font Sizes
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

### Font Weights
```css
:root {
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### Line Heights
```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

## Layout & Grid

### Spacing Scale
```css
:root {
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0.5: 0.125rem;
  --spacing-1: 0.25rem;
  --spacing-1.5: 0.375rem;
  --spacing-2: 0.5rem;
  --spacing-2.5: 0.625rem;
  --spacing-3: 0.75rem;
  --spacing-3.5: 0.875rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  --spacing-32: 8rem;
}
```

### Container Widths
```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

### Grid System
```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-4);
}

.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }
.col-span-6 { grid-column: span 6 / span 6; }
.col-span-12 { grid-column: span 12 / span 12; }
```

## Components

### Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-weight: var(--font-medium);
  border-radius: 0.375rem;
  transition: all 150ms ease-in-out;
}

.btn-primary {
  background-color: var(--dema-red-500);
  color: white;
}

.btn-primary:hover {
  background-color: var(--dema-red-600);
}

.btn-secondary {
  background-color: var(--neutral-200);
  color: var(--neutral-800);
}

.btn-secondary:hover {
  background-color: var(--neutral-300);
}
```

### Form Elements
```css
.input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--neutral-300);
  border-radius: 0.375rem;
  transition: border-color 150ms ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--dema-red-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select {
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  padding-right: 2.5rem;
}
```

### Cards
```css
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-4);
}

.card-hover {
  transition: transform 150ms ease-in-out, box-shadow 150ms ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Container Queries
```css
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
  width: 100%;
}

@media (min-width: 640px) {
  .container { max-width: var(--container-sm); }
}

@media (min-width: 768px) {
  .container { max-width: var(--container-md); }
}

@media (min-width: 1024px) {
  .container { max-width: var(--container-lg); }
}
```

## Animations & Transitions

### Durations
```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### Timing Functions
```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Common Animations
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Best Practices

### CSS Architecture
- Use BEM (Block Element Modifier) naming convention
- Organize CSS properties in logical groups
- Maintain consistent ordering of properties
- Use CSS custom properties for theming and configuration
- Implement mobile-first responsive design
- Keep specificity low and manageable

### Performance
- Minimize use of expensive properties (box-shadow, transform, etc.)
- Use hardware acceleration where appropriate
- Optimize animations for 60fps
- Implement critical CSS
- Lazy load non-critical styles

### Accessibility
- Maintain color contrast ratios (WCAG 2.1)
- Provide focus styles for interactive elements
- Support reduced motion preferences
- Ensure text remains readable when zoomed
- Test with screen readers

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--neutral-900);
    --text-primary: var(--neutral-100);
    /* ... other dark mode variables */
  }
}
```

### Print Styles
```css
@media print {
  .no-print {
    display: none;
  }

  a[href]::after {
    content: " (" attr(href) ")";
  }
}
```

### CSS Reset/Normalize
```css
/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Utility Classes
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
