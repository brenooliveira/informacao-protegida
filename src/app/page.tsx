import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SecurityVisual } from "@/components/security-visual";
const steps = [
  {
    n: "01",
    icon: "◎",
    title: "Conheça sua exposição",
    text: "Descubra se seus e-mails verificados aparecem em vazamentos conhecidos.",
  },
  {
    n: "02",
    icon: "⌘",
    title: "Entenda o que importa",
    text: "Receba explicações em português, com contexto para a sua vida digital no Brasil.",
  },
  {
    n: "03",
    icon: "↗",
    title: "Dê o próximo passo",
    text: "Siga orientações práticas e acompanhe seus avanços, uma ação de cada vez.",
  },
];
export default function Home() {
  return (
    <main id="conteudo">
      <section className="shell hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Badge variant="outline" className="eyebrow">
            <span className="status-dot" /> SUA VIDA DIGITAL, SOB SEU CONTROLE
          </Badge>
          <h1 id="hero-title">
            Seus dados estão
            <br />
            seguros na
            <br />
            <span>internet?</span>
            <span className="terminal-cursor" aria-hidden="true">
              _
            </span>
          </h1>
          <p className="hero-description">
            Descubra riscos digitais, receba orientações e proteja suas
            informações pessoais.
          </p>
          <p className="hero-support">
            Informação clara para transformar preocupação em atitude.
            <br className="desktop-break" /> Sem alarmismo. No seu ritmo.
          </p>
          <div className="hero-actions">
            <Button
              render={<Link href="#como-funciona" />}
              nativeButton={false}
              role="link"
              size="lg"
              className="main-button"
            >
              Conheça como funciona <span aria-hidden="true">↗</span>
            </Button>
            <Link href="/projeto" className="text-link">
              Ver o projeto <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="development-note">
            <span className="small-cross">+</span>
            <span>Em desenvolvimento · Prévia local da Fase 1</span>
          </div>
        </div>
        <SecurityVisual />
      </section>
      <div className="principles-strip">
        <div className="shell strip-inner">
          <span>
            <i aria-hidden="true">◇</i> Privacidade desde o início
          </span>
          <span>
            <i aria-hidden="true">⌁</i> Orientação em português
          </span>
          <span>
            <i aria-hidden="true">⊙</i> Próximos passos claros
          </span>
          <span className="strip-end">
            FEITO PARA A VIDA REAL<span aria-hidden="true"> ↙</span>
          </span>
        </div>
      </div>
      <section
        id="como-funciona"
        className="shell section"
        aria-labelledby="steps-title"
      >
        <div className="section-intro">
          <div>
            <p className="section-kicker">
              {"// MENOS INCERTEZA. MAIS DIREÇÃO."}
            </p>
            <h2 id="steps-title">
              Saber é só o começo.
              <br />
              <span>Agir faz a diferença.</span>
            </h2>
          </div>
          <p>
            Uma jornada simples para cuidar do que é seu.
            <br />
            Estes são os recursos previstos para o produto.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step" key={step.n}>
              <div className="step-top">
                <span className="step-icon" aria-hidden="true">
                  {step.icon}
                </span>
                <span className="step-number">/{step.n}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        id="principios"
        className="shell privacy-section"
        aria-labelledby="privacy-title"
      >
        <div>
          <p className="section-kicker">{"// CONFIANÇA SE CONSTRÓI"}</p>
          <h2 id="privacy-title">
            Sua privacidade
            <br />é o ponto de partida<span className="green">.</span>
          </h2>
        </div>
        <div className="privacy-copy">
          <p>
            O projeto nasce com um compromisso: consultar apenas e-mails cuja
            titularidade você comprovou e explicar os resultados em linguagem
            simples.
          </p>
          <p>
            Nenhuma ferramenta garante segurança absoluta. O objetivo é ajudar
            você a entender os riscos e tomar decisões melhores.
          </p>
          <Link href="/projeto#arquitetura" className="text-link">
            Conheça os princípios do projeto <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="shell phase-notice">
        <span className="notice-mark" aria-hidden="true">
          [ i ]
        </span>
        <p>
          <strong>Estamos construindo a fundação.</strong> Cadastro, consultas e
          monitoramento serão implementados nas próximas fases. Esta prévia não
          coleta informações nem realiza verificações.
        </p>
        <Link href="/projeto">
          Acompanhar etapas <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
