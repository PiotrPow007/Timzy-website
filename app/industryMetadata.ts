import type { Metadata } from "next";
import { industryCopy, type IndustryKey, type SiteLocale } from "./IndustryLandingPage";

function path(locale: SiteLocale, industry: IndustryKey) {
  return `${locale === "en" ? "" : `/${locale}`}/${industry}/`;
}

export function getIndustryMetadata(locale: SiteLocale, industry: IndustryKey): Metadata {
  const content = industryCopy[locale][industry];
  return {
    title: `${content.title} ${content.accent}`,
    description: content.body,
    alternates: {
      canonical: path(locale, industry),
      languages: {
        "en-GB": path("en", industry),
        "pl-PL": path("pl", industry),
        "es-ES": path("es", industry),
        "x-default": path("en", industry),
      },
    },
    openGraph: {
      url: path(locale, industry),
      title: `${content.title} ${content.accent} | Timzy`,
      description: content.body,
    },
  };
}
