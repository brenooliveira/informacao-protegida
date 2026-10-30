# Decisões

| Data       | Decisão                                                   | Motivo / risco                                                                            | Alternativa descartada                                     |
| ---------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 2026-10-30 | Fase 1 local; revisão antes das demais                    | Sequência explícita da especificação; usuário pediu manter local                          | Criar remoto/publicar automaticamente                      |
| 2026-10-30 | Identidade Matrix: preto e verde neon, linhas e escudo    | Preferência direta do usuário tem precedência; preservar leitura e tom calmo              | Paleta azul/branco do anexo                                |
| 2026-10-30 | Next.js 16.4.3 + React 19.3                               | Estáveis atuais confirmados no registro e documentação; lockfile versionado               | Usar canary ou versões de memória                          |
| 2026-10-30 | Node 24.13.x / pnpm 10.30.1                               | Runtime já instalado; compatível com Vitest 5; sem alterar runtime global                 | Node 20 incompatível com Vitest 5                          |
| 2026-10-30 | shadcn CLI 4.23, Base UI                                  | Gerador oficial atual escolhe Base UI; dependências de suporte vieram da UI obrigatória   | Misturar componentes Radix e Base UI                       |
| 2026-10-30 | Schema público de env separado                            | Evita incluir strings/regras de segredos em chunks por efeitos de inicialização           | Um único módulo de env importado pelo browser              |
| 2026-10-30 | Configurar sem integrar HIBP/Resend na Fase 1             | Sem chave nem dados reais, nada é consultado; produção recusa mock                        | Criar resultados demonstrativos sem necessidade            |
| 2026-10-30 | Não criar migrations antes da aprovação                   | Modelo tem decisões caras: FAMILY, exclusão e consentimentos                              | Aplicar schema preliminar silenciosamente                  |
| 2026-10-30 | Supabase CLI fixado como devDependency                    | Reprodutibilidade no CI/local; CLI global era mais antigo                                 | Depender do CLI global do computador                       |
| 2026-10-30 | Supabase local em rede Docker com bind 127.0.0.1          | Evita expor serviços na LAN; Docker só local/CI                                           | Bind público ou Docker em produção                         |
| 2026-10-30 | CSP com nonce e SSR dinâmico                              | Compatível com scripts próprios do Next e sem scripts inline arbitrários; há custo de SSR | unsafe-inline para JavaScript                              |
| 2026-10-30 | CSS inline permitido, scripts externos ausentes           | Compatibilidade Base UI; rever restrição de estilos na fase de hardening                  | Quebrar componentes com política não validada              |
| 2026-10-30 | Sem fonte remota                                          | Build independente de CDN e nenhuma requisição de terceiro na prévia                      | Fonte Google carregada em runtime                          |
| 2026-10-30 | E-mail normalizado em minúsculas sem remover ponto/+alias | Política de produto consistente; não assumir regras Gmail para todos                      | Normalização específica de um provedor                     |
| 2026-10-30 | Sem cliente service role na fundação                      | Não há job implementado; evita expor bypass RLS sem necessidade                           | Cliente admin genérico reutilizável em handlers de usuário |

| 2026-10-30 | MSW 3 usa onUnhandledFrame | API atual confirmada no guia oficial de migração; bloquear tráfego não simulado em testes | onUnhandledRequest de MSW 2 |
| 2026-10-30 | Iniciar somente serviços Supabase usados no MVP local | Postgres/Auth/API/metadata/mailpit; economiza recursos locais e evita serviços sem uso. Não muda Postgres/Auth hospedados futuros | Studio/Realtime/Storage/Edge/analytics/pooler locais sem uso |

| 2026-10-30 | pgTAP por stdin e Studio opcional no ambiente local | Bind mounts sob Documents bloquearam os contêineres Studio/pg_prove neste macOS; docker exec/psql evita montagem sem mudar privilégios do host. Runner valida plano TAP, contagem e not ok; runner CLI alternativo preservado | Conceder acesso amplo ao filesystem ou declarar banco aprovado sem testar |

Decisões propostas de dados aguardando aprovação: detalhadas em SCHEMA.md. A forma de logs legais e direitos de titulares requer revisão jurídica na fase adequada, sem declarar conformidade antecipada.
