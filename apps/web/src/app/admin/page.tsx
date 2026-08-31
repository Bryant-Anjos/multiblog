"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, login } from "@/lib/admin";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (typeof window !== "undefined" && getToken()) {
    router.replace("/admin/sites");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      router.replace("/admin/sites");
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login" onSubmit={handleSubmit}>
      <h1>Multiblog Admin</h1>
      {error && <p className="error-msg">{error}</p>}
      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        aria-label="Admin password"
      />
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
