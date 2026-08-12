#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || "release/cyberfolks-public_html");
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(root);

const pages = files.filter((file) => file.endsWith("index.html"));
const failures = [];
const titles = new Map();
const descriptions = new Map();

function first(html, pattern) { return html.match(pattern)?.[1]?.trim() || ""; }
function occurrenceCount(html, pattern) { return [...html.matchAll(pattern)].length; }
function targetFor(pathname) {
  const clean = decodeURIComponent(pathname);
  const relativePath = clean.replace(/^\//, "");
  if (clean.endsWith("/")) return join(root, relativePath, "index.html");
  if (extname(clean)) return join(root, relativePath);
  return join(root, relativePath, "index.html");
}

for (const file of pages) {
  const route = `/${relative(root, file).replace(/index\.html$/, "")}`.replace(/\/+/g, "/");
  const html = readFileSync(file, "utf8");
  const title = first(html, /<title>([^<]+)<\/title>/i);
  const description = first(html, /<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
  const canonical = first(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  const language = first(html, /<html[^>]+lang="([^"]+)"/i);
  const h1Count = occurrenceCount(html, /<h1(?:\s|>)/gi);
  const alternates = occurrenceCount(html, /<link[^>]+rel="alternate"[^>]+hreflang=/gi);
  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (!title) failures.push(`${route}: missing title`);
  if (!description) failures.push(`${route}: missing description`);
  if (!canonical) failures.push(`${route}: missing canonical`);
  if (h1Count !== 1) failures.push(`${route}: expected 1 H1, found ${h1Count}`);
  if (alternates !== 4) failures.push(`${route}: expected 4 hreflang links, found ${alternates}`);
  if (!language || (route.startsWith("/pl/") && language !== "pl") || (route.startsWith("/es/") && language !== "es")) failures.push(`${route}: invalid document language ${language}`);
  if (!jsonBlocks.length) failures.push(`${route}: missing JSON-LD`);
  for (const [, json] of jsonBlocks) {
    try { JSON.parse(json); } catch { failures.push(`${route}: malformed JSON-LD`); }
  }
  if (html.includes("googletagmanager.com/gtm.js")) failures.push(`${route}: GTM must not load before consent`);
  if (title) titles.set(title, [...(titles.get(title) || []), route]);
  if (description) descriptions.set(description, [...(descriptions.get(description) || []), route]);

  for (const [, href] of html.matchAll(/<a[^>]+href="([^"]+)"/gi)) {
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) continue;
    const url = new URL(href, "https://timzy.app");
    const target = targetFor(url.pathname);
    if (!existsSync(target)) failures.push(`${route}: broken internal link ${href}`);
  }
}

for (const [title, routes] of titles) if (routes.length > 1) failures.push(`duplicate title "${title}" on ${routes.join(", ")}`);
for (const [description, routes] of descriptions) if (routes.length > 1) failures.push(`duplicate description on ${routes.join(", ")}: "${description.slice(0, 70)}…"`);

if (failures.length) {
  console.error(`Static SEO audit failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Static SEO audit passed: ${pages.length} canonical pages, unique metadata and H1, valid hreflang/JSON-LD, no broken internal links.`);
