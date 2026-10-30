# Roadmap

## Fase 1

Fundação, interface inicial Matrix, ambiente Supabase local, validação de env, gate de segredos, testes e proposta de schema. Aprovar o modelo antes das migrations. Ver evidências em docs/VALIDATION.md.

## Fases seguintes — aguardando revisão

2. Landing completa, verificador Pwned Passwords (consulta real somente por clique), espera/consentimento, rascunhos jurídicos, SEO/Lighthouse e primeiro deploy Vercel quando autorizado.
3. OTP, SMTP Resend, migrations/RLS, e-mails verificados, exportação, exclusão e auditoria; testes reais de dois usuários.
4. HIBP providers, catálogo/traduções, fila/limite global, histórico/resultados e HTML sanitizado.
5. Motor de recomendações puro e catálogo RASCUNHO, questionário, painel e docs/SCORING.md.
6. Monitoramento elegível, templates React Email, preferências, resumo e retenção.
7. Limites FREE/PLUS/FAMILY, convites e consentimento agregado, interfaces BillingProvider/Asaas e SecurityAdvisorProvider sem IA/cobrança, OWASP ASVS e preparação de produção.

## Pendências de documentação/decisões futuras

- docs/HIBP.md com termos atuais, custos, cota, respostas, retries e atribuição.
- docs/SCORING.md com fórmula educativa por níveis, sem nota falsa de precisão.
- Estimativa preliminar entregue em docs/COSTS.md para 100, 1.000 e 10.000 usuários; recalcular com métricas e quota efetiva no momento da contratação. Nenhuma compra foi autorizada ou realizada nesta fase.
- Dados da empresa/DPO nos rascunhos legais e revisão por advogado.
- IP/retensão de registros de acesso versus minimização: revisar aplicabilidade jurídica e desenho final antes de Fase 3.
- Contas de menores gerenciadas por responsável fora do MVP; pendência jurídica explícita.
- GitHub remoto/execução de CI e deploy adiados por instrução expressa do usuário de manter local.
