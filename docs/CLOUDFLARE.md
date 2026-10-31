# Cloudflare Workers

Worker: `informacao-protegida` · URL principal: https://informacaoprotegida.com.br

## Diagnóstico

Build `51a9699d-012c-4228-ab50-3b3108eb52cd` falhou em 30/10/2026 às 17:55 UTC: o comando padrão `npx wrangler deploy` tentou configurar OpenNext automaticamente e o Next interrompeu a compilação por ausência de variáveis obrigatórias. O projeto estava configurado para Supabase local; nenhuma variável existia no build ou no Worker.

O repositório agora contém OpenNext/Wrangler fixados, `open-next.config.ts`, `wrangler.jsonc`, assets e compatibilidade Node. O trigger usa build `pnpm cf:build` e deploy `pnpm cf:deploy`. Não usar `.env.local` nem credenciais locais em publicação.

## Configuração

Mesmo conjunto de variáveis no ambiente do build e no runtime do Worker:

| Variável                               | Configuração                                                   |
| -------------------------------------- | -------------------------------------------------------------- |
| `APP_ENV`                              | `production`                                                   |
| `NEXT_PUBLIC_APP_URL`                  | URL HTTPS do Worker                                            |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL HTTPS do projeto hospedado informado pelo proprietário     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável desse projeto                                 |
| `SUPABASE_SERVICE_ROLE_KEY`            | Segredo de servidor Supabase (aceita chave `sb_secret_` atual) |
| `WAITLIST_HMAC_SECRET`                 | Segredo aleatório persistente de pelo menos 32 bytes           |
| `WAITLIST_ENABLED`                     | `true` para a lista com banco configurado                      |
| `BREACH_PROVIDER`                      | `disabled` enquanto consulta de e-mails não foi implementada   |
| `DEPLOYMENT_PLATFORM`                  | `cloudflare`                                                   |
| `SITE_INDEXABLE`                       | `false` enquanto conteúdo legal for rascunho                   |

`SUPABASE_SERVICE_ROLE_KEY` e `WAITLIST_HMAC_SECRET` devem estar como secretos nos dois ambientes. Não rotacionar HMAC durante redeploy: isso invalida cancelamentos. `keep_vars`/`--keep-vars` preserva variáveis e os segredos permanecem no painel. Não é necessário configurar HIBP/Resend/cron HTTP para a funcionalidade atual. Retenção usa pg_cron do Supabase.

O projeto remoto é `jomzfulxpltuoltnjfqi`, confirmado pelo proprietário. Aplicar migrations aprovadas sem reset: `pnpm exec supabase db push --linked --project-ref jomzfulxpltuoltnjfqi --skip-vault --dry-run` e depois o mesmo comando sem `--dry-run`. Conferir grants, RLS e job de retenção.

## Verificação e operação

- `pnpm cf:build`: gera `.open-next`, mantendo checagem de segredos do bundle público.
- `pnpm cf:dry-run`: valida o pacote e os bindings sem publicar.
- `pnpm cf:check`: abre o pacote em workerd local e Chromium; cobre páginas, CSP com nonce único, assets/hidratação e consulta de senha. Usa explicitamente lista desativada para não tocar em banco externo.
- `pnpm cf:preview`: preview local; variáveis do runtime precisam estar em `.dev.vars` ignorado ou em flags `--var` para valores públicos. `--env-file` não substitui bindings de runtime.
- `pnpm cf:deploy`: publica o pacote já construído; preferir o build conectado ao GitHub para não carregar arquivos locais.
- `pnpm cf:typegen`: atualiza os tipos do Worker após mudar bindings/compatibilidade.

O pipeline GitHub tem um job Workers independente sem credenciais de produção. O pipeline existente continua cobrindo o banco local e os fluxos com lista ativa. Teste de produção deve inscrever apenas endereço técnico sob domínio reservado `.invalid`, revogar via token privado e remover resíduos desse teste por identificador exato. Nunca exportar e-mails de usuários nem registrar tokens/senhas em logs.

## Estado de validação

Build OpenNext, dry-run, 76 testes unitários, lint, tipagem e smoke test workerd/Chromium aprovados localmente. Deploy remoto concluído com sucesso pelo Workers Builds `91e43ca0-07a9-43da-9e8e-49e96f4ef16a`, do commit `463eef688ae2f02e83dbb9397935f9d7a9df2ebe`. Versão `dd81f244-1fa3-44ea-a821-3977a01dcf7d` atende 100% do tráfego.

Na URL pública, Chromium confirmou HTTP 200, hidratação sem erros, nonce/CSP, consulta real ao Pwned Passwords (HTTP 200), cadastro técnico na lista, revogação e layout mobile sem overflow. A inscrição técnica foi cancelada; o banco confirmou ausência do registro. A migration remota `20261030000100_waitlist.sql` foi aplicada; RLS ativo e SELECT revogado para anon/authenticated nas três tabelas; job `waitlist-retention` ativo às 03:17 UTC.

Alterações apenas em `*.md`/`docs/**` não disparam novo deploy no trigger conectado. Mudanças de código continuam publicando automaticamente a branch main.

## Domínio principal — 31/10/2026

A delegação no Registro.br já estava correta (`houston.ns.cloudflare.com` e `nataly.ns.cloudflare.com`) e a zona ativa, mas só existiam registros de e-mail: nenhum destino web, rota ou Custom Domain estava ligado ao Worker. O certificado Universal SSL já estava ativo.

Foram associados por Custom Domains o apex `informacaoprotegida.com.br` e `www.informacaoprotegida.com.br`, preservando MX/TXT. As associações também estão em `wrangler.jsonc` para persistir nos próximos deploys. `NEXT_PUBLIC_APP_URL` no build e runtime passa a ser `https://informacaoprotegida.com.br`; é necessário reconstruir o Next.js para atualizar origem permitida, canonical e sitemap. `www` e o endereço anterior workers.dev redirecionam páginas para o domínio principal preservando caminho/query.
