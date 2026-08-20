import { readFile } from "node:fs/promises";

const doc=await readFile(new URL("../docs/FINAL_EXISTING_MODULE_ENTRY_TENANT_SCOPE.md",import.meta.url),"utf8");
for(const marker of ["fail-closed","institution_memberships","system_feature_catalog","sınıflandırılmamış aktif route","yeni fonksiyonel modül geliştirilmeyecektir"]){
 if(!doc.toLocaleLowerCase("tr-TR").includes(marker.toLocaleLowerCase("tr-TR"))){console.error(`Kapanış kriteri eksik: ${marker}`);process.exit(1);}
}
console.log("Mevcut modül giriş + tenant kapsamı kapanış kriterleri kayıtlı.");
