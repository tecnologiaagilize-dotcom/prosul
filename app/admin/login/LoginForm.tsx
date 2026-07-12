"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const inputClass =
    "w-full bg-[var(--ink-panel)] border border-[var(--line)] rounded-sm px-4 py-2.5 text-[var(--text-on-dark)] focus:border-[var(--gold)] outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="eyebrow text-[var(--text-on-dark-dim)]">E-mail</span>
        <input
          type="email"
          required
          className={`${inputClass} mt-2`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="eyebrow text-[var(--text-on-dark-dim)]">Senha</span>
        <input
          type="password"
          required
          className={`${inputClass} mt-2`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="text-[var(--clay-soft)] text-sm font-mono">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--gold)] text-[var(--ink)] font-mono text-sm tracking-wide px-6 py-3 rounded-sm hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
