# HIBP — integração da Fase 2

Verificado em 2026-10-30 na [API v3](https://haveibeenpwned.com/API/v3#PwnedPasswords) e nos [Termos atualizados em 27/10/2026](https://haveibeenpwned.com/TermsOfUse).

Somente Pwned Passwords foi integrado. A API de contas, catálogo de incidentes, quotas pagas e monitoramento permanecem na Fase 4. Nenhuma senha real do usuário foi usada nos testes: apenas o exemplo público `password` e valores aleatórios gerados para teste.

## Fluxo implementado

1. A pessoa clica em Verificar senha; digitar/desfocar não consulta.
2. Web Crypto calcula SHA-1 de UTF-8 no navegador, sem trim ou normalização.
3. GET direto para `https://api.pwnedpasswords.com/range/{prefixo de 5 hex}`, com `Add-Padding: true`, credentials omit, cache no-store, referrer no-referrer e timeout de 10s.
4. A lista é validada; linhas com contagem zero são padding. Comparação do sufixo completo permanece local.
5. Senha, prefixo e sufixo não vão ao backend, armazenamento ou logs. Referências/campo são limpos, inclusive nas falhas; JavaScript não garante apagamento físico imediato de strings da RAM.

Respostas malformadas, falhas HTTP, interrupções e indisponibilidade produzem erro, nunca “nenhum registro”. Resultado ausente não garante segurança. Resultado positivo orienta trocar em todos os locais onde a senha foi reutilizada. Não há consulta enquanto digita.

## CORS e atribuição

Os testes reais em Chromium confirmaram consulta direta com Add-Padding, sem necessidade do proxy previsto como alternativa no briefing. Nenhum endpoint de senha foi criado no servidor.

Os termos atuais dispensam atribuição para Pwned Passwords. Mantivemos a atribuição visível com link no verificador e rodapé, conforme exigência mais estrita do briefing. Não reproduzimos nem revendemos uma base de vazamentos.

## Testes

MSW cobre respostas válidas, padding, malformação, status 400/401/403/404/429/503 e interrupção. Playwright verifica ausência de consulta ao digitar, prefixo de cinco caracteres, ausência de corpo/cookies, limpeza e mensagens. Consultas reais ficam opt-in fora do CI para não depender da disponibilidade externa.

```sh
LIVE_PASSWORD_CHECK=1 pnpm exec playwright test --project desktop --grep 'integração real'
```

Para e-mails, permanecem obrigatórios: prova de titularidade, chave somente no servidor, User-Agent do produto, atribuição, cache, quota global Postgres e respostas/retries corretos. Confirmar assinatura, contas de teste e documentação novamente na Fase 4.
