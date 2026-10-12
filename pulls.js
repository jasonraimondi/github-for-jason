const DEFAULT_QUERY =
  "is:pr is:open (assignee:jasonraimondi OR user-review-requested:jasonraimondi)";
const GITHUB_DEFAULT_QUERY = "is:pr is:open";
const ORG_PULLS_PATH = /^\/jasonraimondi\/[^/]+\/pulls\/?$/;
const SEARCH_INPUT_ID = "repo-pulls-dashboard-filter-input";
const RESET_BUTTON_ID = "github-for-jason-reset-query";

/** @param {string} query */
function urlWithQuery(query) {
  const url = new URL(location.href);
  url.searchParams.set("q", query);
  return url;
}

function applyDefaultQuery() {
  const params = new URLSearchParams(location.search);
  if (!ORG_PULLS_PATH.test(location.pathname) || params.has("q")) return;
  location.replace(urlWithQuery(DEFAULT_QUERY));
}

function createResetButton() {
  const button = document.createElement("button");
  button.id = RESET_BUTTON_ID;
  button.type = "button";
  button.textContent = "✕";
  button.title = "Show all pull requests";
  button.setAttribute("aria-label", "Show all pull requests");
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
    location.assign(urlWithQuery(GITHUB_DEFAULT_QUERY));
  });
  return button;
}

function syncResetButton() {
  const existing = document.getElementById(RESET_BUTTON_ID);
  const params = new URLSearchParams(location.search);
  const isDefaultView =
    ORG_PULLS_PATH.test(location.pathname) && params.get("q") === DEFAULT_QUERY;
  if (!isDefaultView) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const search = document.getElementById(SEARCH_INPUT_ID)?.closest("[role=search]");
  if (!(search instanceof HTMLElement)) return;
  search.style.position = "relative";
  search.append(createResetButton());
}

applyDefaultQuery();
// GitHub switches pages client-side, so a content script only runs on full loads.
navigation.addEventListener("currententrychange", applyDefaultQuery);
new MutationObserver(syncResetButton).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
