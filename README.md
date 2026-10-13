# GitHub for Jason

A personal Chrome extension that tweaks github.com.

## Features

### My PRs filter

On enabled repos, the pull request list opens filtered to open PRs you authored, are assigned to, or are asked to review. An avatar button beside the search box toggles back to GitHub's default list.

<img src="docs/my-prs-filter.png" width="640" alt="The avatar toggle beside a pull request search filtered to my PRs">

### Stack colors

In any repo's pull request list, each stacked PR's stack badge (icon and `1/2` count) becomes a colored pill. PRs in the same stack share a color, and different stacks on the page get different colors.

<img src="docs/stack-colors.png" width="640" alt="Two stacks in the pull request list, each with its own pill color showing the PR's position in the stack">

## Install

1. Open `chrome://extensions` and turn on Developer mode.
2. Click **Load unpacked** and choose this folder.
3. Right-click the extension → **Options**, and add the owners (`jasonraimondi`) or repos (`jasonraimondi/github-for-jason`) where the filter applies, one per line.

## Develop

There is no build step; Chrome loads the files as they are. After editing, reload the extension in `chrome://extensions`.

```sh
pnpm install
pnpm typecheck
```

The stack color palette is `STACK_COLORS` in `pulls.js`; any CSS color works.
