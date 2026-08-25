import { readdir } from "node:fs/promises";

const dir = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
const seen = new Map();
const errors = [];
const legacyDuplicates = new Map([
  ["20260825011500", new Set(["20260825011500_mesem_kimya_teknolojisi.sql", "20260825011500_mesem_konaklama_standard_protocol.sql"])],
  ["20260825013000", new Set(["20260825013000_mesem_insaat_batch1.sql", "20260825013000_mesem_motorlu_araclar_remaining8.sql"])],
]);

for (const file of files) {
  const match = file.match(/^(\d{14})_/);
  if (!match) { errors.push(`${file}: migration adı YYYYMMDDHHMMSS_ ile başlamalı.`); continue; }
  const version = match[1], previous = seen.get(version);
  if (previous) {
    const allowed = legacyDuplicates.get(version);
    if (!allowed || !allowed.has(previous) || !allowed.has(file) || allowed.size !== 2)
      errors.push(`Aynı migration sürümü iki kez kullanılmış: ${version} -> ${previous}, ${file}`);
  } else seen.set(version, file);
}

if (errors.length) {
  console.error("Supabase migration bütünlük hatası:\n" + errors.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}
console.log(`Migration kontrolü başarılı: ${files.length} dosya, ${seen.size} benzersiz sürüm; ${legacyDuplicates.size} tarihsel çift allowlist.`);
