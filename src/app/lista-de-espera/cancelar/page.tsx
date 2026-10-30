import type { Metadata } from "next";
import Link from "next/link";
import { UnsubscribeForm } from "@/components/unsubscribe-form";
export const metadata: Metadata = {
  title: "Cancelar inscrição",
  robots: { index: false, follow: false },
};
export default function UnsubscribePage() {
  return (
    <main id="conteudo" className="shell legal-page">
      <Link className="text-link" href="/">
        ← Voltar ao início
      </Link>
      <h1>
        Cancelar inscrição
        <br />
        <span className="green">na lista de espera.</span>
      </h1>
      <UnsubscribeForm />
    </main>
  );
}
