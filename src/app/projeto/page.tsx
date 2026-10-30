import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "O projeto",
  robots: { index: false, follow: false },
  alternates: { canonical: "/projeto" },
};
const phases = [
  "Fundação técnica e proposta de banco",
  "Landing, verificador de senhas e lista de espera",
  "Login, e-mails e direitos do titular",
  "Integração HIBP e resultados",
  "Recomendações, questionário e painel",
  "Monitoramento e notificações",
  "Planos, revisão e produção",
];
export default function ProjectPage() {
  return (
    <main id="conteudo" className="shell project-page">
      <Link href="/" className="text-link">
        ← Voltar ao início
      </Link>
      <p className="section-kicker">
        {"// CONSTRUÇÃO ABERTA, EXPECTATIVAS CLARAS"}
      </p>
      <h1>
        Proteção começa
        <br />
        com <span className="green">uma boa base.</span>
      </h1>
      <p className="project-lead">
        Fase 1 aprovada. Fase 2 em revisão local. As funções do produto serão
        liberadas por etapas, depois da revisão de cada entrega.
      </p>
      <section aria-labelledby="phases-title">
        <h2 id="phases-title">Etapas do projeto</h2>
        <ol className="phase-list">
          {phases.map((phase, i) => (
            <li key={phase}>
              <span className="phase-id">0{i + 1}</span>
              <span>{phase}</span>
              <span className={i <= 1 ? "phase-status active" : "phase-status"}>
                {i === 0 ? "Aprovada" : i === 1 ? "Em revisão" : "Planejada"}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section id="arquitetura" className="architecture-section">
        <p className="section-kicker">
          {"// ESCOLHAS QUE SUSTENTAM O PRODUTO"}
        </p>
        <h2>
          Simples de operar.
          <br />
          Cuidadoso com os dados.
        </h2>
        <div className="architecture-grid">
          <article>
            <h3>Isolamento no banco</h3>
            <p>
              O schema foi aprovado para continuidade. A lista de espera usa
              tabelas privadas com RLS; os dados de contas serão implementados
              na Fase 3.
            </p>
          </article>
          <article>
            <h3>Segredos no servidor</h3>
            <p>
              Validação de ambiente e verificação automatizada dos arquivos
              enviados ao navegador.
            </p>
          </article>
          <article>
            <h3>Sem dados inventados</h3>
            <p>
              Esta interface não mostra resultados de vazamentos ou indicadores
              de proteção fictícios.
            </p>
          </article>
          <article>
            <h3>Uma aplicação, poucas peças</h3>
            <p>
              Next.js, TypeScript e Postgres. Jobs e limites serão controlados
              no próprio banco.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
