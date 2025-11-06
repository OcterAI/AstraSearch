
const HISTORY_KEY = 'astra-search-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Gets the search history from localStorage.
 * @returns {string[]} An array of past search queries.
 */
export const getSearchHistory = (): string[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Could not parse search history:", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

/**
 * Adds a new item to the search history.
 * It avoids duplicates and keeps the list size managed.
 * @param {string} query The search query to add.
 */
export const addSearchHistoryItem = (query: string): void => {
  if (!query) return;
  const history = getSearchHistory();
  // Remove existing entry of the same query to move it to the top.
  const filteredHistory = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  // Add new query to the front.
  const newHistory = [query, ...filteredHistory];
  // Limit the history size.
  const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
};

/**
 * Clears the entire search history from localStorage.
 */
export const clearSearchHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};
