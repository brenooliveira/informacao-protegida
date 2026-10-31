"use client";
import { waitlistMessageSchema } from "@/lib/validation/waitlist";
import { useSyncExternalStore, useState } from "react";
function currentToken() {
  const value = window.location.hash.slice(1);
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : "";
}
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}
export function UnsubscribeForm() {
  const token = useSyncExternalStore(subscribeHash, currentToken, () => "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function cancel() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/waitlist/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error("Falha ao cancelar.");
      const message = waitlistMessageSchema.parse(result);
      setMessage(message.message);
      setDone(true);
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      setMessage(
        "Não foi possível cancelar agora. Tente novamente mais tarde.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="unsubscribe-panel">
      {!done && (
        <>
          <p>
            Abra o link privado recebido ao entrar na lista. O cancelamento só
            acontece ao clicar no botão abaixo.
          </p>
          <button
            type="button"
            className="main-button action-button"
            disabled={!token || busy}
            onClick={cancel}
          >
            {busy ? "Cancelando…" : "Cancelar minha inscrição"}
          </button>
          {!token && (
            <p className="field-hint">
              Nenhum link válido encontrado nesta página.
            </p>
          )}
        </>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
