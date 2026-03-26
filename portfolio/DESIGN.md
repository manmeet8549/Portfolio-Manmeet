# Design System Specification: High-End Editorial Brutalism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Monolith."** 

This system moves away from the friendly, rounded "SaaS" aesthetic of the last decade. It embraces the raw, uncompromising energy of Swiss Graphic Design and Architectural Brutalism. We are not building a website; we are curating a digital gallery. The experience is defined by intentional asymmetry, a strict adherence to sharp 90-degree angles, and a high-contrast typographic scale that commands attention. By utilizing massive negative space (whitespace) and a rigid, visible-yet-unseen grid, we create an environment that feels premium, authoritative, and futuristic.

## 2. Colors
The palette is a sophisticated interplay of grayscale tones punctuated by a singular, high-vibrancy kinetic blue.

*   **Primary Accent (`#0053db`):** Use this "Electric Blue" sparingly. It is a beacon for interaction and focus.
*   **Neutral Foundation:** A range of grays from `surface` (`#f9f9f9`) to `on_surface` (`#2d3435`).
*   **The "No-Line" Rule:** To maintain an editorial feel, **prohibit 1px solid borders for sectioning.** Boundaries must be defined through background color shifts. For instance, a `surface_container_low` section should sit against a `surface` background to denote a change in context.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of industrial material.
    *   `surface_container_lowest`: Use for the most prominent foreground cards or elements to create a subtle "lift."
    *   `surface_container_highest`: Use for deep, inset areas or secondary sidebars.
*   **The "Glass & Gradient" Rule:** While the base is brutalist, we introduce "futuristic" polish through Glassmorphism. Use semi-transparent versions of `surface_container` with a `backdrop-blur` of 20px-40px for floating navigation or overlay elements.
*   **Signature Textures:** For Hero sections or primary CTAs, apply a subtle linear gradient from `primary` (`#0053db`) to `primary_dim` (`#0048c1`) to add depth and "soul" that a flat hex code lacks.

## 3. Typography
The typography is the architecture of the system. We use **Inter** as a Swiss-inspired variable face to achieve an editorial, high-fashion look.

*   **Display Scale (`display-lg` at 3.5rem):** Reserved for page titles and hero statements. Use tight letter-spacing (-0.02em) and Semi-Bold weights to create a "wall of text" effect.
*   **Headline Scale (`headline-lg` to `headline-sm`):** Used to introduce new grid sections. These should often be placed in asymmetrical positions (e.g., top-left of a container while content is bottom-right).
*   **Body & Labels:** `body-md` (`0.875rem`) handles the bulk of information. Use `label-md` in all-caps with increased letter-spacing (+0.05em) for metadata or small eyebrow titles to mimic architectural blueprints.
*   **Visual Hierarchy:** Establish dominance through extreme scale contrast. A `display-lg` title next to a `body-sm` caption creates the "Editorial" tension required for a premium feel.

## 4. Elevation & Depth
In this system, we reject traditional drop shadows in favor of **Tonal Layering** and **Atmospheric Depth.**

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface_container_lowest` object on top of a `surface_container` background. The slight shift in hex value provides a cleaner, more modern separation than a stroke.
*   **Ambient Shadows:** If an element must "float" (like a modal or a primary action button), use an ultra-diffused shadow: `box-shadow: 0 20px 50px rgba(0, 83, 219, 0.08)`. The shadow should be tinted with the `primary` color to feel like light refracting through a lens.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **10% opacity**. It should be felt, not seen.
*   **Sharp Edges:** All `border-radius` tokens are strictly **0px**. Every element—buttons, images, inputs, and cards—must maintain sharp, architectural corners.

## 5. Components
Consistency in the "Monolith" style requires components that feel integrated into the grid.

*   **Buttons:**
    *   **Primary:** Solid `primary` background, `on_primary` text. No rounded corners. Large padding (e.g., `spacing-4` horizontally).
    *   **Tertiary:** Text-only with a thick 2px underline that appears on hover, using the `primary` color.
*   **Input Fields:** Use a `surface_variant` background with a bottom-only border. Labels should use `label-sm` and sit above the field in all-caps.
*   **Cards:** Forbid divider lines. Use `spacing-16` (5.5rem) of vertical whitespace or a tonal shift to `surface_container_low` to separate items in a list.
*   **Image Containers:** Images should be treated as structural elements. Use black and white photography or high-contrast treatments to match the palette.
*   **Custom Component - The "Grid Guide":** For a futuristic feel, occasionally allow thin, low-opacity (5%) vertical grid lines to be visible in the background, reinforcing the "structured" nature of the portfolio.

## 6. Do's and Don'ts

### Do:
*   **Embrace Whitespace:** If you think there is enough space, double it. Use `spacing-24` (8.5rem) between major sections.
*   **Align to the Grid:** Every element must snap to a strict 12-column grid. Misalignment is the enemy of this system.
*   **Use Bold Imagery:** Use large, full-bleed images that intersect with typography to create a layered, "collage" effect.

### Don't:
*   **No Rounded Corners:** Never use `border-radius`. It breaks the brutalist, futuristic aesthetic.
*   **No Generic Shadows:** Avoid "out-of-the-box" black shadows. They look cheap and dated.
*   **No Busy Patterns:** Avoid complex textures or icons. Stick to geometric shapes and high-quality typography.
*   **No 1px Borders:** Avoid "boxing in" content. Let the content breathe and define its own boundaries through alignment and tone.