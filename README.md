# Storage Fleet — a space atlas

[Public demo](https://newdarwindev.github.io/storage-fleet-demo/) · [Desktop & mobile videos](https://newdarwindev.github.io/storage-fleet-demo/evidence/) · [Quality and publishing](https://github.com/newdarwindev/storage-fleet-demo/actions/workflows/pages.yml)

An original, restrained storage visualization for **eight fictional computers**: three Windows, three Linux and two macOS. Fleet-wide comparisons use a common percentage scale. The disk map represents each folder's share of total capacity by angle, with an outer marker for simulated cleanup candidates. A numerical legend and file table accompany the chart; color is never the only source of information.

Select a machine, inspect a ring segment or folder, select candidates, review the projected free space and confirm a **simulation**. Cancel/Escape leaves data unchanged. Undo restores the last cleanup across the fleet; Reset and reload restore all fixtures. Protected records cannot be selected. GB and TB are decimal units. “Attention” means strictly less than 15% available, before display rounding. OS filtering does not alter fleet totals.

## Safety boundary

No agents, actual filesystem access, deletion, backend, analytics, credentials, external assets, or application network requests. All fixtures are newly authored synthetic records. State lives only in memory. Candidate labels are illustrative, not advice for deleting actual files. The build and video tooling are development-only dependencies, not remote runtime services.

## Local checks

Node 22+ and npm:

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:ui
npm run evidence
npm run preview
```

`npm run check` runs zero-warning ESLint (complexity ≤8), formatting, strict JavaScript type checking, regression tests and the Vite production build. The compatibility command `node test.cjs` runs model tests. The UI tests serve **the built `dist` output**, not Vite's development server, and exercise real Chromium desktop/mobile interactions. Browser installation requires a supported environment; a blocked launch must be reported, never bypassed.

## Evidence and publishing

Playwright retains real videos for successful and failed scenarios, with screenshots of the redesign. CI uploads `test-results/` and `playwright-report/` even when tests fail; artifacts are retained for 14 days. Successful runs build a public [video gallery](https://newdarwindev.github.io/storage-fleet-demo/evidence/) identifying the deployed commit. These are interaction assertions and reviewable recordings, **not pixel-diff regression tests or an accessibility conformance certification**.

The SHA-pinned official Pages workflow validates pull requests and branch dispatches. Only trusted `main` pushes/dispatches publish, and only after quality and production UI checks pass. Repository read access is the default; only deployment receives Pages-write and OIDC-token permissions. No changes to account permissions or repository access are needed.

After visual changes, follow `AGENTS.md`: review synthetic desktop/mobile recordings and deliver them with SHA and CI evidence to the specified Slack thread via the authorized sender. Never publish private sessions or replace video evidence with a fabricated animation.

## Design references

This is an original layout and implementation, not copied product artwork or code, and has no affiliation with these products. The design uses restrained annotation, aligned numeric comparisons and low decorative density; its disk-map interaction is informed by:

- [GNOME Disk Usage Analyzer — chart views](https://help.gnome.org/baobab/pref-view-chart.html): proportional folder rings and chart navigation.
- [DaisyDisk — understanding the disk map](https://web.daisydiskapp.com/guide/4/en/UnderstandingSunburst): proportional segments and inspection/navigation.
- [GitHub — custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
