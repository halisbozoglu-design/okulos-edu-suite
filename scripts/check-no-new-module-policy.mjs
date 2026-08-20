import { readFile } from "node:fs/promises";
const text=(await readFile(new URL("../docs/NO_NEW_MODULES_UNTIL_EXISTING_DONE.md",import.meta.url),"utf8")).toLowerCase();
if(!text.includes("no new functional module")||!text.includes("disabled/passive")){console.error("Yeni modül kilidi belgesi eksik.");process.exit(1)}
console.log("Yeni modül geliştirme kilidi kayıtlı.");
