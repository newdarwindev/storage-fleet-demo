# Public demo quality contract

These instructions apply to this repository and demos created from this template.
They do not change the owner's global defaults or authorize changes to other repositories.

1. Add and maintain strict linters for every implementation language. JavaScript uses
   ESLint with **cyclomatic complexity <= 8**, maximum nesting 3, parameters 3,
   and function length 55 nonblank/noncomment lines. Treat warnings as failures.
   Keep formatting checks, strict type checking, and focused unit tests. Do not
   silence checks, increase budgets, or remove tests merely to make CI green.
2. For a one-page web app, retain a working GitHub Pages publishing action. Use
   relative asset URLs so project-path hosting works. Deploy only trusted default
   branch pushes after quality and UI tests pass. Use minimal job permissions.
3. For every testable UI or TUI, add CI that exercises real user interactions,
   records visual evidence, uploads it even when tests fail, and exposes the
   recording/report path in README. Successful tests must retain videos too.
   Browser UI: Playwright `video: 'on'`; include mobile and desktop coverage.
   TUI: add a deterministic terminal scenario and render a recording to WebM/MP4
   (or GIF) using an appropriate recorder; see docs/tui-recordings.md. A text log
   or cast alone is not a visual video. This starter has no TUI to record.
4. Never publish secrets, personal information, private source, or real customer
   fixtures. Only public/new demo materials belong here. Review recordings before
   publication; use synthetic fixtures and no authenticated personal sessions.
5. Before reporting completion, run `npm ci`, `npm run check`, `npm run test:ui`,
   and `npm run evidence`; verify exact-commit CI, artifact existence, and the
   public Pages URL. Distinguish local checks from remote checks. Never claim
   pixel regression testing: these are interaction tests with visual recordings.
6. Update README identity links when generating a new repository. Do not change
   unrelated repos, account defaults, permissions, or paid services without
   separate authorization. Preserve locked dependencies and SHA-pinned actions.

## Storage Fleet visual-change delivery

After every authorized visual change, run the strict checks and production-build
UI tests at desktop and mobile sizes. Keep real Playwright videos for passing and
failing runs, inspect the resulting screenshots and videos, and publish only
synthetic-fixture recordings. Post the reviewed video links or attachments with
commit SHA, CI run and concise coverage to Slack channel `C0CCQG7F9E3`, thread
`1793271339.287939`, through an authorized sender. If a parent task owns Slack
delivery, return that exact evidence bundle to it instead of double-posting.
A log, screenshot, fabricated animation, or unreviewed video is not a substitute
for a real interaction recording. Report blocked checks honestly. Never use real
filesystem data, personal browser sessions, credentials, or actual deletion.
