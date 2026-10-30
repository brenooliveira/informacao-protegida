# Prompt — Informação Protegida (informacaoprotegida.com.br)

> Como usar: salve este arquivo na raiz do repositório como `SPEC.md` (ou cole como primeira mensagem para o agente). Depois de cada fase, revise o resultado e responda apenas "aprovado, siga para a Fase N" ou com os ajustes.

---

## 1. Seu papel e como trabalhar

Você é um engenheiro de software sênior com experiência em SaaS, segurança de aplicações e privacidade (LGPD). Vai construir, comigo, um produto real que vai para produção — não exemplos nem pseudocódigo.

Regras de trabalho:

- Trabalhe **uma fase por vez** (seção 9). Ao fim de cada fase: rode lint, typecheck, testes e build; mostre os resultados; liste o que ficou pendente; **pare e espere minha aprovação**.
- Uma fase só está concluída quando **todos** os critérios de aceite dela forem atendidos e verificados por você (não "deveria funcionar").
- Antes de implementar qualquer integração externa, **leia a documentação oficial atual** do serviço (links na seção 11). Se algo desta especificação conflitar com a documentação, a documentação vence — me avise e registre a decisão.
- Registre toda decisão de arquitetura relevante em `docs/DECISIONS.md` (data, decisão, motivo, alternativa descartada).
- Se uma exigência for ambígua e a escolha errada for cara de desfazer (modelo de dados, autenticação, cobrança), **pergunte**. Se for barata, decida, registre e siga.
- Não adicione dependências, serviços pagos ou infraestrutura que não estejam nesta especificação sem justificar e pedir aprovação.
- Nunca invente respostas de APIs externas nem apresente dados simulados como reais. Dados de mock devem ser visivelmente identificados como tal em ambiente de desenvolvimento.
- Commits pequenos e descritivos, um conjunto por fase.

## 2. Contexto do negócio

- Dono: empreendedor solo que mantém vários produtos em paralelo. **O sistema precisa ser operável por uma pessoa**, com custo fixo baixo e poucas peças móveis.
- Produto: plataforma brasileira, em português, que ajuda pessoas leigas a descobrir se seus e-mails aparecem em vazamentos conhecidos, entender o risco em linguagem simples e **seguir um plano de ação** — acompanhando sua evolução ao longo do tempo.
- Diferencial: não é "mais um buscador de vazamentos". O valor está na **orientação prática em português, adaptada à realidade brasileira** (WhatsApp, gov.br, Pix, bancos, golpes comuns no país) e no acompanhamento contínuo. Concorrentes que só mostram a lista de vazamentos falharam justamente por não dar próximos passos úteis.
- Tom: confiável, calmo, educativo. **Sem alarmismo e sem promessas de proteção garantida** (Código de Defesa do Consumidor).

## 3. Stack (obrigatória)

- **Next.js** (App Router, versão estável atual) + React + TypeScript em modo `strict`
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod** (schemas compartilhados entre cliente e servidor)
- **Supabase**: Postgres, Auth, Row Level Security (RLS), `pg_cron`/`pg_net` para agendamentos
- **supabase-js** + migrations SQL versionadas via Supabase CLI + tipos gerados (`supabase gen types`). **Não usar Prisma** (a conexão dele contorna o RLS, que é nossa principal barreira de isolamento entre usuários).
- **Resend** para e-mails transacionais (também como SMTP do Supabase Auth)
- **Vercel** para deploy (a partir do GitHub)
- **Vitest** (unitários/integração), **Playwright** (fluxos ponta a ponta), **MSW** para simular APIs externas nos testes
- **GitHub Actions**: lint, typecheck, testes e build em todo PR
- Gerenciador de pacotes: **pnpm**. Repositório único com um app Next.js (sem monorepo — não há segundo app que justifique).

Organização do código (dentro do app Next.js):

```
src/
  app/                 # rotas, layouts, route handlers, server actions
  components/          # UI (shadcn/ui + componentes do produto)
  domain/              # regras puras: recomendações, pontuação, planos/limites (sem I/O)
  application/         # casos de uso que orquestram domínio + infraestrutura
  infrastructure/      # supabase, hibp, resend, billing — adaptadores
  lib/                 # utilitários, validação (zod), config de ambiente
supabase/
  migrations/
  seed.sql
docs/
```

Regras:
- Código de `domain/` não importa nada de `infrastructure/` nem do Next.js; é testável com testes unitários puros.
- Variáveis de ambiente validadas com Zod na inicialização; o app não sobe com configuração inválida.
- Segredos (chave HIBP, `SUPABASE_SERVICE_ROLE_KEY`, chave Resend) **somente no servidor**. Nunca com prefixo `NEXT_PUBLIC_`. Adicione verificação no CI que falhe se algum segredo aparecer no bundle do cliente.
- Sem Redis, BullMQ, Docker de produção ou AWS no MVP. Filas e agendamentos usam tabelas no Postgres + `pg_cron`. Se uma fase realmente exigir algo além disso, pare e justifique.

## 4. Integração com Have I Been Pwned (HIBP)

### 4.1 Regras contratuais (inegociáveis)

Os termos de uso do HIBP permitem consultar e-mails fornecidos pelos próprios usuários e exibir o resultado dentro do nosso produto, desde que:

- Toda tela, e-mail ou exportação que mostre dados de vazamentos tenha atribuição **visível** com link: "Dados de vazamentos fornecidos por [Have I Been Pwned](https://haveibeenpwned.com)".
- Não revendamos o acesso à API como produto em si. **O que se cobra é o acompanhamento, a orientação e os recursos de monitoramento — não a "consulta de vazamentos".** A consulta básica fica disponível no plano gratuito.
- Não construamos um buscador de vazamentos: **só consultamos e-mails cuja titularidade o usuário comprovou** (seção 6.3). Não existe campo "consulte qualquer e-mail".
- Respeitemos o rate limit do plano contratado e nunca contornemos controles.
- O User-Agent identifique corretamente o produto (ex.: `InformacaoProtegida/1.0 (+https://informacaoprotegida.com.br)`).

### 4.2 Arquitetura

- Interface `BreachIntelligenceProvider` em `infrastructure/`, com implementações `HibpProvider` e `MockProvider`.
- Seleção do provider por variável de ambiente. Em produção, o app recusa iniciar com `MockProvider`. Sem chave HIBP válida, nenhuma chamada real é feita.
- Headers: `hibp-api-key` e `user-agent`.
- Timeout configurável (padrão 10 s). Retry só para 429 e 503, respeitando o header `retry-after` (+ pequena margem), com no máximo 3 tentativas e backoff.
- Um limitador global de taxa (no Postgres) garante que **o app inteiro** fique abaixo do RPM contratado (configurável, ex.: 10 RPM no plano de entrada), mesmo com várias execuções simultâneas.

### 4.3 Estratégia de consultas (controle de custo)

A API de conta (`GET /breachedaccount/{account}`) é a única que consome a cota. Portanto:

1. **Catálogo local de vazamentos**: uma vez por dia, um job busca `GET /breaches` (endpoint aberto, sem chave) e sincroniza a tabela `breaches` (nome, título, domínio, datas, `DataClasses`, flags `IsVerified`, `IsFabricated`, `IsSpamList`, `IsRetired`, descrição, logo). Também sincroniza `GET /dataClasses`.
2. **Consulta de conta com resposta truncada** (padrão da API: só nomes dos vazamentos); os detalhes vêm do catálogo local. Use `truncateResponse=false` apenas se o nome não existir no catálogo (e então ressincronize).
3. **Quando consultar**:
   - na verificação de um novo e-mail (1 consulta);
   - quando o job diário detectar **vazamento novo no catálogo** → enfileira 1 consulta por e-mail monitorado elegível (planos com monitoramento);
   - re-checagem manual, limitada por plano (ex.: gratuito: 1 a cada 30 dias).
4. Resultado de cada consulta é guardado com data; nenhuma consulta repetida para o mesmo e-mail em menos de 24 h (configurável).
5. Fila em tabela (`check_jobs`) processada por um worker chamado a cada minuto via `pg_cron` + `pg_net` (chamando um route handler protegido por segredo), processando apenas o número de itens que cabe no RPM.
6. Registrar contagem de chamadas por usuário/dia para monitorar custo; limites por plano em configuração.

### 4.4 Respostas da API

- `200`: vazamentos encontrados → sincronizar `email_breaches`.
- `404`: **nenhum vazamento conhecido** — resultado válido, não erro.
- `400`: e-mail malformado → erro de validação.
- `401`/`403`: problema de chave/User-Agent → alerta operacional (log de erro), mensagem genérica ao usuário.
- `429`: aguardar `retry-after` e reenfileirar.
- `503`: indisponibilidade → reenfileirar com backoff.
- Vazamentos sensíveis não são retornados pela API pública — não tente obtê-los.

### 4.5 Testes da integração

- Testes automatizados com MSW cobrindo 200, 400, 401, 403, 404, 429 (com `retry-after`) e 503, timeout e resposta malformada.
- Teste de integração opcional (desativado no CI por padrão) usando a chave de teste oficial (32 zeros) e as contas de teste do domínio `hibp-integration-tests.com` (ex.: `account-exists@`, `multiple-breaches@`, `unverified-breach@`, `spam-list-only@`). Confirme os nomes na documentação atual.

## 5. Verificador de senhas (Pwned Passwords)

API gratuita, sem chave, sem rate limit, uso comercial permitido.

- SHA-1 calculado **no navegador** (Web Crypto API).
- Chamada `GET https://api.pwnedpasswords.com/range/{5 primeiros caracteres}` **direto do navegador**, com header `Add-Padding: true`; descartar as linhas de padding (contagem 0) e comparar o sufixo localmente.
- Se o navegador bloquear o header por CORS, aceite um proxy mínimo no nosso servidor que receba **apenas o prefixo de 5 caracteres**, não o registre em log e não o armazene. Documente a escolha.
- Consulta só ao clicar no botão (nunca enquanto digita). Campo sem autocomplete, sem envio em formulários, valor limpo da memória/estado após o resultado.
- Nunca: transmitir a senha ao nosso backend, armazenar senhas ou hashes, registrar senha/hash/prefixo em logs ou analytics.
- **Nenhum script de terceiros** (pixels de anúncio, chat, analytics invasivo) nas páginas do verificador e de códigos de verificação.
- Texto explicando, em linguagem simples, como a verificação preserva a privacidade (k-anonimidade), e orientação clara se a senha aparecer: "troque essa senha em todos os lugares onde a usa".
- Disponível sem login (é a porta de entrada do produto).

## 6. Funcionalidades do MVP

### 6.1 Landing page

- Título: "Seus dados estão seguros na internet?"
- Subtítulo: "Descubra riscos digitais, receba orientações e proteja suas informações pessoais."
- Seções: o que é, como funciona (3 passos), verificador de senhas embutido, benefícios, planos, perguntas frequentes, rodapé com Política de Privacidade, Termos de Uso, contato do encarregado (DPO) e atribuição ao HIBP.
- Captura de lista de espera (e-mail + consentimento explícito para comunicações) até a abertura do cadastro.
- Visual: azul-escuro, branco e verde; transmite confiança, sem clichês de "hacker" (capuz, código verde caindo). Mobile-first; Lighthouse ≥ 90 em performance, acessibilidade e SEO no mobile.
- SEO básico: metadados, Open Graph, sitemap, robots.

### 6.2 Autenticação (Supabase Auth)

- Login sem senha por **código OTP de 6 dígitos enviado por e-mail** (preferir ao magic link: links são consumidos por scanners de e-mail corporativos e abrem em navegadores embutidos de apps).
- SMTP próprio via Resend no Supabase Auth (o SMTP padrão do Supabase não serve para produção). Domínio de envio com SPF, DKIM e DMARC configurados.
- Sessão via `@supabase/ssr` com cookies seguros; middleware renovando sessão; rotas protegidas no servidor.
- Mensagens genéricas que não revelem se um e-mail já tem conta (proteção contra enumeração).
- Exclusão de conta self-service (seção 7).

### 6.3 E-mails monitorados

- O e-mail de login é o primeiro e-mail monitorado e já nasce verificado.
- Para adicionar outro: usuário informa → enviamos código de 6 dígitos → usuário confirma → status `VERIFIED` → só então a primeira consulta HIBP é enfileirada.
- Códigos: armazenados como hash, expiram em 15 min, máx. 5 tentativas, reenvio com intervalo mínimo de 60 s, limite diário por usuário e por IP.
- Um mesmo e-mail pode ser monitorado por apenas uma conta ativa (evita que alguém "pegue" o e-mail de outro).
- Remover um e-mail apaga seus resultados.
- Limite de e-mails por plano (seção 6.8).

### 6.4 Resultados de vazamentos

Para cada vazamento:
- Nome e logo do serviço, data do incidente (`BreachDate`) e data em que foi adicionado ao HIBP (`AddedDate`), quando disponíveis
- Tipos de dados expostos, **traduzidos para português** via tabela `data_class_translations` (semeada a partir de `/dataClasses`; classes sem tradução aparecem no original e são registradas para tradução futura)
- **Resumo em português gerado por template** a partir dos campos estruturados (sem IA). Ex.: "Em março de 2019, o serviço X sofreu um vazamento que expôs e-mails, senhas e números de telefone de 12 milhões de contas."
- A descrição original do HIBP (em inglês, contém HTML) em seção recolhível "Descrição original", com **HTML sanitizado** (allowlist de tags/atributos; links com `rel="noopener noreferrer"`)
- Selos quando aplicável: não verificado, fabricado, lista de spam
- Recomendações ligadas ao vazamento (seção 6.5)
- Atribuição ao HIBP

Textos obrigatórios:
- Aparecer num vazamento **não** significa que a senha da pessoa foi exposta — só se "Senhas" estiver entre os dados, e mesmo assim pode ter sido em formato protegido.
- "Nenhum vazamento conhecido" **não** garante que a conta nunca foi comprometida.

### 6.5 Recomendações (motor de regras, sem IA)

Entradas:
1. Tipos de dados expostos em cada vazamento (ex.: `Passwords`, `Phone numbers`, `Physical addresses`, `Dates of birth`, `Security questions and answers`, `Government issued IDs`).
2. **Questionário curto de autoavaliação** (5 a 8 perguntas, opcional, editável a qualquer momento), por exemplo:
   - Usa gerenciador de senhas?
   - Reutiliza senhas em mais de um site?
   - O e-mail principal tem verificação em duas etapas?
   - O WhatsApp tem a verificação em duas etapas (PIN) ativada?
   - A conta gov.br tem verificação em duas etapas?
   - Já consultou o Registrato (Banco Central) para ver contas e empréstimos em seu nome?

Regras declarativas em `domain/` (dados + funções puras, testadas). Exemplos:
- Vazamento com `Passwords` → prioridade **alta**: trocar a senha do serviço; trocar onde ela foi reutilizada; ativar verificação em duas etapas.
- Vazamento com telefone → **média**: atenção a golpes por WhatsApp/SMS; ativar PIN do WhatsApp.
- Vazamento com dados pessoais (endereço, nascimento, CPF/documentos) → **média/alta**: atenção a golpes de engenharia social; consultar Registrato; considerar alertas de crédito.
- Questionário "reutiliza senhas" → **alta**: adotar gerenciador de senhas.

Cada recomendação: título, explicação simples (máx. ~60 palavras), por que importa, passo a passo (com link oficial quando houver), prioridade (alta/média/baixa), status (pendente/concluída/não se aplica), data de conclusão. Recomendações iguais vindas de vários vazamentos são agrupadas (não repetir "ative a verificação em duas etapas" cinco vezes).

O catálogo de recomendações é conteúdo em português que eu vou revisar: gere uma primeira versão em `supabase/seed.sql` (ou arquivo de conteúdo) marcada como RASCUNHO.

Deixe a interface `SecurityAdvisorProvider` preparada para uma futura implementação com IA, mas **sem implementá-la**.

### 6.6 Painel do usuário

- E-mails monitorados e status
- Vazamentos conhecidos (total) e novos desde a última visita
- Recomendações pendentes por prioridade e concluídas
- Histórico de verificações (data, e-mail, resultado)
- Próxima verificação: explicar que o monitoramento é acionado quando novos vazamentos são publicados, não em data fixa
- **Indicador de postura**: em níveis ("Começando", "Em progresso", "Bem protegido"), não em nota de 0 a 100 (evita falsa precisão). Fórmula documentada em `docs/SCORING.md`, baseada em recomendações de alta prioridade resolvidas e respostas do questionário. Texto fixo: "Este indicador é educativo e não garante sua segurança."

### 6.7 Notificações por e-mail (Resend)

Eventos: código de login, código de verificação de e-mail, novo vazamento encontrado, resumo mensal (opcional, opt-in), aviso de exclusão de conta concluída.

- Templates responsivos (React Email), em português.
- **Mínimo de dados pessoais**: o e-mail de alerta diz "Encontramos um novo vazamento envolvendo um dos seus e-mails monitorados" e leva ao painel — não lista dados expostos.
- Link de descadastro em e-mails não transacionais; preferências de notificação no painel.
- Envios registrados em `notifications` (tipo, status, data), sem guardar o corpo.

### 6.8 Planos (sem cobrança real no MVP)

Limites em configuração/tabela, nunca espalhados pelo código:

| | FREE | PLUS | FAMILY |
|---|---|---|---|
| E-mails monitorados | 1 | 5 | 10 (somados entre membros) |
| Consulta ao verificar e-mail | sim | sim | sim |
| Monitoramento automático (novos vazamentos) | não | sim | sim |
| Re-checagem manual | 1 a cada 30 dias | 1 por dia | 1 por dia |
| Recomendações e questionário | sim | sim | sim |
| Histórico completo | últimos 30 dias | completo | completo |
| Resumo mensal | não | sim | sim |
| Membros | — | — | até 5 |

FAMILY:
- O titular convida membros por e-mail; **cada membro cria a própria conta e verifica o próprio e-mail** (titularidade + LGPD).
- O membro consente, explicitamente, em compartilhar com o titular apenas um **resumo** (quantidade de vazamentos e de recomendações de alta prioridade pendentes). Detalhes continuam privados. O membro pode sair a qualquer momento.
- Menores de idade: fluxo em que o responsável gerencia a conta do menor fica fora do MVP; registre como pendência jurídica em `ROADMAP.md`.

Cobrança:
- Modelos `plans` e `subscriptions` + interface `BillingProvider` preparada para o **Asaas** (Pix, boleto, cartão), sem implementação real.
- Troca de plano manual (admin/seed) no MVP. Nunca armazenar dados de cartão.

## 7. Privacidade, LGPD e segurança

Conteúdo jurídico (políticas e termos) deve ser gerado como **rascunho com marcadores `[REVISAR COM ADVOGADO]`** e campos a preencher (razão social, CNPJ, endereço, e-mail do encarregado).

Bases legais (registre em `docs/PRIVACY.md`):
- Execução de contrato (art. 7º, V) → cadastro, e-mails monitorados, consultas e alertas.
- Consentimento (art. 7º, I) → lista de espera, e-mails de marketing, resumo mensal, compartilhamento no plano FAMILY. Registrar em `consent_records` (finalidade, versão do texto, data, IP truncado) e permitir revogação.
- Cumprimento de obrigação legal (art. 7º, II) → registros de acesso à aplicação, que o Marco Civil da Internet (art. 15) exige guardar por 6 meses.

Implementar:
- **RLS em todas as tabelas**, com políticas testadas: um usuário nunca lê nem altera dados de outro. Tabelas sem política = build quebrado (adicione um teste que verifique).
- `service_role` usada apenas em jobs/route handlers do servidor, nunca em código que roda com dados do usuário sem checagem explícita de dono.
- Exportação dos dados do usuário (JSON) pelo painel.
- Exclusão de conta: apaga e-mails, resultados, recomendações, questionário, consentimentos e notificações; mantém somente o exigido por lei (registros de acesso por 6 meses), desvinculado do conteúdo. E-mail de confirmação ao concluir.
- Retenção: códigos expirados apagados diariamente; logs de auditoria 6 meses; jobs concluídos 30 dias. Rotina agendada de limpeza.
- `audit_events`: login, adicionar/remover e-mail, exportação, exclusão, troca de plano, mudanças de consentimento. Sem dados de vazamento nos logs.
- Logs estruturados (JSON) sem PII: e-mails mascarados (`b***@gmail.com`), nunca códigos, tokens, senhas ou hashes.
- Rate limiting nas rotas sensíveis (envio de código, verificação, re-checagem, exportação) por usuário e por IP, implementado no Postgres.
- Headers de segurança: CSP restritiva (com `connect-src` liberando apenas o necessário, incluindo `api.pwnedpasswords.com`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`.
- Validação com Zod em toda entrada (server actions e route handlers).
- Não coletar CPF, documentos, telefone ou endereço no MVP. Nunca armazenar senhas vazadas, dumps ou credenciais de terceiros.

## 8. Modelo de dados (Postgres/Supabase)

Proponha o schema completo (tipos, FKs, índices, unicidade, `created_at`/`updated_at`, política de retenção e RLS de cada tabela) **antes de criar as migrations**, para eu aprovar. Ponto de partida:

- `profiles` (1:1 com `auth.users`)
- `monitored_emails` (e-mail normalizado, status, verificado_em, último_check_em; único entre contas ativas)
- `email_verification_codes` (hash do código, expiração, tentativas)
- `breaches` (catálogo sincronizado do HIBP)
- `data_class_translations`
- `email_breaches` (e-mail ↔ vazamento, primeira detecção, visto pelo usuário)
- `security_checks` (histórico: e-mail, origem — verificação/automático/manual —, resultado, data)
- `check_jobs` (fila: status, tentativas, próximo_em, erro)
- `api_usage` (contagem de chamadas HIBP por dia e usuário)
- `recommendation_templates` e `user_recommendations`
- `assessment_answers` (questionário)
- `plans`, `subscriptions`
- `family_groups`, `family_members` (convite, status, consentimento de compartilhamento)
- `notifications`
- `consent_records`
- `audit_events`
- `waitlist`
- `rate_limits`

## 9. Fases e critérios de aceite

### Fase 1 — Fundação
Repositório, Next.js + Tailwind + shadcn/ui, Supabase local (CLI), validação de env, estrutura de pastas, lint/format, Vitest, Playwright, CI no GitHub Actions, `README.md` inicial, `.env.example`, proposta de schema (seção 8) para aprovação.
**Aceite:** `pnpm dev` sobe com Supabase local; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` passam localmente e no CI; checagem de segredos no bundle ativa; schema proposto entregue.

### Fase 2 — Landing + verificador de senhas + lista de espera (primeira versão no ar)
Landing completa, verificador Pwned Passwords, lista de espera com consentimento, rascunhos de Política de Privacidade e Termos, headers de segurança.
**Aceite:** deploy na Vercel funcionando; teste E2E do verificador (senha sabidamente vazada e senha aleatória) e verificação na aba de rede de que só o prefixo de 5 caracteres sai do navegador; nenhum script de terceiros na página; Lighthouse mobile ≥ 90.

### Fase 3 — Autenticação, e-mails monitorados e direitos do titular
Login por OTP, SMTP Resend, migrations + RLS, adição/verificação/remoção de e-mails, exportação e exclusão de conta, auditoria.
**Aceite:** E2E de cadastro → login → adicionar e verificar segundo e-mail → exportar → excluir conta; testes de RLS com dois usuários provando isolamento; testes de expiração, tentativas e reenvio de código; teste de que respostas não revelam se um e-mail existe.

### Fase 4 — Integração HIBP e resultados
Provider abstrato, HibpProvider, MockProvider, sincronização do catálogo, fila + worker + limitador de taxa, consulta na verificação do e-mail, tela de resultados com tradução, resumo por template, HTML sanitizado e atribuição.
**Aceite:** testes MSW para todos os status da seção 4.4; teste do limitador provando que o RPM configurado nunca é excedido; teste de que 404 vira "nenhum vazamento conhecido"; teste de XSS na descrição; atribuição presente em todas as telas com dados do HIBP.

### Fase 5 — Recomendações, questionário e painel
Motor de regras, catálogo de recomendações (rascunho), questionário, painel, indicador de postura, `docs/SCORING.md`.
**Aceite:** testes unitários cobrindo cada regra e o agrupamento de recomendações; E2E de marcar recomendação como concluída e ver o indicador mudar.

### Fase 6 — Monitoramento contínuo e notificações
Job diário de catálogo → detecção de vazamentos novos → enfileiramento por plano; e-mails de alerta e resumo; preferências de notificação; rotinas de limpeza/retenção.
**Aceite:** teste de integração simulando um vazamento novo no catálogo que gera jobs só para planos elegíveis e um único alerta por usuário; templates renderizados e revisados; jobs de limpeza testados.

### Fase 7 — Planos, endurecimento e produção
Planos e limites aplicados no servidor, FAMILY com convite e consentimento, `BillingProvider` (interface), revisão de segurança (checklist OWASP ASVS nível 1 aplicável), documentação final, checklist de produção.
**Aceite:** testes de limites por plano (inclusive tentativa de burlar pelo cliente); testes do fluxo FAMILY garantindo que o titular só vê o resumo; documentação completa; checklist de produção preenchido.

## 10. Documentação a entregar

`README.md` (instalação, ambiente local, comandos, deploy), `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/SECURITY.md` (modelo de ameaças simples e controles), `docs/PRIVACY.md` (bases legais, retenção, fluxos de dados), `docs/SCORING.md`, `docs/HIBP.md` (termos, estratégia de consultas, custos, rate limit), `docs/OPERATIONS.md` (jobs, alertas, como reprocessar fila, como trocar a chave da API), `ROADMAP.md`, `.env.example`.

Inclua uma estimativa de custo mensal por serviço (Supabase, Vercel, Resend, HIBP) para 100, 1.000 e 10.000 usuários, com as premissas usadas.

## 11. Referências oficiais (consultar antes de implementar)

- HIBP API v3: https://haveibeenpwned.com/API/v3
- HIBP Termos de Uso: https://haveibeenpwned.com/TermsOfUse
- Supabase Auth (OTP por e-mail, SMTP personalizado, SSR): https://supabase.com/docs
- Resend: https://resend.com/docs
- LGPD (Lei 13.709/2018) e Marco Civil da Internet (Lei 12.965/2014)

## 12. Primeira tarefa

1. Inspecione o repositório. Se estiver vazio, inicialize o projeto.
2. Apresente em uma resposta: a estrutura de pastas, as decisões arquiteturais principais (com riscos e alternativas) e a proposta de schema da seção 8.
3. Implemente a **Fase 1**, rode todas as verificações, mostre os resultados e **pare** aguardando minha aprovação.
