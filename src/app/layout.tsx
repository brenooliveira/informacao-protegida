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
  robots: { index: false, follow: false },
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
