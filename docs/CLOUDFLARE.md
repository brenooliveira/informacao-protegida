# Cloudflare Workers

Worker: `informacao-protegida` · URL: https://informacao-protegida.breno26.workers.dev

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

Build OpenNext, dry-run, 76 testes unitários, lint, tipagem e smoke test workerd/Chromium aprovados localmente. Resultado remoto e URL serão confirmados após a publicação.
