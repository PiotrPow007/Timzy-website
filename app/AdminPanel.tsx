"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminLanguageSwitch, useAdminI18n } from "./AdminI18n";
import { adminColumnLabel, adminStatusLabel, type AdminLocale } from "./AdminI18nUtils";

type RecordValue = Record<string, unknown>;
type Dashboard = { orderCounts: RecordValue[]; revenue: RecordValue[]; notificationCounts: RecordValue[]; provisioningCounts: RecordValue[]; recentOrders: RecordValue[] };
type Catalog = { markets: RecordValue[]; legalEntities: RecordValue[]; plans: RecordValue[]; planTranslations: RecordValue[]; planPrices: RecordValue[]; addons: RecordValue[]; addonTranslations: RecordValue[]; addonPrices: RecordValue[]; includedAddons: RecordValue[]; compatiblePlans: RecordValue[]; contractTemplates: RecordValue[]; contractVersions: RecordValue[] };
type Translate = ReturnType<typeof useAdminI18n>["t"];
type Mutate = (path: string, body: unknown) => Promise<void>;
type FormSubmit = (event: React.FormEvent<HTMLFormElement>, path: string, convert: (data: FormData) => unknown) => Promise<void>;
type Tab = "overview" | "catalog" | "prices" | "documents" | "orders";

export function AdminPanel() {
  const { locale, setLocale, t } = useAdminI18n();
  const [csrf, setCsrf] = useState("");
  const [admin, setAdmin] = useState<RecordValue | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [priceTarget, setPriceTarget] = useState<{ kind: "plan" | "addon"; itemId: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const call = useCallback(async (path: string, options: RequestInit = {}) => {
    const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "content-type": "application/json", ...(options.method && options.method !== "GET" ? { "x-csrf-token": csrf } : {}), ...(options.headers ?? {}) } });
    const payload = await response.json() as RecordValue;
    if (!response.ok || payload.ok !== true) throw new Error(String(payload.message ?? t("requestFailed")));
    return payload;
  }, [csrf, t]);

  const refresh = useCallback(async () => {
    const [dashboardResult, catalogResult] = await Promise.all([call("/api/admin/dashboard"), call("/api/admin/catalog")]);
    setDashboard(dashboardResult.dashboard as Dashboard); setCatalog(catalogResult.catalog as Catalog);
  }, [call]);

  useEffect(() => { void (async () => {
    try {
      const sessionResponse = await fetch("/api/admin/session", { credentials: "same-origin" });
      if (sessionResponse.status === 401) { window.location.assign("/admin/login/"); return; }
      const session = await sessionResponse.json() as { admin: RecordValue; csrfToken: string };
      setAdmin(session.admin); setCsrf(session.csrfToken);
      const [dashboardResponse, catalogResponse] = await Promise.all([fetch("/api/admin/dashboard", { credentials: "same-origin" }), fetch("/api/admin/catalog", { credentials: "same-origin" })]);
      const dashboardPayload = await dashboardResponse.json() as { ok: boolean; dashboard: Dashboard };
      const catalogPayload = await catalogResponse.json() as { ok: boolean; catalog: Catalog };
      if (!dashboardPayload.ok || !catalogPayload.ok) throw new Error("Panel unavailable");
      setDashboard(dashboardPayload.dashboard); setCatalog(catalogPayload.catalog);
    } catch { window.location.assign("/admin/login/"); }
  })(); }, []);

  async function mutate(path: string, body: unknown) {
    setError(""); setNotice("");
    try { await call(path, { method: "POST", body: JSON.stringify(body) }); setNotice(t("saved")); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : t("saveFailed")); }
  }

  async function formSubmit(event: React.FormEvent<HTMLFormElement>, path: string, convert: (data: FormData) => unknown) {
    event.preventDefault(); await mutate(path, convert(new FormData(event.currentTarget)));
  }

  if (!admin) return <main className="admin-loading">{t("verifyingSession")}</main>;
  const tabs: [Tab, string][] = [["overview", t("navOverview")], ["catalog", t("navCatalog")], ["prices", t("navPrices")], ["documents", t("navDocuments")], ["orders", t("navOrders")]];
  return <main className="admin-page">
    <header className="admin-header"><Link href="/"><img src="/assets/timzy-logo-official-white.png" width="307" height="158" alt="Timzy" /></Link><div><AdminLanguageSwitch locale={locale} setLocale={setLocale} /><span>{String(admin.displayName)}</span><b>{String(admin.role)}</b><button onClick={() => void call("/api/admin/logout", { method: "POST", body: "{}" }).then(() => window.location.assign("/admin/login/"))}>{t("signOut")}</button></div></header>
    <div className="admin-layout"><nav>{tabs.map(([key, label]) => <button key={key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>{label}</button>)}</nav>
      <section className="admin-content">{error ? <div className="contract-error">{error}</div> : null}{notice ? <div className="admin-notice">{notice}</div> : null}
        {tab === "overview" ? <OverviewTab dashboard={dashboard} locale={locale} t={t} /> : null}
        {tab === "catalog" ? <CatalogTab catalog={catalog} locale={locale} t={t} mutate={mutate} formSubmit={formSubmit} onSetPrice={(kind, itemId) => { setPriceTarget({ kind, itemId }); setTab("prices"); }} onOpenPrices={() => { setPriceTarget(null); setTab("prices"); }} /> : null}
        {tab === "prices" ? <PricesTab catalog={catalog} locale={locale} t={t} mutate={mutate} formSubmit={formSubmit} initialTarget={priceTarget} /> : null}
        {tab === "documents" ? <DocumentsTab catalog={catalog} locale={locale} t={t} mutate={mutate} formSubmit={formSubmit} /> : null}
        {tab === "orders" ? <OrdersTab dashboard={dashboard} locale={locale} t={t} /> : null}
      </section>
    </div>
  </main>;
}

function OverviewTab({ dashboard, locale, t }: { dashboard: Dashboard | null; locale: AdminLocale; t: Translate }) {
  return <><div className="admin-title"><p className="eyebrow">{t("operations")}</p><h1>{t("contractOperations")}</h1><a href="/api/admin/orders-export.csv">{t("exportCsv")}</a></div>
    <div className="admin-metric-grid">{dashboard?.orderCounts.map((item) => <article key={String(item.status)}><b>{String(item.count)}</b><span>{adminStatusLabel(item.status, locale)}</span></article>)}</div>
    <div className="admin-split"><AdminTable title={t("emailQueue")} rows={dashboard?.notificationCounts ?? []} locale={locale} noRecords={t("noRecords")} /><AdminTable title={t("provisioning")} rows={dashboard?.provisioningCounts ?? []} locale={locale} noRecords={t("noRecords")} /></div></>;
}

function CatalogTab({ catalog, locale, t, mutate, formSubmit, onSetPrice, onOpenPrices }: { catalog: Catalog | null; locale: AdminLocale; t: Translate; mutate: Mutate; formSubmit: FormSubmit; onSetPrice: (kind: "plan" | "addon", itemId: string) => void; onOpenPrices: () => void }) {
  return <><div className="admin-title"><p className="eyebrow">{t("versionedCatalogue")}</p><h1>{t("plansAndAddons")}</h1></div>
    <div className="admin-help-card"><div><b>{t("pricingHelpTitle")}</b><p>{t("pricingHelpText")}</p></div><button className="button button--light" onClick={onOpenPrices}>{t("goToPrices")}</button></div>
    <div className="admin-split">
      <form className="admin-form" onSubmit={(event) => void formSubmit(event, "/api/admin/plans", (data) => ({ internalKey: data.get("key"), includedFeatures: String(data.get("features") || "").split("\n"), recommended: data.get("recommended") === "on", displayOrder: Number(data.get("order")), deploymentDays: Number(data.get("days")), status: "DRAFT", translations: { pl: { name: data.get("namePl"), description: data.get("descriptionPl"), benefits: [] }, en: { name: data.get("nameEn"), description: data.get("descriptionEn"), benefits: [] }, es: { name: data.get("nameEs"), description: data.get("descriptionEs"), benefits: [] } } }))}>
        <h2>{t("createPlan")}</h2><input name="key" placeholder={t("internalKey")} required /><input name="namePl" placeholder="Nazwa PL" required /><textarea name="descriptionPl" placeholder="Opis PL" required /><input name="nameEn" placeholder="Name EN" required /><textarea name="descriptionEn" placeholder="Description EN" required /><input name="nameEs" placeholder="Nombre ES" required /><textarea name="descriptionEs" placeholder="Descripción ES" required /><textarea name="features" placeholder={t("includedFeature")} />
        <div className="admin-form-row"><label><span>{t("displayOrder")}</span><input name="order" type="number" min="0" defaultValue="10" /></label><label><span>{t("defaultDeploymentDays")}</span><input name="days" type="number" min="1" defaultValue="7" /></label></div><label><input name="recommended" type="checkbox" /> {t("recommended")}</label><button className="button">{t("createDraftPlan")}</button>
      </form>
      <form className="admin-form" onSubmit={(event) => void formSubmit(event, "/api/admin/addons", (data) => ({ internalKey: data.get("key"), paymentType: data.get("paymentType"), standalone: data.get("standalone") === "on", minQuantity: 1, maxQuantity: Number(data.get("max")), deploymentDaysImpact: Number(data.get("days")), displayOrder: Number(data.get("order")), status: "DRAFT", translations: { pl: { name: data.get("namePl"), description: data.get("descriptionPl") }, en: { name: data.get("nameEn"), description: data.get("descriptionEn") }, es: { name: data.get("nameEs"), description: data.get("descriptionEs") } } }))}>
        <h2>{t("createAddon")}</h2><input name="key" placeholder={t("internalKey")} required /><select name="paymentType"><option value="MONTHLY">{t("monthly")}</option><option value="ONE_TIME">{t("oneTime")}</option></select><input name="namePl" placeholder="Nazwa PL" required /><textarea name="descriptionPl" placeholder="Opis PL" required /><input name="nameEn" placeholder="Name EN" required /><textarea name="descriptionEn" placeholder="Description EN" required /><input name="nameEs" placeholder="Nombre ES" required /><textarea name="descriptionEs" placeholder="Descripción ES" required />
        <div className="admin-form-row"><label><span>{t("maximumQuantity")}</span><input name="max" type="number" min="1" defaultValue="1" /></label><label><span>{t("deploymentDaysImpact")}</span><input name="days" type="number" min="0" defaultValue="0" /></label><label><span>{t("displayOrder")}</span><input name="order" type="number" min="0" defaultValue="10" /></label></div><label><input name="standalone" type="checkbox" /> {t("standalone")}</label><button className="button">{t("createDraftAddon")}</button>
      </form>
    </div>
    <form className="admin-form admin-form--wide" onSubmit={(event) => void formSubmit(event, `/api/admin/plans/${String(new FormData(event.currentTarget).get("planId"))}/addons`, (data) => ({ includedAddonIds: String(data.get("included") || "").split(",").map((id) => id.trim()).filter(Boolean), compatibleAddonIds: String(data.get("compatible") || "").split(",").map((id) => id.trim()).filter(Boolean) }))}>
      <h2>{t("assignAddons")}</h2><select name="planId">{catalog?.plans.map((plan) => <option key={String(plan.id)} value={String(plan.id)}>{String(plan.internal_key)} · {String(plan.id)}</option>)}</select><textarea name="included" placeholder={t("includedAddonIds")} /><textarea name="compatible" placeholder={t("compatibleAddonIds")} /><button className="button">{t("savePlanMapping")}</button>
    </form>
    <CatalogTable title={t("plans")} rows={catalog?.plans ?? []} kind="plans" mutate={mutate} locale={locale} t={t} onSetPrice={(itemId) => onSetPrice("plan", itemId)} /><CatalogTable title={t("addons")} rows={catalog?.addons ?? []} kind="addons" mutate={mutate} locale={locale} t={t} onSetPrice={(itemId) => onSetPrice("addon", itemId)} />
  </>;
}

function PricesTab({ catalog, locale, t, mutate, formSubmit, initialTarget }: { catalog: Catalog | null; locale: AdminLocale; t: Translate; mutate: Mutate; formSubmit: FormSubmit; initialTarget: { kind: "plan" | "addon"; itemId: string } | null }) {
  const [priceKind, setPriceKind] = useState<"plan" | "addon">(initialTarget?.kind ?? "plan");
  const [selectedItem, setSelectedItem] = useState(initialTarget?.itemId ?? "");
  const priceItems = priceKind === "plan" ? catalog?.plans ?? [] : catalog?.addons ?? [];
  const selectedItemId = selectedItem && priceItems.some((item) => String(item.id) === selectedItem) ? selectedItem : String(priceItems[0]?.id ?? "");
  return <><div className="admin-title"><p className="eyebrow">{t("noOverwrites")}</p><h1>{t("priceMarketsSellers")}</h1></div>
    <div className="admin-split">
      <form className="admin-form admin-price-form" onSubmit={(event) => void formSubmit(event, "/api/admin/prices", (data) => ({ kind: data.get("kind"), itemId: data.get("itemId"), marketId: data.get("marketId"), paymentType: data.get("paymentType"), amountMinor: Math.round(Number(data.get("amount")) * 100), stripeProductId: data.get("product"), stripePriceId: data.get("price"), effectiveFrom: new Date().toISOString() }))}>
        <h2>{t("createPriceVersion")}</h2><p className="admin-form-help">{t("priceVersionHelp")}</p>
        <label><span>{t("offerType")}</span><select name="kind" value={priceKind} onChange={(event) => { setPriceKind(event.target.value as "plan" | "addon"); setSelectedItem(""); }}><option value="plan">{t("plan")}</option><option value="addon">{t("addon")}</option></select></label>
        <label><span>{t("itemId")}</span><select name="itemId" value={selectedItemId} onChange={(event) => setSelectedItem(event.target.value)} required>{priceItems.map((item) => <option key={String(item.id)} value={String(item.id)}>{catalogItemLabel(item, priceKind, catalog, locale)}</option>)}</select></label>
        <label><span>{t("marketAndCurrency")}</span><select name="marketId">{catalog?.markets.map((market) => <option key={String(market.id)} value={String(market.id)}>{String(market.code)} · {String(market.currency)}</option>)}</select></label>
        <label><span>{t("paymentSchedule")}</span><select name="paymentType"><option value="MONTHLY">{t("monthly")}</option><option value="ONE_TIME">{t("oneTime")}</option></select></label>
        <label><span>{t("netAmount")}</span><input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={t("amountExample")} required /></label>
        <label><span>{t("stripeProduct")}</span><input name="product" placeholder="prod_…" /></label><label><span>{t("stripePrice")}</span><input name="price" placeholder="price_…" /></label><p className="admin-form-help">{t("stripeHelp")}</p><button className="button">{t("createDraftPrice")}</button>
      </form>
      <form className="admin-form" onSubmit={(event) => void formSubmit(event, "/api/admin/markets", (data) => ({ id: data.get("id"), currency: data.get("currency"), sellerId: data.get("sellerId"), technologyProviderId: data.get("technologyProviderId"), billingCountries: String(data.get("countries") || "").split(",").map((country) => country.trim().toUpperCase()).filter(Boolean), defaultDeploymentDays: Number(data.get("defaultDays")), status: data.get("status"), activationFeeOpenMinor: Math.round(Number(data.get("open")) * 100), activationFeeAnnualMinor: Math.round(Number(data.get("annual")) * 100), activationStripeProductId: data.get("product"), activationStripePriceId: data.get("price") }))}>
        <h2>{t("marketConfiguration")}</h2><select name="id" aria-label={t("marketAndCurrency")}>{catalog?.markets.map((market) => <option key={String(market.id)} value={String(market.id)}>{String(market.code)}</option>)}</select><div className="admin-form-row"><select name="currency" aria-label={t("marketAndCurrency")}><option>PLN</option><option>EUR</option></select><select name="status" aria-label={t("status")}><StatusOptions locale={locale} /></select><input name="defaultDays" type="number" min="1" defaultValue="7" aria-label={t("defaultDeploymentDays")} title={t("defaultDeploymentDays")} /></div><select name="sellerId" aria-label={t("seller")}>{catalog?.legalEntities.map((entity) => <option key={String(entity.id)} value={String(entity.id)}>{t("seller")} · {String(entity.code)}</option>)}</select><select name="technologyProviderId" aria-label={t("technologyProvider")}>{catalog?.legalEntities.map((entity) => <option key={String(entity.id)} value={String(entity.id)}>{t("technologyProvider")} · {String(entity.code)}</option>)}</select><textarea name="countries" placeholder={t("billingCountries")} required /><label><span>{t("openActivationFee")}</span><input name="open" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" required /></label><label><span>{t("annualActivationFee")}</span><input name="annual" type="number" min="0" step="0.01" inputMode="decimal" defaultValue="0" required /></label><input name="product" placeholder={t("activationProduct")} /><input name="price" placeholder={t("activationPrice")} /><button className="button">{t("saveMarket")}</button>
      </form>
    </div>
    <form className="admin-form admin-form--wide" onSubmit={(event) => void formSubmit(event, "/api/admin/legal-entities", (data) => ({ id: data.get("id"), legalName: data.get("legalName"), companyNumber: data.get("companyNumber"), taxId: data.get("taxId"), registryNumber: data.get("registryNumber"), regon: data.get("regon"), addressLine1: data.get("address"), postalCode: data.get("postalCode"), city: data.get("city"), countryCode: data.get("country"), technologyProvider: data.get("technologyProvider") === "on", status: data.get("status") }))}>
      <h2>{t("editEntity")}</h2><select name="id">{catalog?.legalEntities.map((entity) => <option key={String(entity.id)} value={String(entity.id)}>{String(entity.code)} · {String(entity.legal_name)}</option>)}</select><div className="admin-form-row"><input name="legalName" placeholder={t("legalName")} required /><input name="companyNumber" placeholder={t("companyNumber")} /><input name="taxId" placeholder={t("taxId")} /><input name="registryNumber" placeholder={t("registryNumber")} /><input name="regon" placeholder="REGON" /></div><div className="admin-form-row"><input name="address" placeholder={t("address")} required /><input name="postalCode" placeholder={t("postalCode")} /><input name="city" placeholder={t("city")} required /><input name="country" placeholder={t("countryCode")} maxLength={2} required /></div><div className="admin-form-row"><select name="status"><StatusOptions locale={locale} /></select><label><input name="technologyProvider" type="checkbox" /> {t("technologyProvider")}</label></div><button className="button">{t("saveEntity")}</button>
    </form>
    <AdminTable title={t("markets")} rows={catalog?.markets ?? []} locale={locale} noRecords={t("noRecords")} /><AdminTable title={t("legalEntities")} rows={catalog?.legalEntities ?? []} locale={locale} noRecords={t("noRecords")} />
    <PriceTable title={t("planPrices")} rows={catalog?.planPrices ?? []} kind="plan" publish={mutate} locale={locale} t={t} /><PriceTable title={t("addonPrices")} rows={catalog?.addonPrices ?? []} kind="addon" publish={mutate} locale={locale} t={t} />
  </>;
}

function DocumentsTab({ catalog, locale, t, mutate, formSubmit }: { catalog: Catalog | null; locale: AdminLocale; t: Translate; mutate: Mutate; formSubmit: FormSubmit }) {
  return <><div className="admin-title"><p className="eyebrow">{t("legalVersionControl")}</p><h1>{t("contractDocuments")}</h1></div>
    <form className="admin-form admin-form--wide" onSubmit={(event) => void formSubmit(event, "/api/admin/contracts", (data) => ({ kind: data.get("kind"), market: data.get("market"), language: data.get("language"), title: data.get("title"), sections: String(data.get("sections") || "").split("\n\n"), effectiveFrom: new Date().toISOString() }))}>
      <div className="admin-form-row"><select name="kind"><option>AGREEMENT</option><option>TERMS</option><option>DPA</option><option>PRIVACY</option></select><select name="market"><option>PL</option><option>INTERNATIONAL</option></select><select name="language"><option>pl</option><option>en</option><option>es</option></select></div><input name="title" placeholder={t("documentTitle")} required /><textarea name="sections" placeholder={t("documentParagraphs")} rows={10} required /><button className="button">{t("createDocumentVersion")}</button>
    </form><DocumentTable rows={catalog?.contractVersions ?? []} publish={mutate} locale={locale} t={t} />
  </>;
}

function OrdersTab({ dashboard, locale, t }: { dashboard: Dashboard | null; locale: AdminLocale; t: Translate }) {
  return <><div className="admin-title"><p className="eyebrow">{t("immutableHistory")}</p><h1>{t("navOrders")}</h1><a href="/api/admin/orders-export.csv">{t("exportCsv")}</a></div><div className="admin-order-list">{dashboard?.recentOrders.map((order) => <a href={`/admin/orders/${String(order.id)}/`} key={String(order.id)}><b>{String(order.order_number)}</b><span>{adminStatusLabel(order.status, locale)} · {String(order.market_code ?? "—")} · {String(order.currency ?? "—")}</span><small>{String(order.created_at)}</small></a>)}</div></>;
}

function StatusOptions({ locale }: { locale: AdminLocale }) { return <>{["DRAFT", "ACTIVE", "ARCHIVED"].map((status) => <option key={status} value={status}>{adminStatusLabel(status, locale)}</option>)}</>; }

function formatMinorAmount(value: unknown, currency: unknown, locale: AdminLocale) {
  const amount = Number(value); const code = String(currency || "PLN");
  return Number.isFinite(amount) ? new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { style: "currency", currency: code }).format(amount / 100) : "—";
}

function catalogItemLabel(item: RecordValue, kind: "plan" | "addon", catalog: Catalog | null, locale: AdminLocale) {
  const itemId = String(item.id); const foreignKey = kind === "plan" ? "plan_id" : "addon_id";
  const translations = kind === "plan" ? catalog?.planTranslations ?? [] : catalog?.addonTranslations ?? [];
  const translated = translations.find((row) => String(row[foreignKey]) === itemId && String(row.language) === locale)
    ?? translations.find((row) => String(row[foreignKey]) === itemId && String(row.language) === "en");
  return `${String(translated?.name ?? item.internal_key)} · ${String(item.internal_key)}`;
}

function AdminTable({ title, rows, locale, noRecords }: { title: string; rows: RecordValue[]; locale: AdminLocale; noRecords: string }) {
  const columns = rows.length ? Object.keys(rows[0]).slice(0, 7) : [];
  return <div className="admin-table-wrap"><h2>{title}</h2>{rows.length ? <table><thead><tr>{columns.map((column) => <th key={column}>{adminColumnLabel(column, locale)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column}>{column === "status" ? adminStatusLabel(row[column], locale) : typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column] ?? "")}</td>)}</tr>)}</tbody></table> : <p>{noRecords}</p>}</div>;
}

function CatalogTable({ title, rows, kind, mutate, locale, t, onSetPrice }: { title: string; rows: RecordValue[]; kind: "plans" | "addons"; mutate: Mutate; locale: AdminLocale; t: Translate; onSetPrice: (itemId: string) => void }) {
  return <div className="admin-table-wrap"><h2>{title}</h2><table><thead><tr><th>ID</th><th>{t("key")}</th><th>{t("status")}</th><th>{t("displayOrder")}</th><th>{t("actions")}</th></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}><td>{String(row.id)}</td><td>{String(row.internal_key)}</td><td>{adminStatusLabel(row.status, locale)}</td><td>{String(row.display_order)}</td><td><div className="admin-table-actions"><button className="is-primary" onClick={() => onSetPrice(String(row.id))}>{t("setPrice")}</button>{row.status !== "ACTIVE" ? <button onClick={() => void mutate(`/api/admin/${kind}/${String(row.id)}/status`, { status: "ACTIVE" })}>{t("activate")}</button> : null}{row.status !== "DRAFT" ? <button onClick={() => void mutate(`/api/admin/${kind}/${String(row.id)}/status`, { status: "DRAFT" })}>{t("draft")}</button> : null}{row.status !== "ARCHIVED" ? <button onClick={() => void mutate(`/api/admin/${kind}/${String(row.id)}/status`, { status: "ARCHIVED" })}>{t("archive")}</button> : null}</div></td></tr>)}</tbody></table></div>;
}

function PriceTable({ title, rows, kind, publish, locale, t }: { title: string; rows: RecordValue[]; kind: "plan" | "addon"; publish: Mutate; locale: AdminLocale; t: Translate }) {
  return <div className="admin-table-wrap"><h2>{title}</h2><table><thead><tr><th>ID</th><th>{t("item")}</th><th>{t("amount")}</th><th>{t("version")}</th><th>{t("status")}</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}><td>{String(row.id)}</td><td>{String(row.plan_id ?? row.addon_id)}</td><td>{formatMinorAmount(row.amount_minor, row.currency, locale)}</td><td>{String(row.version)}</td><td>{adminStatusLabel(row.status, locale)}</td><td>{row.status === "DRAFT" ? <button onClick={() => void publish(`/api/admin/prices/${kind}/${String(row.id)}/publish`, {})}>{t("publish")}</button> : null}</td></tr>)}</tbody></table></div>;
}

function DocumentTable({ rows, publish, locale, t }: { rows: RecordValue[]; publish: Mutate; locale: AdminLocale; t: Translate }) {
  return <div className="admin-table-wrap"><h2>{t("documentVersions")}</h2><table><thead><tr><th>ID</th><th>{t("template")}</th><th>{t("version")}</th><th>{t("effective")}</th><th>{t("status")}</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={String(row.id)}><td>{String(row.id)}</td><td>{String(row.template_id)}</td><td>{String(row.version)}</td><td>{String(row.effective_from)}</td><td>{adminStatusLabel(row.status, locale)}</td><td>{row.status === "DRAFT" ? <button onClick={() => { const reference = window.prompt(t("legalApprovalReference")); if (reference) void publish(`/api/admin/contracts/${String(row.id)}/publish`, { legalApprovalReference: reference }); }}>{t("publish")}</button> : null}</td></tr>)}</tbody></table></div>;
}
