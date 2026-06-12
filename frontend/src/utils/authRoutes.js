/** Map app routes to the correct login page and post-login home. */

export function getLoginPathForRoute(pathname = '') {
  if (pathname.startsWith('/agent')) return '/agent-login';
  if (pathname.startsWith('/admin')) return '/admin-login';
  if (pathname.startsWith('/owner')) return '/owner-login';
  return '/login';
}

export function getHomePathForRole(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return '/admin';
  if (r === 'owner') return '/owner/dashboard';
  if (r === 'agent') return '/agent';
  return '/';
}
