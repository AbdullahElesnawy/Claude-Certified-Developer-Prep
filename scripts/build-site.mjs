// Builds the GitLab Pages site into public/:
// - every README.md becomes index.html, every other .md becomes .html
// - links between notes are rewritten from .md to .html
// - quiz pages, question banks, and shared assets are copied as-is
import { marked } from "marked";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public");
const SKIP = new Set(["node_modules", "public", "scripts", ".git"]);
const COPY_EXT = new Set([".html", ".js", ".css", ".svg", ".png"]);

const COURSES = [
  ["mso-foundations", "1 · MSO Foundations"],
  ["production-grade-prompting", "2 · Prompting, Agents & Tool Use"],
  ["claude-code-mcp-integration", "3 · Claude Code, MCP & Integration"],
  ["production-engineering-evals-security", "4 · Evals & Security"],
  ["accelerators-ip-contribution", "5 · Accelerators & IP"],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SKIP.has(e.name) || e.name.startsWith(".")) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function outName(rel) {
  return rel.replace(/(^|\/)README\.md$/, "$1index.html").replace(/\.md$/, ".html");
}

function rewriteLinks(md) {
  // [text](foo.md) -> foo.html, [text](README.md) -> index.html; leave URLs alone
  return md.replace(/\]\((?!https?:|mailto:|#)([^)\s]+?)\.md(#[^)]*)?\)/g, (_, p, hash = "") => {
    const target = /(^|\/)README$/.test(p) ? p.replace(/README$/, "index") : p;
    return `](${target}.html${hash})`;
  });
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page({ title, body, rel, rtl }) {
  const depth = rel.split("/").length - 1;
  const up = depth ? "../".repeat(depth) : "./";
  const nav = [`<a href="${up}index.html">Home</a>`]
    .concat(COURSES.map(([dir, label]) => `<a href="${up}${dir}/index.html">${escapeHtml(label)}</a>`))
    .concat(fs.existsSync(path.join(ROOT, "extra-topics")) ? `<a href="${up}extra-topics/index.html">Extra topics</a>` : [])
    .concat(fs.existsSync(path.join(ROOT, "BLUEPRINT.md")) ? `<a href="${up}BLUEPRINT.html">Blueprint checklist</a>` : [])
    .concat(fs.existsSync(path.join(ROOT, "mock-exam")) ? `<a href="${up}mock-exam/index.html">Mock exam</a>` : [])
    .join("");
  return `<!doctype html>
<html lang="${rtl ? "ar" : "en"}" dir="${rtl ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · CCDV-F Prep</title>
<link rel="stylesheet" href="${up}assets/site.css">
</head>
<body>
<header><nav dir="ltr">${nav}</nav></header>
<main>${body}</main>
</body>
</html>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
let pages = 0, copied = 0;

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const ext = path.extname(file);
  if (ext === ".md") {
    const md = fs.readFileSync(file, "utf8");
    const title = (md.match(/^#\s+(.+)$/m) || [, rel])[1];
    const rtl = /[؀-ۿ]/.test(md);
    const body = marked.parse(rewriteLinks(md));
    const dest = path.join(OUT, outName(rel));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, page({ title, body, rel, rtl }));
    pages++;
  } else if (COPY_EXT.has(ext)) {
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    copied++;
  }
}

// Course folders without a README still need a landing page for the nav.
for (const [dir, label] of COURSES) {
  const index = path.join(OUT, dir, "index.html");
  if (!fs.existsSync(index) && fs.existsSync(path.join(OUT, dir, "quiz.html"))) {
    const body = `<h1>${escapeHtml(label)}</h1><p><a href="quiz.html">Open the practice quiz</a></p>`;
    fs.writeFileSync(index, page({ title: label, body, rel: `${dir}/index.md`, rtl: false }));
    pages++;
  }
}

console.log(`Built ${pages} pages and copied ${copied} files into public/`);
