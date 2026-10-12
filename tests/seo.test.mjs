import { test } from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
const canonical = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillwave2.vercel.app';
const pages = [
  ['/', 'Empowering the Next Generation', 'Practical IT Courses'],
  ['/fit', 'Information Technology', 'Foundations of Information Technology'],
  ['/robo-iot', 'Robotics', 'Robotics'],
  ['/devops', 'DevOps', 'DevOps Leadership'],
  ['/web-master', 'Web Master', 'Full-Stack Web Development'],
  ['/news', 'News', 'News &amp; Insights'],
];
for (const [path, content, title] of pages) {
  test(`${path}: server-rendered content, unique metadata and working local images`, async () => {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.ok(markup.includes(content), 'content must exist without executing JavaScript');
    assert.ok(markup.match(/<title>(.*?)<\/title>/)?.[1].includes(title));
    assert.ok(markup.includes(`rel="canonical" href="${canonical}${path === '/' ? '' : path}"`) || markup.includes(`rel="canonical" href="${canonical}${path}"`));
    assert.match(markup, /name="description" content="[^"]+"/);
    assert.equal((markup.match(/<h1\b/g) || []).length, 1);
    const images = [...new Set([...markup.matchAll(/<img[^>]+src="([^\"]+)"/g)].map(m => m[1]).filter(src => src.startsWith('/')))];
    for (const src of images) {
      const image = await fetch(`${origin}${src}`);
      assert.equal(image.status, 200, src);
      assert.match(image.headers.get('content-type'), /^image\//);
    }
  });
}
test('sitemap lists all public routes and excludes private portals', async () => {
  const response = await fetch(`${origin}/sitemap.xml`);
  assert.equal(response.status, 200);
  const xml = await response.text();
  for (const [path] of pages) assert.ok(xml.includes(`${canonical}${path === '/' ? '' : path}`));
  assert.doesNotMatch(xml, /\/admin|\/superadmin|\/lms/);
});
test('robots and social preview are served', async () => {
  const robots = await fetch(`${origin}/robots.txt`).then(r => r.text());
  assert.ok(robots.includes(`Sitemap: ${canonical}/sitemap.xml`));
  const image = await fetch(`${origin}/opengraph-image`);
  assert.equal(image.status, 200);
  assert.match(image.headers.get('content-type'), /^image\/png/);
});
test('unknown routes return a real 404', async () => {
  const response = await fetch(`${origin}/this-page-does-not-exist`);
  assert.equal(response.status, 404);
  assert.ok((await response.text()).includes('Page not found'));
});
