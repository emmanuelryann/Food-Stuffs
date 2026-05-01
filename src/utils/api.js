export const API = import.meta.env.MODE === 'production' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

let csrfToken = null;

// Fetches a new CSRF token and stores it in memory
export const fetchCsrfToken = async () => {
  try {
    const res = await fetch(`${API}/api/csrf-token`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch CSRF token');
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (err) {
    console.error('Error fetching CSRF token:', err);
    return null;
  }
};

// Global fetch wrapper that attaches credentials and CSRF token
export const fetchWithAuth = async (url, options = {}) => {
  // Add credentials to all requests
  const authOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  };

  // If the request mutates state, attach the CSRF token
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // If we don't have a token, try to get one first
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    
    if (csrfToken) {
      authOptions.headers['x-csrf-token'] = csrfToken;
    }
  }

  const res = await fetch(url, authOptions);
  return res;
};

// Helper for making JSON requests
export const fetchJsonWithAuth = async (url, options = {}) => {
  const res = await fetchWithAuth(url, options);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
};
