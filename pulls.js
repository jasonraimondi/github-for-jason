const DEFAULT_QUERY =
  "is:pr is:open (assignee:jasonraimondi OR user-review-requested:jasonraimondi)";
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
  Object.assign(button.style, {
    position: "absolute",
    right: "calc(100% + 16px)",
    top: "0",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid var(--borderColor-default)",
    background: "var(--bgColor-muted)",
    color: "var(--fgColor-muted)",
    cursor: "pointer",
  });
  button.addEventListener("click", () => {
    const query = isDefaultQueryActive() ? GITHUB_DEFAULT_QUERY : DEFAULT_QUERY;
    location.assign(urlWithQuery(query));
  });
  return button;
}

/** @param {HTMLElement} button */
function renderToggleButton(button) {
  const active = isDefaultQueryActive();
  const icon = active ? "✕" : "↺";
  const label = active ? "Show all pull requests" : "Show my pull requests";
  // Rewriting identical text still emits a childList mutation, which would re-trigger the observer forever.
  if (button.textContent !== icon) button.textContent = icon;
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
  search.style.position = "relative";
  search.append(button);
}

applyDefaultQuery();
// GitHub switches pages client-side, so a content script only runs on full loads.
navigation.addEventListener("currententrychange", applyDefaultQuery);
new MutationObserver(syncToggleButton).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
