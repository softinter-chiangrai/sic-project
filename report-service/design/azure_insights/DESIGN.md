# Design System Strategy: The Informed Curator

## 1. Overview & Creative North Star
This design system is built upon the North Star of **"The Informed Curator."** In a world of cluttered Business Intelligence platforms and dense data tables, we move away from the "mechanical dashboard" aesthetic. Instead, we embrace a high-end editorial feel—think of a premium financial journal or a curated gallery of insights.

We achieve this by breaking the traditional rigid grid. We avoid "boxed-in" layouts in favor of **Intentional Asymmetry** and **Tonal Depth**. By utilizing wide margins, varying typographic scales, and overlapping surface layers, we create a sense of calm authority. The interface should feel like it is "presenting" a story rather than just "displaying" data.

---

## 2. Colors: The Palette of Trust
The color strategy avoids the vibration of high-saturation blues. We use a sophisticated palette of deep navy (`primary`), slate (`secondary`), and an expansive range of "Surface" tones to create a soothing, professional environment.

### The "No-Line" Rule
To maintain a premium editorial feel, **1px solid borders are prohibited for sectioning.** Physical boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` data widget should sit directly on a `surface` background without a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper or frosted glass.
*   **Base Layer:** `surface` (#f7f9fb)
*   **Secondary Content:** `surface-container-low` (#f0f4f7)
*   **Primary Action Cards:** `surface-container-lowest` (#ffffff)
*   **Nesting Rule:** To define importance, nest a `surface-container-lowest` element inside a `surface-container` area. The contrast in brightness creates natural focus without visual noise.

### The "Glass & Gradient" Rule
Floating elements (Modals, Popovers, Filter Menus) must use a **Glassmorphic** approach. Utilize a semi-transparent `surface-container-lowest` with a `backdrop-blur` of 12px. For main CTAs, use a subtle linear gradient from `primary` (#0053db) to `primary_dim` (#0048c1) at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance modern utility with editorial character.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and unique character. Use `display-lg` and `headline-md` for high-level insights. The dramatic scale difference between headlines and body text mimics high-end print media.
*   **Body & Labels (Inter):** A workhorse for data. Use `body-md` for standard reporting and `label-sm` for data metadata. 
*   **Hierarchy Tip:** Always pair a `headline-sm` (Manrope) with a `label-md` (Inter, All-Caps, Tracking +5%) to create a sophisticated, curated header for data modules.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often messy. In this system, we convey hierarchy through **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Depth is achieved by "stacking." A card using `surface-container-highest` (#d9e4ea) placed on `surface-container` (#e8eff3) creates an "inset" feel, perfect for secondary data feeds.
*   **Ambient Shadows:** For high-priority floating elements, use a shadow with a 24px-32px blur, but set the opacity to 4%–6%. The shadow color must be a tinted version of `on-surface` (#2a3439), never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline-variant` token (#a9b4b9) at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components: The Building Blocks

### Buttons & Inputs
*   **Primary Button:** Gradient fill (`primary` to `primary_dim`), `md` (0.375rem) corner radius. Typography: `title-sm` (Inter, Medium).
*   **Secondary/Tertiary:** No background. Use `on_surface` text with a `surface-container` hover state.
*   **Input Fields:** Use `surface-container-low` as the background. No border. Upon focus, transition to `surface-container-lowest` with a subtle `primary` underline (2px).

### Cards & Data Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use vertical white space (Spacing `4` or `5`) or alternating tonal shifts (`surface` to `surface-container-low`).
*   **The Report Card:** Use `surface-container-lowest` with an `xl` (0.75rem) corner radius for main report containers. Apply a subtle "Ghost Border" to the bottom edge only to anchor the element.

### Contextual Components
*   **Data Scrims:** When a report is loading or inactive, use a `surface-dim` overlay with 40% opacity.
*   **Trend Chips:** Use `secondary_container` for neutral trends and `error_container` for negative alerts. Keep the corners at `full` (pill-shape) to contrast against the architectural squareness of the reports.

---

## 6. Do's and Don'ts

### Do
*   **DO** use white space as a structural element. If a section feels crowded, increase spacing to `12` (2.75rem) or `16` (3.5rem).
*   **DO** lean into "nested" backgrounds. A sidebar on `surface-dim` next to a main area on `surface` creates an immediate, clean separation.
*   **DO** use Manrope for large numbers (KPIs). The typeface’s geometry makes data feel like a design element.

### Don't
*   **DON'T** use 1px borders to "box in" charts. Let the data breathe against the background.
*   **DON'T** use pure black (#000000) for text. Always use `on_surface` (#2a3439) to maintain the "soothing" professional tone.
*   **DON'T** use sharp corners. All interactive components must adhere to the `md` (0.375rem) or `lg` (0.5rem) radius to feel approachable and modern.