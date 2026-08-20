import { readFile } from "node:fs/promises";

const root = await readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const required = [
  ["/super-admin-tenants", "superOnly"],
  ["/personnel-admin", "personnel.view"],
  ["/calendar", "settings.manage"],
  ["/curriculum", "curriculum.manage"],
  ["/classes", "classes.manage"],
  ["/classrooms", "classrooms.manage"],
  ["/norm-analysis", "norm.view"],
  ["/schedule", "schedule.view"],
  ["/payroll", "payroll.view"],
  ["/substitutes", "substitutes.view"],
  ["/duty-book", "duty.view"],
  ["/super-admin", "superOnly"],
];
const errors=[];
for(const [route,marker] of required){
  const line=root.split("\n").find((x)=>x.includes(`prefix: \"${route}\"`));
  if(!line||!line.includes(marker))errors.push(`${route}: erişim kuralı eksik veya beklenen marker yok (${marker}).`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log(`Mevcut modül giriş haritası tamam: ${required.length} kritik route korumalı.`);
