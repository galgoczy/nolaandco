# Design System Document

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Serene Nursery."** This philosophy moves away from the cluttered, high-stimulation environments often found in the baby industry, opting instead for an editorial, Scandinavian-inspired tranquility.

The system breaks away from "template-style" layouts by embracing **Intentional Asymmetry**. We do not fill every corner; we treat white space as a physical element that frames our content. By using overlapping layers, high-contrast typography scales, and a rejection of traditional borders, we create a digital experience that feels as soft and premium as a hand-woven linen blanket.

---

## 2. Colors
Our palette is rooted in the earth. It is designed to soothe the eye and provide a warm, tactile feel through digital surfaces.

- **Primary (#725948) & Terracotta (#C4A591):** Used for key actions and brand moments. Terracotta acts as our "Primary Container," providing a soft warmth for highlighted regions.
- **Secondary Light Blue (#D5E8F0):** A calming counterpoint to the earthy browns, used for supplementary information or "soft" call-outs.
- **Neutrals (Carbon #333333 & Carbon Light #4A4A4A):** These provide the sophisticated editorial "ink" for our typography.

### The "No-Line" Rule
To maintain a high-end feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to denote a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. Use the `surface-container` tiers (Lowest to Highest) to create organic depth. An inner card should use `surface-container-lowest` (#FFFFFF) against a `surface-container` (#F0EDED) background to create a "lifted" effect without heavy shadows.

### Glassmorphism & Soul
For floating elements (modals, navigation bars), use semi-transparent surface colors with a `backdrop-blur` effect. CTAs and Hero backgrounds should utilize subtle gradients (e.g., `primary` to `primary_container`) to add a sense of luxury and "soul" that flat hex codes cannot achieve.

---

## 3. Typography
We utilize a dual-sans-serif approach to maintain cleanliness while introducing a high-end editorial rhythm.

- **Display & Headline (Manrope):** This is our "sophisticated" voice. Use `display-lg` (3.5rem) with generous tracking and tight line-heights for a bold, intentional look.
- **Title, Body, & Label (Plus Jakarta Sans):** This is our "functional" voice. It offers high readability for product descriptions and navigation.

**Editorial Hierarchy:** Use extreme scale differences. A `display-lg` headline should often be paired with a `body-sm` description tucked into an asymmetrical corner to create a "gallery" feel.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** Stack `surface-container` tiers to create natural lift. Place a `surface-container-lowest` card on a `surface-container-low` background for a soft, tactile separation.
- **Ambient Shadows:** Shadows must be invisible until noticed. Use extra-diffused blur values (20px+) at ultra-low opacities (4%-6%). The shadow color should be a tinted version of `on-surface` (#1B1C1C) to mimic natural ambient light.
- **The "Ghost Border":** If a border is required for accessibility, use the `outline-variant` token at **10% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (#725948), Text `on-primary` (#FFFFFF). Use `rounded-full` for a soft, pebble-like feel.
- **Secondary:** Background `secondary_container` (#D3E6EE), Text `on-secondary_container` (#55676E).
- **Tertiary:** Text-only with an underline that appears only on hover.

### Input Fields
- Avoid boxes. Use a subtle background fill of `surface-container` with a `rounded-md` (0.75rem) corner. The label should use `label-md` in `on-surface-variant`.

### Cards
- **Construction:** No borders. Use `surface-container-lowest` (#FFFFFF) and a `rounded-xl` (1.5rem) corner.
- **Spacing:** Use vertical white space (`spacing-8` or `spacing-10`) to separate internal content rather than divider lines.

### Chips
- Use `secondary_fixed` (#D3E6EE) for filter chips. They should feel like soft "pill" shapes that float over the content.

### Signature Component: The Product Carousel
- Use asymmetrical image sizing where the "featured" item is slightly larger and overlaps the edge of the screen, encouraging a sense of continuity and discovery.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `spacing-16` (5.5rem) and `spacing-20` (7rem) to separate major sections. Air is luxury.
- **Do** use the `roundedness-xl` (1.5rem) for large image containers to mimic the soft edges of baby furniture.
- **Do** lean into the "Warm Beige" (#FDFBF7) as your primary canvas; it is more premium than pure white.

### Don't:
- **Don't** use 1px dividers to separate list items. Use `spacing-3` (1rem) of empty space instead.
- **Don't** use pure black (#000000). Always use `carbon` (#333333) for text to keep the contrast "soft-high."
- **Don't** center-align everything. Use intentional left or right offsets to create an editorial, non-template look.