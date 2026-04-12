async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token && state.token !== 'demo-token') headers['Authorization'] = 'Bearer ' + state.token;
  let res;
  try {
    res = await fetch(API_BASE + path, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
  } catch (err) {
    throw new Error('Network error. Please check your connection and try again.');
  }
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }
  if (!res.ok) {
    if (res.status === 401 && state.token && state.token !== 'demo-token') {
      handleAuthExpired(data.error || 'Session expired. Please sign in again.');
    }
    if (DEMO_MODE && (path === '/auth/login' || path === '/auth/register')) {
      throw new Error('Demo mode: ' + (data.error || 'API unavailable'));
    }
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

function handleAuthExpired(message) {
  doLogout();
  showAlert('auth-alert', message || 'Session expired. Please sign in again.', 'danger');
}

function handleApiError(err, alertId, fallbackMessage) {
  const msg = (err && err.message) ? err.message : (fallbackMessage || 'Request failed.');
  showAlert(alertId, msg, 'danger');
}