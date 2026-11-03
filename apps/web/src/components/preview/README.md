# CV preview

`<CvPreview data={cv} />` renders a `CvData` object (see `libs/shared/src/types.ts`) as the A4 CV, matching `v3.html`.

- **Props.** A component is a function that receives one object, its props. `CvPreview` takes `{ data }` and returns JSX. It keeps no state: when the editor passes new `data`, React calls the function again and updates only the DOM that changed.
- **Small sub-components.** `Sidebar`, `JobBlock`, `BulletGroupBlock` and `HighlightBox` live in the same file. Each one gets only the props it needs, so every piece is short and easy to read.
- **Arrays to JSX.** Lists are written as `items.filter(x => !x.hidden).map(x => <li key={x.id}>...</li>)`. `filter` drops hidden items and `map` turns each remaining item into an element.
- **Keys.** Each element made by `map` needs a `key` that stays unique and stable among its siblings. We use the item's `id` rather than its array index, so React can still match items to their DOM nodes after you reorder them in the editor.
- **Conditional rendering.** `{job.highlight && <HighlightBox ... />}` renders the box only when the value is truthy. A component can also `return null` to render nothing. `BulletGroupBlock` does this when all of its bullets are hidden.
- **Fragments.** `<>...</>`, or `<Fragment key=...>` when a key is needed, groups siblings without adding a DOM element. We use one for the page-break div that comes before a job.
- **Markup.** `Markup.tsx` splits text on `**bold**` and returns React nodes: `<strong>` for the bold parts and plain strings for the rest. React escapes strings, so this is safe without `dangerouslySetInnerHTML`.
- **Scoped CSS.** `cv.css` is global CSS, like all plain CSS imported in Vite. Every selector starts with `.cv-root`, and the CSS variables are defined on `.cv-root`. This keeps generic class names such as `.page`, `.tag` and `.content` from styling the rest of the dashboard.
- **Print.** `@page { size: A4; margin: 0 }` and the `@media print` block remove the shadow and margins. `print-color-adjust: exact` keeps the dark sidebar when printing. `.page` is exactly 210mm wide, so the preview matches the paper.
