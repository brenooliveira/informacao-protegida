# Roadmap

## Fase 1 — aprovada

Fundação, identidade Matrix, Supabase local, validação de ambiente, testes/CI preparado e schema proposto aprovados pelo usuário para continuidade em 2026-10-30.

## Fase 2 — implementada localmente, em revisão

Landing completa, verificador Pwned Passwords real no navegador, espera com consentimento/RLS/rate limit/revogação, limpeza diária, políticas/termos RASCUNHO, SEO/Open Graph e auditoria mobile. Evidências em docs/VALIDATION-PHASE2.md.

Deploy Vercel e execução remota de CI permanecem adiados pela instrução de manter local. Antes de publicação, completar/revisar dados jurídicos e DPO, canal de atendimento e confirmação de titularidade para futuras comunicações. Não foram enviados e-mails ou criadas cobranças.

## Próximas fases — aguardando revisão

3. OTP, SMTP Resend, demais migrations/RLS, e-mails verificados, exportação/exclusão, auditoria e isolamento entre dois usuários reais.
4. HIBP de contas, providers, catálogo/traduções, fila/limite global, histórico/resultados e sanitização.
5. Motor puro e catálogo RASCUNHO, questionário/painel e indicador por níveis em docs/SCORING.md.
6. Monitoramento, React Email, alertas/resumo, opt-in e retenções completas.
7. FREE/PLUS/FAMILY e limites no servidor, convites/consentimento agregado, interfaces BillingProvider/Asaas e SecurityAdvisorProvider sem cobrança/IA, revisão OWASP ASVS e checklist de produção.

## Pendências transversais

- Recalcular docs/COSTS.md com uso real e tarifas/quota no momento da contratação.
- Revisar IP e retenção de acesso legalmente exigido antes da Fase 3; logs padrão do provedor não bastam como decisão jurídica.
- Menores gerenciados por responsável fora do MVP; pendência jurídica.
- Planejar rotação versionada de HMAC para não invalidar silenciosamente links da espera.
- Concluir confirmação de endereço antes de campanhas, mesmo que o cadastro autenticado continue em implementação.
