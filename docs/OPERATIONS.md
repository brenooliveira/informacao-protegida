# Operação local — Fase 1

Use Node da `.nvmrc` e pnpm do `packageManager`. Não alterar configurações globais para operar o projeto.

1. Iniciar Docker Desktop.
2. `pnpm db:start`: inicia Supabase local, rede com bind 127.0.0.1.
3. `pnpm db:env`: importa apenas URL/chave pública locais para arquivo ignorado.
4. `pnpm db:types`: gera tipos; antes de commitar confira diff.
5. `pnpm db:check` e `pnpm db:test`: conexão e catálogo RLS.
6. `pnpm dev`: preview local. `pnpm db:stop`: encerra stack sem apagar dados.

Se os pulls de imagens falharem, conferir daemon, DNS, acesso a public.ecr.aws e conectividade do Docker; não resetar Docker nem apagar volumes de outros projetos. A primeira inicialização baixa imagens e pode levar vários minutos. A CLI é fixada e a stack é exclusiva do project_id `informacao-protegida`.

`pnpm build` inclui a checagem de segredos. Se ela falhar, a saída mostra nomes/arquivos, nunca valores. Remover o vazamento e rotacionar qualquer chave real exposta antes de publicar.

Studio não inicia por padrão: seu bind mount da pasta snippets, assim como pg_prove, bloqueou no ambiente macOS desta entrega. `pnpm db:test` usa stdin no psql já presente no container Postgres, sem novos pacotes/serviços ou mudanças de permissões do computador. A alternativa CLI fica em `pnpm db:test:cli`. Para habilitar Studio depois de resolver os mounts, ajustar o exclude em scripts/start-local-db.mjs e reiniciar somente este projeto.

O workflow remoto está preparado mas não foi executado por escolha de manter local. CI usa sentinelas fictícias; não requer HIBP, Resend, Supabase remoto ou cartão. Quando autorizado, criar/conectar repositório e confirmar execução real.

Runbooks de catálogo, worker, reprocessamento, retry-after, limpeza, alertas e rotação de chave HIBP serão documentados quando as integrações existirem. Não há jobs de produção a operar na Fase 1.
