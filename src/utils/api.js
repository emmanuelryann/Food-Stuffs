const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let csrfToken = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API}/api/csrf-token`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch CSRF token');
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (err) {
    console.error('CSRF token fetch error:', err);
    return null;
  }
}

export function getCsrfToken() {
  return csrfToken;
}

/**
 * Authenticated fetch wrapper that auto-includes credentials and CSRF token.
 * For GET requests, only credentials are sent.
 * For mutating requests (POST, PATCH, PUT, DELETE), the CSRF token header is added.
 */
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const headers = { ...options.headers };

  // Add CSRF token for mutating requests
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  // If we get a 403 with CSRF error, try refreshing the token once and retry
  if (res.status === 403) {
    const errorData = await res.clone().json().catch(() => ({}));
    if (errorData.message?.toLowerCase().includes('csrf')) {
      await fetchCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
        const retryRes = await fetch(url, {
          ...options,
          credentials: 'include',
          headers,
        });
        const retryData = await retryRes.json();
        if (!retryRes.ok) throw new Error(retryData.message || 'Request failed');
        return retryData;
      }
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
