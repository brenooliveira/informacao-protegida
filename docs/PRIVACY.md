# Privacidade — Fase 2 local

**RASCUNHO [REVISAR COM ADVOGADO].** Política e termos em /privacidade e /termos, com campos da empresa e DPO deliberadamente em aberto. Não usar dados pessoais de outras fontes para preencher esses papéis. Antes da publicação, completar controlador, atendimento, fornecedores/regiões e revisão jurídica.

## Dados efetivos nesta fase

- Verificador: senha e hash completo ficam no browser; prefixo de cinco hex vai diretamente ao Pwned Passwords. O provedor observa os dados da conexão. Nenhum valor de senha/hash/prefixo é recebido ou armazenado pelo nosso backend. Sem analytics/pixels/fontes remotas.
- Espera: e-mail normalizado, snapshot e versão do consentimento, data/hora e IP truncado /24 ou /48. Consentimento explícito para notícias do lançamento, independente do verificador gratuito. SQL grava lista + consentimento na mesma transação.
- Antiuso indevido: HMAC do IP com segredo do servidor, escopo, janela, contador e expiração. IP completo não é persistido nesta tabela.
- Cancelamento: token aleatório entregue no recibo; apenas digest HMAC no banco. Fragmento # não é enviado como URL ao servidor. Só um POST confirmado pela pessoa cancela; token inválido e válido têm mesma mensagem. Cancelamento remove lista/consentimentos em cascata.

A lista não verifica titularidade nesta fase e não envia mensagens. Antes de campanhas, implementar confirmação do e-mail; nenhuma autorização para envio a terceiros está implícita na execução dos testes. Duplicatas não substituem o token original. Se a pessoa perder o link, o canal do controlador deverá atender; esse canal precisa estar operacional antes de publicação.

## Retenção

Espera: no máximo 180 dias; cancelamento apaga imediatamente. Cron diário às 03:17 UTC (00:17 em São Paulo) remove registros expirados e contadores. Na abertura do cadastro, encerrar lista em até 90 dias, se isso ocorrer antes, conforme desenho original. Contadores expiram após fim da janela + um dia, sendo removidos na próxima limpeza diária. Consentimentos são apagados junto da inscrição, sujeito à revisão jurídica sobre comprovação mínima.

## Bases propostas e fontes

Consentimento para espera e comunicações de lançamento. Bases do produto futuro, ainda não ativado: contrato para conta/consultas/alertas, consentimento para marketing/resumo/FAMILY e obrigação legal para registros de acesso aplicáveis. Não equiparar logs padrão de infraestrutura ou IP truncado de consentimento a registros legais completos.

[LGPD — texto atualizado na Câmara](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html), [privacidade HIBP](https://haveibeenpwned.com/Privacy). Implementação técnica não equivale a parecer jurídico ou declaração de conformidade.

## Fases seguintes

Conta autenticada, auditoria, exportação, exclusão, confirmação OTP e registros legais na Fase 3. Recomendação, monitoramento e FAMILY em fases posteriores. CPF, documento, telefone e endereço não são coletados. Fluxo de responsável por menor fica fora do MVP e permanece pendência jurídica.
