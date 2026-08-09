import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the English Timzy landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /More bookings\. Less admin/);
  assert.match(html, /All under your brand/);
  assert.match(html, /TRUE WHITE-LABEL/);
  assert.match(html, /Your clients remain your clients/);
  assert.match(html, /Start from a proven template or commission a fully custom design/);
  assert.match(html, /Choose from a library of ready-made app templates/);
  assert.match(html, /assets\/templates\/ready-template-library\.webp/);
  assert.match(html, /Natural Sage/);
  assert.match(html, /Noir Prestige/);
  assert.match(html, /Sunset Energy/);
  assert.match(html, /Fuchsia Pop/);
  assert.doesNotMatch(html, /SPA Light|SPA Luxury|Sport Club/);
  assert.match(html, /assets\/mockups\/client-home\.webp/);
  for (const screen of ["client-login", "client-home", "client-services", "client-calendar", "client-shop", "client-vouchers"]) {
    assert.match(html, new RegExp(`assets/mockups/${screen}\\.webp`));
  }
  assert.match(html, /Not a concept\. This is the real Timzy client app/);
  assert.match(html, /THE COMPLETE TIMZY ECOSYSTEM/);
  assert.match(html, /A separate data environment for each client/);
  assert.match(html, /Typical marketplace/);
  assert.match(html, /CAR WASH &amp; DETAILING|CAR WASH & DETAILING/);
  assert.match(html, /href="\/tennis\//);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /Your business, today|Signature ritual/);
});

test("renders localized Polish and Spanish landing pages", async () => {
  const [pl, es] = await Promise.all([render("/pl"), render("/es")]);
  assert.equal(pl.status, 200);
  assert.equal(es.status, 200);
  const plHtml = await pl.text();
  assert.match(plHtml, /Więcej rezerwacji\. Mniej obsługi/);
  assert.match(plHtml, /Twoi klienci pozostają Twoimi klientami/);
  assert.match(plHtml, /Nie wykorzystujemy Twojej bazy klientów do promowania konkurencyjnych firm/);
  assert.match(plHtml, /Gotowy szablon/);
  assert.match(plHtml, /Wybierz z biblioteki gotowych template’ów aplikacji/);
  assert.match(plHtml, /Projekt indywidualny/);
  assert.match(plHtml, /Tak wygląda aktualna aplikacja Timzy/);
  assert.match(plHtml, /Osobne środowisko klienta zamiast jednej centralnej bazy/);
  assert.match(plHtml, /Nie stanowi automatycznej gwarancji zwolnienia prawnego/);
  assert.match(plHtml, /45% netto wartości usług/);
  assert.match(await es.text(), /Más reservas\. Menos gestión/);
});

test("renders all industry landing pages in every language", async () => {
  const paths = [
    "/sport", "/golf", "/tennis", "/car-wash-detailing",
    "/pl/sport", "/pl/golf", "/pl/tennis", "/pl/car-wash-detailing",
    "/es/sport", "/es/golf", "/es/tennis", "/es/car-wash-detailing",
  ];
  const responses = await Promise.all(paths.map((path) => render(path)));
  responses.forEach((response, index) => assert.equal(response.status, 200, paths[index]));
  const [sport, golf, tennis, car] = await Promise.all(responses.slice(0, 4).map((response) => response.text()));
  assert.match(sport, /Run the club/);
  assert.match(golf, /player.*pocket/i);
  assert.match(golf, /Ball dispenser access from the app/);
  assert.match(tennis, /Fill more courts/);
  assert.match(car, /Turn enquiries into booked visits/);
});
