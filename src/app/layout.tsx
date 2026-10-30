import { serverEnv } from "@/lib/env/server";
import { connection } from "next/server";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Informação Protegida | Sua vida digital, sob seu controle",
    template: "%s | Informação Protegida",
  },
  description:
    "Conheça o projeto Informação Protegida: orientação prática em português para entender riscos digitais e cuidar das suas informações.",
  metadataBase: new URL(serverEnv.NEXT_PUBLIC_APP_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Informação Protegida",
    title: "Seus dados estão seguros na internet?",
    description:
      "Descubra riscos digitais e receba orientações práticas em português.",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: serverEnv.SITE_INDEXABLE,
    follow: serverEnv.SITE_INDEXABLE,
  },
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
