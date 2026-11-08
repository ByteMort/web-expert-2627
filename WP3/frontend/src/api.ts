export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const details = Array.isArray(body?.data)
      ? body.data.map((d: { field: string; message: string }) => `${d.field} ${d.message}`).join(', ')
      : '';
    throw new Error(details || body?.message || 'Request failed');
  }

  return body as T;
}
