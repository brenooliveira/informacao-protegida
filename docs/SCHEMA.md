# Proposta de schema — aguardando aprovação

Data: 2026-10-30. **Não aplicado. Não é migration.** Nenhuma tabela de negócio será criada até aprovação. Esta proposta reúne tipos, relacionamentos, índices, unicidade, RLS e retenção para orientar a revisão antes da Fase 3.

## Convenções

Postgres 17/Supabase. UUID com `gen_random_uuid()` para PKs salvo tabelas de referência e chaves compostas. Datas em `timestamptz` UTC; `BreachDate` em `date`. Todas as tabelas mutáveis terão `created_at` e `updated_at` com trigger de atualização. Registros imutáveis terão somente `created_at`/data de evento; não simular atualização. FKs indexadas, `NOT NULL` por padrão, campos opcionais indicados com `?`.

`owner_id` aponta `profiles.user_id` e todas as ligações entre entidades do usuário preservam o dono: `monitored_emails UNIQUE(id, owner_id)` permite FKs compostas em resultados/jobs/códigos. Isso impede associar UUID de outro usuário mesmo em inserts autorizados. Políticas usam `(select auth.uid())`, `USING` e `WITH CHECK`; RLS e privilégios SQL são barreiras distintas.

RLS habilitado em **todas** as tabelas. Sem acesso necessário ao cliente: revogar privilégios de `anon`/`authenticated` e política explícita `USING(false) WITH CHECK(false)` para esses papéis. O teste exige política inclusive nas tabelas internas. Service role apenas em jobs/admin com escopo explícito; nunca exposto ao browser. Policies não autorizam usuário a mudar plano, status de verificação, resultado ou contador.

Categorias de acesso nesta proposta:

- **Próprio R:** usuário pode ler suas linhas; alterações somente por caso de uso do servidor, com sua identidade e RPC restrita quando necessário.
- **Próprio RU limitado:** ler/alterar somente colunas explicitamente liberadas. RLS + grants de coluna ou RPC; jamais UPDATE genérico.
- **Catálogo R:** `authenticated` pode ler; escrita apenas worker/admin. `plans` e conteúdo público aprovado também podem ter SELECT `anon` quando exigido pela landing.
- **Interno:** política deny-all para usuários; worker com service role ou função definida e restrita.

## Tipos e checks

Enums: `email_status(PENDING,VERIFIED)`; `check_source(verification,automatic,manual)`; `check_result(found,none,error)`; `job_status(queued,running,completed,failed,cancelled)`; `priority(high,medium,low)`; `recommendation_status(pending,completed,not_applicable)`; `plan_code(FREE,PLUS,FAMILY)`; `subscription_status(active,cancelled)`; `member_status(invited,active,revoked,left)`; `notification_type(login_code,email_code,new_breach,monthly_summary,account_deleted)`; `delivery_status(queued,sent,failed)`; `consent_purpose(waitlist,marketing,monthly_summary,family_summary)`.

E-mail `text` normalizado por trim/minúsculas no servidor e CHECK no banco; limite 254 caracteres. Não retirar pontos nem `+aliases`. UUID nunca substitui autorização. JSONB apenas para estruturas versionadas com esquema validado, sem dados de cartão, dumps ou texto livre de logs.

## Tabelas

As colunas de timestamp seguem as convenções acima. `CASCADE` em propriedade do usuário salvo exceções declaradas. `RESTRICT` em catálogos/referências, exceto regras específicas de retenção.

### profiles

- PK `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE`.
- `locale text DEFAULT 'pt-BR' CHECK(locale='pt-BR')`, `last_dashboard_visit_at timestamptz?`.
- Índices: PK. Não duplicar e-mail do Auth nem coletar nome/CPF/telefone/endereço.
- RLS: próprio R; edição de locale/visita via RPC limitada, sem coluna de plano editável.
- Retenção: enquanto conta ativa; cascata na exclusão. Criação em transação com perfil/assinatura/free/e-mail verificado, após confirmação Auth.

### monitored_emails

- `id uuid PK`, `owner_id FK profiles CASCADE`, `normalized_email text`, `status email_status DEFAULT PENDING`, `verified_at timestamptz?`, `last_checked_at timestamptz?`.
- `UNIQUE(normalized_email)`, `UNIQUE(id,owner_id)`, índice `(owner_id,status)`; CHECK consistência VERIFIED ↔ verified_at preenchido.
- RLS: próprio R; criar/verificar/remover por casos de uso/RPC. Alterar endereço exige remover e verificar outro, sem UPDATE arbitrário.
- Retenção: até remoção/conta excluída; pendentes não verificados expiram em 24 h e são removidos diariamente. Unicidade global **inclui pendentes** por até 24 h para evitar disputa de verificação; limites e cooldown reduzem reserva abusiva. Mensagens genéricas não revelam titular.
- Decisão para aprovação: reservar endereço pendente por prazo limitado evita duas contas verificando o mesmo e-mail; alternativa é claim apenas na confirmação com fila privada de pedidos. Implementar o claim transacional se reservas abusivas se mostrarem relevantes.

### email_verification_codes

- `id uuid PK`, `monitored_email_id uuid`, `owner_id uuid`, FK composta `(monitored_email_id,owner_id)` CASCADE.
- `code_digest bytea`, `digest_version smallint`, `expires_at timestamptz`, `attempts smallint DEFAULT 0 CHECK 0..5`, `last_sent_at timestamptz`, `consumed_at timestamptz?`.
- Digest por HMAC-SHA-256 com segredo servidor e contexto (id/e-mail/nonce), sem código em claro; futuro segredo `OTP_HASH_SECRET` será adicionado na Fase 3. Hash simples de 6 dígitos é vulnerável a enumeração offline.
- Índices `(owner_id,created_at)`, `(expires_at)`, único parcial por monitored_email_id com consumed_at NULL; emissão invalida anterior atomicamente. Expiração por comparação no RPC, não em índice dependente de `now()`.
- RLS: interno. Retenção: expirados/consumidos apagados diariamente. Consumo bloqueia linha e incrementa tentativas, 15 min / 5 tentativas / 60 s entre envios; limites diários por usuário e IP na mesma transação. Não substitui OTP do Supabase Auth.

### breaches

- `name text PK` (identificador HIBP), `title text`, `domain text?`, `breach_date date?`, `added_at timestamptz?`, `modified_at timestamptz?`, `pwn_count bigint CHECK >=0`, `data_classes text[]`, `description_html text`, `logo_path text?`, `is_verified boolean`, `is_fabricated boolean`, `is_spam_list boolean`, `is_retired boolean`, `is_sensitive boolean DEFAULT false`, `synced_at timestamptz`.
- Índices `(added_at)`, GIN(data_classes), `(synced_at)`. `is_sensitive` reflete somente metadado público; nunca tentar obter conteúdo sensível omitido pela API.
- RLS: catálogo R. Retenção: catálogo enquanto serviço ativo; marcar retired conforme fonte, não apagar referências existentes.
- Texto HTML é dado não confiável. Sanitizar antes de renderizar; nenhum HTML bruto no browser.

### data_class_translations

- `source_name text PK`, `label_pt_br text?`, `translation_status text CHECK IN ('draft','reviewed','missing')`, `last_seen_at timestamptz`.
- `breaches.data_classes` é array da fonte, validado pela sincronização; não FK array. Classes novas entram como missing e geram evento operacional sem e-mail.
- RLS: catálogo R. Retenção: enquanto catálogo existir; tradução ausente usa original com fallback explícito.

### email_breaches

- PK `(monitored_email_id uuid,breach_name text)`; `owner_id uuid`; FK composta para monitored_emails CASCADE; `breach_name REFERENCES breaches(name) RESTRICT`.
- `first_detected_at timestamptz`, `last_detected_at timestamptz`, `seen_at timestamptz?`.
- Índices `(owner_id,seen_at)`, `(breach_name)`. Persistir detecção conhecida; 404 posterior não remove histórico automaticamente sem semântica definida da fonte.
- RLS: próprio R; marcar visto por RPC/coluna limitada; detecção somente worker.
- Retenção: até remoção do e-mail/conta. Exportação inclui atribuição HIBP e timestamps.

### security_checks

- `id uuid PK`, `monitored_email_id uuid`, `owner_id uuid`, FK composta CASCADE, `source check_source`, `result check_result`, `breach_count integer CHECK >=0`, `completed_at timestamptz`, `error_code text?` (enum allowlist, sem resposta bruta).
- Índices `(owner_id,completed_at DESC)`, `(monitored_email_id,completed_at DESC)`. Só append, sem updated_at.
- RLS: próprio R por janela do plano; FREE visualiza últimos 30 dias via política que consulta função de entitlement sem recursão. PLUS/FAMILY histórico integral. Escrita só worker.
- Retenção: até remoção do e-mail/conta; separar limite de visualização de retenção para permitir upgrade. Definir prazo máximo com revisão jurídica antes da Fase 3.

### check_jobs

- `id uuid PK`, `monitored_email_id uuid`, `owner_id uuid`, FK composta CASCADE; `source check_source`, `status job_status`, `attempts smallint DEFAULT 0`, `available_at timestamptz`, `locked_at timestamptz?`, `lease_expires_at timestamptz?`, `locked_by uuid?`, `dedupe_key text UNIQUE`, `error_code text?`, `finished_at timestamptz?`.
- Índice parcial `(available_at,id) WHERE status='queued'`; parcial `UNIQUE(monitored_email_id) WHERE status IN ('queued','running')`; `(finished_at)`.
- RLS: interno. Retenção: finalizados 30 dias; exclusão de e-mail cancela e remove jobs. Erros armazenados por código, sem resposta/API/e-mail em claro.
- Claim via `FOR UPDATE SKIP LOCKED`, lease para recuperar worker interrompido, idempotência para gravação/envio. Antes de cada chamada confirmar VERIFIED, titular ativo, elegibilidade e janela mínima de 24h; resposta antiga reutilizada dentro da janela.

### api_usage

- PK `(owner_id uuid REFERENCES profiles CASCADE, usage_date date)`, `call_count integer DEFAULT 0 CHECK >=0`, timestamps.
- Índice `(usage_date)`. Contabilizar tentativas enviadas ao provider, incluindo retries conforme cobrança real confirmada.
- RLS: interno. Retenção proposta 90 dias para otimizar custo; agregado diário sem identificador pode ser mantido depois da exclusão. Não registrar e-mail consultado.

### recommendation_templates

- `code text PK`, `version integer CHECK >0`, `title text`, `explanation text`, `why_it_matters text`, `steps jsonb` (lista validada), `priority priority`, `trigger_rules jsonb` (declarativo versionado), `publication_status text CHECK IN ('draft','reviewed')`.
- Índice `(publication_status)`. Um código atual por recomendação; versionar histórico de conteúdo em Git/seed. Links oficiais allowlist HTTPS.
- RLS: catálogo R de conteúdo revisado; rascunhos apenas ambiente/admin. Retenção: catálogo permanente; desativar em vez de apagar algo referenciado.
- Primeira versão RASCUNHO será gerada na Fase 5, conforme revisão de conteúdo.

### user_recommendations

- `id uuid PK`, `owner_id FK profiles CASCADE`, `template_code FK recommendation_templates RESTRICT`, `template_version integer`, `status recommendation_status DEFAULT pending`, `completed_at timestamptz?`, `source_breach_names text[]`, `source_assessment_keys text[]`.
- `UNIQUE(owner_id,template_code)`, índice `(owner_id,status)`; CHECK completed ↔ completed_at. Código estável agrupa recomendações iguais.
- RLS: próprio R; somente status pelo RPC (calcula completed_at no servidor). Worker atualiza fontes sem reabrir conclusão arbitrariamente. Ao remover e-mail, recalcular fontes/recomendações; apagar as sem fonte e sem resposta relevante conforme regra aprovada.
- Retenção: até exclusão da conta ou reconciliação de fontes. Não duplicar detalhes do HIBP em logs.

### assessment_answers

- PK `(owner_id uuid REFERENCES profiles CASCADE, question_key text)`, `answer text CHECK IN ('yes','no','unknown')`, `questionnaire_version integer`, timestamps.
- CHECK question_key em allowlist das 5–8 perguntas; alterar versão preserva migração explícita. Sem texto livre.
- RLS: próprio R; edição por RPC que valida schema e reconcilia recomendações. Retenção: até exclusão/revogação voluntária das respostas.

### plans

- `code plan_code PK`, `monitored_email_limit smallint`, `automatic_monitoring boolean`, `manual_check_interval_hours integer`, `history_window_days integer?`, `monthly_summary boolean`, `member_limit smallint`, `is_active boolean`.
- CHECK limites positivos, member_limit >=1, configuração versionada. FREE: 1/false/720/30/false/1; PLUS: 5/true/24/NULL/true/1; FAMILY: 10/true/24/NULL/true/5. A janela manual de 30 dias é duração de 720h, não mês de calendário.
- RLS: catálogo R público; escrita admin. Retenção: permanente; nunca limites espalhados no frontend.

### subscriptions

- `id uuid PK`, `owner_id FK profiles CASCADE`, `plan_code FK plans RESTRICT`, `status subscription_status`, `started_at timestamptz`, `ended_at timestamptz?`, `billing_provider text?`, `external_reference text?`.
- Único parcial `(owner_id) WHERE status='active'`; índice `(plan_code,status)`. FREE inicial criado no servidor.
- RLS: próprio R; alterar plano só admin/seed. Sem cartão, token de cartão, cobrança ou cliente Asaas implementado.
- Retenção: enquanto conta existir; downgrade reconciliado atomicamente. Limite é aplicado a operações novas; decisão sobre excedentes (pausar até reduzir) precisa ser exibida na UI da Fase 7, sem apagar dados silenciosamente.

### family_groups

- `id uuid PK`, `owner_id FK profiles CASCADE UNIQUE`, `subscription_id FK subscriptions RESTRICT UNIQUE`, timestamps.
- RLS: titular lê metadados do grupo; membro ativo lê apenas id e condição de participação via RPC limitada, sem listar e-mails de outros membros.
- Retenção: até fim do grupo/conta do titular; dissolver grupo retira compartilhamento, membros mantêm contas e tornam-se FREE. A subscription deve pertencer ao owner e ser FAMILY, verificado transacionalmente.

### family_members

- `id uuid PK`, `group_id FK family_groups CASCADE`, `member_user_id uuid? REFERENCES profiles ON DELETE SET NULL`, `invited_email text`, `status member_status`, `invite_token_digest bytea?`, `invite_expires_at timestamptz?`, `accepted_at timestamptz?`, `left_at timestamptz?`.
- `UNIQUE(group_id,invited_email)`, índice `(member_user_id,status)`, único parcial `(member_user_id) WHERE status='active'`, único parcial `(invite_token_digest) WHERE invite_token_digest IS NOT NULL`. Convite expira em 7 dias; política de limites sob lock.
- RLS: titular lê/gerencia apenas status/convite no próprio grupo por RPC; convidado vê/aceita seu convite após autenticar e verificar **o e-mail exato do convite**. Não autoriza SELECT em e-mails/resultados de membro.
- Retenção: convites expirados e vínculos inativos por 30 dias; membro excluído tem dados identificáveis removidos imediatamente e vínculo retirado. Titular ocupa 1 das 5 vagas; total 10 e-mails inclui todos os membros.
- Compartilhamento só se `consent_records` ativo para group_id; RPC de resumo retorna contagens de vazamentos e recomendações altas pendentes, jamais detalhes/e-mails do membro. Sem consentimento não retornar contagem, nem zero ambíguo.

### notification_preferences (adicional necessário)

- PK `owner_id FK profiles CASCADE`, `new_breach_alerts boolean DEFAULT true`, `monthly_summary_enabled boolean DEFAULT false`, `unsubscribe_token_digest bytea?`, timestamps.
- Token único parcial. RLS próprio R; atualização via caso de uso com consentimento/revogação quando necessário.
- Retenção: até exclusão. O resumo exige simultaneamente opt-in registrado e entitlement. Não desativar OTP/exclusão usando descadastro promocional.

### notifications

- `id uuid PK`, `owner_id uuid? REFERENCES profiles ON DELETE CASCADE`, `type notification_type`, `status delivery_status`, `dedupe_key text UNIQUE`, `provider_message_id text?`, `attempts smallint`, `available_at timestamptz`, `sent_at timestamptz?`, `error_code text?`.
- Índices `(owner_id,created_at)`, parcial `(available_at) WHERE status='queued'`. Sem corpo ou resultado de vazamento.
- RLS: próprio R das notificações de conta; escrita interno. Retenção proposta 90 dias e imediata na exclusão.
- Confirmação de exclusão é enviada pelo processo antes de descartar o destinatário da memória; registro final sem owner/destinatário/corpo. Falhas de entrega exigem outbox temporária criptografada, TTL 24h, desenho/revisão na Fase 3; não afirmar entrega garantida só por HTTP 200 do provedor.

### consent_records

- `id uuid PK`, `owner_id uuid? REFERENCES profiles CASCADE`, `waitlist_id uuid? REFERENCES waitlist CASCADE`, `family_group_id uuid? REFERENCES family_groups CASCADE`, `purpose consent_purpose`, `text_version text`, `granted_at timestamptz`, `revoked_at timestamptz?`, `ip_truncated inet?`.
- CHECK exatamente um de owner_id/waitlist_id; family_summary exige owner e group. CHECK IP IPv4 /24 ou IPv6 /48 no armazenamento; sem fingerprint.
- Únicos parciais por dono/finalidade/contexto com revoked_at NULL; contexto não nulo tratado por índices separados para não permitir duplicação com NULL. Índices `(owner_id,purpose)`, `(waitlist_id)`, `(family_group_id)`.
- RLS: próprio R quando owner; gravação/revogação via servidor. Sem SELECT anônimo para espera. Histórico por eventos imutáveis; revogação preenche revoked_at, não altera texto/data original.
- Retenção: até exclusão do titular/lista conforme briefing; advogado deve revisar eventual comprovação mínima de consentimento após exclusão. Revogação interrompe processamento imediatamente.

### audit_events

- `id uuid PK`, `owner_id uuid? REFERENCES profiles ON DELETE SET NULL`, `event_type text` allowlist (login/email_add/email_remove/export/delete/plan_change/consent_change), `occurred_at timestamptz`, `correlation_id uuid` sem associação pública.
- Imutável, sem updated_at. Índices `(owner_id,occurred_at)`, `(occurred_at)`. Sem e-mail, código, token, hash de senha, vazamento ou metadata livre.
- RLS: interno. Retenção seis meses, limpeza diária; na exclusão owner desvinculado. Revisar retenção de eventos que não se enquadram em obrigação legal; não usar a exigência de acesso para reter todo dado indefinidamente.

### access_logs (adicional: obrigação distinta de auditoria)

- `id uuid PK`, `occurred_at timestamptz`, `ip_encrypted bytea`, `encryption_key_version smallint`, `subject_reference uuid?` sem FK para conteúdo, `request_id uuid`, `route_code text` allowlist, sem querystring/corpo/user-agent bruto.
- Imutável; índice `(occurred_at)`, partição mensal opcional posterior. RLS interno, sem grant a usuários; acesso operacional excepcional registrado e restrito.
- Retenção proposta seis meses e limpeza diária; desvincular subject_reference na exclusão e nunca guardar conteúdo. Chaves fora do banco. Revisar definição de IP, tempo, logs do provedor e base jurídica com advogado antes de implementar. Não confundir IP truncado de consentimento com registro de acesso legalmente suficiente.

### waitlist

- `id uuid PK`, `normalized_email text UNIQUE`, `status text CHECK IN ('active','unsubscribed')`, `confirmed_at timestamptz?`, `unsubscribe_token_digest bytea UNIQUE`, timestamps.
- Índice `(status,created_at)`. Sem campos adicionais de identificação.
- RLS: interno. Ação pública validada recebe e-mail + consentimento explícito; usa caso de uso com rate limit, não INSERT público direto. Resposta idêntica para duplicata.
- Retenção proposta: até abertura do cadastro + 90 dias ou revogação anterior, apagar em até 24h. Alinhar prazo no texto de consentimento na Fase 2. Não inscrever sem consent_record na mesma transação.

### rate_limits

- PK `(scope text, subject_digest bytea, window_start timestamptz)`, `request_count integer CHECK >=0`, `expires_at timestamptz`, timestamps.
- Scope allowlist por ação; subject é HMAC rotativo de user/IP (não hash fraco nem IP em claro). Índice `(expires_at)`.
- RLS: interno. TTL da janela + 24h; limpeza diária. `INSERT ... ON CONFLICT ... WHERE count<limit RETURNING` ou lock equivalente garante incremento e decisão atômicos. Verificar simultaneamente limites por IP e usuário, inclusive diários.

### hibp_rate_slots (adicional: limite global)

- `id uuid PK`, `reserved_at timestamptz`, `job_id uuid? REFERENCES check_jobs ON DELETE SET NULL`, `attempt_no smallint`.
- Imutável; índice `(reserved_at)`. RLS interno; retenção 48h. Não contém usuário/e-mail.
- Reserva por transação com advisory lock global: contar chamadas reservadas nos últimos **60 segundos móveis**, comparar RPM, gravar slot e só então permitir chamada. Espaçamento conservador por `next_allowed_at` e margem respeita plano; retry também precisa de slot. Slot não é devolvido se envio incerto; isso reduz uso, nunca permite exceder. A garantia com funções paralelas será testada na Fase 4.

### catalog_sync_runs (adicional: idempotência e observabilidade)

- `id uuid PK`, `started_at timestamptz`, `finished_at timestamptz?`, `status text CHECK IN ('running','completed','failed')`, `new_breach_names text[]`, `error_code text?`.
- Único parcial para um running global; índice started_at. RLS interno. Retenção 30 dias.
- Primeiro catálogo cria baseline sem disparar todos os monitoramentos. Comparar conjuntos de nomes, não só datas; upsert e enfileiramento idempotentes. Usar dedupe por email/evento. Worker revalida plano na execução.

## Operações transacionais críticas

1. **Primeiro login:** confirmar Auth; criar profile, FREE ativo e e-mail de login VERIFIED; reservar limite/primeiro job em transação idempotente. Sem consulta antes da verificação.
2. **Adicionar/verificar e-mail:** lock do titular e, em FAMILY, grupo para contagem; reservar vaga; resposta genérica em conflito; emitir/validar código com contadores atômicos; claim global e job na mesma transação. Nunca aceitar owner/status do cliente.
3. **Executar consulta:** lease do job, revalidar propriedade/estado/plano, cache ≥24h, slot global, chamada externa fora da transação longa; gravar resultado/detecções e outbox com dedupe em transação curta. `404` é resultado válido none; 429/503 reprogramam sem alerta falso.
4. **Resumo FAMILY:** função de privilégio mínimo com search_path fixo, argumentos estritos e grants de execução só authenticated. Validar caller=titular, grupo ativo, membro ativo e consentimento atual em toda chamada. Retornar somente duas contagens. Revogação e saída eliminam acesso na transação, sem cache compartilhado.
5. **Excluir:** marcar conta em processo para bloquear jobs, remover dados/Auth, desvincular acesso/auditoria exigida, remover convite/consentimento, enviar confirmação; coordenar APIs externas com saga/outbox idempotente. Tokens privados e destinatário temporário jamais no log. Não existe garantia de transação ACID entre Resend/Auth/DB; documentar recuperação de falhas na Fase 3.
6. **Planos:** RPC admin; cliente nunca atualiza plano. Entitlement efetivo FREE/PLUS ou FAMILY ativo. Contagem de membros e total de e-mails sob lock do grupo. Resumo mensal condicionado a plano **e** consentimento.

## Verificações obrigatórias com as migrations

- Gate pgTAP já preparado verifica tabelas RLS/policy. Adicionar: grants, WITH CHECK, enum/checks, ownership composto e políticas reais com dois usuários.
- Tentar ler/escrever UUID de outro usuário por REST/RPC, alterar owner, status VERIFIED, limites/assinatura e papel de titular.
- Concorrência em claim de e-mail, OTP (expiração/5 tentativas/60s), RPM móvel, fila/lease, 24h/cache e limites FAMILY.
- Sanitização de HTML e propagação de atribuição em tela/e-mail/exportação.
- Exclusão e revogação sem órfãos, fila ativa ou cache de resumo familiar.

## Pontos para aprovação

- Aprovar entidades/relações antes de migrations. Proposta contém 25 tabelas: 21 do briefing + notification_preferences, access_logs, hibp_rate_slots e catalog_sync_runs (recommendation_templates/user_recommendations contadas separadamente).
- Confirmar reserva de endereço PENDING por até 24h ou preferir claim apenas na confirmação.
- Aceitar retenções propostas para histórico integral, espera, contadores e notificações; revisar legalmente access_logs e comprovação de consentimento.
- Confirmar titular incluído no limite FAMILY de cinco membros e dez e-mails somados.

Essas decisões são propostas para revisão, não escolhas já impostas ao banco. Os detalhes podem mudar antes da primeira migration sem custo de migração de dados.
