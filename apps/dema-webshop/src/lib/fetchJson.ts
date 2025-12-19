/**
 * Safely fetch and parse JSON with proper error handling
 * Validates response status and content-type before parsing
 */
export async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON response but got ${contentType || 'unknown content-type'}`);
  }
  
  return response.json();
}

/**
 * Safely fetch JSON with Promise chaining style
 * Use this for .then() chains to maintain backwards compatibility
 */
export function fetchJsonSafe(url: string, options?: RequestInit): Promise<any> {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      return response.json();
    });
}
