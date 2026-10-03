export function getUid() {
  let u = localStorage.getItem("krishi-uid");
  if (!u) { u = (crypto.randomUUID && crypto.randomUUID()) || Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("krishi-uid", u); }
  return u;
}
export const bn = (n, o) => Number(n).toLocaleString("bn-BD", o);
export const getPosition = () => new Promise((ok) => {
  if (!navigator.geolocation) return ok(null);
  navigator.geolocation.getCurrentPosition((p) => ok({ lat: p.coords.latitude, lon: p.coords.longitude }), () => ok(null), { timeout: 5000 });
});
export async function api(path, opts) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || "সমস্যা হয়েছে, আবার চেষ্টা করুন"), { status: r.status });
  return j;
}
