const TN_API_BASE = 'https://titik-ngemil-api.titik-ngemil-v2.workers.dev';

async function tnApi(path, options = {}) {
  const token = localStorage.getItem('tn_auth_token');
  const response = await fetch(`${TN_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Permintaan gagal. Silakan coba lagi.');
  return data;
}
