# Verificação da Fase 2 local

Data: 2026-10-30, America/Sao_Paulo. Node 24.13.0, pnpm 10.30.1, Next.js 16.4.3, Supabase CLI 2.122.0, Lighthouse 13.6.0.

**Implementação e aceite local verificados. Deploy Vercel/CI remoto adiados por instrução expressa do usuário de manter local.** Não declarar a URL pública validada: ela não foi publicada.

| Verificação                             | Resultado observado                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                                    | Passou sem erros/avisos                                                                                                               |
| TypeScript strict                       | Passou                                                                                                                                |
| Vitest + MSW                            | 65 testes passaram, 5 arquivos                                                                                                        |
| pgTAP                                   | 26 verificações: 2 de catálogo RLS + 24 de espera/acesso/consentimento/limites/revogação/retensão/cron                                |
| Build de produção local                 | Passou, 13 rotas geradas                                                                                                              |
| Scanner de segredos                     | 15 arquivos do cliente inspecionados; nenhum segredo detectado                                                                        |
| Playwright desktop/mobile               | 18 testes passaram; 4 casos de integração real desativados por padrão                                                                 |
| Integração real Pwned Passwords, opt-in | 2 testes passaram: exemplo público conhecido e senha aleatória de teste                                                               |
| Rede na consulta real                   | Somente GET com prefixo de cinco caracteres; sem senha/hash completo ao backend; campo limpo após resultado                           |
| Espera ponta a ponta                    | Consentimento exigido, registro real no banco, snapshot/IP truncado, duplicata sem novo consentimento e revogação/cascata confirmadas |
| Páginas/SEO                             | Política, termos, robots, sitemap e Open Graph PNG retornaram 200                                                                     |
| Interface                               | Desktop/mobile sem overflow horizontal; capturas revisadas; verificador também inspecionado na prévia do app                          |
| Migrations/tipos                        | Migration local aplicada sem reset; tipos gerados do Postgres real e formatados automaticamente                                       |
| CI/GitHub remoto                        | Workflow atualizado e preparado, execução remota não realizada                                                                        |
| E-mails/cobrança                        | Nenhuma mensagem enviada, nenhum pagamento/serviço contratado                                                                         |

## Lighthouse mobile

Auditoria de produção servida apenas em `http://127.0.0.1:3000`, simulação mobile padrão do Lighthouse (não aparelho físico), sem scripts de terceiros.

| Categoria      | Pontuação |
| -------------- | --------: |
| Desempenho     |    **99** |
| Acessibilidade |   **100** |
| SEO            |   **100** |

A auditoria acima usou **SITE_INDEXABLE=true no build e no servidor**, correspondendo à configuração planejada da landing pública. Isso não publica o site. No desenvolvimento normal, SITE_INDEXABLE=false mantém a página noindex. Os rascunhos jurídicos, projeto e cancelamento ficam noindex mesmo com a flag habilitada.

A primeira medição da prévia não indexável foi 98/100/66; o SEO foi penalizado justamente por noindex/robots, não por erro de metadados. Não removemos auditorias para obter a pontuação final. A correção de nome acessível do logotipo também foi verificada na segunda medição.

Relatórios completos entregues separadamente em outputs: `fase2-lighthouse-mobile.report.html` e `.report.json`. Reavaliar a URL real após futuro deploy; rede, região e infraestrutura de produção podem alterar os resultados.

## Como reproduzir

```sh
nvm use
pnpm install --frozen-lockfile
pnpm db:start
pnpm db:env
pnpm db:migrate
pnpm db:types
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:test
pnpm build
pnpm test:e2e
LIVE_PASSWORD_CHECK=1 pnpm exec playwright test --project desktop --grep 'integração real'
```

Para Lighthouse, gerar o build com SITE_INDEXABLE=true e iniciar o servidor com a mesma flag; executar Lighthouse 13.6.0 com Chrome e categorias performance/accessibility/seo. Os relatórios preservam configuração e métricas. Dados sintéticos das integrações são restritos aos testes; o app comum consulta a API real. A captura do resultado positivo entregue ao usuário veio da API real com o exemplo público de teste, não de MSW.

## Limites e pendências

- Deploy Vercel, domínio público e CI remoto aguardam autorização específica de publicação; continuar local preserva a escolha anterior.
- Minutas jurídicas com [REVISAR COM ADVOGADO] e campos de controlador/DPO ainda precisam de preenchimento/revisão, como previsto no briefing.
- A lista não confirma titularidade nem envia mensagens nesta fase; confirmar endereços antes de campanhas e definir canal para perda do link.
- Login, resultados de e-mail, usuários distintos e isolamento por conta não foram implementados nem declarados aprovados. Próxima entrega é a Fase 3, após revisão desta fase.
- JavaScript não garante zerar fisicamente strings da memória; aplicação limpa campo/referências e não persiste nem transmite o valor completo.

## Atualização posterior — publicação autorizada

O registro acima documenta o aceite local original. O proprietário depois autorizou GitHub e correção/publicação no Worker Cloudflare existente. Consulte [CLOUDFLARE.md](CLOUDFLARE.md) para a configuração atual, o deploy concluído e os testes na URL pública. A versão hospedada mantém a lista ativa no Supabase remoto informado pelo proprietário.
