import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Política de Privacidade — rascunho",
  robots: { index: false, follow: false },
  alternates: { canonical: "/privacidade" },
};
export default function Privacy() {
  return (
    <main id="conteudo" className="shell legal-page">
      <Link className="text-link" href="/">
        ← Voltar ao início
      </Link>
      <p className="section-kicker">{"// TRANSPARÊNCIA DESDE O COMEÇO"}</p>
      <h1>
        Política de
        <br />
        <span className="green">Privacidade.</span>
      </h1>
      <p className="legal-draft">
        RASCUNHO [REVISAR COM ADVOGADO] · Versão 2026-10-30 · Prévia local
      </p>
      <section>
        <h2>Quem é responsável</h2>
        <p>
          Controlador: [PREENCHER RAZÃO SOCIAL], CNPJ [PREENCHER], endereço
          [PREENCHER]. Estes dados e o canal de atendimento serão preenchidos
          antes de uma publicação pública. Este documento é uma minuta para
          revisão jurídica.
        </p>
      </section>
      <section>
        <h2>O que funciona nesta versão</h2>
        <p>
          O verificador de senhas é gratuito e não exige login. A lista de
          espera registra somente o e-mail e o consentimento para notícias do
          lançamento. Cadastro, consultas de e-mail, planos e monitoramento
          ainda não estão disponíveis.
        </p>
      </section>
      <section>
        <h2>Verificação de senhas</h2>
        <p>
          A senha e seu hash completo permanecem no navegador. Após seu clique,
          apenas os cinco primeiros caracteres do hash SHA-1 são enviados
          diretamente à API Pwned Passwords. Seu dispositivo compara a resposta
          localmente. O campo é limpo após a consulta; não armazenamos senha,
          hash ou prefixo.
        </p>
        <p>
          A API recebe o prefixo e os dados técnicos da conexão, como o IP.
          Consulte também a{" "}
          <a
            href="https://haveibeenpwned.com/Privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade do Have I Been Pwned
          </a>
          . Não há pixels, chat, anúncios ou analytics de terceiros nesta
          página.
        </p>
      </section>
      <section>
        <h2>Lista de espera e consentimento</h2>
        <p>
          Com sua autorização explícita, guardamos seu e-mail, a versão e o
          texto do consentimento, data/hora e IP truncado (IPv4 /24 ou IPv6
          /48). A finalidade é comunicar notícias do lançamento. Não é
          necessário entrar na lista para usar o verificador.
        </p>
        <p>
          A base legal proposta é o consentimento, sujeito à revisão jurídica.
          Nesta versão local não são enviados e-mails. A inscrição não comprova
          titularidade; antes de qualquer campanha, será necessário confirmar a
          titularidade por e-mail e configurar o serviço de envio.
        </p>
      </section>
      <section>
        <h2>Cancelamento e retenção</h2>
        <p>
          Guarde o link privado exibido após a inscrição. Nele você pode
          cancelar e remover o e-mail e seus consentimentos. Inscrições
          repetidas não substituem o link original e recebem uma resposta
          genérica para evitar exposição do cadastro.
        </p>
        <p>
          A inscrição é removida no cancelamento ou, no máximo, em 180 dias pela
          rotina diária. Na abertura do cadastro, revisar esse prazo para
          encerrar a lista em até 90 dias após a abertura, se ocorrer antes.
          Contadores contra abuso expiram após a janela de uso mais um dia e são
          limpos diariamente. Nenhum corpo de e-mail é armazenado.
        </p>
      </section>
      <section>
        <h2>Segurança e fornecedores</h2>
        <p>
          Os registros da lista ficam em tabelas privadas do Supabase,
          acessíveis por funções específicas no servidor. Não vendemos os
          e-mails. Provedores de infraestrutura podem processar dados técnicos
          necessários à operação. Região, países de processamento,
          transferências internacionais e contratos: [PREENCHER E REVISAR ANTES
          DA PUBLICAÇÃO].
        </p>
        <p>
          Para limites de tentativas, usamos identificadores HMAC do IP, sem
          guardar o IP completo na tabela de limites. Registros de acesso
          legalmente exigidos e serviços futuros terão documentação própria
          antes de sua ativação.
        </p>
      </section>
      <section id="contato">
        <h2>Seus direitos e o encarregado</h2>
        <p>
          Você pode solicitar informações, acesso, correção, eliminação e
          revogação do consentimento, conforme a legislação aplicável. O
          cancelamento por link está disponível nesta versão local.
        </p>
        <p>
          Encarregado/DPO: [PREENCHER NOME OU IDENTIFICAÇÃO DO CANAL]. E-mail de
          atendimento: [PREENCHER E VALIDAR]. O canal ainda não está operacional
          nesta prévia. Se perder o link de cancelamento, será necessário usar o
          canal do controlador quando estiver definido. [REVISAR COM ADVOGADO].
        </p>
      </section>
      <section>
        <h2>Alterações</h2>
        <p>
          Antes da abertura pública, esta minuta será revisada e seus campos
          serão preenchidos. Mudanças relevantes de finalidade exigirão
          informação e nova avaliação do consentimento. Consulte os{" "}
          <Link href="/termos">Termos de Uso (rascunho)</Link>.
        </p>
      </section>
    </main>
  );
}
