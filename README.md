# Storage Fleet

A dependency-free, one-page interactive storage dashboard for eight **fictional** computers: three Windows, three Linux, and two macOS machines.

**[Open the public demo](https://newdarwindev.github.io/storage-fleet-demo/)**

## Explore

- Fleet capacity, free space, cleanup opportunity, and low-space alerts.
- Select machines, filter operating systems, and browse mock folders.
- Select demo candidates, preview reclaimed space, and confirm simulated cleanup.
- Protected records cannot be selected. Undo cleanups or reset the entire demo.
- Responsive layout, semantic controls, keyboard focus states, native confirmation dialog, and live status announcements.

## Safety boundary

All data is newly created fictional demo data. There are **no device agents, credentials, real filesystem access, file deletion, backend, analytics, external assets, or application network requests**. Simulations exist only in page memory; reloading resets them. Candidate classifications are illustrative, not advice for deleting actual files. GB/TB use decimal units.

## Run and test

Open `index.html` directly, or serve this directory with any static HTTP server. No build or dependency installation is required.

```sh
node test.cjs
```

The dependency-free test uses a minimal DOM harness to exercise all eight hosts, totals, protected records, selections, preview cancellation, simulation, repeated confirmation, undo, OS filtering, empty folders, and reset. This is logic coverage, not a substitute for browser/accessibility testing.

## Publishing

`.github/workflows/pages.yml` runs tests and publishes `index.html` using GitHub's official `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions. Pushes to `main` and manual workflow dispatch trigger it. The build has read-only repository access; only the deployment job receives Pages-write and OIDC-token permissions. No long-lived deployment secrets are needed.

The repository's Pages source must be **GitHub Actions**. Only the staged `_site` folder is published, not tests or repository metadata.

Reference: [GitHub — custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
