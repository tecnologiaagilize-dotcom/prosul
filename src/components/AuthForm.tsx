"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hasSupabaseEnv } from "@/lib/supabase/client";
import * as mfa from "@/services/mfa";
import { countries } from "@/lib/catalog";
export function AuthForm({
  mode,
}: {
  mode: "login" | "register" | "recover" | "reset" | "mfa";
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [factor, setFactor] = useState(""),
    [qr, setQr] = useState("");
  useEffect(() => {
    if (mode !== "mfa" || !hasSupabaseEnv()) return;
    mfa
      .listFactors(supabase)
      .then((fs) => {
        const f = fs.find((x) => x.status === "verified");
        if (f) setFactor(f.id);
      })
      .catch(() => setMessage("Entre com sua conta antes de configurar MFA."));
  }, [mode]);
  async function enroll() {
    setBusy(true);
    try {
      const d = await mfa.enrollTotp(supabase);
      setFactor(d.factorId);
      setQr(d.qrCodeSvg);
    } catch {
      setMessage(
        "Não foi possível iniciar. Entre novamente ou remova fatores pendentes nas configurações do provedor.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (!hasSupabaseEnv()) throw Error("O acesso ainda não foi configurado.");
      const f = new FormData(e.currentTarget),
        email = String(f.get("email") || ""),
        password = String(f.get("password") || "");
      let error;
      if (mode === "register") {
        if (password !== f.get("confirm"))
          throw Error("As senhas não conferem.");
        ({ error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: f.get("name"),
              organization: f.get("organization"),
              country: f.get("country"),
            },
            emailRedirectTo: location.origin + "/auth/callback",
          },
        }));
        if (!error)
          setMessage(
            "Confira seu e-mail para ativar o acesso. A participação institucional depende de aprovação.",
          );
      }
      if (mode === "login") {
        ({ error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));
        if (!error) location.href = "/painel";
      }
      if (mode === "recover") {
        ({ error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + "/auth/callback?next=/nova-senha",
        }));
        if (!error)
          setMessage(
            "Se o endereço puder receber a recuperação, enviaremos as instruções.",
          );
      }
      if (mode === "reset") {
        if (password !== f.get("confirm"))
          throw Error("As senhas não conferem.");
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user)
          throw Error("Link inválido ou expirado. Solicite nova recuperação.");
        ({ error } = await supabase.auth.updateUser({ password }));
        if (!error)
          setMessage("Senha alterada. Você já pode acessar o painel.");
      }
      if (mode === "mfa") {
        await mfa.verifyLoginChallenge(supabase, factor, String(f.get("code")));
        location.href = "/painel";
      }
      if (error) throw error;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha no acesso.");
    } finally {
      setBusy(false);
    }
  }
  const titles = {
    login: "Acesse sua conta",
    register: "Participe da PROSUL",
    recover: "Recuperar acesso",
    reset: "Definir nova senha",
    mfa: "Segurança da conta",
  };
  return (
    <section className="card auth">
      <div className="cover-line" />
      <small>PLATAFORMA PROSUL</small>
      <h1>{titles[mode]}</h1>
      <form className="form" onSubmit={submit}>
        {mode === "register" && (
          <>
            <div>
              <label htmlFor="name">Nome completo</label>
              <input id="name" name="name" required maxLength={150} />
            </div>
            <div>
              <label htmlFor="organization">Instituição (opcional)</label>
              <input id="organization" name="organization" maxLength={200} />
            </div>
            <div>
              <label htmlFor="country">País</label>
              <select name="country" id="country">
                <option value="">Selecione</option>
                {countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {["login", "register", "recover"].includes(mode) && (
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
        )}
        {["login", "register", "reset"].includes(mode) && (
          <div>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={mode === "login" ? 1 : 12}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
            />
          </div>
        )}
        {["register", "reset"].includes(mode) && (
          <div>
            <label htmlFor="confirm">
              Confirme a senha (mínimo 12 caracteres)
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
          </div>
        )}
        {mode === "register" && (
          <label>
            <input style={{ width: "auto" }} type="checkbox" required /> Li o{" "}
            <Link href="/privacidade">aviso de privacidade</Link>. O cadastro
            não confere cargo ou filiação à Frente.
          </label>
        )}
        {mode === "mfa" && (
          <>
            {qr && (
              <img
                src={qr}
                width="210"
                height="210"
                alt="QR Code para aplicativo autenticador"
              />
            )}
            {!factor ? (
              <button type="button" disabled={busy} onClick={enroll}>
                Configurar autenticador
              </button>
            ) : (
              <div>
                <label htmlFor="code">Código de 6 dígitos</label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            )}
          </>
        )}
        {(mode !== "mfa" || factor) && (
          <button disabled={busy}>
            {busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Confirmar"}
          </button>
        )}
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
      </form>
      <div className="actions">
        <Link href="/entrar">Entrar</Link> ·{" "}
        <Link href="/cadastrar">Criar conta</Link> ·{" "}
        <Link href="/recuperar-senha">Recuperar senha</Link>
      </div>
      <Link href="/painel">Minha área →</Link>
    </section>
  );
}
