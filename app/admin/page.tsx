import { createClient } from "@/lib/supabase/server";
import { AdminTable } from "./AdminTable";
import { LogoutButton } from "./LogoutButton";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("empresas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="eyebrow text-[var(--gold)]">Painel administrativo</p>
            <h1 className="font-display text-xl">Rede Prosul</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {error ? (
          <p className="text-[var(--clay-soft)] font-mono text-sm">
            Não foi possível carregar os cadastros. Verifique a conexão com o
            Supabase.
          </p>
        ) : (
          <AdminTable rows={rows ?? []} />
        )}
      </main>
    </div>
  );
}
