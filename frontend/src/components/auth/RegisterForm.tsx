"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { normalizeApiError } from "@/lib/api-errors";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      workspaceName: String(formData.get("workspaceName") ?? "")
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json();
      setError(normalizeApiError(body.error, "Registration failed"));
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false
    });
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="app-label" htmlFor="reg-name">
          Full name
        </label>
        <input id="reg-name" name="name" placeholder="Alex Morgan" className="app-input" required />
      </div>
      <div>
        <label className="app-label" htmlFor="reg-workspace">
          Workspace <span className="font-normal normal-case text-zinc-600">(optional)</span>
        </label>
        <input
          id="reg-workspace"
          name="workspaceName"
          placeholder="Acme Team"
          className="app-input"
        />
      </div>
      <div>
        <label className="app-label" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="app-input"
          required
        />
      </div>
      <div>
        <label className="app-label" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className="app-input"
          required
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="app-btn-primary mt-2" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
