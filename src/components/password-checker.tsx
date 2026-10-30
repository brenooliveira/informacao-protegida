"use client";
import { useRef, useState } from "react";
import {
  fingerprintPassword,
  checkPasswordRange,
} from "@/lib/passwords/pwned-passwords";
export function PasswordChecker() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    count?: number;
    error?: string;
  } | null>(null);
  async function check() {
    if (busy || !input.current) return;
    let value = input.current.value;
    if (!value) {
      setResult({ error: "Digite uma senha para verificar." });
      input.current.focus();
      return;
    }
    if (value.length > 1024) {
      input.current.value = "";
      value = "";
      setResult({ error: "Use uma senha de até 1.024 caracteres." });
      return;
    }
    setBusy(true);
    setResult(null);
    let fingerprint: { prefix: string; suffix: string } | undefined;
    try {
      fingerprint = await fingerprintPassword(value);
      value = "";
      if (input.current) input.current.value = "";
      const count = await checkPasswordRange(fingerprint);
      fingerprint.prefix = "";
      fingerprint.suffix = "";
      setResult({ count });
    } catch {
      setResult({
        error:
          "Não foi possível verificar agora. Tente novamente em instantes. Nenhum resultado foi concluído.",
      });
    } finally {
      if (fingerprint) {
        fingerprint.prefix = "";
        fingerprint.suffix = "";
      }
      value = "";
      if (input.current) input.current.value = "";
      setBusy(false);
    }
  }
  return (
    <section
      id="verificador"
      className="shell password-section"
      aria-labelledby="password-title"
    >
      <div className="checker-intro">
        <p className="section-kicker">
          {"// UMA SENHA. UMA VERIFICAÇÃO PRIVADA."}
        </p>
        <h2 id="password-title">
          Essa senha já
          <br />
          apareceu em um <span className="green">vazamento?</span>
        </h2>
        <p>
          Verifique gratuitamente, sem criar conta. A senha completa permanece
          no seu navegador.
        </p>
        <a href="#como-preserva" className="text-link">
          Como a privacidade é preservada <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="checker-panel">
        <div className="panel-heading">
          <span className="status-dot" />
          <span>VERIFICADOR DE SENHAS</span>
          <span className="panel-label">SEM LOGIN</span>
        </div>
        <label htmlFor="password-check">Senha para verificar</label>
        <input
          id="password-check"
          ref={input}
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={1024}
          disabled={busy}
          aria-describedby="password-hint"
          placeholder="Digite uma senha"
        />
        <p id="password-hint" className="field-hint">
          Não há consulta enquanto você digita. O campo é limpo após a
          verificação.
        </p>
        <button
          className="main-button action-button"
          type="button"
          disabled={busy}
          onClick={check}
        >
          {busy ? "Verificando…" : "Verificar senha"}
          <span aria-hidden="true">↗</span>
        </button>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="checker-result"
        >
          {result?.error ? (
            <p className="form-error">{result.error}</p>
          ) : result?.count !== undefined ? (
            result.count > 0 ? (
              <div className="result-found">
                <h3>Esta senha apareceu em vazamentos conhecidos.</h3>
                <p>
                  Encontramos {result.count.toLocaleString("pt-BR")}{" "}
                  ocorrências.{" "}
                  <strong>
                    Troque essa senha em todos os lugares onde a usa.
                  </strong>{" "}
                  Prefira uma senha única para cada conta e ative a verificação
                  em duas etapas.
                </p>
              </div>
            ) : (
              <div className="result-clear">
                <h3>Nenhum registro encontrado para esta senha.</h3>
                <p>
                  Isso não garante que a senha seja segura ou que nunca tenha
                  sido exposta. Use senhas longas, únicas e um gerenciador de
                  senhas.
                </p>
              </div>
            )
          ) : null}
        </div>
        <p className="source-note">
          Dados de vazamentos fornecidos por{" "}
          <a
            href="https://haveibeenpwned.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Have I Been Pwned
          </a>
          .
        </p>
      </div>
      <details id="como-preserva" className="privacy-explainer">
        <summary>O que sai do meu navegador?</summary>
        <p>
          Seu navegador transforma a senha em um identificador SHA-1 e envia
          apenas os cinco primeiros caracteres à API Pwned Passwords. O serviço
          devolve uma lista de possibilidades; a comparação completa acontece no
          seu dispositivo. Esse método é chamado de k-anonimidade.
        </p>
        <p>
          A API recebe o prefixo e os dados de conexão, como seu IP, mas não
          recebe a senha completa. Não enviamos a senha ou seu hash completo ao
          nosso servidor, não os armazenamos e não usamos ferramentas de
          rastreamento nesta página.
        </p>
        <p>
          O campo e as referências usadas pela aplicação são limpos após a
          consulta. Como em qualquer aplicação JavaScript, a liberação física de
          memória é gerenciada pelo navegador.
        </p>
      </details>
    </section>
  );
}
