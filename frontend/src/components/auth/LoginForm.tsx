"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl bg-slate-900 p-6 shadow-xl">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <input name="email" type="email" placeholder="Email" className="w-full rounded bg-slate-800 p-3" required />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full rounded bg-slate-800 p-3"
        required
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" className="w-full rounded bg-blue-600 p-3 font-medium hover:bg-blue-500" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <a href="/register" className="block text-center text-sm text-slate-300 hover:text-white">
        Create account
      </a>
    </form>
  );
}
