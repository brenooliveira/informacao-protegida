import Link from "next/link";
import { Brand } from "./brand";
export function SiteFooter() {
  return (
    <footer className="shell site-footer">
      <Brand />
      <p>Mais consciência. Mais controle. Um passo de cada vez.</p>
      <Link href="/projeto">
        Desenvolvimento do projeto <span aria-hidden="true">↗</span>
      </Link>
      <nav className="footer-links" aria-label="Informações legais">
        <Link href="/privacidade">Política de Privacidade</Link>
        <Link href="/termos">Termos de Uso</Link>
        <Link href="/privacidade#contato">Contato do encarregado</Link>
      </nav>
      <p className="source-note footer-source">
        Dados de vazamentos fornecidos por{" "}
        <a
          href="https://haveibeenpwned.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Have I Been Pwned
        </a>
        .
      </p>
      <span className="footer-note">
        © {new Date().getFullYear()} Informação Protegida
      </span>
    </footer>
  );
}
