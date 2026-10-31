# Segurança — estado da Fase 2

| Ameaça                       | Controle implementado                                                                    | Limite                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Senha divulgada              | Web Crypto no browser; request externo com prefixo 5; sem rota de senha; só por clique   | Provedor recebe prefixo/IP da conexão; JS não garante limpeza física de RAM |
| Resultado limpo falso        | Parser estrito, contagem zero descartada; HTTP/falhas geram erro                         | Base externa não cobre todo comprometimento                                 |
| Segredo no cliente           | server-only, schemas separados, scanner no build, testes de sentinelas                   | Scanner cobre padrões/variáveis previstas, não todos os segredos possíveis  |
| XSS/clickjacking             | CSP por nonce, scripts próprios, nosniff, frame-ancestors none, DENY                     | style-src unsafe-inline permanece por compatibilidade UI                    |
| Lista exposta                | RLS/policy deny-all, grants revogados, RPCs só service_role                              | Fase 3 ainda precisa isolamento real entre contas                           |
| Consentimento ausente        | RHF/Zod no browser, Zod no servidor e transação SQL                                      | Inscrição não prova titularidade; confirmar antes de qualquer campanha      |
| Abuso/concorrência           | Limites Postgres atômicos por HMAC de IP, horário e diário                               | Endpoints públicos ainda dependem da proteção de rede/host em produção      |
| Spoofing IP                  | Header confiável da plataforma configurada (Cloudflare/Vercel); localhost ignora headers | Trocar de host exige selecionar a fronteira de confiança                    |
| CSRF/payload                 | Origin estrita, JSON e stream limitado a 4 KiB                                           | Não substitui controles de autenticação futura                              |
| Token de revogação exposto   | 32 bytes aleatórios, HMAC no banco, fragmento #, POST explícito                          | Quem possui o link pode cancelar; pessoa deve guardar link original         |
| Enumeração/sequestro de link | Mensagem genérica e token original preservado em duplicatas                              | Contato/DPO ainda precisa ser definido antes de publicação                  |
| Retenção indefinida          | Limpeza pg_cron diária e cascata no cancelamento                                         | Operação precisa monitorar cron e revisar prazo quando cadastro abrir       |

HSTS fica ativo apenas em APP_ENV=production, sem atrapalhar localhost. CSP connect-src permite somente origem própria, Supabase configurado e api.pwnedpasswords.com; websocket adicional só no desenvolvimento. Credenciais HIBP/Resend não são usadas pelo verificador.

Não há cliente admin genérico acessível ao browser. O módulo de espera server-only usa service role sem receber owner/status da pessoa e chama funções específicas. Os grants de funções auxiliares também foram removidos de anon/authenticated/PUBLIC.

Pendências: OTP/cookies/RLS por conta, exportação/exclusão e logs legais na Fase 3; integração de contas HIBP e sanitização na Fase 4; revisão OWASP ASVS aplicável na Fase 7. Nenhum deploy, compra ou envio de e-mail foi feito nesta fase local.
