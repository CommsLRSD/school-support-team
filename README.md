# School &amp; Classroom Support Team (SCST)

An interactive, public-facing web app for the **Louis Riel School Division's School and Classroom Support Team**. It helps the general public and internal staff understand the team's role, the support available, who is responsible for what, and who to contact.

The content is drawn from _School and Classroom Support Team DRAFT.docx_.

## Features

- **Modern, responsive single-page site** — works on phones, tablets, and desktops.
- **Interactive tier explorer** — explore Universal (Tier 1), Targeted (Tier 2), and Intensive (Tier 3) support.
- **Searchable, filterable team directory** — search by name or role, or filter by any of the six areas of support, with click-to-open bios.
- **Six integrated areas** — Leadership, Instructional Support, Student Support Services, Indigenous Education, Clinical Services, and Specialized Supports.
- **Equity support model, data sources, and "Looking Ahead"** sections that mirror the source document.
- **Accessible** — semantic landmarks, keyboard-navigable modal, skip link, focus styles, scroll-spy navigation, and reduced-motion support.

## Project structure

```
index.html              Page markup and section scaffolding
assets/css/styles.css   All styling (design tokens, layout, components)
assets/js/data.js       Structured content (team, tiers, areas, bios)
assets/js/app.js        Rendering and interactivity (no framework, no build step)
```

## Running locally

No build step or dependencies are required — it is a static site. Serve the folder with any static web server, for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Updating content

All text, team members, roles, and bios live in `assets/js/data.js`. Edit that file to add or update people, areas, tiers, or copy — the page re-renders from it automatically. No changes to the HTML or JavaScript logic are needed for routine content updates.
