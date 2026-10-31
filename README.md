# Informação Protegida

**Fase 2 local:** landing Matrix completa, verificador Pwned Passwords real sem login, lista de espera com consentimento persistente e cancelamento, rascunhos jurídicos e SEO. Fase 1 aprovada pelo usuário em 2026-10-30.

Cadastro/OTP, e-mails monitorados, consultas de e-mail, recomendações pessoais, FAMILY e cobrança ainda não estão implementados. Os cartões de planos descrevem recursos futuros e não aceitam pagamento. Nenhum e-mail é enviado nesta fase.

## Executar

Node 24.13.x (`nvm use`), pnpm 10.30.1 e Docker Desktop ativo. Docker somente no desenvolvimento/CI; publicação em Cloudflare Workers (OpenNext) e Supabase hospedado.

```sh
nvm use
pnpm install --frozen-lockfile
pnpm db:start
pnpm db:env
pnpm db:migrate
pnpm db:types
pnpm dev
```

App em http://127.0.0.1:3000; API local Supabase 54321; caixa SMTP 54324. Studio é opcional, desativado por padrão por limitação de bind mounts observada neste macOS. O helper restringe portas a loopback.

`db:env` cria/atualiza `.env.local` ignorado e com permissão 600, usando chaves reais locais (incluindo service role **apenas no servidor**) e segredo HMAC aleatório. Não imprime valores. O exemplo `.env.example` contém o inventário de configuração. Configuração inválida impede iniciar/buildar. Não usar APP_ENV=local num deploy público.

## Fluxos disponíveis

- **Verificador:** digitar não consulta. Só ao clicar, o browser calcula SHA-1 e envia os primeiros cinco caracteres diretamente à API Pwned Passwords, com padding. Sem rota de senha, scripts de terceiros ou armazenamento do valor/hash. O campo é limpo em sucesso/falha. Resultado negativo não garante segurança.
- **Espera:** e-mail próprio + consentimento explícito desmarcado por padrão. Zod valida browser/servidor; transação grava lista e consentimento com texto/versionamento/data/IP truncado. Clientes não acessam as tabelas diretamente.
- **Cancelar:** link privado exibido no recibo, com token no fragmento `#` (não na query/path do servidor). Ação exige clique/POST e apaga e-mail/consentimentos. Guarde o link original: duplicatas recebem resposta genérica e não substituem seu token.
- **Retenção:** cron diário remove espera acima de 180 dias e limites expirados; revisar encerramento da lista após a abertura do cadastro. Revogação apaga imediatamente.

A lista ainda não verifica titularidade nem envia mensagens. Confirmar titularidade antes de qualquer campanha e completar canal do controlador/DPO e revisão jurídica antes de publicação. As páginas de política/termos são rascunhos marcados com [REVISAR COM ADVOGADO] e [PREENCHER]; não foram preenchidas com dados pessoais de outras fontes.

## Estrutura e arquitetura

```text
src/app/                  páginas, SEO e endpoints de espera
src/components/           UI shadcn/Base UI, Matrix e formulários
src/domain/               reservado para regras futuras, sem I/O
src/application/          reservado para casos de uso futuros
src/infrastructure/       Supabase, RPCs e limites de confiança
src/lib/                  env, Zod, privacidade do verificador e HTTP
supabase/migrations/      espera + consentimento + rate_limits
supabase/tests/           pgTAP, acesso/consentimento/retensão/limites
scripts/                  helpers locais, geração de tipos e scanner
tests/                    Vitest/MSW + Playwright
docs/                     decisões, privacidade, operação e evidências
```

Apenas o subconjunto necessário ao consentimento foi migrado nesta fase. Modelo de contas e demais tabelas segue para Fase 3. Service role está isolada em módulo server-only e executa funções específicas de espera sem receber owner/status do visitante. O servidor recusa origens externas e payloads acima de 4 KiB. Limites atômicos Postgres: cinco pedidos/hora e dez/dia por IP; cancelamento limitado a vinte/hora. IP em limites vira HMAC; consentimento retém só IPv4 /24 ou IPv6 /48. Em produção, a extração de IP usa o header confiável da plataforma configurada (Cloudflare ou Vercel); local ignora headers forjados.

## Verificar

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:check
pnpm db:test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
LIVE_PASSWORD_CHECK=1 pnpm exec playwright test --project desktop --grep 'integração real'
```

`build` inclui scanner de todos os arquivos `.next/static`: nomes/valores dos segredos previstos e padrões Supabase. CI usa sentinelas e importa chaves locais sem expô-las. O gate do catálogo exige RLS/policy em toda tabela pública. pgTAP roda por stdin no psql, sem bind mounts. Os E2E usam dados `example.invalid`, verificam persistência/revogação reais no banco e removem inscrições de teste; um segredo HMAC efêmero isola os contadores de cada execução. Testes da API externa usam mocks no CI, com teste real opt-in.

## SEO e auditoria

Metadados, canonical, Open Graph PNG, sitemap e robots implementados. **SITE_INDEXABLE=false é o padrão**; rascunhos jurídicos, projeto e cancelamento permanecem noindex. Para auditar a configuração da landing pública servida só em localhost:

```sh
SITE_INDEXABLE=true pnpm build
SITE_INDEXABLE=true pnpm start --port 3000 --hostname 127.0.0.1
```

Essa flag controla indexação, não cria hospedagem ou publicação. No desenvolvimento normal, `pnpm dev` preserva noindex. Relatórios Lighthouse em [docs/VALIDATION-PHASE2.md](docs/VALIDATION-PHASE2.md).

## Entregáveis e pendências

[Decisões](docs/DECISIONS.md), [schema](docs/SCHEMA.md), [privacidade](docs/PRIVACY.md), [segurança](docs/SECURITY.md), [Pwned Passwords](docs/HIBP.md), [operação](docs/OPERATIONS.md), [custos preliminares](docs/COSTS.md), [roadmap](ROADMAP.md) e [prompt original](SPEC.md).

O código está no GitHub e o CI da Fase 2 passou. A publicação em Cloudflare Workers foi autorizada posteriormente pelo proprietário. Configuração, diagnóstico e validação estão em [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md).

Para encerrar: pare `pnpm dev` e execute `pnpm db:stop`; os dados locais são preservados.
