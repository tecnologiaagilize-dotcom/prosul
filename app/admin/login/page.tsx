import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Acesso administrativo | Rede Prosul",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-[var(--gold)] mb-3">Área restrita</p>
        <h1 className="font-display text-3xl mb-8">Painel Rede Prosul</h1>
        <LoginForm />
      </div>
    </div>
  );
}
