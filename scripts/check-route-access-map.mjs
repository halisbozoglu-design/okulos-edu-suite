import { readFile } from "node:fs/promises";
const root=await readFile(new URL("../src/routes/__root.tsx",import.meta.url),"utf8");
const required=[
  ["/super-admin-tenants","superOnly"],
  ["/personnel-admin","personnel.view"],
  ["/academic-years","settings.manage"],
  ["/calendar","settings.manage"],
  ["/curriculum","curriculum.manage"],
  ["/classes","classes.manage"],
  ["/classrooms","classrooms.manage"],
  ["/norm-analysis","norm.view"],
  ["/timetable","schedule.view"],
  ["/schedule-optimization","schedule.rules"],
  ["/schedule-scoped-rules","schedule.rules"],
  ["/schedule-scenario-comparison","schedule.view"],
  ["/schedule-rules","schedule.rules"],
  ["/schedule-preparation","schedule.generate"],
  ["/schedule-solver","schedule.generate"],
  ["/schedule-validation","schedule.view"],
  ["/schedule-history","schedule.restore"],
  ["/schedule-archive","schedule.publish"],
  ["/schedule","schedule.view"],
  ["/payroll","payroll.view"],
  ["/substitutes","substitutes.view"],
  ["/duty-book","duty.view"],
  ["/super-admin","superOnly"],
];
for(const [route,marker] of required){
  const line=root.split("\n").find(x=>x.includes(`prefix: \"${route}\"`));
  if(!line||!line.includes(marker)){
    console.error(`${route}: erişim kuralı eksik (${marker}).`);
    process.exit(1);
  }
}
for(const route of ["/schedule-optimization","/schedule-scoped-rules","/schedule-scenario-comparison"]){
  const exact=root.split("\n").filter(x=>x.includes(`prefix: \"${route}\"`));
  if(exact.length!==1){console.error(`${route}: özel route kuralı tekil değil.`);process.exit(1);}
}
console.log(`Mevcut modül giriş haritası tamam: ${required.length} kritik route korumalı.`);
