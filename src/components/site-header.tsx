import Link from "next/link";
import { Brand } from "./brand";
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/#verificador">Verificador</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/projeto" className="nav-project">
            O projeto <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
