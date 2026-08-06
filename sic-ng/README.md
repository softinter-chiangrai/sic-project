# sic-ng

Angular 22 component library for SIC products. Standalone components, `sic-*` selectors, light/dark theming via CSS custom properties, and Reactive/Template-driven forms support through a shared `ControlValueAccessor` base.

- [1. How to start](#1-how-to-start)
- [2. Theming — custom design, colors, sizes](#2-theming--custom-design-colors-sizes)
- [3. Basic usage](#3-basic-usage)
- [4. Using SicValidator (form error messages)](#4-using-sicvalidator-form-error-messages)
- [5. Component reference](#5-component-reference)

---

## 1. How to start

### Install

```bash
npm install sic-ng
```

`sic-ng` depends on Angular itself as **peer dependencies** — make sure your app already has these installed (any standard `ng new` app does):

```
@angular/core, @angular/common, @angular/forms, @angular/cdk
```

### Import the theme CSS

Add the default theme once, globally, in `angular.json` (`styles` array) or `src/styles.css`:

```css
/* src/styles.css */
@import 'sic-ng/theme/default-theme.css';
```

This defines every `--sic-*` design token for both light and dark mode (see [§2](#2-theming--custom-design-colors-sizes)).

### Register the theme provider

In a standalone app's `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideSicTheme } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSicTheme({
      mode: 'system',        // 'light' | 'dark' | 'system'
      colorPrimary: '#7c3aed',
    }),
    // ...your other providers
  ],
};
```

`provideSicTheme()` applies your overrides to `:root` and calls `SicThemeService.init()` on bootstrap, so dark mode, `localStorage` persistence, and OS theme changes all work out of the box. It's optional — if you skip it, components still render with the default theme.

### Use a component

Every component is standalone, so just import the ones you need directly into your component/page:

```ts
import { Component } from '@angular/core';
import { SicButtonComponent, SicInputComponent } from 'sic-ng';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SicInputComponent, SicButtonComponent],
  template: `
    <sic-input label="Email" placeholder="you@example.com" />
    <sic-button variant="solid" color="primary">Sign in</sic-button>
  `,
})
export class LoginComponent {}
```

---

## 2. Theming — custom design, colors, sizes

Everything visual is driven by `--sic-*` CSS custom properties. Components never hardcode colors, spacing, or radii — they read tokens, so overriding a token anywhere in the CSS cascade re-themes every component under it.

### Token reference (defaults)

| Token | Light default | Dark default | Used for |
|---|---|---|---|
| `--sic-color-bg` | `#ffffff` | `#101215` | component backgrounds |
| `--sic-color-surface` | `#f7f8fa` | `#17191d` | subtle fills (disabled state, table header, dropzone) |
| `--sic-color-border` | `#e2e5ea` | `#2a2d33` | borders, dividers |
| `--sic-color-text` | `#16181d` | `#f2f3f5` | body text |
| `--sic-color-text-muted` | `#6b7280` | `#9aa0ab` | placeholders, hints |
| `--sic-color-text-active` | `#0b0c0e` | `#ffffff` | labels, headings, active values |
| `--sic-color-primary` | `#2563eb` | *(inherits light)* | primary actions, focus rings, links |
| `--sic-color-primary-contrast` | `#ffffff` | | text/icons drawn on top of `primary` |
| `--sic-color-success` | `#16a34a` | | success state |
| `--sic-color-danger` | `#dc2626` | | error / destructive state |
| `--sic-color-warning` | `#d97706` | | warning state |
| `--sic-radius-sm` / `-md` / `-lg` / `-full` | `0.5rem` / `0.85rem` / `1.25rem` / `999px` | | corner rounding |
| `--sic-font-sans` | `'Inter', system-ui, ...` | | all component typography |
| `--sic-font-size-sm` / `-md` / `-lg` | `0.85rem` / `0.95rem` / `1.05rem` | | text scale |
| `--sic-space-1..4` | `0.25rem .. 1rem` | | internal padding/gap scale |
| `--sic-control-height-sm` / `-md` / `-lg` | `2.2rem` / `2.9rem` / `3.4rem` | | input/button height per `size` |
| `--sic-shadow-sm` / `-md` | | | elevation (dialogs, dropdowns) |
| `--sic-transition-fast` / `-base` | `0.15s` / `0.2s` ease | | hover/focus transitions |

### Option A — override globally in CSS

```css
/* src/styles.css, after the sic-ng theme import */
:root {
  --sic-color-primary: #7c3aed;
  --sic-radius-md: 0.4rem;   /* sharper corners app-wide */
  --sic-font-sans: 'Sarabun', system-ui, sans-serif;
}
```

### Option B — override at bootstrap with `provideSicTheme`

```ts
provideSicTheme({
  mode: 'dark',
  colorPrimary: '#7c3aed',
  colorDanger: '#e11d48',
  radiusMd: '0.4rem',
  fontSans: "'Sarabun', system-ui, sans-serif",
});
```

### Option C — scope an override to one section of the page

Because it's plain CSS custom property inheritance, you can re-theme just a container (e.g. give a "danger zone" panel a red primary color) without touching global styles:

```css
.danger-zone {
  --sic-color-primary: var(--sic-color-danger);
}
```

```html
<div class="danger-zone">
  <sic-button color="primary">Delete account</sic-button>
</div>
```

### Dark mode

```ts
import { SicThemeService } from 'sic-ng';

constructor(private theme: SicThemeService) {}

toggleDark() {
  this.theme.toggleDark();       // flips light <-> dark, persists to localStorage
}

setSystem() {
  this.theme.setTheme('system'); // follow OS preference
}
```

`SicThemeService` toggles a `dark` class on `<html>` and sets `colorScheme`, matching the `:root.dark { ... }` overrides shipped in the theme CSS.

### Size

Every input-like and button-like component accepts:

```html
<sic-input size="sm" label="Compact field" />
<sic-input size="lg" label="Large field" />
<sic-button size="sm">Small</sic-button>
```

`size` toggles `--sic-control-height-*` and font-size — there is no separate "custom pixel height" input; adjust the token instead if you need a different scale globally.

---

## 3. Basic usage

### Template-driven forms

```html
<form #f="ngForm">
  <sic-input
    name="email"
    label="Email"
    [(ngModel)]="email"
    required
    email
  />
  <sic-button [disabled]="f.invalid" type="submit">Submit</sic-button>
</form>
```

### Reactive forms

```ts
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SicInputComponent, SicButtonComponent } from 'sic-ng';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SicInputComponent, SicButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <sic-input
        label="Email"
        formControlName="email"
        [errorMessages]="{ required: 'กรุณากรอกอีเมล', email: 'รูปแบบอีเมลไม่ถูกต้อง' }"
      />
      <sic-button type="submit" [disabled]="form.invalid">Save</sic-button>
    </form>
  `,
})
export class ProfileFormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder) {}

  submit() {
    if (this.form.valid) { /* ... */ }
  }
}
```

Any `sic-*` form control (`sic-input`, `sic-checkbox`, `sic-combobox`, `sic-datepicker`, etc.) works as a drop-in `formControlName` / `[(ngModel)]` target — they all implement `ControlValueAccessor`.

### Content projection

Components that wrap content (`sic-card`, `sic-dialog`, `sic-button`, `sic-tabs`, `sic-accordion`) use named slots via attribute selectors:

```html
<sic-card title="Order #1024">
  <p>Order body content goes here.</p>
  <div sicCardFooter>
    <sic-button variant="ghost">Cancel</sic-button>
    <sic-button variant="solid">Confirm</sic-button>
  </div>
</sic-card>
```

### Imperative overlays (dialog / toast)

```ts
import { SicDialogService, SicToastService } from 'sic-ng';

constructor(
  private dialogs: SicDialogService,
  private toasts: SicToastService,
) {}

confirmDelete() {
  const ref = this.dialogs.open(ConfirmDialogComponent, { data: { id: 42 } });
  // ref.close() to dismiss programmatically
}

notify() {
  this.toasts.show('บันทึกสำเร็จ', 'success');
}
```

Drop `<sic-toast position="top-right" />` once near the root of your app shell — it subscribes to `SicToastService` and renders the queue.

---

## 4. Using SicValidator (form error messages)

Every form control extends `SicFormControlBase`, which wires itself to Angular's `NgControl` and exposes:

| Member | Meaning |
|---|---|
| `control` | the underlying `AbstractControl` (from `formControlName`/`ngModel`) |
| `showError` | `true` when the control is invalid **and** touched/dirty |
| `errorMessage` | resolved human-readable message for the first active error |
| `isRequired` | `true` if a `Validators.required`-shaped validator is attached — used to render the `*` next to the label |

You never call these yourself for standard usage — they're rendered automatically in each component's template. What you *do* control is `errorMessages`, a `Record<string, string>` input to override the default English copy per error key:

```html
<sic-input
  label="Username"
  formControlName="username"
  [errorMessages]="{
    required: 'กรุณากรอกชื่อผู้ใช้',
    minlength: 'ต้องมีอย่างน้อย 4 ตัวอักษร'
  }"
/>
```

If a key isn't overridden, `SicValidator` falls back to its built-in message:

| Validator key | Default message |
|---|---|
| `required` | This field is required. |
| `email` | Please enter a valid email address. |
| `minlength` | Minimum length is `{requiredLength}`. |
| `maxlength` | Maximum length is `{requiredLength}`. |
| `min` | Minimum value is `{min}`. |
| `max` | Maximum value is `{max}`. |
| `pattern` | The format is invalid. |
| *(anything else)* | The value is invalid. |

Only the **first** active error key is shown at a time (Angular validators run in the order declared; put your most important validator first, e.g. `[Validators.required, Validators.email]`).

### Using `SicValidator` directly

You can also inject `SicValidator` yourself — for example to build a custom summary of all form errors:

```ts
import { SicValidator } from 'sic-ng';

constructor(private validator: SicValidator) {}

describeError(control: AbstractControl | null, touched: boolean) {
  if (!this.validator.shouldShowError(control, touched)) return null;
  return this.validator.getErrorMessage(control, { required: 'จำเป็นต้องกรอก' });
}
```

---

## 5. Component reference

Unless noted, every component is standalone and imported by class name from `'sic-ng'`.

### Shared form-control inputs

All **Data Entry** components below (`sic-input`, `sic-input-password`, `sic-input-number`, `sic-input-area`, `sic-input-phone`, `sic-combobox`, `sic-checkbox`, `sic-radio`, `sic-switch`, `sic-range`, `sic-datepicker`, `sic-timepicker`, `sic-colorpicker`, `sic-upload`, `sic-rating`) inherit these from `SicFormControlBase` in addition to their own inputs:

| Input | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | control height / font scale |
| `label` | `string` | — | field label text |
| `hint` | `string` | — | helper text shown under the field when there's no error |
| `disabled` | `boolean` | `false` | disables the control |
| `readonly` | `boolean` | `false` | read-only (value still submits) |
| `errorMessages` | `Record<string, string>` | `{}` | per-validator-key message overrides ([§4](#4-using-sicvalidator-form-error-messages)) |

All of them also implement `ControlValueAccessor` (use with `formControlName` or `[(ngModel)]`).

---

### Data Entry / Inputs

#### `sic-input`
Single-line text input (text/email/password/search/tel/url).

| Input | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `placeholder` | `string` | `''` |
| `type` | `'text'\|'email'\|'password'\|'search'\|'tel'\|'url'` | `'text'` |
| `autocomplete` | `string` | — |
| `maxlength` | `number` | — |

#### `sic-input-password`
Password field with a built-in show/hide toggle.

| Input | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `placeholder` | `string` | `''` |
| `autocomplete` | `string` | `'current-password'` |

#### `sic-input-number`
Numeric input with stepper buttons and optional prefix/suffix.

| Input | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `placeholder` | `string` | `''` |
| `min` / `max` | `number` | — |
| `step` | `number` | `1` |
| `prefix` / `suffix` | `string` | `''` |

Value type: `number \| null`.

#### `sic-input-area`
Multi-line textarea.

| Input | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `placeholder` | `string` | `''` |
| `rows` | `number` | `4` |
| `maxlength` | `number` | — |
| `autoResize` | `boolean` | `false` — grows with content |

#### `sic-input-phone`
Text input with a dial-code `<select>` prefix.

| Input | Type | Default |
|---|---|---|
| `name` | `string` | — |
| `placeholder` | `string` | `''` |
| `countries` | `SicPhoneCountry[]` | TH/US/GB/SG built-ins |

Emits combined value as `"+66 812345678"`.

#### `sic-combobox<T>`
Single/multi select dropdown with optional search.

| Input | Type | Default |
|---|---|---|
| `options` | `T[]` | `[]` |
| `optionLabel` | `keyof T \| ((option: T) => string)` | stringifies option |
| `optionValue` | `keyof T \| ((option: T) => unknown)` | identity |
| `placeholder` | `string` | `'Select…'` |
| `multi` | `boolean` | `false` |
| `searchable` | `boolean` | `true` |

| Output | Payload | When |
|---|---|---|
| `search` | `string` | user types in the filter box (hook up server-side search here) |

Value type: `T \| T[] \| null`.

#### `sic-checkbox`
| Input | Type | Default |
|---|---|---|
| `checkedValue` | `unknown` | `true` |
| `uncheckedValue` | `unknown` | `false` |

#### `sic-radio`
Use several with the same `name` to form a group; bind each to a `radioValue`.

| Input | Type | Default |
|---|---|---|
| `name` | `string` | random per-instance id — **set this explicitly to group radios** |
| `radioValue` | `unknown` | — |

#### `sic-switch`
Boolean toggle, same shape as `sic-checkbox`.

| Input | Type | Default |
|---|---|---|
| `checkedValue` | `unknown` | `true` |
| `uncheckedValue` | `unknown` | `false` |

#### `sic-range`
Single or dual-handle slider.

| Input | Type | Default |
|---|---|---|
| `min` / `max` | `number` | `0` / `100` |
| `step` | `number` | `1` |
| `dual` | `boolean` | `false` — value becomes `[number, number]` |

#### `sic-datepicker`
Native date input wrapper.

| Input | Type | Default |
|---|---|---|
| `min` / `max` | `string` (`yyyy-mm-dd`) | — |
| `outputType` | `'date' \| 'string'` | `'string'` |

#### `sic-timepicker`
| Input | Type | Default |
|---|---|---|
| `min` / `max` | `string` | — |
| `step` | `number` | — |

#### `sic-colorpicker`
| Input | Type | Default |
|---|---|---|
| `allowText` | `boolean` | `true` — show the hex text field next to the swatch |

#### `sic-upload`
Drag & drop / click-to-browse file picker.

| Input | Type | Default |
|---|---|---|
| `accept` | `string` | `'*'` |
| `multiple` | `boolean` | `true` |
| `maxSizeMb` | `number` | `10` |

| Output | Payload |
|---|---|
| `progress` | `{ file: File; percent: number }` — emitted per accepted file |
| `rejected` | `File[]` — files that failed the size check |

Value type: `File[]`.

#### `sic-rating`
| Input | Type | Default |
|---|---|---|
| `max` | `number` | `5` |
| `allowHalf` | `boolean` | `false` |

---

### General / Buttons

#### `sic-flex`
CSS flexbox wrapper (not a form control — no shared inputs above apply).

| Input | Type | Default |
|---|---|---|
| `direction` | `'row'\|'column'\|'row-reverse'\|'column-reverse'` | `'row'` |
| `align` | `'start'\|'center'\|'end'\|'stretch'\|'baseline'` | `'stretch'` |
| `justify` | `'start'\|'center'\|'end'\|'between'\|'around'\|'evenly'` | `'start'` |
| `wrap` | `'nowrap'\|'wrap'\|'wrap-reverse'` | `'nowrap'` |
| `gap` | `string` (CSS length) | `'0'` |

#### `sic-grid`
CSS grid wrapper.

| Input | Type | Default |
|---|---|---|
| `cols` | `number` | `12` |
| `gap` | `string` | `var(--sic-space-4)` |
| `colsBreakpoints` | `{ sm, md, lg }: number` | `null` — responsive column counts at 768px/1024px |

#### `sic-card`
| Input | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `bordered` | `boolean` | `true` |
| `elevated` | `boolean` | `false` |

Slots: default content, `[sicCardHeader]`, `[sicCardFooter]`.

#### `sic-button`
| Input | Type | Default |
|---|---|---|
| `variant` | `'solid'\|'outline'\|'ghost'` | `'solid'` |
| `color` | `'primary'\|'success'\|'danger'\|'warning'` | `'primary'` |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` |
| `type` | `'button'\|'submit'\|'reset'` | `'button'` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` — shows spinner, auto-disables |
| `block` | `boolean` | `false` — full width |

Slots: default (label), `[sicIconLeft]`, `[sicIconRight]`.

#### `sic-button-group`
| Input | Type | Default |
|---|---|---|
| `attached` | `boolean` | `false` — merges borders into a segmented control |
| `direction` | `'row'\|'column'` | `'row'` |

---

### Navigation

#### `sic-navbar`
| Input | Type | Default |
|---|---|---|
| `sticky` | `boolean` | `false` |

Slots: `[sicBrand]`, `[sicNavLeft]`, `[sicNavRight]`.

#### `sic-sidebar`
| Input | Type | Default |
|---|---|---|
| `items` | `SicSidebarItem[]` (`{ label, icon?, link?, children? }`) | `[]` |
| `collapsed` | `boolean` | `false` |
| `activeLink` | `string` | — |

| Output | Payload |
|---|---|
| `itemSelect` | `SicSidebarItem` — leaf item clicked |
| `collapsedChange` | `boolean` |

#### `sic-tabs`
| Input | Type | Default |
|---|---|---|
| `tabs` | `SicTab[]` (`{ id, label, disabled? }`) | `[]` |
| `activeId` | `string` | — |

| Output | Payload |
|---|---|
| `activeIdChange` | `string` |

Arrow-key navigation between enabled tabs is built in.

#### `sic-breadcrumb`
| Input | Type | Default |
|---|---|---|
| `items` | `SicBreadcrumbItem[]` (`{ label, link? }`) | `[]` |
| `separator` | `string` | `'/'` |

| Output | Payload |
|---|---|
| `itemClick` | `SicBreadcrumbItem` |

---

### Data Display & Media

#### `sic-gridpanel<T>`
Data table with click-to-sort headers.

| Input | Type | Default |
|---|---|---|
| `columns` | `SicGridColumn<T>[]` (`{ field, header, sortable?, width? }`) | `[]` |
| `rows` | `T[]` | `[]` |
| `trackByField` | `keyof T` | — |
| `loading` | `boolean` | `false` |
| `emptyText` | `string` | `'No data'` |

| Output | Payload |
|---|---|
| `rowClick` | `T` |
| `sortChange` | `{ field: string; direction: 'asc'\|'desc'\|null }` |

#### `sic-calendar`
Month-view date picker grid.

| Input | Type | Default |
|---|---|---|
| `selected` | `Date \| null` | `null` |
| `weekStartsOn` | `0 \| 1` | `1` (Monday) |

| Output | Payload |
|---|---|
| `selectedChange` | `Date` |

#### `sic-image`
| Input | Type | Default |
|---|---|---|
| `src` | `string` (required) | — |
| `alt` | `string` | `''` |
| `fallback` | `string` | `''` — shown if `src` fails to load |
| `loading` | `'lazy'\|'eager'` | `'lazy'` |
| `rounded` | `'none'\|'sm'\|'md'\|'lg'\|'full'` | `'none'` |

#### `sic-video-player`
| Input | Type | Default |
|---|---|---|
| `src` | `string` (required) | — |
| `poster` | `string` | — |
| `autoplay` / `loop` / `muted` | `boolean` | `false` |

#### `sic-badge`
Wraps its content and overlays a count or dot.

| Input | Type | Default |
|---|---|---|
| `count` | `number` | — |
| `max` | `number` | `99` — shows `99+` beyond this |
| `dot` | `boolean` | `false` |
| `color` | `'primary'\|'success'\|'danger'\|'warning'` | `'primary'` |

#### `sic-tag`
| Input | Type | Default |
|---|---|---|
| `color` | `'primary'\|'success'\|'danger'\|'warning'\|'neutral'` | `'neutral'` |
| `closable` | `boolean` | `false` |

| Output | Payload |
|---|---|
| `closed` | `void` |

#### `sic-avatar`
| Input | Type | Default |
|---|---|---|
| `src` | `string` | — |
| `name` | `string` | `''` — used to derive initials fallback |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` |

#### `sic-accordion`
Coordinates projected `<sic-collapse>` children so only one stays open (unless `multi`).

| Input | Type | Default |
|---|---|---|
| `multi` | `boolean` | `false` |

```html
<sic-accordion>
  <sic-collapse label="Section A">Content A</sic-collapse>
  <sic-collapse label="Section B">Content B</sic-collapse>
</sic-accordion>
```

#### `sic-collapse`
Standalone expand/collapse panel (also the building block for `sic-accordion`).

| Input | Type | Default |
|---|---|---|
| `label` | `string` | `''` |
| `expanded` | `boolean` | `false` |

| Output | Payload |
|---|---|
| `expandedChange` | `boolean` |

---

### Overlays & Feedback

#### `sic-dialog`
Declarative modal.

| Input | Type | Default |
|---|---|---|
| `open` | `boolean` | `false` |
| `title` | `string` | — |
| `disableClose` | `boolean` | `false` — disables backdrop-click/Escape close |
| `width` | `string` | `'32rem'` |

| Output | Payload |
|---|---|
| `openChange` | `boolean` |
| `closed` | `void` |

Slots: default (body), `[sicDialogFooter]`.

#### `SicDialogService`
Imperative alternative for portalling an arbitrary component into a centered CDK overlay:

```ts
dialogService.open(MyComponent, { data: {...}, width: '28rem', disableClose: false });
// -> { componentInstance, close(), overlayRef }
```

#### `sic-toast` / `SicToastService`
| `sic-toast` Input | Type | Default |
|---|---|---|
| `position` | `'top-right'\|'top-left'\|'bottom-right'\|'bottom-left'\|'top-center'\|'bottom-center'` | `'top-right'` |

```ts
toastService.show(message: string, type: 'info'|'success'|'danger'|'warning' = 'info', duration = 3500): number
toastService.dismiss(id: number): void
toastService.clear(): void
```

#### `sic-tooltip` directive
Apply `[sicTooltip]` to any element; positions via CDK overlay.

| Input | Type | Default |
|---|---|---|
| `sicTooltip` | `string` | `''` — tooltip text |
| `sicTooltipPlacement` | `'top'\|'bottom'\|'left'\|'right'` | `'top'` |

```html
<button [sicTooltip]="'Save changes'" sicTooltipPlacement="bottom">Save</button>
```

---

### Loading / Indicators

#### `sic-spinner`
| Input | Type | Default |
|---|---|---|
| `size` | `'sm'\|'md'\|'lg'` | `'md'` |

#### `sic-skeleton`
| Input | Type | Default |
|---|---|---|
| `variant` | `'text'\|'circle'\|'rect'` | `'text'` |
| `width` | `string` | `'100%'` |
| `height` | `string` | derived from `variant` if omitted |

#### `sic-progress-bar`
| Input | Type | Default |
|---|---|---|
| `value` | `number` (0–100) | `0` |
| `indeterminate` | `boolean` | `false` |
| `color` | `'primary'\|'success'\|'danger'\|'warning'` | `'primary'` |
