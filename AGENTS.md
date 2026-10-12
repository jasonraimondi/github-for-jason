# AGENTS.md

Manifest V3 Chrome extension for github.com, written in plain JavaScript with no build step. Use the vocabulary in `GLOSSARY.md`.

## Code

- Content scripts (`pulls.js`, `content.js`) are classic scripts: they share one global scope, so keep them free of `import`/`export` and give top-level names distinct across files. Extension pages (`options.js`) load as ES modules.
- Types are strict JSDoc, checked by `tsc` across every `.js` file at once. Chrome APIs return storage values as `unknown`; cast them with a JSDoc `@type` at the read site.
- GitHub navigates client-side, so a content script runs only on full page loads. React to later page changes through the `navigation` API or a `MutationObserver`, as `pulls.js` does.
- User settings live in `chrome.storage.sync`, written only by the options page.

## Verify

1. `pnpm typecheck` passes.
2. Reload the unpacked extension in `chrome://extensions` and exercise the change on github.com, including a client-side navigation into the affected page.
