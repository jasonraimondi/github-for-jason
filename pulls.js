const DEFAULT_QUERY = "is:pr is:open (assignee:@me OR user-review-requested:@me)";
const GITHUB_DEFAULT_QUERY = "is:pr is:open";
const ORG_PULLS_PATH = /^\/jasonraimondi\/[^/]+\/pulls\/?$/;
const SEARCH_INPUT_ID = "repo-pulls-dashboard-filter-input";
const TOGGLE_BUTTON_ID = "github-for-jason-toggle-query";

/** @param {string} query */
function urlWithQuery(query) {
  const url = new URL(location.href);
  url.searchParams.set("q", query);
  return url;
}

function isDefaultQueryActive() {
  return new URLSearchParams(location.search).get("q") === DEFAULT_QUERY;
}

function applyDefaultQuery() {
  const params = new URLSearchParams(location.search);
  if (!ORG_PULLS_PATH.test(location.pathname) || params.has("q")) return;
  location.replace(urlWithQuery(DEFAULT_QUERY));
}

function createToggleButton() {
  const button = document.createElement("button");
  button.id = TOGGLE_BUTTON_ID;
  button.type = "button";
  button.addEventListener("click", () => {
    const query = isDefaultQueryActive() ? GITHUB_DEFAULT_QUERY : DEFAULT_QUERY;
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
  const active = isDefaultQueryActive();
  const label = active ? "Show all pull requests" : "Show my pull requests";
  button.dataset.state = active ? "active" : "inactive";
  button.title = label;
  button.setAttribute("aria-label", label);
}

function syncToggleButton() {
  const existing = document.getElementById(TOGGLE_BUTTON_ID);
  if (!ORG_PULLS_PATH.test(location.pathname)) {
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

applyDefaultQuery();
// GitHub switches pages client-side, so a content script only runs on full loads.
navigation.addEventListener("currententrychange", applyDefaultQuery);
new MutationObserver(syncToggleButton).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
