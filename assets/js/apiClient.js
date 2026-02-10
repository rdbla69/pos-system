// Simple API client (JSON scaffold) - swap endpoints to your DB later.
// All endpoints respond with: { ok: boolean, data: any, error: string|null }

window.Api = {
  base: '/pos-system/api',

  async request(path, { method = 'GET', body = null } = {}) {
    const opts = { method, headers: {} };
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${this.base}/${path}`, opts);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || payload.ok === false) {
      const msg = payload.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return payload.data;
  },

  get(path) {
    return this.request(path, { method: 'GET' });
  },
  post(path, body) {
    return this.request(path, { method: 'POST', body });
  },
  put(path, body) {
    return this.request(path, { method: 'PUT', body });
  },
  del(path) {
    return this.request(path, { method: 'DELETE' });
  }
};
