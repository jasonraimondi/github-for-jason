const ENABLED_REPOS_KEY = "enabledRepos";
const GITHUB_URL_PREFIX = /^https?:\/\/github\.com\//;
const ENTRY = /^[a-z0-9-]+(\/[a-z0-9._-]+)?$/;

const form = /** @type {HTMLFormElement} */ (document.getElementById("enabled-repos-form"));
const textarea = /** @type {HTMLTextAreaElement} */ (document.getElementById("enabled-repos"));
const status = /** @type {HTMLOutputElement} */ (document.getElementById("status"));
const invalidList = /** @type {HTMLUListElement} */ (document.getElementById("invalid-entries"));

/** @param {string} text */
export function parseEntries(text) {
  /** @type {string[]} */
  const entries = [];
  /** @type {string[]} */
  const invalid = [];
  for (const line of text.split("\n")) {
    const entry = line.trim().toLowerCase().replace(GITHUB_URL_PREFIX, "").replace(/\/$/, "");
    if (!entry) continue;
    if (ENTRY.test(entry)) entries.push(entry);
    else invalid.push(line.trim());
  }
  return { entries, invalid };
}

/** @param {string} line */
function createInvalidItem(line) {
  const item = document.createElement("li");
  item.textContent = line;
  return item;
}

chrome.storage.sync.get(ENABLED_REPOS_KEY).then((items) => {
  const enabledRepos = /** @type {string[] | undefined} */ (items[ENABLED_REPOS_KEY]) ?? [];
  textarea.value = enabledRepos.join("\n");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { entries, invalid } = parseEntries(textarea.value);
  invalidList.replaceChildren(...invalid.map(createInvalidItem));
  if (invalid.length > 0) {
    status.value = "Not saved. Fix these lines:";
    return;
  }
  await chrome.storage.sync.set({ [ENABLED_REPOS_KEY]: entries });
  textarea.value = entries.join("\n");
  status.value = "Saved";
});
