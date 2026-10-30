# Operação local — Fase 1

Use Node da `.nvmrc` e pnpm do `packageManager`. Não alterar configurações globais para operar o projeto.

1. Iniciar Docker Desktop.
2. `pnpm db:start`: inicia Supabase local, rede com bind 127.0.0.1.
3. `pnpm db:env`: importa URL/chaves locais e gera HMAC para arquivo ignorado com permissão 600; valores não são exibidos.
4. `pnpm db:types`: gera tipos; antes de commitar confira diff.
5. `pnpm db:check` e `pnpm db:test`: conexão e catálogo RLS.
6. `pnpm dev`: preview local. `pnpm db:stop`: encerra stack sem apagar dados.

Se os pulls de imagens falharem, conferir daemon, DNS, acesso a public.ecr.aws e conectividade do Docker; não resetar Docker nem apagar volumes de outros projetos. A primeira inicialização baixa imagens e pode levar vários minutos. A CLI é fixada e a stack é exclusiva do project_id `informacao-protegida`.

`pnpm build` inclui a checagem de segredos. Se ela falhar, a saída mostra nomes/arquivos, nunca valores. Remover o vazamento e rotacionar qualquer chave real exposta antes de publicar.

Studio não inicia por padrão: seu bind mount da pasta snippets, assim como pg_prove, bloqueou no ambiente macOS desta entrega. `pnpm db:test` usa stdin no psql já presente no container Postgres, sem novos pacotes/serviços ou mudanças de permissões do computador. A alternativa CLI fica em `pnpm db:test:cli`. Para habilitar Studio depois de resolver os mounts, ajustar o exclude em scripts/start-local-db.mjs e reiniciar somente este projeto.

O workflow remoto está preparado mas não foi executado por escolha de manter local. CI usa sentinelas fictícias; não requer HIBP, Resend, Supabase remoto ou cartão. Quando autorizado, criar/conectar repositório e confirmar execução real.

Runbooks de catálogo, worker, reprocessamento, retry-after, limpeza, alertas e rotação de chave HIBP serão documentados quando as integrações existirem. Não há jobs de produção a operar na Fase 1.

## Fase 2 — espera e verificador

Depois de `pnpm db:env`, execute `pnpm db:migrate` (migration up --local, sem reset destrutivo) e `pnpm db:types`. O helper agora importa também a chave de serviço local e gera WAITLIST_HMAC_SECRET em arquivo 600. Não publicar .env.local, status JSON ou tokens.

A função join_waitlist registra consentimento e reserva limites em transação; leave_waitlist remove inscrição/consentimentos; cleanup_waitlist elimina registros vencidos. Job waitlist-retention roda às 03:17 UTC (00:17 em São Paulo). Para verificar execução, consultar cron.job/cron.job_run_details com acesso administrativo, sem exportar endereços. A limpeza também pode ser invocada pelo operador local no Postgres. Após iniciar cadastro, revisar o prazo de encerramento da lista.

Verificador é browser → Pwned Passwords; se indisponível, a UI informa erro e limpa o campo. Não reenviar senha ao suporte ou habilitar logs de valores para diagnosticar. Atribuição permanece visível. CORS foi confirmado em testes reais; não há proxy de senha/prefixo no produto.

HMAC protege identificadores de IP e tokens. Rotacionar WAITLIST_HMAC_SECRET invalida links de cancelamento existentes; planejar uma transição com versões antes de rotacionar em produção. O ambiente atual é local, sem campanha nem usuários de produção. Não rotacionar silenciosamente: db:env preserva um segredo já existente.

## Publicação futura na Vercel (adiada)

1. Obter autorização de publicação/GitHub, configurar projeto Supabase remoto e Vercel do proprietário.
2. Revisar/controlador/DPO/termos, fornecedores/regiões, confirmação de titularidade da lista e canal para perda de link.
3. Aplicar somente migrations aprovadas no remoto pela CLI, sem db reset; conferir grants/RLS e cron.
4. Configurar URL pública HTTPS e chaves somente no servidor, HMAC forte/persistente, APP_ENV=production e provider real conforme gates do ambiente. Supabase SMTP/Resend e HIBP de contas serão conectados nas fases correspondentes. O verificador Pwned Passwords não usa chave.
5. Habilitar SITE_INDEXABLE=true somente para a landing aprovada; manter rotas privadas/rascunhos noindex. Conferir headers em HTTPS e relatórios mobile na URL final.
6. Executar CI remoto e deploy Vercel, validar resultado real; não declarar esse aceite concluído com base no build local.

Não houve publicação nem criação de contas/serviços pagos. A escolha anterior de manter tudo local continua em vigor.
