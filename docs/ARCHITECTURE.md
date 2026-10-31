# Arquitetura — estado da Fase 2

2026-10-30. Fundação aprovada; landing/ferramentas implementadas localmente. Stack única Next.js 16.4.3/React 19.3, TypeScript strict, Tailwind 4, shadcn/Base UI, pnpm e Node 24.13.x. Sem monorepo, Prisma, Redis ou infraestrutura de produção extra.

## Fronteiras

- Browser → Pwned Passwords diretamente: Web Crypto, prefixo de cinco hex e comparação local. Sem endpoint do produto recebendo senha/hash/prefixo.
- Browser → Next.js /api/waitlist: RHF/Zod e consentimento explícito; servidor valida origem, JSON/tamanho e dados. Adaptador server-only executa RPCs privadas no Supabase.
- Next.js → Supabase: service role apenas no adaptador específico de espera, sem valores de owner/status fornecidos pelo visitante. Autenticação futura usará JWT/cookies e RLS por usuário, não um cliente admin genérico.
- Domain/application continuam reservados para regras/casos de uso das fases futuras. ESLint bloqueia I/O/frameworks no domínio. Não criar lógica fictícia de postura/proteção.

## Banco

Modelo geral aprovado para continuidade. Só waitlist, consent_records e rate_limits foram migradas; grants de anon/authenticated/PUBLIC revogados e RLS deny-all explícito. join_waitlist grava lista/consentimento atomicamente; contadores usam upsert condicional e advisory lock por sujeito. leave_waitlist elimina por digest de token; cleanup_waitlist roda diariamente via pg_cron.

Tipos TypeScript são gerados do banco real via CLI e formatados automaticamente; CI compara a geração com o arquivo versionado. Testes pgTAP verificam catálogo/grants, gravação/duplicatas, token, consentimento, limites, retenção e cron. Testes reais de isolamento entre contas serão acrescentados na Fase 3, quando essas tabelas existirem.

## Confiança e privacidade

Schemas de env públicos/servidor separados fisicamente. server-only evita importação acidental no browser; scanner adicional inspeciona todos os arquivos .next/static. Não imprimir segredos, tokens, e-mails, senha/hash/prefixo em logs. Helpers capturam o status Supabase sem expor valores.

CSP usa nonce e SSR dinâmico para scripts próprios. Sem scripts/fontes de terceiros; connect-src permite própria origem, Supabase configurado e Pwned Passwords. unsafe-eval apenas no desenvolvimento e style-src unsafe-inline documentado para compatibilidade. Proxy segue o nome atual do Next.js 16 e receberá refresh Auth na Fase 3.

O IP confiável vem do cabeçalho sobrescrito pela plataforma configurada: CF-Connecting-IP na Cloudflare ou x-vercel-forwarded-for na Vercel. No localhost os headers do cliente são ignorados. Apenas HMAC vai à tabela de limites, e IP truncado ao consentimento. Token de cancelamento tem 32 bytes aleatórios, digest HMAC no banco e fragmento # no link. Duplicatas não rotacionam o token original.

## SEO, publicação e operação

Metadados, canonical, PNG Open Graph, sitemap e robots. SITE_INDEXABLE é opt-in, permitindo medir SEO da configuração pública em localhost sem publicar. Padrão de desenvolvimento e rascunhos permanecem noindex. Pages jurídicas têm campos de controlador/DPO em aberto para revisão.

Supabase local usa Docker apenas no desenvolvimento/CI e bind de rede em loopback; Studio é opcional. Testes SQL usam psql por stdin para evitar o bloqueio de bind mounts observado no macOS. O deploy posteriormente autorizado usa o Worker Cloudflare existente e o projeto Supabase hospedado informado pelo proprietário. Next.js é empacotado com OpenNext; SSR dinâmico preserva nonce/CSP. O CI inclui validação no runtime workerd. Não há R2/D1/filas neste deploy.

## Riscos e alternativas

SSR por nonce custa mais que página inteiramente estática; desempenho medido em mobile. O motor JS gerencia limpeza física de memória, portanto não prometer apagamento seguro de strings. Serviço externo pode falhar; erro nunca é resultado negativo.

Controle de acesso requer grants e políticas, não apenas RLS ligado. Service role fica restrita ao adaptador e às operações definidas. HMAC protege índices/tokens, mas rotacioná-lo exige versionamento para não invalidar links. A inscrição de espera ainda não comprova titularidade e não deve receber campanha antes da confirmação. Retenção/DPO/transferências internacionais exigem revisão antes da publicação.

## Referências oficiais consultadas

- https://nextjs.org/docs/app/getting-started/installation e documentação local versionada em node_modules/next/dist/docs
- https://nextjs.org/docs/app/guides/content-security-policy
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/cron
- https://haveibeenpwned.com/API/v3 e https://haveibeenpwned.com/TermsOfUse
- https://vercel.com/docs/headers/request-headers
- https://ui.shadcn.com/docs/installation/next
- https://mswjs.io/docs/migrations/2.x-to-3.x
