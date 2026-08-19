import { existsSync, readFileSync } from "node:fs";

const errors = [];
const indexPath = "src/routes/index.tsx";
const callbackPath = "src/routes/auth.callback.tsx";

if (!existsSync(indexPath)) errors.push("Ana giriş route'u bulunamadı.");
if (!existsSync(callbackPath)) errors.push("Auth callback route'u bulunamadı.");

if (existsSync(indexPath)) {
  const source = readFileSync(indexPath, "utf8");
  if (source.includes('value="superadmin"') || source.includes("function SuperAdminLogin")) {
    errors.push("Ayrı Süper Admin giriş ekranı yeniden eklenmiş.");
  }
  if (!source.includes("emailRedirectTo:callbackUrl()")) {
    errors.push("OTP/magic-link dönüş adresi auth callback'e bağlı değil.");
  }
  if (!source.includes("claim_super_admin_profile")) {
    errors.push("Tek giriş akışında Süper Admin profil claim adımı yok.");
  }
}

if (existsSync(callbackPath)) {
  const source = readFileSync(callbackPath, "utf8");
  if (!source.includes('createFileRoute("/auth/callback")')) errors.push("Auth callback route yolu yanlış.");
  if (!source.includes("exchangeCodeForSession") || !source.includes("verifyOtp") || !source.includes("setSession")) {
    errors.push("Callback PKCE/token_hash/hash session dönüşlerinin tamamını işlemiyor.");
  }
}

if (errors.length) {
  console.error("Auth flow check FAILED:\n" + errors.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log("Auth flow check OK.");
