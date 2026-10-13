const MY_PRS_QUERY = "is:pr is:open (assignee:@me OR user-review-requested:@me OR author:@me)";
const GITHUB_DEFAULT_QUERY = "is:pr is:open";
const PULLS_PATH = /^\/([^/]+)\/([^/]+)\/pulls\/?$/;
const ENABLED_REPOS_KEY = "enabledRepos";
const SEARCH_INPUT_ID = "repo-pulls-dashboard-filter-input";
const TOGGLE_BUTTON_ID = "github-for-jason-toggle-query";
const STACK_BADGE_SELECTOR = 'button[aria-label^="Pull request stack"]';
const PULL_PATH = /^\/[^/]+\/[^/]+\/pull\/\d+$/;
/** @type {[string, ...string[]]} */
const STACK_COLORS = [
  "oklch(63.7% 0.237 25.331)",  // red
  "oklch(70.5% 0.213 47.604)",  // orange
  "oklch(76.9% 0.188 70.08)",   // amber
  "oklch(79.5% 0.184 86.047)",  // yellow
  "oklch(76.8% 0.233 130.85)",  // lime
  "oklch(72.3% 0.219 149.579)", // green
  "oklch(69.6% 0.17 162.48)",   // emerald
  "oklch(70.4% 0.14 182.503)",  // teal
  "oklch(71.5% 0.143 215.221)", // cyan
  "oklch(68.5% 0.169 237.323)", // sky
  "oklch(62.3% 0.214 259.815)", // blue
  "oklch(58.5% 0.233 277.117)", // indigo
  "oklch(60.6% 0.25 292.717)",  // violet
  "oklch(62.7% 0.265 303.9)",   // purple
  "oklch(66.7% 0.295 322.15)",  // fuchsia
  "oklch(65.6% 0.241 354.308)", // pink
  "oklch(64.5% 0.246 16.439)",  // rose
];

/** @typedef {{ stack: { number: number, repositoryOwnerLogin: string, repositoryName: string, pulls: { number: number }[] } }} StackPageData */

/** @type {string[] | undefined} */
let enabledRepos;
/** @type {Map<string, Promise<string | null>>} */
const stackKeysByPullPath = new Map();

/** @param {string} pathname */
function isEnabledPullsPage(pathname) {
  const match = PULLS_PATH.exec(pathname.toLowerCase());
  if (!match || !enabledRepos) return false;
  if (enabledRepos.length === 0) return true;
  const [, owner, repo] = match;
  return enabledRepos.some((entry) => entry === owner || entry === `${owner}/${repo}`);
}

/** @param {string} query */
function urlWithQuery(query) {
  const url = new URL(location.href);
  url.searchParams.set("q", query);
  return url;
}

function isMyPrsQueryActive() {
  return new URLSearchParams(location.search).get("q") === MY_PRS_QUERY;
}

function applyMyPrsQuery() {
  const params = new URLSearchParams(location.search);
  if (!isEnabledPullsPage(location.pathname) || params.has("q")) return;
  location.replace(urlWithQuery(MY_PRS_QUERY));
}

function createToggleButton() {
  const button = document.createElement("button");
  button.id = TOGGLE_BUTTON_ID;
  button.type = "button";
  button.addEventListener("click", () => {
    const query = isMyPrsQueryActive() ? GITHUB_DEFAULT_QUERY : MY_PRS_QUERY;
    location.assign(urlWithQuery(query));
  });
  button.append(createAvatar());
  return button;
}

function createAvatar() {
  const login = document.querySelector('meta[name="user-login"]')?.getAttribute("content");
  if (!login) return "↺";
  const avatar = document.createElement("img");
  avatar.src = `https://avatars.githubusercontent.com/${login}?s=64`;
  avatar.alt = "";
  return avatar;
}

/** @param {HTMLElement} button */
function renderToggleButton(button) {
  const active = isMyPrsQueryActive();
  const label = active ? "Show all pull requests" : "Show my pull requests";
  button.dataset.state = active ? "active" : "inactive";
  button.title = label;
  button.setAttribute("aria-label", label);
}

function syncToggleButton() {
  const existing = document.getElementById(TOGGLE_BUTTON_ID);
  if (!isEnabledPullsPage(location.pathname)) {
    existing?.remove();
    return;
  }
  if (existing) {
    renderToggleButton(existing);
    return;
  }
  const search = document.getElementById(SEARCH_INPUT_ID)?.closest("[role=search]");
  if (!(search instanceof HTMLElement)) return;
  const button = createToggleButton();
  renderToggleButton(button);
  search.append(button);
}

/** @param {string} pullPath */
function fetchStackKey(pullPath) {
  const cached = stackKeysByPullPath.get(pullPath);
  if (cached) return cached;
  const stackKey = fetch(`${pullPath}/page_data/stacks`, {
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data) return null;
      const { stack } = /** @type {StackPageData} */ (data);
      const repoPath = `/${stack.repositoryOwnerLogin}/${stack.repositoryName}`;
      const key = `${repoPath}#${stack.number}`;
      for (const pull of stack.pulls) {
        stackKeysByPullPath.set(`${repoPath}/pull/${pull.number}`, Promise.resolve(key));
      }
      return key;
    })
    .catch(() => null);
  stackKeysByPullPath.set(pullPath, stackKey);
  return stackKey;
}

/** @param {string} text */
function hashString(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** @param {string} stackKey */
function pickStackColor(stackKey) {
  const painted = [...document.querySelectorAll("[data-github-for-jason-stack-color]")].filter(
    (badge) => badge instanceof HTMLElement,
  );
  const sameStack = painted.find((badge) => badge.dataset.githubForJasonStack === stackKey);
  if (sameStack?.dataset.githubForJasonStackColor) return sameStack.dataset.githubForJasonStackColor;
  const taken = new Set(painted.map((badge) => badge.dataset.githubForJasonStackColor));
  const start = hashString(stackKey) % STACK_COLORS.length;
  const rotated = [...STACK_COLORS.slice(start), ...STACK_COLORS.slice(0, start)];
  return rotated.find((color) => !taken.has(color)) ?? STACK_COLORS[0];
}

/** @param {HTMLElement} badge */
async function paintStackBadge(badge) {
  badge.dataset.githubForJasonStack = "";
  const link = [...(badge.closest("li")?.querySelectorAll("a") ?? [])].find((a) =>
    PULL_PATH.test(a.pathname),
  );
  if (!link) return;
  const stackKey = await fetchStackKey(link.pathname);
  if (!stackKey) return;
  const color = pickStackColor(stackKey);
  badge.dataset.githubForJasonStack = stackKey;
  badge.dataset.githubForJasonStackColor = color;
  badge.style.setProperty("--github-for-jason-stack-color", color);
}

function paintStackBadges() {
  for (const badge of document.querySelectorAll(`${STACK_BADGE_SELECTOR}:not([data-github-for-jason-stack])`)) {
    if (badge instanceof HTMLElement) paintStackBadge(badge);
  }
}

chrome.storage.sync.get(ENABLED_REPOS_KEY).then((items) => {
  enabledRepos = /** @type {string[] | undefined} */ (items[ENABLED_REPOS_KEY]) ?? [];
  applyMyPrsQuery();
  syncToggleButton();
});
chrome.storage.onChanged.addListener((changes, area) => {
  const change = changes[ENABLED_REPOS_KEY];
  if (area !== "sync" || !change) return;
  enabledRepos = /** @type {string[] | undefined} */ (change.newValue) ?? [];
  syncToggleButton();
});
// GitHub switches pages client-side, so a content script only runs on full loads.
navigation.addEventListener("currententrychange", applyMyPrsQuery);
new MutationObserver(() => {
  syncToggleButton();
  paintStackBadges();
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
