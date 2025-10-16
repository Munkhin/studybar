// src/config.ts
// Dynamically determine API base URL for local and Codespace environments
const getApiBaseUrl = () => {
  // In development, if we're in a Codespace (hostname contains github.dev)
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    // Replace the port in the current URL with 5000
    const protocol = window.location.protocol;
    const hostname = window.location.hostname.replace(/-8080\./, '-5000.');
    return `${protocol}//${hostname}`;
  }
  // Default to localhost
  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();
