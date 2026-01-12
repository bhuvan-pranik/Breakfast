# Breakfast Counter QR System - Design System Specification

**Version:** 1.0.0
**Date:** January 3, 2026
**Status:** Specification Phase

---

## Table of Contents

1. [Research Summary](#1-research-summary)
2. [System Overview](#2-system-overview)
3. [Design Tokens](#3-design-tokens)
4. [Component Library Specification](#4-component-library-specification)
5. [Page/View Specifications](#5-pageview-specifications)
6. [Design Patterns](#6-design-patterns)
7. [Iconography & Visual Elements](#7-iconography--visual-elements)
8. [Responsive Design Strategy](#8-responsive-design-strategy)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Research Summary

### Key Findings from Latest Best Practices (2026)

**shadcn/ui for Vue.js (shadcn-vue):**
- Components distributed as source code, not packages - becomes part of your project
- Built on Tailwind CSS and Radix Vue for accessibility (WAI-ARIA standards)
- Open code approach: top layer modifiable for customization
- Composition-based: predictable, common interface across components
- Mobile-first responsive design principles
- TypeScript support, dark/light mode theming, SSR compatibility

**WCAG 2.2 Compliance (Mandatory by April 2026):**
- Forms must support review, correct, and confirm workflow
- Accessible authentication alternatives (password managers, biometric)
- Focus indicators must be visible and not hidden by overlapping elements
- Text labels must be associated with form inputs
- Form validation errors must be clearly identified with quick access to fix
- Success Criterion 3.3.8 (AA): Accessible Authentication
- Success Criterion 3.3.9 (AAA): Input review/confirmation for complex tasks

**Design Tokens (2026 Standards):**
- Multi-layer token hierarchy: Foundation → Alias → Component-specific
- Foundation tokens: core values (colors, typography, spacing, radius)
- Alias tokens: semantic meaning (e.g., `color-success`, `color-danger`)
- Machine-readable formats (JSON/YAML) for tool integration
- W3C Design Tokens Standard coming - future-proofing consideration

**QR Scanner UX Best Practices:**
- Zero-friction approach: open directly to scanner
- Fast scanning with immediate visual/haptic feedback
- Always preview scanned content before action (security)
- Minimal permissions (no contacts/location access needed)
- Clear user guidance with on-screen prompts
- Performance critical: optimize camera preview and image processing
- Mobile-first design for optimal scanning experience

### Sources
- [shadcn-vue Documentation](https://www.shadcn-vue.com/)
- [WCAG 2.2 Accessibility Checklist 2026](https://theclaymedia.com/wcag-2-2-accessibility-checklist-2026/)
- [Design Tokens Guide](https://thedesignsystem.guide/design-tokens)
- [QR Code UX Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/qr-code-guidelines/)

---

## 2. System Overview

### Design Philosophy

**Core Principles:**
1. **Simplicity First**: Zero-friction interfaces optimized for daily repetitive tasks
2. **Role-Based Clarity**: Each user role sees exactly what they need, nothing more
3. **Speed & Efficiency**: Optimized for high-throughput breakfast counter operations
4. **Accessibility-First**: WCAG 2.2 AA compliance minimum, AAA where feasible
5. **Mobile-Optimized**: Scanner interface designed for handheld tablet/phone use
6. **Progressive Enhancement**: Start simple, scale features incrementally

### System Architecture Layers

```
┌─────────────────────────────────────────┐
│   Design Tokens (Foundation Layer)     │
│   Colors, Typography, Spacing, etc.    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Primitive Components                  │
│   Button, Input, Card, Badge, etc.     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Composite Components                  │
│   DataTable, FormField, Modal, etc.    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Feature Components                    │
│   EmployeeTable, QRScanner, etc.       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Pages/Views                           │
│   AdminDashboard, ScannerView, etc.    │
└─────────────────────────────────────────┘
```

### Technology Stack Alignment

- **Framework**: Vue.js 3 (Composition API)
- **Styling**: Tailwind CSS with custom design tokens
- **Component Base**: Radix Vue primitives for accessibility
- **Type Safety**: TypeScript
- **State Management**: Pinia (for global state like auth, current user)
- **Backend**: Supabase (database + auth)
- **Hosting**: GitHub Pages (always online)

---

## 3. Design Tokens

### 3.1 Foundation Tokens

Design tokens are defined in a three-tier hierarchy: Foundation (raw values) → Alias (semantic) → Component-specific.

#### 3.1.1 Color Palette

**Primary Colors** (Brand Identity)
```css
--color-primary-50: #f0f9ff;   /* Lightest tint */
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9;  /* Base primary */
--color-primary-600: #0284c7;  /* Hover/Active states */
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;
--color-primary-950: #082f49;  /* Darkest shade */
```

**Neutral/Gray Colors** (UI Structure)
```css
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #0a0a0a;
```

**Semantic Colors**
```css
/* Success (Green) */
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-500: #22c55e;  /* Base */
--color-success-600: #16a34a;  /* Hover */
--color-success-700: #15803d;
--color-success-900: #14532d;

/* Error/Danger (Red) */
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-500: #ef4444;    /* Base */
--color-error-600: #dc2626;    /* Hover */
--color-error-700: #b91c1c;
--color-error-900: #7f1d1d;

/* Warning (Amber) */
--color-warning-50: #fffbeb;
--color-warning-100: #fef3c7;
--color-warning-500: #f59e0b;  /* Base */
--color-warning-600: #d97706;  /* Hover */
--color-warning-700: #b45309;
--color-warning-900: #78350f;

/* Info (Blue) */
--color-info-50: #eff6ff;
--color-info-100: #dbeafe;
--color-info-500: #3b82f6;     /* Base */
--color-info-600: #2563eb;     /* Hover */
--color-info-700: #1d4ed8;
--color-info-900: #1e3a8a;
```

**Alias Tokens** (Semantic Mapping)
```css
/* Backgrounds */
--color-bg-base: var(--color-neutral-50);
--color-bg-elevated: #ffffff;
--color-bg-overlay: rgba(0, 0, 0, 0.5);
--color-bg-muted: var(--color-neutral-100);

/* Borders */
--color-border-default: var(--color-neutral-200);
--color-border-hover: var(--color-neutral-300);
--color-border-focus: var(--color-primary-500);

/* Text */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-muted: var(--color-neutral-500);
--color-text-inverse: #ffffff;
--color-text-link: var(--color-primary-600);

/* Interactive States */
--color-interactive-default: var(--color-primary-500);
--color-interactive-hover: var(--color-primary-600);
--color-interactive-active: var(--color-primary-700);
--color-interactive-disabled: var(--color-neutral-300);
```

**Dark Mode Colors** (Phase II Consideration)
```css
/* Dark mode overrides */
[data-theme="dark"] {
  --color-bg-base: var(--color-neutral-950);
  --color-bg-elevated: var(--color-neutral-900);
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-400);
  --color-border-default: var(--color-neutral-700);
  /* ... additional dark mode mappings */
}
```

#### 3.1.2 Typography Scale

**Font Families**
```css
--font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
                    'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Font Sizes** (Type Scale - 1.25 ratio)
```css
--font-size-xs: 0.75rem;      /* 12px */
--font-size-sm: 0.875rem;     /* 14px */
--font-size-base: 1rem;       /* 16px - Base */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
--font-size-2xl: 1.5rem;      /* 24px */
--font-size-3xl: 1.875rem;    /* 30px */
--font-size-4xl: 2.25rem;     /* 36px */
--font-size-5xl: 3rem;        /* 48px */
```

**Font Weights**
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Line Heights**
```css
--line-height-tight: 1.25;    /* Headings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.75;  /* Long-form content */
```

**Letter Spacing**
```css
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
```

**Typography Alias Tokens**
```css
/* Headings */
--text-h1: var(--font-weight-bold) var(--font-size-4xl)/var(--line-height-tight);
--text-h2: var(--font-weight-bold) var(--font-size-3xl)/var(--line-height-tight);
--text-h3: var(--font-weight-semibold) var(--font-size-2xl)/var(--line-height-tight);
--text-h4: var(--font-weight-semibold) var(--font-size-xl)/var(--line-height-tight);
--text-h5: var(--font-weight-semibold) var(--font-size-lg)/var(--line-height-normal);

/* Body */
--text-body-large: var(--font-weight-normal) var(--font-size-lg)/var(--line-height-normal);
--text-body-base: var(--font-weight-normal) var(--font-size-base)/var(--line-height-normal);
--text-body-small: var(--font-weight-normal) var(--font-size-sm)/var(--line-height-normal);

/* Special */
--text-label: var(--font-weight-medium) var(--font-size-sm)/var(--line-height-normal);
--text-caption: var(--font-weight-normal) var(--font-size-xs)/var(--line-height-normal);
--text-code: var(--font-weight-normal) var(--font-size-sm)/var(--line-height-normal) var(--font-family-mono);
```

#### 3.1.3 Spacing System

**8px Base Grid System**
```css
--spacing-0: 0;
--spacing-px: 1px;
--spacing-0-5: 0.125rem;  /* 2px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-1-5: 0.375rem;  /* 6px */
--spacing-2: 0.5rem;      /* 8px - Base unit */
--spacing-3: 0.75rem;     /* 12px */
--spacing-4: 1rem;        /* 16px */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-8: 2rem;        /* 32px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-12: 3rem;       /* 48px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
--spacing-32: 8rem;       /* 128px */
```

**Semantic Spacing Aliases**
```css
--spacing-xs: var(--spacing-1);     /* 4px */
--spacing-sm: var(--spacing-2);     /* 8px */
--spacing-md: var(--spacing-4);     /* 16px */
--spacing-lg: var(--spacing-6);     /* 24px */
--spacing-xl: var(--spacing-8);     /* 32px */
--spacing-2xl: var(--spacing-12);   /* 48px */
--spacing-3xl: var(--spacing-16);   /* 64px */
```

#### 3.1.4 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Pill shape */
```

**Component-Specific Aliases**
```css
--radius-button: var(--radius-md);
--radius-input: var(--radius-md);
--radius-card: var(--radius-lg);
--radius-modal: var(--radius-xl);
--radius-badge: var(--radius-full);
```

#### 3.1.5 Shadows (Elevation)

**Shadow Scale** (Progressive depth)
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
```

**Semantic Shadow Aliases**
```css
--shadow-card: var(--shadow-sm);
--shadow-dropdown: var(--shadow-md);
--shadow-modal: var(--shadow-xl);
--shadow-popover: var(--shadow-lg);
--shadow-focus: 0 0 0 3px rgba(14, 165, 233, 0.3); /* Primary with transparency */
```

#### 3.1.6 Z-Index Scale

```css
--z-index-base: 0;
--z-index-dropdown: 1000;
--z-index-sticky: 1100;
--z-index-fixed: 1200;
--z-index-overlay: 1300;
--z-index-modal: 1400;
--z-index-popover: 1500;
--z-index-tooltip: 1600;
--z-index-toast: 1700;
```

#### 3.1.7 Breakpoints (Responsive)

**Mobile-First Breakpoints**
```css
/* Base: < 640px (Mobile phones) */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large desktop */
```

**Usage in Tailwind Config:**
```js
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

#### 3.1.8 Transitions & Animations

**Duration**
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

**Easing Functions**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Common Transitions**
```css
--transition-base: all var(--duration-base) var(--ease-in-out);
--transition-colors: color var(--duration-base) var(--ease-in-out),
                     background-color var(--duration-base) var(--ease-in-out),
                     border-color var(--duration-base) var(--ease-in-out);
--transition-transform: transform var(--duration-base) var(--ease-out);
--transition-opacity: opacity var(--duration-fast) var(--ease-in-out);
```

---

## 4. Component Library Specification

### 4.1 Primitive Components

#### 4.1.1 Button Component

**Purpose**: Primary interactive element for user actions

**Variants**:
- `primary`: Main call-to-action buttons
- `secondary`: Less prominent actions
- `outline`: Tertiary actions, alternative to filled buttons
- `ghost`: Minimal visual weight, inline actions
- `destructive`: Dangerous actions (delete, deactivate)
- `link`: Text-only button appearance

**Sizes**:
- `sm`: 32px height, 12px padding, 14px font
- `base`: 40px height, 16px padding, 16px font
- `lg`: 48px height, 20px padding, 18px font

**States**:
- Default
- Hover (darker shade, slight scale if appropriate)
- Active/Pressed (darkest shade, scale down slightly)
- Focused (visible focus ring, WCAG 2.2 compliant)
- Disabled (reduced opacity, cursor not-allowed)
- Loading (spinner icon, disabled interaction)

**Props API**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: Component;
  rightIcon?: Component;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
  ariaLabel?: string; // Required if no text content
}
```

**Accessibility**:
- Minimum touch target: 44x44px (WCAG 2.2)
- Clear focus indicator with 3px offset
- ARIA label if icon-only
- Disabled state communicated to screen readers
- Loading state announced via aria-live="polite"

**Tailwind Class Pattern**:
```vue
<!-- Primary Button Base -->
<button class="
  inline-flex items-center justify-center gap-2
  rounded-md font-medium transition-colors
  focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-500/30
  disabled:opacity-50 disabled:pointer-events-none
  bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700
  h-10 px-4 py-2 text-base
">
  Button Text
</button>
```

---

#### 4.1.2 Input Component

**Purpose**: Text input for forms (text, email, number, tel)

**Variants**:
- `default`: Standard input
- `error`: Invalid state with error styling

**Sizes**:
- `sm`: 32px height
- `base`: 40px height
- `lg`: 48px height

**States**:
- Default
- Hover (border color change)
- Focused (border + focus ring)
- Error (red border + error icon)
- Disabled (reduced opacity, cursor not-allowed)
- Read-only (different background, no focus ring)

**Props API**:
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  size?: 'sm' | 'base' | 'lg';
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: Component;
  rightIcon?: Component;
  ariaLabel?: string; // Required if no label
  ariaDescribedBy?: string; // Link to error message
  autocomplete?: string;
  required?: boolean;
  maxlength?: number;
}
```

**Accessibility**:
- Associated label (via `for` attribute or wrapping)
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`
- Autocomplete attributes for common fields (WCAG 2.1)
- Placeholder NOT used as label replacement

**Tailwind Class Pattern**:
```vue
<input class="
  w-full rounded-md border border-neutral-200
  px-3 py-2 text-base
  transition-colors
  placeholder:text-neutral-500
  focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500
  disabled:opacity-50 disabled:cursor-not-allowed
  aria-[invalid=true]:border-error-500 aria-[invalid=true]:focus:ring-error-500/30
">
```

---

#### 4.1.3 Badge Component

**Purpose**: Display status indicators, counts, or labels

**Variants**:
- `default`: Neutral gray
- `success`: Green (active employees, successful scans)
- `error`: Red (inactive employees, failed scans)
- `warning`: Amber (warnings, alerts)
- `info`: Blue (informational)

**Sizes**:
- `sm`: 20px height, 10px text
- `base`: 24px height, 12px text
- `lg`: 28px height, 14px text

**Props API**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'base' | 'lg';
  dot?: boolean; // Show colored dot before text
  removable?: boolean; // Show X icon
  onRemove?: () => void;
}
```

**Accessibility**:
- Role="status" for dynamic status badges
- Clear color + text combination (not color alone)
- Sufficient contrast ratio (4.5:1 minimum)

**Tailwind Class Pattern**:
```vue
<span class="
  inline-flex items-center gap-1.5
  rounded-full px-2.5 py-0.5
  text-xs font-medium
  bg-success-100 text-success-700
">
  Active
</span>
```

---

#### 4.1.4 Card Component

**Purpose**: Container for related content and actions

**Variants**:
- `default`: Standard card with border
- `elevated`: Card with shadow (no border)
- `outline`: Emphasized border, no shadow

**Props API**:
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'base' | 'lg';
  hover?: boolean; // Hover effect for clickable cards
  asChild?: boolean; // Render as child component (e.g., <a>)
}

// Subcomponents
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: Component; // Right-aligned action
}

interface CardContentProps {
  // Just a container
}

interface CardFooterProps {
  // Just a container
}
```

**Accessibility**:
- Semantic structure (article, section, or div)
- If clickable, entire card is keyboard accessible
- Focus visible on card if interactive

**Tailwind Class Pattern**:
```vue
<div class="
  rounded-lg border border-neutral-200 bg-white
  p-6
  shadow-sm
  transition-shadow
  hover:shadow-md
">
  <!-- Card content -->
</div>
```

---

#### 4.1.5 Modal/Dialog Component

**Purpose**: Overlay dialog for focused interactions

**Variants**:
- `default`: Standard modal
- `alert`: Alert/confirmation dialog (smaller, centered)

**Sizes**:
- `sm`: Max width 400px
- `base`: Max width 600px
- `lg`: Max width 800px
- `xl`: Max width 1000px
- `full`: Full screen (mobile)

**Props API**:
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
}

// Subcomponents
interface ModalHeaderProps {
  title: string;
  subtitle?: string;
}

interface ModalContentProps {
  // Container
}

interface ModalFooterProps {
  // Container for action buttons
}
```

**Accessibility**:
- Focus trap within modal when open
- Focus returns to trigger element on close
- Escape key closes modal
- `aria-modal="true"`
- `aria-labelledby` links to title
- `aria-describedby` links to description
- Overlay click closes (optional, default true)
- Body scroll locked when modal open

**Behavior**:
- Fade-in animation (150ms)
- Overlay darkens background
- Modal slides up from center (scale + opacity)
- Close button in top-right

---

#### 4.1.6 Select/Dropdown Component

**Purpose**: Selection from a list of options

**Variants**:
- `default`: Standard select
- `error`: Error state

**Sizes**:
- `sm`: 32px height
- `base`: 40px height
- `lg`: 48px height

**Props API**:
```typescript
interface SelectProps {
  value?: string | number;
  placeholder?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  error?: boolean;
  searchable?: boolean; // Allow typing to filter
  multiple?: boolean; // Multi-select
  ariaLabel?: string;
}
```

**Accessibility**:
- Built on Radix Vue `Select` primitive
- Keyboard navigation (Arrow keys, Enter, Space, Escape)
- Type-ahead search
- Clear focus management
- ARIA attributes auto-handled by Radix

---

#### 4.1.7 Table Component

**Purpose**: Display structured data in rows and columns

**Props API**:
```typescript
interface TableProps {
  striped?: boolean; // Alternating row colors
  hoverable?: boolean; // Hover effect on rows
  bordered?: boolean; // Cell borders
  compact?: boolean; // Reduced padding
}

// Subcomponents: TableHead, TableHeader, TableBody, TableRow, TableCell
```

**Accessibility**:
- Semantic `<table>` element
- `<th>` for header cells with `scope` attribute
- `<caption>` for table description
- Responsive: horizontal scroll on mobile with scroll indicator

**Features**:
- Sortable columns (visual indicator)
- Selectable rows (checkbox in first column)
- Sticky header on scroll
- Loading state with skeleton rows
- Empty state

---

#### 4.1.8 Toast/Notification Component

**Purpose**: Temporary feedback messages

**Variants**:
- `success`: Green (action completed)
- `error`: Red (action failed)
- `warning`: Amber (warning message)
- `info`: Blue (informational)

**Props API**:
```typescript
interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number; // Auto-dismiss in ms (default 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean; // Show close button
}
```

**Accessibility**:
- `role="status"` for non-critical messages
- `role="alert"` for errors
- `aria-live="polite"` or `"assertive"`
- Keyboard dismissible (Escape or focus + Enter on close)

**Behavior**:
- Appear from top-right or bottom-right
- Stack if multiple toasts
- Slide-in animation
- Auto-dismiss after duration
- Pause timer on hover

---

#### 4.1.9 Checkbox Component

**Purpose**: Boolean selection (yes/no, on/off)

**States**:
- Unchecked
- Checked
- Indeterminate (for "select all" scenarios)
- Disabled

**Props API**:
```typescript
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
  onChange?: (checked: boolean) => void;
}
```

**Accessibility**:
- Native checkbox input or Radix primitive
- Label associated via `for` or wrapping
- Keyboard operable (Space to toggle)
- Focus visible
- `aria-checked` state

---

#### 4.1.10 Radio Button Component

**Purpose**: Single selection from multiple options

**Props API**:
```typescript
interface RadioGroupProps {
  value?: string | number;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  onChange?: (value: string | number) => void;
}
```

**Accessibility**:
- Built on Radix Vue `RadioGroup`
- Arrow key navigation between options
- Space to select
- Only one radio in group tabbable at a time
- `aria-checked` state

---

### 4.2 Composite Components

#### 4.2.1 DataTable Component

**Purpose**: Advanced data table with sorting, filtering, pagination

**Features**:
- Column sorting (click header to toggle)
- Column filtering (input above columns)
- Row selection (checkboxes)
- Pagination controls
- Bulk actions (when rows selected)
- Export to CSV
- Responsive: stacked cards on mobile

**Props API**:
```typescript
interface DataTableProps<T> {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (row: T) => VNode; // Custom cell renderer
  }>;
  data: T[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyState?: Component | string;
  bulkActions?: Array<{
    label: string;
    icon?: Component;
    onClick: (selectedRows: T[]) => void;
  }>;
}
```

**Accessibility**:
- ARIA grid pattern
- Keyboard navigation (Arrow keys, Home, End, Page Up/Down)
- Sort state announced to screen readers
- Focus management during filtering/sorting

---

#### 4.2.2 FormField Component

**Purpose**: Wrapper for form inputs with label, error, hint

**Props API**:
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string; // Links label to input
}
```

**Structure**:
```vue
<FormField>
  <Label>Employee Name *</Label>
  <Input />
  <Hint>Enter the employee's full name</Hint>
  <ErrorMessage>This field is required</ErrorMessage>
</FormField>
```

**Accessibility**:
- Label linked to input via `for` attribute
- Error linked via `aria-describedby`
- Hint linked via `aria-describedby`
- Required indicator (asterisk + aria-required)

---

#### 4.2.3 SearchInput Component

**Purpose**: Input field optimized for search with clear button

**Features**:
- Magnifying glass icon (left)
- Clear button (right, appears when value present)
- Debounced onChange (300ms default)
- Loading indicator (when searching)

**Props API**:
```typescript
interface SearchInputProps {
  value?: string;
  placeholder?: string;
  debounce?: number; // ms
  loading?: boolean;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}
```

---

#### 4.2.4 Pagination Component

**Purpose**: Navigate between pages of data

**Variants**:
- `simple`: Previous/Next buttons only
- `full`: Previous, page numbers, Next
- `compact`: Page input + total pages

**Props API**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  variant?: 'simple' | 'full' | 'compact';
  showPageSize?: boolean; // Dropdown to change page size
  pageSizeOptions?: number[]; // [10, 25, 50, 100]
}
```

**Accessibility**:
- `nav` element with `aria-label="Pagination"`
- Current page marked with `aria-current="page"`
- Keyboard navigable
- Previous/Next disabled on first/last page

---

#### 4.2.5 FileUpload Component

**Purpose**: Upload files (CSV/XLS for bulk employee import)

**Variants**:
- `dropzone`: Drag and drop area
- `button`: Button to open file picker

**Props API**:
```typescript
interface FileUploadProps {
  accept?: string; // MIME types or extensions (.csv, .xlsx)
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  onError?: (error: string) => void;
  variant?: 'dropzone' | 'button';
}
```

**Features**:
- Drag and drop support
- File type validation
- File size validation
- Preview uploaded files
- Remove individual files
- Progress indicator (if upload happens here)

**Accessibility**:
- Button is keyboard accessible
- Dropzone has focus state
- File list announced to screen readers
- Error messages clear and actionable

---

#### 4.2.6 StatusIndicator Component

**Purpose**: Visual status display (online, offline, active, inactive)

**Variants**:
- `dot`: Colored dot only
- `dot-text`: Dot + text label
- `badge`: Badge style
- `pulse`: Animated pulsing dot (for "live" status)

**Props API**:
```typescript
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'dot' | 'dot-text' | 'badge' | 'pulse';
  label?: string;
  size?: 'sm' | 'base' | 'lg';
}
```

---

### 4.3 Feature Components

#### 4.3.1 QRScanner Component

**Purpose**: Camera-based QR code scanner

**Features**:
- Real-time camera preview
- Automatic QR detection
- Visual scan indicator (box overlay)
- Haptic feedback on scan (vibration)
- Audio feedback (beep sound)
- Manual torch/flashlight toggle
- Camera selection (front/back)

**Props API**:
```typescript
interface QRScannerProps {
  onScan: (qrCode: string) => Promise<void>;
  onError: (error: Error) => void;
  enabled?: boolean; // Can pause scanning
  scanDelay?: number; // ms between scans (prevent duplicates)
  showTorch?: boolean;
  showCameraSwitch?: boolean;
}
```

**States**:
- Initializing (requesting camera permission)
- Ready (camera active, scanning)
- Scanning (QR detected, processing)
- Success (scan successful, show feedback)
- Error (scan failed, show error)

**Accessibility**:
- Camera permission request clear
- Error messages descriptive
- Torch/camera buttons keyboard accessible
- Status announced to screen readers

**UI Elements**:
- Fullscreen camera preview
- Semi-transparent overlay with cutout scan area
- Scan guide text at bottom ("Position QR code within frame")
- Torch button (bottom-left)
- Camera switch button (bottom-right)
- Close/Cancel button (top-left)

---

#### 4.3.2 QRCodeDisplay Component

**Purpose**: Display QR code for employee

**Features**:
- Generate QR code from string
- Display at various sizes
- Download button (save as PNG)
- Print button

**Props API**:
```typescript
interface QRCodeDisplayProps {
  value: string; // QR code data
  size?: 'sm' | 'base' | 'lg' | 'xl'; // 128, 256, 384, 512 px
  showDownload?: boolean;
  showPrint?: boolean;
  label?: string; // Employee name below QR
  logoUrl?: string; // Center logo overlay (optional)
}
```

**Accessibility**:
- Alt text for QR code image
- Download/print buttons keyboard accessible
- Label visible and associated

---

#### 4.3.3 ScanResultDisplay Component

**Purpose**: Show scan result after QR scanned

**Variants**:
- `success`: Green checkmark, employee name, success message
- `error`: Red X, error message

**Props API**:
```typescript
interface ScanResultDisplayProps {
  status: 'success' | 'error';
  employeeName?: string;
  message: string;
  timestamp?: Date;
  onDismiss?: () => void;
  autoDismiss?: number; // ms, auto-close after delay
}
```

**Features**:
- Large icon (checkmark or X)
- Employee name (if success)
- Message text
- Timestamp
- Dismiss button or auto-dismiss
- Slide-in animation from bottom

**Accessibility**:
- Status announced to screen reader via aria-live
- Focus moved to result display
- Keyboard dismissible

---

#### 4.3.4 EmployeeForm Component

**Purpose**: Create/edit employee details

**Fields**:
- Phone number (required, unique, validation)
- Name (required, text input)
- Department (select dropdown)
- Gender (radio buttons: Male, Female, Other, Prefer not to say)
- Active status (checkbox, for edit mode)

**Props API**:
```typescript
interface EmployeeFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    phone: string;
    name: string;
    department: string;
    gender: string;
    active: boolean;
  };
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Validation Rules**:
- Phone: 10 digits, numeric, unique
- Name: Min 2 chars, max 100 chars
- Department: Required selection
- Gender: Required selection

**Accessibility**:
- All fields labeled
- Required fields marked
- Error messages clear and linked
- Form review before submit (Phase II: WCAG 3.3.9)
- Submit disabled during loading

---

#### 4.3.5 BulkUploadModal Component

**Purpose**: Upload CSV/XLS file to import employees

**Features**:
- File upload (drag/drop or button)
- File format validation
- Preview uploaded data (first 5 rows)
- Error reporting (row-level validation errors)
- Confirm to proceed
- Progress indicator during upload

**Props API**:
```typescript
interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<{
    success: number;
    errors: Array<{ row: number; message: string }>;
  }>;
}
```

**CSV Format**:
```
phone,name,department,gender
9876543210,John Doe,Engineering,Male
9876543211,Jane Smith,HR,Female
```

**Accessibility**:
- Modal accessibility (focus trap, etc.)
- File upload accessible
- Error list readable by screen reader
- Progress announced

---

#### 4.3.6 ScannerAccountForm Component

**Purpose**: Create scanner/staff account

**Fields**:
- Username (required, unique)
- Password (required, min 8 chars)
- Confirm password (must match)
- Name (optional, display name)

**Props API**:
```typescript
interface ScannerAccountFormProps {
  onSubmit: (data: ScannerFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Validation**:
- Username: min 3 chars, alphanumeric + underscore
- Password: min 8 chars, complexity rules (1 uppercase, 1 number)
- Confirm password: matches password

---

#### 4.3.7 ReportFilters Component (Phase II)

**Purpose**: Filter options for attendance reports

**Fields**:
- Date range picker (from date, to date)
- Department filter (multi-select)
- Employee search (autocomplete)

**Props API**:
```typescript
interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  departments: string[];
}
```

---

## 5. Page/View Specifications

### 5.1 Authentication Pages

#### 5.1.1 Login Page (`/login`)

**Purpose**: Authenticate users (admin or scanner)

**Layout**:
- Centered card (max-width 400px)
- Logo/app name at top
- Form fields
- Submit button
- Optional: "Forgot password" link (Phase II)

**Components Used**:
- `Card`
- `FormField`
- `Input` (username, password)
- `Button` (submit)
- `Toast` (error messages)

**Flow**:
1. User enters username/password
2. Click "Login"
3. Validation (client-side)
4. Submit to Supabase Auth
5. On success: redirect based on role
   - Admin → `/admin/dashboard`
   - Scanner → `/scanner`
6. On error: show error toast

**States**:
- Initial (form empty)
- Submitting (loading spinner on button)
- Error (error message below form or toast)

**Accessibility**:
- Form labeled correctly
- Error messages linked
- Focus on first input on load
- Enter key submits form

**Responsive**:
- Mobile: Full-width card with padding
- Desktop: Centered card, background color/pattern

---

### 5.2 Admin Pages

#### 5.2.1 Admin Dashboard (`/admin/dashboard`)

**Purpose**: Overview and navigation hub for admin

**Layout**:
- Top navigation bar (logo, user menu)
- Sidebar navigation (desktop) or hamburger menu (mobile)
- Main content area

**Sidebar Navigation Items**:
- Dashboard (home icon)
- Employees (users icon)
- Scanners (qr-code icon)
- Reports (chart icon, Phase II)
- Settings (gear icon, Phase II)
- Logout (logout icon)

**Dashboard Content** (Overview stats):
- **Stat Cards** (4-card grid):
  - Total Employees
  - Active Employees
  - Today's Scans
  - Total Scanners
- **Recent Activity** (table):
  - Last 10 scans (employee name, timestamp)
- **Quick Actions** (buttons):
  - Add Employee
  - Create Scanner Account
  - View Today's Report (Phase II)

**Components Used**:
- `Card` (stat cards)
- `DataTable` (recent activity)
- `Button` (quick actions)
- Navigation components

**Accessibility**:
- Skip to main content link
- Landmark regions (nav, main)
- Keyboard navigation for sidebar

**Responsive**:
- Desktop: Sidebar always visible (240px width)
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu, full-screen sidebar overlay

---

#### 5.2.2 Employees List Page (`/admin/employees`)

**Purpose**: View, search, filter, manage all employees

**Layout**:
- Page header (title + actions)
- Search and filters bar
- Data table
- Pagination

**Header Actions**:
- Add Employee (button, opens modal/form)
- Bulk Upload (button, opens modal)
- Export to CSV (button)

**Search & Filters**:
- Search input (searches name, phone)
- Department filter (multi-select dropdown)
- Status filter (Active, Inactive, All)

**Data Table Columns**:
- Checkbox (select row)
- Phone
- Name
- Department
- Gender
- Status (badge: Active/Inactive)
- QR Code (button to view/download)
- Actions (dropdown: Edit, Deactivate/Activate, Regenerate QR, Delete)

**Bulk Actions** (when rows selected):
- Deactivate Selected
- Activate Selected
- Delete Selected
- Export Selected

**States**:
- Loading (skeleton table rows)
- Empty (no employees, empty state illustration)
- Error (failed to load, retry button)
- No search results (empty state with clear filters button)

**Components Used**:
- `DataTable`
- `SearchInput`
- `Select` (filters)
- `Button`
- `Badge`
- `Modal` (for add/edit employee form, bulk upload)
- `QRCodeDisplay` (in modal)
- `Toast` (success/error feedback)

**Accessibility**:
- Table accessible (headers, scope)
- Search input labeled
- Filters labeled
- Keyboard navigation
- Actions menu keyboard accessible

**Responsive**:
- Desktop: Full table
- Tablet: Hide less important columns (gender)
- Mobile: Stacked cards instead of table rows

---

#### 5.2.3 Employee Detail/Edit Modal

**Purpose**: View and edit single employee

**Triggered By**: Click "Edit" action on employee row

**Modal Content**:
- Employee form (EmployeeForm component)
- QR code display (QRCodeDisplay component)
- Regenerate QR button
- Save and Cancel buttons

**Flow**:
1. Open modal with employee data pre-filled
2. User edits fields
3. Click "Save"
4. Validation
5. Submit to Supabase
6. On success: update table, close modal, show success toast
7. On error: show error message in modal

---

#### 5.2.4 Scanners List Page (`/admin/scanners`)

**Purpose**: Manage scanner/staff accounts

**Layout**:
- Page header (title + "Create Scanner Account" button)
- Data table
- Pagination

**Data Table Columns**:
- Username
- Name
- Created Date
- Status (badge: Active/Inactive)
- Last Login (timestamp or "Never")
- Actions (dropdown: Edit, Deactivate/Activate, Reset Password, Delete)

**Create Scanner Flow**:
1. Click "Create Scanner Account"
2. Modal opens with ScannerAccountForm
3. Fill form, submit
4. On success: add to table, close modal, show success toast

**Components Used**:
- `DataTable`
- `Button`
- `Badge`
- `Modal`
- `ScannerAccountForm`
- `Toast`

**Accessibility**: Same as Employees page

**Responsive**:
- Desktop: Full table
- Mobile: Stacked cards

---

#### 5.2.5 Reports Page (`/admin/reports`) - Phase II

**Purpose**: View attendance reports

**Layout**:
- Page header (title)
- Filters bar (ReportFilters component)
- Report display area
- Export button

**Report Types**:
- **Daily Attendance**: List of scans for selected date
- **Date Range Report**: Aggregated stats for date range
- **Department Report**: Breakdown by department
- **Employee Report**: Individual employee attendance history

**Filters**:
- Date range
- Department
- Employee (search/select)

**Report Display**:
- Summary stats (cards)
- Data table or chart
- Export to CSV/PDF

**Components Used**:
- `ReportFilters`
- `Card` (stats)
- `DataTable`
- `Button` (export)
- Chart library (e.g., Chart.js for visualizations)

---

### 5.3 Scanner Pages

#### 5.3.1 Scanner View (`/scanner`)

**Purpose**: Scan QR codes and see results

**Layout** (Fullscreen):
- Top bar (minimal):
  - App name/logo (left)
  - Scanner name (center)
  - Logout button (right)
- Main area: QR scanner (fullscreen camera)
- Result overlay (appears after scan)

**Flow**:
1. Page loads, requests camera permission
2. Camera preview shown with scan guide overlay
3. Scanner staff points camera at employee QR code
4. QR detected and decoded
5. Send QR string to backend API
6. Backend validates:
   - QR code valid?
   - Employee active?
   - Already scanned today?
7. Response received:
   - **Success**: Show ScanResultDisplay (green, employee name, "Scan successful!")
   - **Error**: Show ScanResultDisplay (red, error message: "Invalid QR code", "Employee inactive", "Already scanned today")
8. Result auto-dismisses after 3 seconds OR user taps "Scan Next"
9. Return to scanner

**Components Used**:
- `QRScanner`
- `ScanResultDisplay`
- `Button` (logout, minimal)

**States**:
- Initializing (loading spinner)
- Ready (camera active)
- Scanning (QR detected, processing)
- Result (success or error display)
- Error (camera permission denied, camera error)

**Accessibility**:
- Camera permission prompt clear
- Scan status announced to screen reader
- Result display accessible
- Logout button keyboard accessible

**Responsive**:
- Optimized for tablet (landscape or portrait)
- Works on phone (portrait)
- Fullscreen for maximum scan area

---

### 5.4 Error Pages

#### 5.4.1 404 Not Found (`/404`)

**Content**:
- Large 404 text or illustration
- "Page not found" heading
- Message: "The page you're looking for doesn't exist."
- Button: "Go to Dashboard" (links to appropriate dashboard based on role)

#### 5.4.2 403 Forbidden (`/403`)

**Content**:
- Lock icon or illustration
- "Access Denied" heading
- Message: "You don't have permission to access this page."
- Button: "Go Back" or "Go to Dashboard"

#### 5.4.3 500 Server Error (`/500`)

**Content**:
- Error icon or illustration
- "Something went wrong" heading
- Message: "We're working on fixing the issue. Please try again later."
- Button: "Retry" or "Go to Dashboard"

---

## 6. Design Patterns

### 6.1 Form Patterns

#### 6.1.1 Form Structure

**Standard Form Layout**:
```
┌─────────────────────────────────┐
│ Form Title                      │
│ Optional subtitle/description   │
├─────────────────────────────────┤
│ Label *                         │
│ [Input field]                   │
│ Hint text (optional)            │
│ Error message (if invalid)      │
├─────────────────────────────────┤
│ Label *                         │
│ [Input field]                   │
├─────────────────────────────────┤
│              [Cancel] [Submit]  │
└─────────────────────────────────┘
```

**Spacing**:
- Form fields: 24px vertical gap
- Label to input: 8px gap
- Input to hint/error: 4px gap
- Form to action buttons: 32px gap
- Between action buttons: 12px gap

#### 6.1.2 Validation Patterns

**Client-Side Validation**:
- Validate on blur (after user leaves field)
- Re-validate on input (after first validation)
- Show error state immediately
- Don't block submission, but show all errors on submit attempt

**Error Display**:
- Red border on input
- Error icon in input (right side)
- Error message below input (red text, 14px)
- Error linked via `aria-describedby`

**Error Message Format**:
- Clear, actionable language
- Examples:
  - "Phone number must be 10 digits"
  - "Name is required"
  - "Passwords do not match"
  - "This phone number is already registered"

**Success State** (Optional):
- Green border on input
- Checkmark icon (right side)
- Use sparingly (not for every field)

**Real-Time Validation** (Specific fields):
- Phone number: format as user types (XXX-XXX-XXXX)
- Password strength: show meter below input

#### 6.1.3 Form Submission Pattern

**Flow**:
1. User fills form
2. Clicks submit
3. Client-side validation runs
4. If errors: focus first error field, show all errors
5. If valid: disable form, show loading state on button
6. Submit to backend
7. On success: show success toast, close modal/redirect
8. On error: re-enable form, show error message (toast or inline)

**Loading State**:
- Submit button: disabled, loading spinner, text changes to "Submitting..."
- All form inputs: disabled during submission

**Prevent Multiple Submissions**:
- Disable submit button on first click
- Ignore additional clicks while loading

#### 6.1.4 Required Field Indicators

- Asterisk (*) next to label
- Visual: red asterisk
- Semantic: `aria-required="true"` on input
- Optional: "Required" text in form intro

---

### 6.2 Loading States

#### 6.2.1 Button Loading

**Pattern**:
- Replace button text with spinner + "Loading..."
- Disable button (no interaction)
- Maintain button size (no layout shift)

**Implementation**:
```vue
<Button :loading="isSubmitting">
  Submit
</Button>
<!-- Renders: [Spinner] Loading... -->
```

#### 6.2.2 Page/Section Loading

**Skeleton Screens**:
- Use for initial page load
- Mimic layout of actual content
- Animated pulse or shimmer effect

**Table Loading**:
- Show 5-10 skeleton rows
- Skeleton cells match column structure

**Card Loading**:
- Skeleton content blocks

**Spinner Loading**:
- Use for quick actions (<2 seconds expected)
- Centered spinner with optional text below

**Progress Bar**:
- Use for long operations (file upload, bulk import)
- Show percentage or "X of Y completed"

#### 6.2.3 Lazy Loading / Infinite Scroll

**Pattern**:
- Load more data when user scrolls to bottom
- Show "Loading more..." indicator at bottom
- Smooth insertion of new items (no jump)

---

### 6.3 Empty States

#### 6.3.1 No Data / First Use

**Pattern**:
- Illustration or icon (large, centered)
- Heading: "No [items] yet"
- Message: Brief explanation
- Call-to-action button: "Add [item]"

**Example - No Employees**:
```
┌─────────────────────────────────┐
│         [Illustration]          │
│      No employees yet           │
│  Get started by adding your     │
│      first employee.            │
│                                 │
│       [Add Employee]            │
└─────────────────────────────────┘
```

#### 6.3.2 No Search Results

**Pattern**:
- Magnifying glass icon
- Heading: "No results found"
- Message: "Try adjusting your search or filters"
- Button: "Clear filters"

#### 6.3.3 Empty Table State

**Pattern**:
- Show table headers
- Empty state in table body area
- Same as "No Data" pattern

---

### 6.4 Error Handling UI Patterns

#### 6.4.1 Inline Errors (Form Fields)

- See Form Validation Patterns above

#### 6.4.2 Toast Notifications (Non-Critical Errors)

**Use Cases**:
- Save failed
- Network error
- Session timeout warning

**Pattern**:
- Error toast appears (red, top-right or bottom-right)
- Error icon + message
- Dismissible (X button)
- Optional action button ("Retry")
- Auto-dismiss after 5-7 seconds

#### 6.4.3 Alert Dialogs (Critical Errors)

**Use Cases**:
- Cannot load critical data
- Destructive action failed

**Pattern**:
- Modal dialog
- Error icon (large, red)
- Heading: Error type
- Message: What happened, what user can do
- Action buttons: "Retry", "Cancel", "Contact Support"

#### 6.4.4 Page-Level Errors

**Use Cases**:
- Failed to load page data
- 404, 403, 500 errors

**Pattern**:
- Dedicated error page (see 5.4)
- Or error state in main content area (if partial failure)

#### 6.4.5 Error Recovery

**Retry Pattern**:
- Provide "Retry" button for failed operations
- On retry: show loading state, attempt again

**Fallback Pattern**:
- If data fails to load, show cached/stale data with warning
- "Showing cached data. Unable to refresh."

---

### 6.5 Success/Confirmation Patterns

#### 6.5.1 Success Toast

**Use Cases**:
- Item created/updated/deleted
- File uploaded
- Action completed

**Pattern**:
- Green toast (top-right)
- Checkmark icon + success message
- Auto-dismiss after 3-5 seconds

**Examples**:
- "Employee added successfully"
- "Scanner account created"
- "QR code regenerated"

#### 6.5.2 Confirmation Dialogs (Before Destructive Actions)

**Use Cases**:
- Delete employee
- Deactivate scanner
- Bulk delete

**Pattern**:
- Alert dialog (modal)
- Warning icon (amber or red)
- Heading: "Are you sure?"
- Message: Explain consequences, cannot be undone
- Actions:
  - "Cancel" (secondary, left)
  - "Delete" or "Confirm" (destructive, right)

**Example - Delete Employee**:
```
┌─────────────────────────────────┐
│  ⚠️  Delete Employee?           │
│                                 │
│  Are you sure you want to       │
│  delete "John Doe"? This        │
│  action cannot be undone.       │
│                                 │
│       [Cancel]  [Delete]        │
└─────────────────────────────────┘
```

#### 6.5.3 Inline Confirmation (Undo Pattern)

**Use Cases**:
- Non-destructive actions that can be undone
- Quick actions

**Pattern**:
- Toast with undo button
- "Employee deactivated. [Undo]"
- Auto-dismiss after 5 seconds (action finalized)
- If user clicks undo before dismiss: reverse action

---

### 6.6 Navigation Patterns

#### 6.6.1 Admin Navigation

**Desktop**:
- Persistent sidebar (left, 240px)
- Active item highlighted (primary color background)
- Hover state on items
- Icons + labels

**Mobile**:
- Top bar with hamburger menu (left)
- Hamburger opens full-screen overlay sidebar
- Close button (X) or tap outside to close

**Breadcrumbs** (Optional, Phase II):
- For nested pages
- Dashboard > Employees > Edit Employee

#### 6.6.2 Scanner Navigation

**Minimal Navigation**:
- Top bar only
- No sidebar (single-page app)
- Logout button in top-right

#### 6.6.3 Back Navigation

**Pattern**:
- Back button (arrow-left icon + "Back" text)
- Placed at top-left of page header
- Returns to previous page or list view

---

### 6.7 Data Table Patterns

#### 6.7.1 Sortable Columns

**Pattern**:
- Column header is clickable (button or link semantics)
- Unsorted: small up/down arrows (neutral)
- Sorted ascending: up arrow (primary color)
- Sorted descending: down arrow (primary color)
- Click to toggle: unsorted → asc → desc → asc...

**Accessibility**:
- `aria-sort="ascending"` or `"descending"` on `<th>`
- Screen reader announcement on sort change

#### 6.7.2 Filterable Columns

**Pattern**:
- Filter icon in column header
- Click to open filter popover
- Popover contains: input or select for filtering
- Apply/Clear buttons
- Active filter: badge on column header (count or "Filtered")

#### 6.7.3 Row Actions

**Pattern**:
- Actions column (last column, right-aligned)
- Dropdown menu button ("..." icon or "Actions")
- Menu items: Edit, Deactivate, Delete, etc.

**Accessibility**:
- Menu button keyboard accessible
- Menu items navigable with arrow keys
- Escape closes menu

#### 6.7.4 Bulk Actions

**Pattern**:
- Checkbox in first column of each row
- Select all checkbox in header row
- When rows selected: bulk action bar appears (top of table or sticky at bottom)
- Bulk action bar shows: "X selected" + action buttons + "Clear selection"

**Indeterminate Checkbox**:
- Header checkbox indeterminate state when some (not all) rows selected

#### 6.7.5 Pagination

**Pattern**:
- Bottom of table
- Shows: "Showing X-Y of Z" + page controls
- Page controls: Previous, page numbers, Next
- Current page highlighted
- Ellipsis (...) for many pages

**Page Size Selector** (Optional):
- Dropdown: "Show: [10] [25] [50] [100] per page"

---

### 6.8 Modal/Dialog Patterns

#### 6.8.1 Modal Sizes

- Small: Quick confirmations, alerts (400px)
- Base: Forms, detail views (600px)
- Large: Complex forms, bulk upload (800px)
- Full: Mobile (100% screen)

#### 6.8.2 Modal Structure

```
┌───────────────────────────────────────┐
│ Modal Title                       [X] │ <- Header
├───────────────────────────────────────┤
│                                       │
│  Modal content area                   │ <- Body (scrollable if tall)
│                                       │
│                                       │
├───────────────────────────────────────┤
│                   [Cancel] [Action]   │ <- Footer (sticky)
└───────────────────────────────────────┘
```

#### 6.8.3 Modal Behavior

- Opens: fade-in overlay (150ms) + slide-up modal (200ms)
- Focus: trap focus inside modal
- Close:
  - Click X button
  - Click overlay (outside modal)
  - Press Escape key
  - Submit/cancel action
- On close: focus returns to trigger element
- Body scroll: locked while modal open

---

## 7. Iconography & Visual Elements

### 7.1 Icon System

#### 7.1.1 Icon Library

**Recommended**: Lucide Icons (MIT license, optimized for web)
- Consistent design language
- 1000+ icons
- SVG-based, tree-shakeable
- Customizable size and color

**Alternative**: Heroicons, Feather Icons

#### 7.1.2 Icon Sizes

```css
--icon-size-xs: 12px;
--icon-size-sm: 16px;
--icon-size-base: 20px;
--icon-size-lg: 24px;
--icon-size-xl: 32px;
--icon-size-2xl: 48px;
```

**Usage**:
- Button icons: 16px or 20px
- Input icons: 20px
- Navigation icons: 20px or 24px
- Large illustrations: 48px+

#### 7.1.3 Icon List (Required Icons)

**Navigation & UI**:
- `home`: Dashboard
- `users`: Employees
- `qr-code`: Scanners, QR codes
- `chart-bar`: Reports
- `settings`: Settings
- `log-out`: Logout
- `menu`: Hamburger menu
- `x`: Close, dismiss
- `chevron-left/right/up/down`: Navigation arrows
- `arrow-left`: Back button
- `search`: Search
- `filter`: Filter
- `download`: Download
- `upload`: Upload
- `plus`: Add, create
- `edit`: Edit
- `trash`: Delete
- `more-vertical`: Actions menu (three dots)

**Status & Feedback**:
- `check-circle`: Success
- `x-circle`: Error
- `alert-triangle`: Warning
- `info`: Information
- `alert-circle`: Alert

**Form & Input**:
- `eye`: Show password
- `eye-off`: Hide password
- `calendar`: Date picker
- `clock`: Time

**QR Scanner**:
- `camera`: Camera
- `flashlight`: Torch/flashlight
- `refresh-cw`: Camera switch
- `scan`: Scan indicator

**Employees**:
- `user`: Single employee
- `users`: Multiple employees
- `user-plus`: Add employee
- `user-x`: Delete employee

**Misc**:
- `file-text`: CSV file
- `printer`: Print
- `copy`: Copy to clipboard
- `external-link`: Open in new window

### 7.2 QR Code Display Specifications

#### 7.2.1 QR Code Generation

**Library**: `qrcode.vue3` or `qrcode.js`

**QR Code Data Format**:
- String: `{phone}:{salt}:{timestamp}` (hashed on backend)
- Or: Pre-generated hash from backend

**Error Correction Level**: Medium (M) - 15% error tolerance
- Balance between size and durability

**QR Code Sizes**:
- Small: 128x128px (list view thumbnail)
- Medium: 256x256px (modal display)
- Large: 384x384px (print/download)
- Extra Large: 512x512px (full-screen display for employee)

#### 7.2.2 QR Code Styling

**Colors**:
- Foreground (dots): Black (#000000)
- Background: White (#FFFFFF)
- High contrast for reliability

**Margin/Quiet Zone**:
- 4 modules (standard, built into library)
- Ensures reliable scanning

**Optional Branding**:
- Center logo: 20% of QR code size maximum
- Logo background: white circle for contrast
- Use only if error correction level supports it

#### 7.2.3 QR Code Display Context

**In Employee Table**:
- Thumbnail (128px)
- Click to open modal with larger view + download/print

**In Employee Detail Modal**:
- Medium size (256px)
- Employee name below QR
- Download PNG button
- Print button

**For Employee (to save/print)**:
- Large size (384px or 512px)
- Employee name and phone below
- Company/app logo above
- Instructions: "Show this QR code at the breakfast counter"

### 7.3 Status Indicators

#### 7.3.1 Active/Inactive Badge

**Active**:
- Green badge (success-100 bg, success-700 text)
- Text: "Active"
- Dot: green circle (if dot variant)

**Inactive**:
- Gray badge (neutral-100 bg, neutral-700 text)
- Text: "Inactive"
- Dot: gray circle

#### 7.3.2 Scan Result Indicators

**Success**:
- Large green checkmark icon (48px)
- Green background (success-50)
- Haptic feedback (vibration)
- Optional: success sound (beep)

**Error**:
- Large red X icon (48px)
- Red background (error-50)
- No haptic (or different vibration pattern)

#### 7.3.3 Gender Display

**Options**:
- Male: M or Male
- Female: F or Female
- Other: O or Other
- Prefer not to say: - or N/A

**No Icons**: Use text only (icons for gender can be problematic)

### 7.4 Illustrations & Empty States

#### 7.4.1 Empty State Illustrations

**Style**: Minimalist, line-based, single-color (primary-500)

**Illustrations Needed**:
- No employees: Clipboard with user icon
- No search results: Magnifying glass
- No scanners: QR code outline
- 404 page: Question mark or compass
- 500 error: Broken gear or alert

**Sources**:
- Undraw.co (customizable, free)
- Storyset (free, editable)
- Create custom with Figma

**Size**: 200-300px width, maintain aspect ratio

#### 7.4.2 Loading Illustrations

**Skeleton Screens**: See Loading States (6.2)

**Spinner**:
- Animated circular spinner
- Primary color
- Sizes: 16px (inline), 24px (button), 48px (page)

---

## 8. Responsive Design Strategy

### 8.1 Mobile-First Approach

**Principle**: Design for mobile first, enhance for larger screens

**Breakpoints** (from Design Tokens):
- Base: 0-639px (Mobile portrait)
- sm: 640px+ (Mobile landscape, small tablets)
- md: 768px+ (Tablets)
- lg: 1024px+ (Desktop)
- xl: 1280px+ (Large desktop)

### 8.2 Scanner View Optimization

**Target Devices**: Tablets (iPad, Android tablets), Large phones

**Orientation**:
- Portrait: Best for scanning (camera top, result bottom)
- Landscape: Also supported

**Layout**:
- Fullscreen camera preview
- Minimal UI (top bar 60px)
- Scan guide overlay (semi-transparent)
- Scan area cutout (centered, square, 300x300px or 70% screen width)

**Touch Targets**:
- All buttons: minimum 44x44px (WCAG 2.2)
- Adequate spacing between buttons (12px minimum)

**Text Size**:
- Scan guide text: 18px minimum (readable from arm's length)
- Result display: 24px+ for employee name, 18px for message

### 8.3 Admin Dashboard Responsive Patterns

#### 8.3.1 Desktop (lg: 1024px+)

**Layout**:
- Persistent sidebar (240px left)
- Main content area (fluid)
- Data tables: full width, all columns visible
- Modals: centered, max-width as specified

**Stats Cards Grid**:
- 4 columns (4 cards in one row)

#### 8.3.2 Tablet (md: 768px - 1023px)

**Layout**:
- Collapsible sidebar (icon-only or hidden, hamburger menu)
- Main content area: full width
- Data tables: hide non-essential columns (gender, created date)
- Modals: full width with padding

**Stats Cards Grid**:
- 2 columns (2 cards per row)

#### 8.3.3 Mobile (< 768px)

**Layout**:
- No sidebar, hamburger menu opens full-screen overlay
- Main content area: full width with padding
- Data tables: Transform to stacked cards
  - Each row becomes a card
  - Fields displayed vertically
  - Actions at bottom of card
- Modals: Full screen
- Forms: Single column, full width inputs

**Stats Cards Grid**:
- 1 column (stacked)

**Navigation**:
- Bottom navigation bar (alternative to hamburger)
- Icons only or icons + labels

### 8.4 Table Responsive Patterns

#### 8.4.1 Desktop Table

- Standard table with all columns
- Horizontal scroll if too many columns

#### 8.4.2 Mobile Table (Stacked Cards)

**Pattern**:
```
┌─────────────────────────────────┐
│ John Doe                    [•] │ <- Name + Actions menu
│ 📞 9876543210                   │
│ 🏢 Engineering                  │
│ 🟢 Active                       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Jane Smith                  [•] │
│ 📞 9876543211                   │
│ 🏢 HR                           │
│ 🟢 Active                       │
└─────────────────────────────────┘
```

**Implementation**:
- Hide `<table>` on mobile
- Display data as cards using CSS Grid/Flexbox
- Each card: employee info + action button

### 8.5 Form Responsive Patterns

**Desktop**:
- Two-column forms for short fields (first name, last name)
- Full-width for longer fields (address, description)

**Mobile**:
- All fields full-width
- Single column layout

### 8.6 Typography Responsive Scale

**Fluid Typography** (Optional):
```css
--text-h1: clamp(2rem, 5vw, 3rem); /* 32px - 48px */
--text-h2: clamp(1.5rem, 4vw, 2.25rem); /* 24px - 36px */
--text-body: clamp(0.875rem, 2vw, 1rem); /* 14px - 16px */
```

**Or Fixed Scale with Breakpoints**:
- Mobile: Slightly smaller font sizes (14px base)
- Desktop: Standard sizes (16px base)

### 8.7 Touch Target Optimization

**Minimum Touch Target**: 44x44px (WCAG 2.2, Level AA)
- Applies to all interactive elements: buttons, links, checkboxes, radio buttons

**Spacing Between Targets**: 8px minimum (prefer 12px+)

**Implementation**:
- Use padding to increase touch area without increasing visual size
- Example: Icon button 20px visual, but 44px touch area via padding

---

## 9. Accessibility Requirements

### 9.1 WCAG 2.2 Level AA Compliance (Mandatory)

**Success Criteria Highlights**:

#### 9.1.1 Perceivable
- **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
- **1.4.11 Non-text Contrast**: 3:1 for UI components and graphical objects
- **1.4.12 Text Spacing**: User can adjust spacing without loss of content
- **1.4.13 Content on Hover or Focus**: Dismissible, hoverable, persistent

#### 9.1.2 Operable
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Focus can move away from component
- **2.4.3 Focus Order**: Logical and meaningful focus order
- **2.4.7 Focus Visible**: Keyboard focus indicator visible
- **2.5.5 Target Size (Level AAA, but recommended)**: 44x44px minimum
- **2.5.7 Dragging Movements**: Alternatives to dragging (use single-point activation)
- **2.5.8 Target Size (Minimum)**: 24x24px minimum (WCAG 2.2 new, Level AA)
  - **Our standard: 44x44px to exceed requirements**

#### 9.1.3 Understandable
- **3.2.6 Consistent Help**: Help mechanisms in consistent order (if applicable)
- **3.3.1 Error Identification**: Errors clearly identified
- **3.3.2 Labels or Instructions**: Labels provided for inputs
- **3.3.3 Error Suggestion**: Suggestions provided for errors
- **3.3.7 Redundant Entry**: Minimize re-entering information (autofill, copy from previous)
- **3.3.8 Accessible Authentication (Minimum)**: Alternatives to cognitive function tests for authentication
  - Allow password managers
  - Support autofill (autocomplete attributes)
  - Biometric authentication (future Phase)

#### 9.1.4 Robust
- **4.1.2 Name, Role, Value**: UI components have accessible names and roles
- **4.1.3 Status Messages**: Status messages programmatically determined (aria-live)

### 9.2 Keyboard Navigation

**General**:
- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Enter: Activate buttons, links
- Space: Activate buttons, toggle checkboxes
- Escape: Close modals, dropdowns, cancel actions
- Arrow keys: Navigate within components (menus, radio groups, tabs)

**Specific Components**:
- **Modals**: Focus trap, Escape closes
- **Dropdowns/Menus**: Arrow keys navigate, Enter selects, Escape closes
- **Data Tables**: Arrow keys navigate cells (optional enhancement), Tab navigates interactive elements
- **QR Scanner**: Escape exits scanner, returns to previous view

**Focus Management**:
- Visible focus indicators (3px outline, primary color, 3px offset)
- Focus moves logically (top to bottom, left to right)
- On modal open: focus moves to modal (first focusable element or close button)
- On modal close: focus returns to trigger element

### 9.3 Screen Reader Support

**ARIA Landmarks**:
- `<header>` with `role="banner"` or native `<header>`
- `<nav>` with `aria-label="Main navigation"`
- `<main>` with `role="main"` or native `<main>`
- `<footer>` with `role="contentinfo"` or native `<footer>`
- Sidebars: `<aside>` or `role="complementary"`

**ARIA Live Regions**:
- Toasts/Notifications: `aria-live="polite"` or `"assertive"`
- Form errors: `aria-live="polite"` on error message container
- Loading states: `aria-busy="true"`, announce "Loading..."
- Scan results: `aria-live="assertive"` to announce immediately

**ARIA Attributes**:
- `aria-label`: For icon-only buttons, unlabeled inputs
- `aria-labelledby`: Link to visible label element
- `aria-describedby`: Link to hint/error messages
- `aria-required`: For required fields
- `aria-invalid`: For fields with errors
- `aria-expanded`: For dropdowns, collapsible sections
- `aria-controls`: Links trigger to controlled element
- `aria-haspopup`: Indicates element triggers popup
- `aria-current="page"`: Current navigation item
- `aria-sort`: Sort state on table headers

**Skip Links**:
- "Skip to main content" link (visually hidden, appears on focus)
- At very top of page, before header

**Semantic HTML**:
- Use native elements: `<button>`, `<a>`, `<input>`, `<label>`, `<table>`, etc.
- Headings hierarchy: h1 → h2 → h3 (no skipping)
- Lists: `<ul>`, `<ol>` for navigation, lists

### 9.4 Color & Contrast

**Contrast Ratios** (WCAG 2.2 AA):
- Normal text (< 24px): 4.5:1 minimum
- Large text (≥ 24px or ≥ 19px bold): 3:1 minimum
- UI components (borders, icons): 3:1 minimum

**Tools**: Use contrast checkers (e.g., WebAIM, Stark, browser dev tools)

**Color Independence**:
- Don't rely on color alone for information
- Status indicators: color + text label (not just green/red dot)
- Form errors: red border + error icon + error text
- Links: underline or bold, not just color change

**Dark Mode** (Phase II):
- Maintain contrast ratios in dark mode
- Test all colors for accessibility

### 9.5 Forms Accessibility

**Labels**:
- Every input has a visible label
- Label linked via `for` attribute or wrapping
- Placeholder NOT used as label

**Required Fields**:
- Visual indicator (asterisk)
- `aria-required="true"` or `required` attribute

**Error Messages**:
- Clearly identified (red text, icon)
- Linked via `aria-describedby`
- Announced to screen readers
- Actionable language

**Autocomplete**:
- Use `autocomplete` attribute for common fields (name, email, phone, address)
- Helps users with cognitive disabilities
- Helps password managers
- WCAG 2.1 requirement (1.3.5)

**Examples**:
```html
<input type="text" name="phone" autocomplete="tel">
<input type="email" name="email" autocomplete="email">
<input type="password" name="password" autocomplete="current-password">
```

### 9.6 Images & Icons

**Alt Text**:
- Decorative images/icons: `alt=""` (empty alt, screen reader skips)
- Informative images: Descriptive alt text
- QR codes: `alt="QR code for [Employee Name]"`

**Icon-Only Buttons**:
- `aria-label` attribute
- Example: `<button aria-label="Close modal"><XIcon /></button>`

**Icon + Text Buttons**:
- Icon is decorative, hide from screen reader (`aria-hidden="true"`)
- Example: `<button><XIcon aria-hidden="true" /> Close</button>`

### 9.7 Modals & Dialogs

**Accessibility Requirements**:
- Focus trap (Tab cycles within modal)
- Focus moved to modal on open (first interactive element or close button)
- Focus returned to trigger on close
- Escape key closes modal
- `aria-modal="true"`
- `aria-labelledby` links to title
- `aria-describedby` links to description (if present)
- Body scroll locked

**Implementation**: Use Radix Vue `Dialog` primitive (handles all of this)

### 9.8 Data Tables

**Accessibility Requirements**:
- `<caption>` element for table description
- `<th>` for header cells with `scope="col"` or `scope="row"`
- Complex headers: use `headers` attribute on `<td>` linking to header IDs
- Sortable columns: `aria-sort` on `<th>`
- Responsive: ensure table data accessible on mobile (stacked cards or horizontal scroll)

### 9.9 Testing Checklist

**Automated Testing**:
- Axe DevTools (browser extension)
- Lighthouse (Chrome DevTools)
- WAVE (browser extension)
- pa11y (CI integration)

**Manual Testing**:
- [ ] Keyboard navigation (unplug mouse, navigate entire app)
- [ ] Screen reader testing (NVDA on Windows, VoiceOver on Mac/iOS, TalkBack on Android)
- [ ] Color contrast (WebAIM contrast checker)
- [ ] Focus indicators visible on all interactive elements
- [ ] Forms: all inputs labeled, errors announced, autocomplete works
- [ ] Modals: focus trap works, Escape closes, focus returns
- [ ] QR Scanner: camera permission clear, errors announced, result announced
- [ ] Responsive: all content accessible on mobile
- [ ] Touch targets: 44x44px minimum, adequate spacing

**User Testing** (Phase II):
- Test with real users with disabilities
- Include: low vision, blind (screen reader), motor disabilities, cognitive disabilities

---

## 10. Implementation Roadmap

### Phase I: Core System (MVP)

#### Milestone 1: Design Tokens & Foundation (Week 1)
- [ ] Define and document all design tokens (colors, typography, spacing, etc.)
- [ ] Set up Tailwind CSS config with custom tokens
- [ ] Create CSS variables for theming
- [ ] Set up project structure (components, pages, utils)

#### Milestone 2: Primitive Components (Week 2-3)
- [ ] Button (all variants, sizes, states)
- [ ] Input (text, email, tel, number)
- [ ] Badge
- [ ] Card
- [ ] Checkbox
- [ ] Radio Button
- [ ] Select/Dropdown
- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Set up Radix Vue primitives

#### Milestone 3: Composite Components (Week 4)
- [ ] DataTable (basic: columns, sorting, pagination)
- [ ] FormField wrapper
- [ ] SearchInput
- [ ] Pagination
- [ ] FileUpload (for CSV)
- [ ] StatusIndicator

#### Milestone 4: Authentication (Week 5)
- [ ] Login page
- [ ] Supabase auth integration
- [ ] Role-based routing
- [ ] Session management
- [ ] Logout functionality

#### Milestone 5: Admin - Employees Management (Week 6-7)
- [ ] Employees list page
- [ ] Employee form (create/edit)
- [ ] Employee detail modal
- [ ] QR code generation (QRCodeDisplay component)
- [ ] Activate/deactivate employee
- [ ] Delete employee
- [ ] Search and filter employees
- [ ] DataTable enhancements (row selection, bulk actions)

#### Milestone 6: Admin - Scanners Management (Week 8)
- [ ] Scanners list page
- [ ] Scanner account form (create)
- [ ] Activate/deactivate scanner
- [ ] Delete scanner
- [ ] Scanner login credentials management

#### Milestone 7: Scanner - QR Scanning (Week 9-10)
- [ ] QR Scanner component
- [ ] Camera integration (Web APIs)
- [ ] QR code decoding library
- [ ] Scan result display (success/error)
- [ ] Backend integration (validate QR, check scan limit)
- [ ] Haptic/audio feedback

#### Milestone 8: Admin Dashboard & Bulk Upload (Week 11)
- [ ] Dashboard page (stats, recent activity)
- [ ] Bulk employee upload (CSV/XLS)
- [ ] CSV parsing and validation
- [ ] Bulk upload modal with preview
- [ ] Error reporting for bulk upload

#### Milestone 9: Testing & Accessibility (Week 12)
- [ ] Accessibility audit (automated + manual)
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Responsive design testing (all breakpoints)
- [ ] Cross-browser testing
- [ ] Bug fixes

#### Milestone 10: Deployment (Week 13)
- [ ] Build optimization
- [ ] GitHub Pages setup
- [ ] Environment variables (Supabase config)
- [ ] Deploy to production
- [ ] User acceptance testing
- [ ] Documentation (user guide, admin guide)

---

### Phase II: Enhancements (Post-MVP)

#### Reports & Analytics
- [ ] Reports page
- [ ] Report filters (date range, department, employee)
- [ ] Daily attendance report
- [ ] Date range report
- [ ] Department breakdown report
- [ ] Employee attendance history
- [ ] Export reports (CSV, PDF)
- [ ] Charts/visualizations (Chart.js or similar)

#### Advanced Features
- [ ] Dark mode toggle
- [ ] Settings page (admin)
  - [ ] Department management (add/edit departments)
  - [ ] System settings (scan window, daily limits)
  - [ ] Notification settings
- [ ] Advanced search (full-text, filters)
- [ ] Audit log (who did what, when)
- [ ] Email notifications (optional)
- [ ] QR code regeneration in bulk
- [ ] Password reset flow (forgot password)
- [ ] User profile page (change password, update info)

#### Accessibility Enhancements
- [ ] WCAG 2.2 AAA compliance (where feasible)
- [ ] High contrast mode
- [ ] Text resizing support (zoom up to 200%)
- [ ] Reduced motion mode (respect prefers-reduced-motion)
- [ ] User testing with assistive technologies

#### Performance Optimization
- [ ] Code splitting (lazy load routes)
- [ ] Image optimization
- [ ] Caching strategy (service worker, Phase III)
- [ ] Performance monitoring (Web Vitals)

---

### Phase III: Future Considerations (6+ months)

- **Offline Mode**: Service worker, offline data sync (if requirements change)
- **Multi-language Support**: i18n (internationalization)
- **Advanced Analytics**: Dashboard charts, trends, predictions
- **Mobile Apps**: Native iOS/Android apps (if web not sufficient)
- **Biometric Authentication**: Fingerprint, Face ID for scanner login
- **Kiosk Mode**: Self-service QR scanning (employees scan themselves)
- **Integration**: External systems (HR systems, payroll)

---

## Appendix A: Naming Conventions

### File Naming
- Components: PascalCase (e.g., `Button.vue`, `DataTable.vue`)
- Pages/Views: PascalCase (e.g., `EmployeesList.vue`, `ScannerView.vue`)
- Utils/Composables: camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Component Naming
- Primitive components: Single word or compound (e.g., `Button`, `FormField`)
- Feature components: Descriptive, specific (e.g., `QRScanner`, `EmployeeForm`)
- Page components: Noun + "Page" or "View" (e.g., `EmployeesListPage`, `ScannerView`)

### CSS Class Naming
- Utility-first with Tailwind CSS
- Custom classes (if needed): kebab-case, BEM-like (e.g., `employee-card`, `employee-card__header`)

### Variable Naming
- JavaScript/TypeScript: camelCase (e.g., `isLoading`, `employeeData`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- Boolean variables: `is`, `has`, `should` prefix (e.g., `isActive`, `hasError`)

---

## Appendix B: Folder Structure

```
breakfast-v3/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── styles/
│   │       └── main.css (Tailwind imports, global styles)
│   ├── components/
│   │   ├── primitives/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Badge.vue
│   │   │   ├── Card.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Select.vue
│   │   │   ├── Checkbox.vue
│   │   │   ├── RadioGroup.vue
│   │   │   ├── Toast.vue
│   │   │   └── Table.vue
│   │   ├── composite/
│   │   │   ├── DataTable.vue
│   │   │   ├── FormField.vue
│   │   │   ├── SearchInput.vue
│   │   │   ├── Pagination.vue
│   │   │   ├── FileUpload.vue
│   │   │   └── StatusIndicator.vue
│   │   ├── feature/
│   │   │   ├── QRScanner.vue
│   │   │   ├── QRCodeDisplay.vue
│   │   │   ├── ScanResultDisplay.vue
│   │   │   ├── EmployeeForm.vue
│   │   │   ├── BulkUploadModal.vue
│   │   │   ├── ScannerAccountForm.vue
│   │   │   └── ReportFilters.vue
│   │   └── layout/
│   │       ├── AppHeader.vue
│   │       ├── Sidebar.vue
│   │       ├── MainLayout.vue
│   │       └── ScannerLayout.vue
│   ├── views/
│   │   ├── auth/
│   │   │   └── LoginView.vue
│   │   ├── admin/
│   │   │   ├── DashboardView.vue
│   │   │   ├── EmployeesListView.vue
│   │   │   ├── ScannersListView.vue
│   │   │   └── ReportsView.vue (Phase II)
│   │   ├── scanner/
│   │   │   └── ScannerView.vue
│   │   └── error/
│   │       ├── NotFoundView.vue (404)
│   │       ├── ForbiddenView.vue (403)
│   │       └── ServerErrorView.vue (500)
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useEmployees.ts
│   │   ├── useScanners.ts
│   │   ├── useQRScanner.ts
│   │   └── useToast.ts
│   ├── stores/
│   │   ├── auth.ts (Pinia store)
│   │   ├── employees.ts
│   │   └── scanners.ts
│   ├── utils/
│   │   ├── supabase.ts (Supabase client)
│   │   ├── validation.ts (Form validation helpers)
│   │   ├── formatters.ts (Date, phone number formatting)
│   │   └── constants.ts
│   ├── types/
│   │   ├── employee.ts
│   │   ├── scanner.ts
│   │   └── index.ts
│   ├── router/
│   │   └── index.ts (Vue Router)
│   ├── App.vue
│   └── main.ts
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Appendix C: Color Palette Reference (Quick Lookup)

| Color      | 50        | 100       | 500 (Base) | 600 (Hover) | 700        | 900        |
|------------|-----------|-----------|------------|-------------|------------|------------|
| Primary    | #f0f9ff   | #e0f2fe   | #0ea5e9    | #0284c7     | #0369a1    | #0c4a6e    |
| Neutral    | #fafafa   | #f5f5f5   | #737373    | #525252     | #404040    | #171717    |
| Success    | #f0fdf4   | #dcfce7   | #22c55e    | #16a34a     | #15803d    | #14532d    |
| Error      | #fef2f2   | #fee2e2   | #ef4444    | #dc2626     | #b91c1c    | #7f1d1d    |
| Warning    | #fffbeb   | #fef3c7   | #f59e0b    | #d97706     | #b45309    | #78350f    |
| Info       | #eff6ff   | #dbeafe   | #3b82f6    | #2563eb     | #1d4ed8    | #1e3a8a    |

---

## Appendix D: Component Props Quick Reference

### Button
```typescript
variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
size: 'sm' | 'base' | 'lg'
disabled: boolean
loading: boolean
```

### Input
```typescript
type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'
size: 'sm' | 'base' | 'lg'
error: boolean
disabled: boolean
readonly: boolean
```

### Badge
```typescript
variant: 'default' | 'success' | 'error' | 'warning' | 'info'
size: 'sm' | 'base' | 'lg'
```

### Modal
```typescript
open: boolean
size: 'sm' | 'base' | 'lg' | 'xl' | 'full'
closeOnOverlayClick: boolean
closeOnEscape: boolean
```

### DataTable
```typescript
columns: Array<{ key, label, sortable, filterable, width, align, render }>
data: T[]
selectable: boolean
pagination: { page, pageSize, total, onPageChange }
```

---

## Appendix E: Typography Scale (Quick Reference)

| Name       | Size    | Weight     | Line Height | Usage                  |
|------------|---------|------------|-------------|------------------------|
| H1         | 36px    | 700 (bold) | 1.25        | Page titles            |
| H2         | 30px    | 700 (bold) | 1.25        | Section titles         |
| H3         | 24px    | 600 (semi) | 1.25        | Subsection titles      |
| H4         | 20px    | 600 (semi) | 1.25        | Card titles            |
| H5         | 18px    | 600 (semi) | 1.5         | Small headings         |
| Body Large | 18px    | 400 (reg)  | 1.5         | Emphasized body text   |
| Body Base  | 16px    | 400 (reg)  | 1.5         | Standard body text     |
| Body Small | 14px    | 400 (reg)  | 1.5         | Small text, captions   |
| Label      | 14px    | 500 (med)  | 1.5         | Form labels            |
| Caption    | 12px    | 400 (reg)  | 1.5         | Tiny text, hints       |

---

## Appendix F: Spacing Scale (Quick Reference)

| Token | Value  | Pixels | Usage                     |
|-------|--------|--------|---------------------------|
| xs    | 0.25rem| 4px    | Tight spacing (icon gaps) |
| sm    | 0.5rem | 8px    | Small gaps                |
| base  | 1rem   | 16px   | Default spacing           |
| md    | 1rem   | 16px   | Medium gaps               |
| lg    | 1.5rem | 24px   | Large gaps                |
| xl    | 2rem   | 32px   | Extra large gaps          |
| 2xl   | 3rem   | 48px   | Section spacing           |
| 3xl   | 4rem   | 64px   | Page spacing              |

---

## Document Control

**Document Version**: 1.0.0
**Last Updated**: January 3, 2026
**Author**: Design System Architect
**Approved By**: [Pending]
**Next Review Date**: [After MVP completion]

**Change Log**:
- 2026-01-03: Initial specification created

---

## Glossary

- **ARIA**: Accessible Rich Internet Applications - set of attributes for accessibility
- **WCAG**: Web Content Accessibility Guidelines
- **QR**: Quick Response (code)
- **RBAC**: Role-Based Access Control
- **SSR**: Server-Side Rendering
- **MVP**: Minimum Viable Product
- **Primitive Component**: Basic, single-purpose UI component
- **Composite Component**: Component composed of multiple primitives
- **Feature Component**: Domain-specific component for this application
- **Design Token**: Named variable representing a design decision (color, spacing, etc.)
- **Semantic Token**: Token with meaning (e.g., "color-success" instead of "color-green-500")

---

**End of Design System Specification**

This document serves as the comprehensive blueprint for implementing the Breakfast Counter QR System. All implementation should follow these specifications to ensure consistency, accessibility, and maintainability.
