import Link from "next/link";
const plans = [
  {
    name: "FREE",
    subtitle: "Para começar",
    emails: "1 e-mail",
    features: [
      "Consulta após verificar titularidade",
      "Recomendações e questionário",
      "Rechecagem a cada 30 dias",
      "Histórico dos últimos 30 dias",
    ],
  },
  {
    name: "PLUS",
    subtitle: "Para acompanhar",
    emails: "Até 5 e-mails",
    features: [
      "Tudo do FREE",
      "Monitoramento de novos vazamentos",
      "Rechecagem diária e histórico completo",
      "Resumo mensal opcional",
    ],
  },
  {
    name: "FAMILY",
    subtitle: "Para cuidar em conjunto",
    emails: "Até 10 e-mails no grupo",
    features: [
      "Até 5 membros, incluindo o titular",
      "Cada pessoa verifica o próprio e-mail",
      "Resumo compartilhado só com consentimento",
      "Detalhes de cada membro continuam privados",
    ],
  },
];
const faqs = [
  [
    "Posso consultar qualquer e-mail?",
    "Não. O produto consultará somente e-mails cuja titularidade você comprovar. Cadastro e consultas de e-mail serão liberados em fases futuras.",
  ],
  [
    "Minha senha sai do navegador?",
    "A senha completa e seu hash completo não são enviados. Seu navegador consulta a API Pwned Passwords com apenas os cinco primeiros caracteres do hash e faz a comparação localmente. A API recebe o prefixo e os dados da conexão, como seu IP.",
  ],
  [
    "Se a senha não foi encontrada, estou seguro?",
    "Nenhum registro encontrado não garante que uma senha seja segura. Use senhas longas e únicas, um gerenciador e verificação em duas etapas.",
  ],
  [
    "Aparecer em um vazamento significa que minha senha vazou?",
    "Não necessariamente. Só há indicação de senha exposta se Senhas estiver entre os tipos de dados; ainda assim, ela pode ter sido armazenada em formato protegido. Os resultados de e-mail serão implementados em fase futura.",
  ],
  [
    "Quanto custa?",
    "O verificador de senhas é gratuito e não precisa de login. Os planos de acompanhamento estão previstos para o produto; ainda não há contratação, cobrança ou preços definidos. A consulta básica de e-mail permanecerá no plano gratuito após a abertura do cadastro.",
  ],
  [
    "Como cancelo a lista de espera?",
    "Use o link privado exibido após sua inscrição e clique em Cancelar minha inscrição. Guarde esse link. Em uma inscrição repetida, use o link original; a resposta não revela se o e-mail já existe na lista.",
  ],
];
export function Benefits() {
  return (
    <section
      className="shell section benefits-section"
      aria-labelledby="benefits-title"
    >
      <div className="section-intro">
        <div>
          <p className="section-kicker">{"// INFORMAÇÃO QUE VIRA ATITUDE"}</p>
          <h2 id="benefits-title">
            Mais que descobrir.
            <br />
            <span>Entender o que fazer.</span>
          </h2>
        </div>
        <p>
          Acompanhamento pensado para a realidade brasileira.
          <br />
          Recursos previstos para as próximas fases.
        </p>
      </div>
      <div className="steps-grid">
        <article className="step">
          <div className="benefit-icon" aria-hidden="true">
            ↗
          </div>
          <h3>Orientações que cabem no dia a dia</h3>
          <p>
            Próximos passos para senhas, WhatsApp, gov.br e cuidados com golpes
            envolvendo Pix e bancos.
          </p>
        </article>
        <article className="step">
          <div className="benefit-icon" aria-hidden="true">
            ◎
          </div>
          <h3>Um plano, sem sobrecarga</h3>
          <p>
            Recomendações agrupadas por prioridade, em linguagem simples e com
            ações que você pode acompanhar.
          </p>
        </article>
        <article className="step">
          <div className="benefit-icon" aria-hidden="true">
            ◇
          </div>
          <h3>Você decide o que compartilhar</h3>
          <p>
            Consentimento claro e detalhes privados. No plano família, somente
            um resumo poderá ser compartilhado.
          </p>
        </article>
      </div>
    </section>
  );
}
export function Plans() {
  return (
    <section
      id="planos"
      className="shell section plans-section"
      aria-labelledby="plans-title"
    >
      <div className="section-intro">
        <div>
          <p className="section-kicker">{"// CADA PESSOA, UM RITMO"}</p>
          <h2 id="plans-title">
            Comece simples.
            <br />
            <span>Acompanhe de perto.</span>
          </h2>
        </div>
        <p>
          Planos previstos. Sem cobrança nesta versão.
          <br />O valor estará na orientação e no acompanhamento.
        </p>
      </div>
      <div className="plans-grid">
        {plans.map((plan, i) => (
          <article
            className={`plan-card ${i === 1 ? "plan-highlight" : ""}`}
            key={plan.name}
          >
            <div className="plan-label">
              {plan.name}
              <span>{i === 1 ? "ACOMPANHAMENTO" : "EM BREVE"}</span>
            </div>
            <h3>{plan.subtitle}</h3>
            <p className="plan-emails">{plan.emails}</p>
            <p className="plan-price">
              {i === 0 ? "Gratuito" : "Preço a definir"}
            </p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">+</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="#lista-de-espera" className="plan-link">
              Quero saber do lançamento <span aria-hidden="true">↗</span>
            </Link>
          </article>
        ))}
      </div>
      <p className="field-hint">
        Monitoramento será acionado quando novos vazamentos forem publicados,
        sem uma data fixa de verificação. Nenhum plano garante segurança
        absoluta.
      </p>
    </section>
  );
}
export function FAQ() {
  return (
    <section
      id="perguntas"
      className="shell section faq-section"
      aria-labelledby="faq-title"
    >
      <p className="section-kicker">{"// SEM COMPLICAÇÃO"}</p>
      <h2 id="faq-title">
        Suas dúvidas.
        <br />
        <span>Respostas claras.</span>
      </h2>
      <div className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
