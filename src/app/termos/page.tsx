import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Termos de Uso — rascunho",
  robots: { index: false, follow: false },
  alternates: { canonical: "/termos" },
};
export default function Terms() {
  return (
    <main id="conteudo" className="shell legal-page">
      <Link className="text-link" href="/">
        ← Voltar ao início
      </Link>
      <p className="section-kicker">{"// EXPECTATIVAS CLARAS"}</p>
      <h1>
        Termos
        <br />
        <span className="green">de Uso.</span>
      </h1>
      <p className="legal-draft">
        RASCUNHO [REVISAR COM ADVOGADO] · Versão 2026-10-30 · Prévia local
      </p>
      <section>
        <h2>Responsável pelo serviço</h2>
        <p>
          [PREENCHER RAZÃO SOCIAL], CNPJ [PREENCHER], endereço [PREENCHER],
          contato [PREENCHER]. Minuta sujeita à revisão jurídica antes de
          publicação pública.
        </p>
      </section>
      <section>
        <h2>Finalidade e disponibilidade</h2>
        <p>
          Informação Protegida é um projeto de orientação sobre riscos digitais.
          Nesta versão, você pode verificar senhas sem login e registrar
          interesse no lançamento. Contas, consultas de e-mail, monitoramento e
          planos são recursos previstos, ainda indisponíveis. Não há contratação
          nem cobrança nesta fase.
        </p>
      </section>
      <section>
        <h2>Verificador de senhas</h2>
        <p>
          A consulta acontece somente após sua ação, por meio da API Pwned
          Passwords. Apenas um prefixo de cinco caracteres do hash é
          transmitido; a comparação completa ocorre no navegador. Não use este
          recurso para testar credenciais de terceiros sem autorização.
        </p>
        <p>
          Um resultado ausente não comprova segurança. Uma senha encontrada deve
          ser trocada em todos os locais onde é usada. A disponibilidade e a
          cobertura da fonte externa podem variar.
        </p>
      </section>
      <section>
        <h2>Limitações importantes</h2>
        <p>
          O conteúdo é educativo e não garante proteção contra incidentes,
          fraudes ou vazamentos. Nenhuma ferramenta consegue identificar todos
          os comprometimentos. Os próximos recursos de consulta de e-mail
          exigirão comprovação de titularidade.
        </p>
        <p>
          Aparecer em um vazamento não significa necessariamente que a senha foi
          exposta. A interpretação dependerá dos tipos de dados informados pela
          fonte; senhas também podem ter sido armazenadas em formato protegido.
        </p>
      </section>
      <section>
        <h2>Uso responsável</h2>
        <p>
          Use somente seus próprios dados, não tente contornar limites de acesso
          e não use o produto para perseguir, prejudicar ou enviar comunicações
          indevidas a outras pessoas. Limites de tentativas protegem o
          funcionamento da lista de espera.
        </p>
      </section>
      <section>
        <h2>Lista de espera</h2>
        <p>
          O consentimento é facultativo e pode ser revogado pelo link privado da
          inscrição. Não há prazo de lançamento garantido. Antes de envios de
          comunicação, a titularidade do endereço deverá ser confirmada. Leia a{" "}
          <Link href="/privacidade">Política de Privacidade (rascunho)</Link>.
        </p>
      </section>
      <section>
        <h2>Fontes e direitos</h2>
        <p>
          Dados de vazamentos fornecidos por{" "}
          <a
            href="https://haveibeenpwned.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Have I Been Pwned
          </a>
          . Aplicam-se os termos do provedor para uso de seus serviços. Não
          revendemos acesso à API; o futuro valor dos planos estará no
          acompanhamento e na orientação.
        </p>
      </section>
      <section>
        <h2>Atendimento e legislação</h2>
        <p>
          Canal de atendimento: [PREENCHER E VALIDAR ANTES DA PUBLICAÇÃO]. A
          redação sobre responsabilidade, legislação aplicável e solução de
          conflitos será revisada com advogado, respeitando os direitos do
          consumidor. [REVISAR COM ADVOGADO].
        </p>
      </section>
    </main>
  );
}
