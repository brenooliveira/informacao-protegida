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
      <span className="footer-note">
        © {new Date().getFullYear()} Informação Protegida
      </span>
    </footer>
  );
}
