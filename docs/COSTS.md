# Estimativa preliminar de custo mensal

Referência: 2026-10-30. Valores em USD, antes de impostos/câmbio, **sem contratação realizada**. Custos do produto futuro em produção; a Fase 1 roda localmente e não ativou esses serviços. O número de usuários sozinho não determina consumo; este é um orçamento por cenário, não garantia de capacidade ou fatura.

## Premissas do modelo (estimativas próprias)

- 30 dias, um projeto Supabase, um assento Vercel, usuários mensais ativos iguais à base indicada.
- 80% FREE com um e-mail; 20% pagos com média de dois e-mails monitorados.
- Catálogo com novidades em dez dias por mês; cada dia enfileira uma consulta por e-mail elegível. Nenhuma chamada repetida em menos de 24h.
- Novos e-mails verificados por mês equivalentes a 10% da base de usuários; FREE usa uma rechecagem mensal, pagos usam duas/mês. Para orçamento conservador, não descontar consultas que o cache poderia evitar.
- Consultas mensais HIBP = `N × (0,2 × 2 × 10 + 0,1 + 0,8 + 0,2 × 2)` = **5,3 × N**. Acréscimo de retries/abusos não incluído.
- E-mails transacionais: duas autenticações, 0,1 código adicional, 0,2 alerta e 0,2 resumo por usuário/mês = **2,5 × N**. Sem campanhas de marketing, sem IP dedicado e sem anexos.
- Arquivos de vazamentos não são armazenados; crescerão índices, resultados e logs. Medir volume real e uso dos seis meses de logs antes de escolher compute.

| Volume estimado                          | 100 usuários | 1.000 usuários | 10.000 usuários |
| ---------------------------------------- | -----------: | -------------: | --------------: |
| Chamadas HIBP/mês                        |          530 |          5.300 |          53.000 |
| Média de chamadas/minuto (mês inteiro)   |        0,012 |          0,123 |           1,227 |
| E-mails transacionais/mês                |          250 |          2.500 |          25.000 |
| E-mails elegíveis por evento de catálogo |           40 |            400 |           4.000 |

## Base de preços confirmada nas fontes oficiais

Supabase Pro começa em **US$25/mês**, com US$10 de crédito de compute; Micro custa US$10 e Small US$15. O modelo de 10 mil usuários reserva Small (total US$30), sujeito a medição. [Preços Supabase](https://supabase.com/pricing).

Vercel Pro custa **US$20/mês**, com US$20 de crédito de uso. O valor efetivo depende de execução e consumo; reserva adicional no cenário maior é orçamento próprio, não tarifa anunciada. [Preços Vercel](https://vercel.com/pricing).

Resend Free inclui **3.000 envios/mês, até 100/dia**. Pro de 50 mil custa **US$20/mês**. Para mil usuários, o modelo escolhe Pro para evitar que picos de OTP atinjam o teto diário. [Preços Resend](https://resend.com/pricing), [tabela oficial em Markdown](https://resend.com/pricing.md).

HIBP Core 1 aparece por **US$4,39/mês equivalente com pagamento anual de US$52,68**. Consultas individuais de usuários/clientes são permitidas nos planos com email search; isso difere de domain search de terceiros. O preço mensal sem compromisso anual e a quota exata do plano precisam ser confirmados no checkout/status antes da contratação. Não presumir que toda modalidade exibida na página pertence ao Core 1. [Planos HIBP](https://haveibeenpwned.com/Subscription), [API/status da assinatura](https://haveibeenpwned.com/API/v3#SubscriptionStatus).

## Orçamento por serviço

| Serviço                           |    100 usuários |  1.000 usuários |  10.000 usuários |
| --------------------------------- | --------------: | --------------: | ---------------: |
| Supabase                          |           25,00 |           25,00 |            30,00 |
| Vercel — base                     |           20,00 |           20,00 |            20,00 |
| Resend                            |            0,00 |           20,00 |            20,00 |
| HIBP — hipótese Core 1 anual      |            4,39 |            4,39 |             4,39 |
| **Base mensal equivalente**       |       **49,39** |       **69,39** |        **74,39** |
| Reserva própria para uso variável |            0–10 |            0–20 |             0–40 |
| **Faixa de orçamento**            | **49,39–59,39** | **69,39–89,39** | **74,39–114,39** |

O preço HIBP é condicional à quota contratada atender à fila. Sob a **hipótese de 10 RPM** do briefing e margem operacional para 8 consultas/minuto, um evento com quatro mil e-mails leva cerca de **8h20** só para drenar a fila, além do atraso da sincronização diária. Se todos os dez mil usuários monitorarem cinco e-mails, serão 50 mil consultas por evento e cerca de 104h10 a 8 RPM: esse cenário exige outro plano/quota e novo orçamento. Não prometer alertas imediatos.

Não incluídos: domínio, câmbio/IOF, impostos, honorários jurídicos, suporte humano, mais projetos/assentos, compute extra, armazenamento/egress excedentes e eventual infraestrutura adicional que dependa de aprovação. Logs legais precisam de retenção própria; o prazo de logs padrão do provedor não substitui esse requisito.

Recalcular antes de produção com taxa de login, número efetivo de e-mails, dias de novidades, pico da fila, crescimento do banco e limites reais da assinatura. Nenhuma aprovação de gasto está implícita nesta estimativa.
