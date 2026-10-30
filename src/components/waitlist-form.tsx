"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  waitlistSchema,
  WAITLIST_CONSENT_TEXT,
} from "@/lib/validation/waitlist";
export function WaitlistForm() {
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    token: string;
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<
    z.input<typeof waitlistSchema>,
    unknown,
    z.output<typeof waitlistSchema>
  >({ resolver: zodResolver(waitlistSchema) });
  async function submit(values: z.output<typeof waitlistSchema>) {
    setError("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Não foi possível registrar agora.");
      setReceipt(result);
      reset();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível registrar agora.",
      );
    }
  }
  return (
    <section
      id="lista-de-espera"
      className="shell waitlist-section"
      aria-labelledby="waitlist-title"
    >
      <div>
        <p className="section-kicker">{"// O PRÓXIMO PASSO COMEÇA AQUI"}</p>
        <h2 id="waitlist-title">
          Fique por dentro.
          <br />
          <span className="green">Sem ficar no escuro.</span>
        </h2>
        <p>
          Receba notícias sobre o lançamento. O cadastro e o monitoramento ainda
          estão em desenvolvimento.
        </p>
      </div>
      <div className="waitlist-panel">
        {receipt ? (
          <div role="status">
            <h3>Pedido recebido.</h3>
            <p>{receipt.message}</p>
            <p>
              Guarde seu link privado de cancelamento. Ele vale para uma
              inscrição criada neste pedido. Se você já estava inscrito, use o
              link original.
            </p>
            <Link
              prefetch={false}
              className="text-link green"
              href={`/lista-de-espera/cancelar#${receipt.token}`}
            >
              Abrir link de cancelamento <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <label htmlFor="waitlist-email">Seu e-mail</label>
            <input
              id="waitlist-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="voce@exemplo.com.br"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            <p id="email-error" className="form-error">
              {errors.email ? "Informe um e-mail válido." : ""}
            </p>
            <label className="consent-label">
              <input
                type="checkbox"
                {...register("consent")}
                aria-invalid={!!errors.consent}
              />
              <span>{WAITLIST_CONSENT_TEXT}</span>
            </label>
            {errors.consent && (
              <p className="form-error">{errors.consent.message}</p>
            )}
            <p className="field-hint">
              Inscreva apenas seu próprio e-mail. Leia a{" "}
              <Link href="/privacidade">
                Política de Privacidade (rascunho)
              </Link>
              .
            </p>
            <button
              type="submit"
              className="main-button action-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando…" : "Entrar na lista de espera"}
              <span aria-hidden="true">↗</span>
            </button>
            <p role="alert" className="form-error">
              {error}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
