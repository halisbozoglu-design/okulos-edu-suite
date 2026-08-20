import { readFile, readdir } from "node:fs/promises";

const routeDir = new URL("../src/routes/", import.meta.url);
const routeTreePath = new URL("../src/routeTree.gen.ts", import.meta.url);
const ignored = new Set(["README.md", "__root.tsx"]);
const files = (await readdir(routeDir)).filter((name) => name.endsWith(".tsx") && !ignored.has(name));
const tree = await readFile(routeTreePath, "utf8");
const missing = [];
for (const file of files) {
  const routeName = file.replace(/\.tsx$/, "");
  const importToken = `./routes/${routeName}`;
  if (!tree.includes(importToken)) missing.push(file);
}
if (missing.length) {
  console.error("routeTree.gen.ts güncel değil. Eksik route'lar:\n" + missing.map((x) => `- ${x}`).join("\n"));
  console.error("Önce production build ile route ağacını üretip src/routeTree.gen.ts dosyasını commit edin.");
  process.exit(1);
}
console.log(`Route ağacı güncel: ${files.length} route dosyası temsil ediliyor.`);
