import { test } from "node:test";
import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
// Run against an unconfigured preview. Never bypass authentication for test users.
for (const [path, title] of [
  ["/login", "Welcome back, learner"],
  ["/admin/login", "Lecturer sign in"],
  ["/superadmin/login", "Superadmin sign in"],
  ["/register", "Start your learning journey"],
  ["/forgot-password", "Forgot your password?"],
  ["/reset-password", "Choose a new password"],
]) {
  test(`${path}: noindex, no-store and a disabled setup state`, async () => {
    const r = await fetch(origin + path);
    assert.equal(r.status, 200);
    assert.match(r.headers.get("cache-control"), /no-store/);
    assert.match(r.headers.get("x-robots-tag"), /noindex/);
    const html = await r.text();
    assert.ok(html.includes(title));
    assert.ok(html.includes("Sign-in is being prepared"));
    assert.match(html, /<button[^>]*disabled/);
  });
}
for (const [path, login] of [
  ["/lms", "/login"],
  ["/admin", "/admin/login"],
  ["/superadmin", "/superadmin/login"],
]) {
  test(`${path}: no access without configuration/session`, async () => {
    const r = await fetch(origin + path, {
      redirect: "manual",
      headers: { cookie: "sb-fake-auth-token=not-a-real-session" },
    });
    assert.equal(r.status, 307);
    const location = new URL(r.headers.get("location"), origin);
    assert.equal(location.pathname, login);
    assert.match(r.headers.get("cache-control"), /no-store/);
  });
}
test("invalid confirmation and recovery callbacks cannot redirect to a foreign site", async () => {
  for (const path of [
    "/auth/callback?code=fake&next=https://evil.example",
    "/auth/confirm?type=recovery&token_hash=fake&next=//evil.example",
  ]) {
    const r = await fetch(origin + path, { redirect: "manual" });
    assert.equal(new URL(r.headers.get("location"), origin).origin, origin);
    assert.equal(new URL(r.headers.get("location"), origin).pathname, "/login");
  }
});
