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
  assert.match(html, /Your own booking app/);
  assert.match(html, /Under your brand/);
  assert.match(html, /TRUE WHITE-LABEL/);
  assert.match(html, /Typical marketplace/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders localized Polish and Spanish landing pages", async () => {
  const [pl, es] = await Promise.all([render("/pl"), render("/es")]);
  assert.equal(pl.status, 200);
  assert.equal(es.status, 200);
  assert.match(await pl.text(), /Własna aplikacja do rezerwacji/);
  assert.match(await es.text(), /Tu propia app de reservas/);
});
