import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    rules: {
      userAgent: "*",
      ...(process.env.SITE_INDEXABLE === "true"
        ? {
            allow: "/",
            disallow: [
              "/api/",
              "/projeto",
              "/lista-de-espera/",
              "/privacidade",
              "/termos",
            ],
          }
        : { disallow: "/" }),
    },
    sitemap: base + "/sitemap.xml",
  };
}
