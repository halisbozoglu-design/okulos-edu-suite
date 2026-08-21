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
  for (const token of [
    'functions.invoke("password-login"',
    'auth.setSession',
    'functions.invoke("school-recovery"',
    'auth.verifyOtp',
    'lovable.auth.signInWithOAuth("google"',
    'callbackUrl()',
    'claim_super_admin_profile',
    'is_super_admin',
  ]) {
    if (!source.includes(token)) errors.push(`Güncel giriş akışı işareti eksik: ${token}`);
  }
}

if (existsSync(callbackPath)) {
  const source = readFileSync(callbackPath, "utf8");
  if (!source.includes('createFileRoute("/auth/callback")')) errors.push("Auth callback route yolu yanlış.");
  for (const token of ["exchangeCodeForSession", "verifyOtp", "setSession", "claim_super_admin_profile", "is_super_admin"]) {
    if (!source.includes(token)) errors.push(`Callback oturum dönüş işareti eksik: ${token}`);
  }
}

if (errors.length) {
  console.error("Auth flow check FAILED:\n" + errors.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log("Auth flow check OK: password, recovery OTP, Google OAuth callback and role claim paths are wired.");
