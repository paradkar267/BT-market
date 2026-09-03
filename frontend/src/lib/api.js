// Unified API client for Bizleap Marketplace (Neon + Express Backend)

const getAuthToken = () => {
  try {
    return localStorage.getItem('bizleap_token');
  } catch {
    return null;
  }
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const rawBackend = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
  const backendBase = rawBackend ? rawBackend.replace(/\/$/, '') : '';
  const url = endpoint.startsWith('http') ? endpoint : `${backendBase}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText || 'Request failed' };
    }
    const error = new Error(errorData.error || errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

export const api = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, options) => request(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};

export default api;
