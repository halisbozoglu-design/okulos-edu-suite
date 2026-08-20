import { readFile } from "node:fs/promises";

const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const errors = [];
for (const token of [
  'reason:"not_authenticated"',
  '"tenant_required"',
  'reason:"access_check_failed"',
  'publicPaths=["/","/school-registration","/auth/callback"]',
]) if (!root.includes(token)) errors.push(`Eksik giriş/tenant güvenlik işareti: ${token}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Kimlik doğrulama + tenant giriş kapısı fail-closed durumda.");
