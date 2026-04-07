"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
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
      setError(body.error ?? "Registration failed");
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
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6">
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl bg-slate-900 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Create your workspace</h1>
        <input name="name" placeholder="Your name" className="w-full rounded bg-slate-800 p-3" required />
        <input
          name="workspaceName"
          placeholder="Workspace name (optional)"
          className="w-full rounded bg-slate-800 p-3"
        />
        <input name="email" type="email" placeholder="Email" className="w-full rounded bg-slate-800 p-3" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded bg-slate-800 p-3"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="w-full rounded bg-blue-600 p-3 font-medium hover:bg-blue-500" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
