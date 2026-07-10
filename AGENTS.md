# AGENTS.md

## Cursor Cloud specific instructions

### Product
`lonelyme` is a single static marketing/landing page ("LonelyMe — Safe Global Friends & Chats"). The whole product is one file: `index.html`. There is no backend, build step, database, or package manager. Styling/icons come from CDNs (Tailwind via `cdn.tailwindcss.com`, Font Awesome via cdnjs) and placeholder images from `picsum.photos`, so internet access is needed for the page to render fully.

### Where the code lives (non-obvious)
The actual `index.html` is currently only on the `cursor/lonelyme-landing-page-f8b2` branch. The `main` branch contains only a placeholder `README.md`. If `index.html` is missing from the working tree, fetch/check out that branch (or `git show origin/cursor/lonelyme-landing-page-f8b2:index.html`).

### Running it (dev)
No install is required. Serve the directory containing `index.html` with any static server and open it in a browser, e.g.:
- `python3 -m http.server 8000` then visit `http://localhost:8000/index.html`

There is no lint/test/build tooling configured in this repo; "testing" is opening the page and visually verifying it (and the waitlist form `alert()` on submit).
