import { readFile,readdir } from "node:fs/promises";
const files=(await readdir(new URL("../src/routes/",import.meta.url))).filter(x=>x.endsWith(".tsx")&&!['__root.tsx'].includes(x));
const tree=await readFile(new URL("../src/routeTree.gen.ts",import.meta.url),"utf8");
const missing=files.filter(file=>!tree.includes(`./routes/${file.replace(/\.tsx$/,'')}`));
if(missing.length){console.error("routeTree.gen.ts eksik route içeriyor:\n"+missing.map(x=>`- ${x}`).join("\n"));process.exit(1);}
console.log(`Route ağacı güncel: ${files.length} route temsil ediliyor.`);
