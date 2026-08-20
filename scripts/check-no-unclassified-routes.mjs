import { readFile, readdir } from "node:fs/promises";

const routeDir = new URL("../src/routes/", import.meta.url);
const wiring = await readFile(new URL("./check-existing-module-tenant-wiring.mjs", import.meta.url), "utf8");
const publicRoutes = new Set(["index.tsx","school-registration.tsx","auth.callback.tsx","README.md","__root.tsx"]);
const files=(await readdir(routeDir)).filter((x)=>x.endsWith(".tsx"));
const unclassified=[];
for(const file of files){
 if(publicRoutes.has(file))continue;
 const slug=file.replace(/\.tsx$/,"").replace(/\./g,"/");
 if(!wiring.includes(`/${slug}`))unclassified.push(file);
}
if(unclassified.length){
 console.error("Sınıflandırılmamış aktif route bulundu:\n"+unclassified.map((x)=>`- ${x}`).join("\n"));
 console.error("Yeni modül açılmayacaksa route mevcut feature/tenant kataloğuna bağlanmalı; yeni modül ise önce pasif Süper Admin kaydı yapılmalı.");
 process.exit(1);
}
console.log("Tüm aktif route'lar mevcut modül/tenant sınıflandırmasına bağlı.");
