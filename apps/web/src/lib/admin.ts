// In production the API is served on the same origin by nginx (`/api/*` →
// the `api` container), so the default is a same-origin relative base. Set
// NEXT_PUBLIC_API_URL explicitly only when the API lives on another origin
// (e.g. local dev with the API on :8080).
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    throw new Error("unauthorized");
  }
  return res;
}

export async function login(password: string): Promise<void> {
  // /api/, matching main.go's registration — everything the API exposes
  // externally lives under /api/, since that is the one prefix nginx routes
  // to this container in production; a bare path falls through to the web
  // container's own 404 instead.
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Invalid password");
  const data = await res.json();
  setToken(data.token);
}
