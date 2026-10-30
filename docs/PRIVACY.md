# Privacidade — notas de arquitetura, não política publicada

**RASCUNHO [REVISAR COM ADVOGADO].** A prévia Fase 1 não recebe informações pessoais. Não preenchemos razão social, CNPJ, endereço nem DPO com dados de outras fontes.

O schema proposto separa dados necessários ao serviço, consentimentos revogáveis e logs legais. Bases legais previstas no briefing: execução de contrato para conta/consultas/alertas; consentimento para espera, marketing, resumo e FAMILY; obrigação legal para registros de acesso. Confirmar aplicabilidade e redação com advogado antes da publicação.

Consentimentos: finalidade tipada, versão do texto, momento, IP truncado e revogação. Marketing e resumo independentes; não condicionar o serviço ao consentimento promocional. CPF, telefone, documento e endereço não são solicitados no MVP.

Retenção proposta em SCHEMA.md: códigos expirados diariamente, jobs finalizados por 30 dias, auditoria por seis meses. Registros de acesso legais precisam de definição técnica/jurídica específica; IP truncado de consentimento não deve ser confundido com registro legal de acesso.

Exclusão: cascata de dados do produto, remoção no Auth, limpeza de filas e envio transacional de confirmação sem guardar corpo. Logs legalmente necessários desvinculados do conteúdo, com acesso restrito e expiração. FAMILY: agregados apenas enquanto o consentimento estiver ativo; revogar deve remover acesso imediatamente.

A política pública e termos com campos [PREENCHER] serão redigidos na Fase 2. Plano FAMILY para menores e eventuais fluxos do responsável ficam fora do MVP.
