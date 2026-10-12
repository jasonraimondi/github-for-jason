const MY_PRS_QUERY = "is:pr is:open (assignee:@me OR user-review-requested:@me)";
const GITHUB_DEFAULT_QUERY = "is:pr is:open";
const PULLS_PATH = /^\/([^/]+)\/([^/]+)\/pulls\/?$/;
const ENABLED_REPOS_KEY = "enabledRepos";
const SEARCH_INPUT_ID = "repo-pulls-dashboard-filter-input";
const TOGGLE_BUTTON_ID = "github-for-jason-toggle-query";

/** @type {string[]} */
let enabledRepos = [];

/** @param {string} pathname */
function isEnabledPullsPage(pathname) {
  const match = PULLS_PATH.exec(pathname.toLowerCase());
  if (!match) return false;
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
new MutationObserver(syncToggleButton).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
