import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CadastroForm } from "./CadastroForm";

export const metadata = {
  title: "Cadastrar empresa | Rede Prosul",
};

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-4">
          <p className="eyebrow text-[var(--gold)] mb-4">Novo cadastro</p>
          <h1 className="font-display text-4xl mb-4">
            Registre sua empresa ou instituto
          </h1>
          <p className="text-[var(--text-on-dark-dim)] max-w-xl">
            As informações abaixo entram em análise antes de aparecer no
            diretório público. Campos marcados com{" "}
            <span className="text-[var(--gold)]">*</span> são obrigatórios.
          </p>
        </section>
        <section className="max-w-3xl mx-auto px-6 py-10">
          <CadastroForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
