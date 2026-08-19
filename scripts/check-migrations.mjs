import { readdir } from "node:fs/promises";

const dir = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
const seen = new Map();
const errors = [];

for (const file of files) {
  const match = file.match(/^(\d{14})_/);
  if (!match) {
    errors.push(`${file}: migration adı YYYYMMDDHHMMSS_ ile başlamalı.`);
    continue;
  }
  const version = match[1];
  const previous = seen.get(version);
  if (previous) errors.push(`Aynı migration sürümü iki kez kullanılmış: ${version} -> ${previous}, ${file}`);
  else seen.set(version, file);
}

if (errors.length) {
  console.error("Supabase migration bütünlük hatası:\n" + errors.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}

console.log(`Migration kontrolü başarılı: ${files.length} dosya, ${seen.size} benzersiz sürüm.`);
