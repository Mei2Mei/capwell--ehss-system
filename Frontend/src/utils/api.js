const BASE_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("ehss_token");
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired or invalid, log out
  if (res.status === 401) {
    localStorage.removeItem("ehss_token");
    localStorage.removeItem("ehss_user");
    window.location.reload();
  }

  return res;
}

export default apiFetch;