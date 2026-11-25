function base(env) {
  return String(env.SUPABASE_URL || '').replace(/\/$/, '');
}

function serviceHeaders(env, prefer) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
    'content-type': 'application/json'
  };
  if (prefer) headers.prefer = prefer;
  return headers;
}

export async function getUser(env, request, fetchImpl = fetch) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) return null;
  const res = await fetchImpl(base(env) + '/auth/v1/user', {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: 'Bearer ' + match[1]
    }
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user || !user.id) return null;
  return { id: user.id, email: typeof user.email === 'string' ? user.email : '' };
}

async function rest(env, fetchImpl, path, options) {
  const res = await fetchImpl(base(env) + '/rest/v1/' + path, options);
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = null; }
  }
  return { ok: res.ok, status: res.status, data };
}

export function dbFromEnv(env, fetchImpl = fetch) {
  return {
    async getProject(id) {
      const q = 'projects?id=eq.' + encodeURIComponent(id) + '&select=id,owner,name,edit_until,pdf_path';
      const res = await rest(env, fetchImpl, q, { headers: serviceHeaders(env) });
      if (!res.ok || !Array.isArray(res.data) || !res.data.length) return null;
      return res.data[0];
    },
    async insertProject(row) {
      const res = await rest(env, fetchImpl, 'projects', {
        method: 'POST',
        headers: serviceHeaders(env, 'return=representation'),
        body: JSON.stringify(row)
      });
      if (res.status === 409) return { conflict: true };
      if (!res.ok) return { error: 'Could not create the project.' };
      return { row: Array.isArray(res.data) ? res.data[0] : res.data };
    },
    async findEntitlement(sessionId) {
      const q = 'entitlements?stripe_session_id=eq.' + encodeURIComponent(sessionId) + '&select=id,edit_until,project_id';
      const res = await rest(env, fetchImpl, q, { headers: serviceHeaders(env) });
      if (!res.ok || !Array.isArray(res.data) || !res.data.length) return null;
      return res.data[0];
    },
    async insertEntitlement(row) {
      const res = await rest(env, fetchImpl, 'entitlements', {
        method: 'POST',
        headers: serviceHeaders(env, 'return=minimal'),
        body: JSON.stringify(row)
      });
      if (res.status === 409) return false;
      if (!res.ok) throw new Error('entitlement insert failed');
      return true;
    },
    async setEditUntil(projectId, editUntil) {
      const q = 'projects?id=eq.' + encodeURIComponent(projectId);
      const res = await rest(env, fetchImpl, q, {
        method: 'PATCH',
        headers: serviceHeaders(env, 'return=minimal'),
        body: JSON.stringify({ edit_until: editUntil })
      });
      if (!res.ok) throw new Error('edit window update failed');
    }
  };
}
