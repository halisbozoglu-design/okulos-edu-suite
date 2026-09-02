import { describe, expect, it } from "bun:test";

describe("OkulOS security PWA entry points", () => {
  it("exposes installable manifest shortcuts for security workflows", async () => {
    const manifest = JSON.parse(await Bun.file("public/manifest.webmanifest").text()) as { display: string; scope: string; shortcuts?: { url: string }[] };
    expect(manifest.display).toBe("standalone");
    expect(manifest.scope).toBe("/");
    expect(manifest.shortcuts?.map((shortcut) => shortcut.url)).toContain("/security/visitors/check-in");
    expect(manifest.shortcuts?.map((shortcut) => shortcut.url)).toContain("/security/student-duty");
  });

  it("keeps the service worker offline shell generic and versioned", async () => {
    const serviceWorker = await Bun.file("public/sw.js").text();
    expect(serviceWorker).toContain('const CACHE_NAME = "okulos-shell-v3"');
    expect(serviceWorker).toContain("internet bağlantısı gerekiyor");
  });
});
