import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/", env = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, ...env },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the English Timzy landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /More bookings\. More returning clients/);
  assert.match(html, /In an app under your brand/);
  assert.match(html, /assets\/timzy-logo-official-purple\.png/);
  assert.doesNotMatch(html, /class="brand-symbol"/);
  assert.match(html, /See a demo for my industry/);
  assert.match(html, /privacy information/);
  assert.match(html, /Your clients remain your clients/);
  assert.match(html, /The app should not look like Timzy\. It should look like your brand/);
  assert.match(html, /Choose from a library of ready-made app templates/);
  for (const template of ["noir-prestige", "sunset-energy", "fuchsia-pop"]) assert.match(html, new RegExp(`assets/templates/${template}\\.webp`));
  assert.match(html, /assets\/templates\/natural-sage-phone-transparent\.png/);
  assert.doesNotMatch(html, /assets\/templates\/ready-template-library\.webp/);
  assert.match(html, /Natural Sage/);
  assert.match(html, /Noir Prestige/);
  assert.match(html, /Sunset Energy/);
  assert.match(html, /Fuchsia Pop/);
  assert.doesNotMatch(html, /SPA Light|SPA Luxury|Sport Club/);
  assert.match(html, /assets\/mockups\/client-home\.webp/);
  for (const screen of ["client-login", "client-home", "client-services", "client-shop", "client-vouchers"]) assert.match(html, new RegExp(`assets/mockups/${screen}\\.webp`));
  assert.match(html, /assets\/mockups\/client-calendar-mockup-transparent\.png/);
  const offerSection = html.match(/<section class="offer">([\s\S]*?)<\/section>/)?.[1] ?? "";
  assert.match(offerSection, /assets\/templates\/natural-sage-phone-transparent\.png/);
  assert.doesNotMatch(offerSection, /assets\/mockups\/client-vouchers\.webp/);
  assert.match(html, /One consistent journey from the first tap to the next visit/);
  assert.doesNotMatch(html, /Welcome voucher|Booking confirmed|Technology in the background|YOUR LOGO|#7C58F7/);
  assert.match(html, /THE COMPLETE TIMZY ECOSYSTEM/);
  assert.match(html, /Need a function outside the standard modules/);
  assert.match(html, /A separate data environment for each client/);
  assert.match(html, /Typical marketplace/);
  assert.match(html, /SPA &amp; BEAUTY|SPA & BEAUTY/);
  assert.match(html, /CAR WASH &amp; DETAILING|CAR WASH & DETAILING/);
  assert.match(html, /OTHER INDUSTRIES/);
  assert.match(html, /assets\/industries\/spa\.webp/);
  assert.match(html, /assets\/industries\/sport\.webp/);
  assert.match(html, /assets\/industries\/detailing\.webp/);
  assert.match(html, /assets\/industries\/psychology\.webp/);
  assert.match(html, /assets\/industries\/tailor\.webp/);
  assert.match(html, /assets\/industries\/nutrition\.webp/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /Your business, today|Signature ritual/);
});

test("renders localized Polish and Spanish landing pages", async () => {
  const [pl, es] = await Promise.all([render("/pl"), render("/es")]);
  assert.equal(pl.status, 200);
  assert.equal(es.status, 200);
  const plHtml = await pl.text();
  assert.match(plHtml, /Więcej rezerwacji\. Więcej powrotów/);
  assert.match(plHtml, /Zobacz demo dla swojej branży/);
  assert.match(plHtml, /informacją o przetwarzaniu danych/);
  assert.match(plHtml, /SPA I BEAUTY/);
  assert.match(plHtml, /INNE BRANŻE/);
  assert.match(plHtml, /Twoi klienci pozostają Twoimi klientami/);
  assert.match(plHtml, /Timzy sprawdza się wszędzie tam, gdzie klient rezerwuje czas specjalisty/);
  assert.match(plHtml, /Trenerzy i eksperci/);
  assert.match(plHtml, /Salony beauty/);
  assert.match(plHtml, /Kliniki i gabinety/);
  assert.match(plHtml, /Każdy biznes usługowy/);
  assert.match(plHtml, /Nie wykorzystujemy Twojej bazy klientów do promowania konkurencyjnych firm/);
  assert.match(plHtml, /Gotowy szablon/);
  assert.match(plHtml, /Wybierz z biblioteki gotowych szablonów aplikacji/);
  assert.match(plHtml, /Projekt indywidualny/);
  assert.match(plHtml, /Jeden spójny proces od pierwszego kliknięcia do kolejnej wizyty/);
  assert.doesNotMatch(plHtml, /Aktualna aplikacja|Prawdziwe ekrany Timzy|Welcome voucher|Booking confirmed|YOUR LOGO|#7C58F7/);
  assert.match(plHtml, /Potrzebujesz funkcji, której nie ma na liście/);
  assert.match(plHtml, /Do 3 pracowników bez dodatkowej opłaty/);
  assert.match(plHtml, /Notatki po wizycie i pełna historia klienta/);
  assert.match(plHtml, /Płatność całości lub części kwoty przy rezerwacji/);
  assert.match(plHtml, /Brak prowizji Timzy od płatności za rezerwację/);
  assert.match(plHtml, /standardowe opłaty operatora Stripe/);
  assert.match(plHtml, /Funkcje dedykowane wyceniamy osobno/);
  assert.match(plHtml, /Nie można obiecać ogólnego zwolnienia/);
  assert.match(await es.text(), /Más reservas\. Más clientes que vuelven/);
});

test("renders privacy pages and a signed contact challenge", async () => {
  const [privacy, challenge] = await Promise.all([
    render("/pl/polityka-prywatnosci"),
    render("/api/contact-challenge", { CAPTCHA_SECRET: "test-secret-that-is-long-enough" }),
  ]);
  assert.equal(privacy.status, 200);
  const privacyHtml = await privacy.text();
  assert.match(privacyHtml, /Polityka prywatności strony Timzy/);
  assert.match(privacyHtml, /INNOVARE GROUP LTD/);
  assert.match(privacyHtml, /12878269/);
  assert.match(privacyHtml, /7 Bell Yard/);
  assert.match(privacyHtml, /Cookies i podobne technologie/);
  assert.equal(challenge.status, 200);
  const payload = await challenge.json();
  assert.match(payload.question, /^\d+ \+ \d+ =$/);
  assert.match(payload.token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
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
