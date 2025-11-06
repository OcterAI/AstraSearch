
const SYSTEM_PROMPT_KEY = 'astra-system-prompt';

/**
 * The default system prompt. An empty string means no special instructions are sent.
 */
export const DEFAULT_SYSTEM_PROMPT = "You are Astra, a large language model trained by NarsAI-Labs.";

/**
 * Gets the system prompt from localStorage.
 * @returns {string} The stored system prompt or the default if not set.
 */
export const getSystemPrompt = (): string => {
  try {
    return localStorage.getItem(SYSTEM_PROMPT_KEY) ?? DEFAULT_SYSTEM_PROMPT;
  } catch (error) {
    console.error("Could not read system prompt from localStorage:", error);
    return DEFAULT_SYSTEM_PROMPT;
  }
};

/**
 * Saves the system prompt to localStorage.
 * @param {string} prompt The system prompt to save.
 */
export const setSystemPrompt = (prompt: string): void => {
  try {
    localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
  } catch (error) {
    console.error("Could not save system prompt to localStorage:", error);
  }
};

/**
 * Clears the system prompt from localStorage.
 */
export const clearSystemPrompt = (): void => {
  try {
    localStorage.removeItem(SYSTEM_PROMPT_KEY);
  } catch (error) {
    console.error("Could not clear system prompt from localStorage:", error);
  }
};