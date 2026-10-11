# CECI MES Studio

Visual drag-and-drop builder for MES / HMI shop-floor kiosk terminals: design stations,
link them together, test as an operator, and publish. Projects are stored in the browser.

## Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server on port 3000    |
| `npm run build`   | Production build     |
| `npm run lint`    | Strict TypeScript check (`tsc`)      |
| `npm run preview` | Serve the production build           |

## Project layout

```
src/
  App.tsx                  Composition root (landing page ↔ studio, UI-only state)
  hooks/
    useProject.ts          Project state, persistence, station + component-tree edits
    useOperatorRuntime.ts  Test-run values, production logs, operator actions
    useToast.ts            Auto-dismissing toast message
  components/              UI panels (canvas, inspector, layers, pages, publish, ...)
  data/                    Component library, themes, station factory, sample project
  utils/                   Pure helpers: tree ops, link extraction, storage, HTML export
  types.ts                 Shared domain types
```
