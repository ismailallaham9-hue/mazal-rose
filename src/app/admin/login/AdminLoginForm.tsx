"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("That password did not work.");
      return;
    }
    router.replace(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5">
      <div>
        <label
          htmlFor="password"
          className="text-xs uppercase tracking-[0.18em] text-ink-soft"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-2 w-full border border-sand-deep bg-cream-soft px-4 py-3 text-ink outline-none transition-colors focus:border-bronze"
          required
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink px-5 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-opacity disabled:opacity-60"
      >
        {loading ? "Opening..." : "Open admin"}
      </button>
    </form>
  );
}
