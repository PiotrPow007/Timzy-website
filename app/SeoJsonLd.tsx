import type { IndustryKey, SiteLocale } from "./IndustryLandingPage";

const siteUrl = "https://timzy.app";
const languageCode = { en: "en-GB", pl: "pl-PL", es: "es-ES" } as const;

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function PlatformJsonLd({ locale, faqs }: { locale: SiteLocale; faqs: Array<{ question: string; answer: string }> }) {
  const roots = { en: "/", pl: "/pl/", es: "/es/" };
  const names = { en: "Timzy branded booking app", pl: "Aplikacja rezerwacyjna Timzy pod Twoją marką", es: "App de reservas Timzy con tu marca" };
  const descriptions = {
    en: "White-label booking application for service businesses, with online bookings, customer management and a separate branded experience.",
    pl: "System rezerwacji online i osobna aplikacja mobilna pod marką firmy usługowej, bez katalogu konkurencji.",
    es: "Sistema de reservas online y app móvil independiente con la marca del negocio, sin catálogo de competidores.",
  };
  const page = `${siteUrl}${roots[locale]}`;
  return <JsonLd data={[
    { "@context": "https://schema.org", "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "Timzy", legalName: "INNOVARE GROUP LTD", url: siteUrl, logo: `${siteUrl}/assets/timzy-logo-official-purple.png`, email: "hello@timzy.app", telephone: ["+34 600 659 705", "+48 507 702 007"] },
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "Timzy", publisher: { "@id": `${siteUrl}/#organization` }, inLanguage: ["en-GB", "pl-PL", "es-ES"] },
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${siteUrl}/#software`, name: names[locale], applicationCategory: "BusinessApplication", operatingSystem: "iOS, Android, Web", description: descriptions[locale], url: page, brand: { "@id": `${siteUrl}/#organization` }, inLanguage: languageCode[locale] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ]} />;
}

export function IndustryJsonLd({ locale, industry, title, description }: { locale: SiteLocale; industry: IndustryKey; title: string; description: string }) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const root = locale === "en" ? "/" : `/${locale}/`;
  const path = `${prefix}/${industry}/`;
  const labels = { en: "Industries", pl: "Branże", es: "Sectores" };
  return <JsonLd data={[
    { "@context": "https://schema.org", "@type": "WebApplication", name: title, description, url: `${siteUrl}${path}`, applicationCategory: "BusinessApplication", operatingSystem: "iOS, Android, Web", brand: { "@id": `${siteUrl}/#organization` }, inLanguage: languageCode[locale] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Timzy", item: `${siteUrl}${root}` },
      { "@type": "ListItem", position: 2, name: labels[locale], item: `${siteUrl}${root}#industries` },
      { "@type": "ListItem", position: 3, name: title, item: `${siteUrl}${path}` },
    ] },
  ]} />;
}
