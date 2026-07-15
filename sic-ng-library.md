# sic-ng — Angular Component Library Spec

Design spec for `sic-ng`, an Angular component library extracted from the
`sic-app` design system. Source of truth for naming, sizing, theming and the
component API contract before implementation starts. Requirements: see
[sic-ng.md](sic-ng.md).

## 1. Package

| | |
|---|---|
| Package name | `sic-ng` |
| Angular target | v22 (workspace generated with `ng new sic-ng-workspace --create-application=false`, library via `ng generate library sic-ng`) |
| Peer deps | `@angular/core`, `@angular/common`, `@angular/forms` pinned to the same major as the library |
| Distribution | Ivy partial compilation via `ng-packagr` (`ng build sic-ng`) |
| Module format | Standalone components only — no `NgModule` |
| Secondary entry points | none for v1; every component is exported from the root `sic-ng` entry point |

```
projects/sic-ng/
  src/
    lib/
      components/
        sic-input/
          sic-input.component.ts
          sic-input.component.html
          sic-input.component.css
        sic-checkbox/
        ...
      tokens/
        _tokens.css
        _tokens.dark.css
      theme/
        theme.service.ts
        theme.config.ts
      validator/
        sic.validator.ts
      public-api.ts
  package.json
  ng-package.json
```

## 2. Naming & API conventions

- Selector prefix: `sic-*`, one component per folder, files named
  `sic-<name>.component.{ts,html,css}` — matches the pattern already used in
  `sic-app/src/app/core/component`.
- Every component is `standalone: true` and imports only what it needs
  (`CommonModule`, `ReactiveFormsModule` types, etc.).
- Form components implement `ControlValueAccessor` and register via
  `NG_VALUE_ACCESSOR` + `forwardRef`, same shape as
  [sic-input.component.ts](sic-app/src/app/core/component/sic-input/sic-input.component.ts)
  and
  [sic-checkbox.component.ts](sic-app/src/app/core/component/sic-checkbox/sic-checkbox.component.ts):
  - `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`
  - pulls `NgControl` via `Injector` in `ngOnInit` (not constructor, to avoid
    the `NG0200` circular-DI error) and sets `ngControl.valueAccessor = this`
  - exposes `control`, `showError`, `errorMessage`, `isRequired` getters
    backed by a shared `SicValidator` service so every input renders errors
    the same way
  - accepts an `errorMessages: Record<string, string>` input to override
    default messages per-control
- Every component input list starts with the shared visual props (§4) before
  its own functional props.
- Outputs use `sic` prefix only where it disambiguates from the native DOM
  event (e.g. `(sicChange)`); otherwise plain names (`(change)`, `(open)`,
  `(close)`) are fine on non-form components.

## 3. Theming

Two-layer token system, CSS custom properties only (no SCSS build step
required by consumers):

1. **Primitive tokens** — raw values, defined once in `_tokens.css` /
   `_tokens.dark.css`, scoped to `:root` and `:root.dark`.
2. **Component tokens** — each component reads semantic vars
   (`--sic-*`) that fall back to the primitives, so a consumer can override a
   single component without touching the global palette.

```css
/* _tokens.css (light, default) */
:root {
  --sic-color-bg: #ffffff;
  --sic-color-surface: #f7f8fa;
  --sic-color-border: #e2e5ea;
  --sic-color-text: #16181d;
  --sic-color-text-muted: #6b7280;
  --sic-color-primary: #2563eb;
  --sic-color-success: #16a34a;
  --sic-color-danger: #dc2626;
  --sic-color-warning: #d97706;

  --sic-radius-sm: 0.5rem;
  --sic-radius-md: 0.85rem;
  --sic-radius-lg: 1.25rem;
  --sic-radius-full: 999px;

  --sic-font-sans: 'Inter', system-ui, sans-serif;
  --sic-font-size-sm: 0.85rem;
  --sic-font-size-md: 0.95rem;
  --sic-font-size-lg: 1.05rem;

  --sic-space-1: 0.25rem;
  --sic-space-2: 0.5rem;
  --sic-space-3: 0.75rem;
  --sic-space-4: 1rem;

  --sic-control-height-sm: 2.2rem;
  --sic-control-height-md: 2.9rem;
  --sic-control-height-lg: 3.4rem;
}

:root.dark {
  --sic-color-bg: #101215;
  --sic-color-surface: #17191d;
  --sic-color-border: #2a2d33;
  --sic-color-text: #f2f3f5;
  --sic-color-text-muted: #9aa0ab;
  /* primary/success/danger/warning stay brand-controlled, override if needed */
}
```

- `ThemeService` (ported from
  [theme.service.ts](sic-app/src/app/core/services/theme.service.ts)) owns
  `mode: 'light' | 'dark' | 'system'`, persists to `localStorage`, toggles the
  `dark` class on `<html>`, and sets `colorScheme` so native form widgets
  (date/time pickers, scrollbars) follow suit.
- App-level overrides go through an injectable `SIC_THEME_CONFIG` token
  (shape mirrors
  [app-theme-config.model.ts](sic-app/src/app/core/model/app-theme-config.model.ts))
  that the library maps onto the CSS custom properties at bootstrap — so a
  consumer can set `crmPrimary` once instead of editing CSS.
- **Style customization is CSS-variable-only.** No `@Input() color` /
  `@Input() borderRadius` props on individual components — that would fight
  the token cascade and blow up the API surface across 30+ components.
  Consumers override at whatever scope they need:
  ```css
  .my-form { --sic-color-primary: #7c3aed; --sic-radius-md: 0.4rem; }
  ```

### Size

Every input/button-like component takes a shared `size` input:

```ts
@Input() size: 'sm' | 'md' | 'lg' = 'md';
```

which toggles a host class (`sic-size-sm|md|lg`) that swaps the
`--sic-control-height-*`, padding and font-size tokens. No component computes
pixel values in TS.

## 4. Shared input contract

Applies to every component in "Data Entry / Inputs" plus `sic-button`,
`sic-tag`, `sic-badge`:

```ts
@Input() size: 'sm' | 'md' | 'lg' = 'md';
@Input() variant?: 'solid' | 'outline' | 'ghost';   // buttons/tags only
@Input() disabled = false;
@Input() readonly = false;                           // form controls only
@Input() label?: string;
@Input() hint?: string;
@Input() errorMessages: Record<string, string> = {};
```

Common host bindings:

```ts
@HostBinding('class.sic-<name>-host') readonly hostClass = true;
@HostBinding('class.sic-size-sm') get isSm() { return this.size === 'sm'; }
@HostBinding('class.sic-size-lg') get isLg() { return this.size === 'lg'; }
```

## 5. Component inventory

Status column tracks planning only — nothing is implemented yet.

### Data Entry / Inputs

| Component | Value type | Notes |
|---|---|---|
| `sic-input` | `string` | text/email/password/search/tel/url, optional `ngx-mask` integration (prefix/suffix/mask), matches [sic-input](sic-app/src/app/core/component/sic-input/sic-input.component.ts) |
| `sic-input-password` | `string` | wraps `sic-input` with a visibility-toggle affordance instead of duplicating markup |
| `sic-input-number` | `number \| null` | thousand separator, min/max/step, ports [sic-number](sic-app/src/app/core/component/sic-number/sic-number.component.ts) |
| `sic-input-area` | `string` | textarea, `rows`/`autoResize` inputs |
| `sic-input-phone` | `string` | country prefix + mask, ports [sic-input-phone](sic-app/src/app/core/component/sic-input-phone/sic-input-phone.component.ts) |
| `sic-combobox` | `T \| T[] \| null` | single/multi select, `options`, `optionLabel`, `optionValue`, async search via `(search)` output |
| `sic-checkbox` | `any` | `checkedValue`/`uncheckedValue` for tri-state or non-boolean forms, ports [sic-checkbox](sic-app/src/app/core/component/sic-checkbox/sic-checkbox.component.ts) |
| `sic-radio` | `any` | grouped via shared `name`, ports [sic-radio](sic-app/src/app/core/component/sic-radio/sic-radio.component.ts) |
| `sic-switch` | `boolean` | same CVA shape as `sic-checkbox`, pill visual |
| `sic-range` | `number \| [number, number]` | single or dual-handle slider |
| `sic-datepicker` | `Date \| string \| null` | ports [sic-datepicker](sic-app/src/app/core/component/sic-datepicker/sic-datepicker.component.ts), locale-aware |
| `sic-timepicker` | `string` | ports [sic-timepicker](sic-app/src/app/core/component/sic-timepicker/sic-timepicker.component.ts) |
| `sic-colorpicker` | `string` (hex) | ports [sic-colorpicker](sic-app/src/app/core/component/sic-colorpicker/sic-colorpicker.component.ts) |
| `sic-upload` | `File[]` | drag/drop + click, `accept`, `multiple`, `maxSizeMb`, progress via `(progress)`, ports [sic-upload](sic-app/src/app/core/component/sic-upload/sic-upload.component.ts) |
| `sic-rating` | `number` | `max` stars/icons, `allowHalf` |

### General / Buttons

| Component | Notes |
|---|---|
| `sic-flex` | thin wrapper over CSS flexbox (`direction`, `gap`, `align`, `justify`, `wrap` inputs) so layout stays declarative in templates |
| `sic-grid` | CSS grid wrapper (`cols`, `gap`, responsive `colsBreakpoints`) |
| `sic-card` | header/content/footer content-projection slots, ports [sic-card](sic-app/src/app/core/component/sic-card/sic-card.component.ts) |
| `sic-button` | `variant`, `size`, `loading`, `iconLeft`/`iconRight` slots, ports [sic-button](sic-app/src/app/core/component/sic-button/sic-button.component.ts) |
| `sic-button-group` | lays out `sic-button` children, `attached` boolean to merge borders |

### Navigation

| Component | Notes |
|---|---|
| `sic-navbar` | slots for brand/left/right, sticky option |
| `sic-sidebar` | collapsible, ports [sic-sidebar](sic-app/src/app/core/component/sic-sidebar/sic-sidebar.component.ts) + [sic-sidebar.service.ts](sic-app/src/app/core/component/sic-sidebar/sic-sidebar.service.ts) (note: repo has a stray `sic-sidebar copy/` — do not port that, it's dead duplicate work) |
| `sic-tabs` | `sic-tab` child directive/content-child pattern, keyboard arrow nav |
| `sic-breadcrumb` | `items: { label, link? }[]` input |

### Data Display & Media

| Component | Notes |
|---|---|
| `sic-gridpanel` | data table shell, ports [sic-gridpanel](sic-app/src/app/core/component/sic-gridpanel/sic-gridpanel.component.ts) |
| `sic-calendar` | month/week/day views, ports [sic-calendar](sic-app/src/app/core/component/sic-calendar/sic-calendar.component.ts) |
| `sic-image` | lazy-load + fallback/placeholder |
| `sic-video-player` | native `<video>` wrapper with themed controls |
| `sic-badge` | count/dot variants |
| `sic-tag` | closable, color variants |
| `sic-avatar` | image/initials fallback, `size` |
| `sic-accordion` | single/multi expand |
| `sic-collapse` | primitive `sic-accordion` builds on |

### Overlays & Feedback

| Component | Notes |
|---|---|
| `sic-dialog` | CDK Overlay-based, ports [sic-dialog](sic-app/src/app/core/component/sic-dialog/sic-dialog.component.ts), service-driven `open()`/`close()` API plus declarative usage |
| `sic-toast` | queued, `SicToastService.show()`, positions (`top-right` default) |
| `sic-tooltip` | directive + component pair, ports [sic-tooltip](sic-app/src/app/core/component/sic-tooltip/sic-tooltip.component.ts) |

### Loading / Indicators

| Component | Notes |
|---|---|
| `sic-spinner` | `size`, `color` via token override only |
| `sic-skeleton` | `variant: 'text' \| 'circle' \| 'rect'`, shimmer animation |
| `sic-progress-bar` | determinate/indeterminate, `value` 0–100 |

## 6. Cross-cutting pieces

- `SicValidator` — shared service (port of
  [sic.validator.ts](sic-app/src/app/core/validator/sic.validator.ts)) that
  every form control depends on for `showError` / `errorMessage` /
  `isRequired`. Ships as a single injectable in the library, not duplicated
  per component.
- `ThemeService` + `provideSicTheme(config)` — app-level provider function
  consumers call once in `app.config.ts`.
- Default theme ships as CSS import: `@import 'sic-ng/theme/default.css';`.
- Overlay-based components (`sic-dialog`, `sic-tooltip`, `sic-combobox`
  dropdown) depend on `@angular/cdk/overlay` — the one non-Angular-core peer
  dependency, called out explicitly in the package README.

## 7. Non-goals for v1

- No `NgModule` compatibility layer.
- No SSR-specific components beyond guarding browser-only APIs
  (`localStorage`, `matchMedia`) the same way `ThemeService` already does.
- No secondary entry points / tree-shaken sub-packages — revisit only if
  bundle-size feedback demands it.

## 8. Open questions

- Confirm whether `sic-ng` is versioned in lockstep with `sic-app`'s Angular
  version or pinned independently once `sic-app` upgrades past 21.
- Icon set: `sic-button`, `sic-tag`, `sic-rating` etc. need one — not
  specified in [sic-ng.md](sic-ng.md) yet.
