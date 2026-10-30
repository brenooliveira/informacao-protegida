# Verificação da Fase 1 local

Data: 2026-10-30, America/Sao_Paulo. Comandos executados com Node 24.13.0 e pnpm 10.30.1.

| Verificação                            | Resultado observado                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| pnpm format:check                      | Passou                                                                                   |
| pnpm lint                              | Passou, zero erros/avisos                                                                |
| pnpm typecheck                         | Passou, TypeScript strict e tipos de rotas                                               |
| pnpm test                              | 31 testes passaram em 3 arquivos                                                         |
| pnpm build                             | Passou, bundle de produção gerado                                                        |
| pnpm check:secrets (incluído no build) | 14 arquivos do cliente examinados, nenhum segredo detectado                              |
| pnpm test:e2e                          | 6 testes passaram: início, navegação e health em desktop/mobile                          |
| Rede na página (teste E2E)             | Nenhuma requisição a terceiros; scripts próprios sem unsafe-eval na CSP de produção      |
| Responsividade (teste E2E)             | Sem overflow horizontal em desktop e iPhone 13/Chromium                                  |
| Capturas visuais                       | Desktop/mobile geradas do build real e revisadas                                         |
| pnpm db:start                          | Concluiu com exit 0; Postgres/Auth/API e SMTP local iniciados com a CLI fixada           |
| pnpm db:check                          | API Supabase local acessível, Auth por e-mail habilitado; nenhum e-mail enviado          |
| pnpm db:test                           | 2/2 verificações pgTAP passaram no Postgres real                                         |
| pnpm db:types                          | Tipos gerados via CLI da base local real e formatados automaticamente, sem edição manual |
| pnpm dev                               | Servidor iniciou, página e health responderam HTTP 200                                   |
| CI remoto                              | Não executado: usuário solicitou manter somente local                                    |
| Deploy                                 | Não realizado; fase atual é local                                                        |

## Limites desta evidência

A base pública está vazia por decisão explícita: o schema ainda aguarda aprovação. O gate pgTAP exige RLS e políticas para cada tabela, mas sua execução nesta fase **não comprova isolamento funcional entre usuários**. Esse teste entra com as migrations na Fase 3. Nenhum cliente privilegiado, autenticação, HIBP, espera ou monitoramento foi implementado.

A stack local apresentou travamentos de contêineres em criação. Studio/pg_prove usavam bind mounts da pasta Documents; o SQL via stdin no container Postgres executou sem esses mounts. Studio fica opcional/desligado por padrão; API/Auth/Postgres são os serviços necessários para esta fase. Não foram alteradas permissões amplas do macOS nem apagados volumes de outros projetos. O daemon Docker foi reiniciado durante o diagnóstico; foram preservados dados/volumes.

O fluxo E2E foi executado em Chromium desktop e emulação mobile, não em Safari real. Lighthouse/SEO e verificador de senhas pertencem à Fase 2 e não foram declarados aprovados.

## Pendências para continuidade

- Revisão/aprovação de docs/SCHEMA.md, incluindo endereço PENDING, FAMILY e retenção.
- Aprovação para iniciar Fase 2, conforme SPEC.md, seção 12: “Implemente a Fase 1 [...] pare aguardando minha aprovação”.
- GitHub Actions está configurado; comprovar execução remota quando o usuário autorizar GitHub. A exigência original de CI remoto permanece explicitamente adiada.
- Tarifas e quotas reais precisam ser reconfirmadas antes de contratação; estimativa preliminar em docs/COSTS.md.
