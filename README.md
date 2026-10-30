# Informação Protegida

Plataforma brasileira para entender exposição em vazamentos e seguir orientações práticas. **Fase 1 — fundação e prévia visual local.** Nenhuma consulta, login, captura de e-mail, cobrança ou monitoramento está disponível nesta entrega.

## Começar

Requisitos: Node 24.13.x (`nvm use`), pnpm 10.30.1 e Docker Desktop ativo. Docker é somente desenvolvimento/CI, nunca produção. O Supabase CLI 2.122.0 é instalado pelo pnpm.

```sh
nvm use
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm db:start
pnpm db:env
pnpm db:types
pnpm dev
```

Abra http://127.0.0.1:3000. API local: http://127.0.0.1:54321; caixa SMTP local: http://127.0.0.1:54324. Studio é opcional e não inicia por padrão nesta máquina (limitação de bind mounts em Documents). O helper usa rede Docker com bind em loopback. `pnpm db:env` lê chaves reais locais e escreve somente as públicas em `.env.local`, ignorado pelo Git. Não copie chaves de exemplos de internet.

O app falha ao iniciar/buildar se faltar configuração ou houver valor inválido. Em `APP_ENV=local|test`, o provider mock é apenas uma **configuração reservada**: nenhum provider foi implementado ainda. Em `APP_ENV=production`, mock é proibido; HTTPS e segredos são exigidos. Nunca use `APP_ENV=local` num deploy público.

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
```

`pnpm build` também verifica todos os arquivos `.next/static` contra nomes/valores de segredos, chaves secretas do Supabase e JWTs de service role. No CI, sentinelas identificáveis testam vazamento sem credenciais reais. Unitários verificam que o detector efetivamente acusa vazamentos.

`pnpm db:test` envia SQL por stdin ao Postgres local com Docker/psql e valida o plano TAP, falhas e contagem de assertions, sem montar pastas do host. O runner padrão da CLI também está disponível como `pnpm db:test:cli` em ambientes sem essa limitação. O teste consulta o catálogo Postgres com pgTAP: toda tabela em `public` deve ter RLS e política explícita. **Nenhuma tabela de produto existe na Fase 1**; isso não é prova de isolamento entre dois usuários. Os testes de isolamento serão entregues com as migrations na Fase 3, após aprovação do schema.

`pnpm db:types` gera tipos da instância real via `supabase gen types`; o CI compara com o arquivo versionado. `pnpm db:check` testa a API local Auth sem enviar mensagens. `/api/health` testa somente o processo Next.js, sem alegar que o banco está saudável.

## Estrutura

```text
src/
  app/                     rotas, layout e health
  components/              identidade, prévia visual e shadcn/ui
  domain/                  reservado para regras puras
  application/             reservado para casos de uso
  infrastructure/supabase/ clientes browser/servidor e tipos gerados
  lib/env/                 schemas públicos separados dos segredos
  lib/validation/          validações compartilhadas Zod
supabase/
  config.toml              stack local
  migrations/              vazio até aprovação
  tests/                   verificações pgTAP do catálogo RLS
  seed.sql                 vazio até aprovação
scripts/                   ambiente local, tipos e detector de segredos
tests/                     Vitest + MSW; E2E Playwright desktop/mobile
.github/workflows/ci.yml   lint, tipos, testes, banco, build, segredos e E2E
docs/                      arquitetura, decisões, schema e validação
```

## Direção visual

Preto esverdeado, verde neon, grid orbital, escudo vetorial e detalhes de terminal. A preferência Matrix informada pelo usuário prevalece sobre a direção visual do documento original. Sem scripts, fontes ou imagens de terceiros. Movimento reduzido respeitado. A prévia fica `noindex` enquanto o produto não está disponível.

## Documentação e estado

- [Schema para aprovação](docs/SCHEMA.md): campos, chaves, índices, RLS, retenção e transações.
- [Arquitetura](docs/ARCHITECTURE.md) e [decisões](docs/DECISIONS.md).
- [Segurança](docs/SECURITY.md), [privacidade](docs/PRIVACY.md) e [operação local](docs/OPERATIONS.md).
- [Custos estimados para 100, 1.000 e 10.000 usuários](docs/COSTS.md).
- [Resultados verificados](docs/VALIDATION.md) e [próximas fases](ROADMAP.md).
- [Especificação original](SPEC.md), preservada sem alterações.

## GitHub e deploy

Git inicializado localmente. Por solicitação expressa do usuário, **nenhum repositório remoto foi criado e nenhum workflow remoto foi executado**. O workflow já está pronto para um futuro push/PR; não se deve declarar CI remoto aprovado antes de uma execução real.

Deploy na Vercel começa na Fase 2, depois da revisão. As variáveis de `.env.example` são o inventário; inserir segredos apenas no ambiente do servidor. O SMTP Resend e as integrações HIBP serão ligados nas fases próprias. Não foram criados serviços pagos.

Para encerrar o banco: `pnpm db:stop`. Para testes E2E locais, primeiro gerar o build; Playwright inicia e encerra sua própria instância de produção na porta 3100.
