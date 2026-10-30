# Segurança — fundação

## Ameaças e controles presentes

| Ameaça                            | Controle implementado                                                           | Limite atual                                                                |
| --------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Segredo no bundle                 | server-only, env separado, scanner no build/CI + testes de vazamento            | Não cobre segredos arbitrários fora dos padrões previstos                   |
| XSS/clickjacking                  | CSP nonce, object-src none, frame-ancestors none, X-Frame-Options DENY, nosniff | Sanitização HIBP será implementada na Fase 4                                |
| Configuração inválida             | Zod no carregamento de next.config e no módulo server                           | APP_ENV precisa ser production no deploy real                               |
| Exposição do banco local          | Rede Docker com bind loopback                                                   | Conferir configuração em cada máquina; não usar stack local em produção     |
| Acesso cruzado                    | Gate de catálogo exige RLS e policy explícita em todas as tabelas public        | Não existem tabelas de produto; isolamento funcional ainda não implementado |
| Vazamento por logs de ferramentas | Helpers de env/tipos capturam stdout contendo chaves; erros sem valores         | Não imprimir supabase status JSON em logs públicos                          |
| Risco de supply chain             | Lockfile, pacote CLI fixado, instalação frozen no CI                            | Auditoria de dependências e atualização contínua ainda necessárias          |

Não existe envio, armazenamento ou coleta de senha/e-mail na prévia. Não há autenticação, worker ou integração HIBP ativo.

## Pendências por fase

Fase 2: Pwned Passwords com prefixo somente, headers finais, consentimento de espera e testes de rede. Fase 3: cookies/refresh, OTP com HMAC de código, RLS funcional, limites, auditoria, exportação e exclusão. Fase 4: timeout/retry, quota global atômica, sanitização e XSS. Fase 7: revisão OWASP ASVS nível 1 aplicável, configuração de produção e dependências.

Não há afirmação de conformidade LGPD ou proteção garantida nesta entrega. HSTS fica ativo apenas com APP_ENV=production para não interferir em localhost.
