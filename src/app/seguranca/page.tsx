import { redirect } from "next/navigation";
// Autenticação em duas etapas foi desativada: a antiga página leva ao painel.
export default function Page() {
  redirect("/painel");
}
