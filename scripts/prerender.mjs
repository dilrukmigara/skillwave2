import { createServer, loadEnv } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const env = loadEnv("production", process.cwd(), "VITE_");
const origin = (
  env.VITE_SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://skillwave2.vercel.app"
).replace(/\/$/, "");
const base = await readFile("dist/index.html", "utf8"),
  manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: "custom",
});
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
try {
  const { render, publicPages } =
    await server.ssrLoadModule("/src/seo-entry.tsx");
  for (const [path, meta] of Object.entries(publicPages)) {
    let markup = render(path);
    for (const [source, asset] of Object.entries(manifest))
      if (asset.file && !source.startsWith("_"))
        markup = markup
          .replaceAll("/" + source, "/" + asset.file)
          .replaceAll(encodeURI("/" + source), "/" + asset.file);
    // Static content must remain readable before the animation runtime starts.
    markup = markup
      .replaceAll("opacity:0;", "opacity:1;")
      .replaceAll('opacity:0"', 'opacity:1"');
    const url = origin + path,
      title = meta.title + " | SkillWave Academy";
    const structured =
      path === "/"
        ? '<script type="application/ld+json">' +
          JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "SkillWave Academy",
            url: origin,
            email: "mail@skillwave.lk",
            telephone: "+94712777303",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Baduraliya",
              addressCountry: "LK",
            },
          }).replaceAll("<", "\\u003c") +
          "</script>"
        : "";
    let html = base
      .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(
        /<meta name="description"[^>]*\/>/,
        `<meta name="description" content="${escape(meta.description)}" />`,
      )
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
      .replace(
        "</head>",
        `<link rel="canonical" href="${escape(url)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${escape(url)}"/>${structured}</head>`,
      );
    const dir = path === "/" ? "dist" : "dist" + path;
    await mkdir(dir, { recursive: true });
    await writeFile(dir + "/index.html", html);
  }
  await writeFile(
    "dist/sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      Object.keys(publicPages)
        .map((p) => `<url><loc>${escape(origin + p)}</loc></url>`)
        .join("") +
      "</urlset>",
  );
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  console.log(
    "Prerendered public pages with route-specific metadata, canonical URLs and sitemap.",
  );
} finally {
  await server.close();
}
