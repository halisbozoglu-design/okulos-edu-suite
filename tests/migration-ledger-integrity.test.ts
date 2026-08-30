import { expect, test } from "bun:test";
import { readdir } from "node:fs/promises";

const migrationDir = new URL("../supabase/migrations/", import.meta.url);

test("migration ledger integrity keeps every local version unique", async () => {
  const versions = (await readdir(migrationDir))
    .filter((name) => name.endsWith(".sql"))
    .map((name) => name.match(/^(\d+)_/)?.[1])
    .filter((version): version is string => version != null);

  expect(new Set(versions).size).toBe(versions.length);
});
