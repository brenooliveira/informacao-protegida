# Arquitetura — Fase 1

Data: 2026-10-30. Estado: fundação implementada; modelo de produto **proposto, aguardando aprovação**.

## Uma aplicação

Next.js 16.4.3 estável, React 19.3, TypeScript strict, Tailwind 4 e shadcn/ui com primitivas Base UI (padrão atual do gerador). Um pacote pnpm, sem monorepo. Node 24.13.x permite usar Vitest 5 e mantém runtime único no desenvolvimento e CI.

Browser → Next.js (SSR/ações/handlers) → Supabase via supabase-js. Ações de usuário usarão JWT/cookies e RLS. Jobs terão adaptador separado com service role e checagem de escopo; esse cliente privilegiado não foi criado nesta fase para evitar uso acidental.

`domain/` conterá dados/funções puras. `application/` terá casos de uso; `infrastructure/` implementará portas e I/O. ESLint impede importações de Next.js, React, Supabase e infraestrutura no domínio. RHF + resolver Zod estão instalados para os formulários das próximas fases.

## Separação de confiança

Schema público de env separado fisicamente do schema do servidor. Arquivos de servidor importam `server-only`; o build bloqueia importação acidental em componente cliente. O detector adicional inspeciona todo `.next/static`, inclusive chunks e sourcemaps presentes. Não promete identificar todo segredo possível: cobre os quatro tipos previstos e padrões Supabase.

CSP usa nonce por resposta e renderização dinâmica; scripts do Next recebem o nonce. `unsafe-eval` apenas em desenvolvimento. CSS permite `unsafe-inline` para compatibilidade com a UI, risco documentado; scripts não permitem inline arbitrário. Sem analytics, imagens remotas, fontes Google ou scripts externos. O host de `connect-src` é derivado da configuração pública do Supabase. Pwned Passwords será liberado somente na Fase 2.

`src/proxy.ts` segue o nome atual do Next.js 16; a função de renovação de sessão será adicionada na Fase 3. Não há rota autenticada nem falsa garantia de autenticação nesta entrega.

## Banco e integração futura

[SCHEMA.md](SCHEMA.md) é a proposta, não uma migration. Tipos gerados representam o banco vazio real. Fila `check_jobs`, limites e agendamento Postgres evitam Redis/filas adicionais. Operações críticas usarão transações/RPC com locks e restrições do banco, e não verificações somente no browser.

HIBP, Resend, BillingProvider e SecurityAdvisorProvider serão implementados nas fases correspondentes, após leitura da documentação oficial atual. Sem API simulada apresentada como real. A tela inicial é uma prévia de identidade e estrutura; não é a landing completa da Fase 2.

## Riscos e alternativas

- Next.js tem complexidade de cache e fronteiras RSC. CSP dinâmica elimina cache compartilhado nesta fase; rever custo/performance com medição na Fase 2.
- RLS exige teste de políticas e de concessões de privilégios; checagem do catálogo não substitui dois usuários reais. Testes na Fase 3.
- Postgres centraliza custo/concorrência e exige índices, locks curtos e idempotência. Alternativa Redis/BullMQ adicionaria operação e foi descartada conforme escopo.
- SMTP é dependência para login; testes locais usarão caixa SMTP local, produção precisa domínio e Resend configurados.
- Plano FAMILY compartilha somente agregados consentidos; detalhe nunca via policy de leitura por titular. Requer RPC limitada e teste específico.
- Aprovação de schema é uma fronteira explícita do projeto; migrations não serão inventadas para aparentar uma fase concluída.

## Referências oficiais consultadas

- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/guides/content-security-policy
- https://nextjs.org/docs/app/getting-started/proxy
- https://supabase.com/docs/guides/local-development
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://ui.shadcn.com/docs/installation/next
- https://vitest.dev/guide/
- https://mswjs.io/docs/migrations/2.x-to-3.x

Versões confirmadas também no registro npm em 2026-10-30; detalhes exatos no pnpm-lock.yaml.
