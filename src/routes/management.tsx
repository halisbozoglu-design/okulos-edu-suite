import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, BookOpenCheck, BriefcaseBusiness, Building2, CalendarDays, Calculator, Crown, FileClock, GraduationCap, History, KeyRound, Scale, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Table2, UserCog, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { supabase } from "@/lib/supabase";

export const Route=createFileRoute("/management")({head:()=>({meta:[{title:"Yönetim Merkezi — OkulOS"}]}),component:ManagementHub});
type Group="data"|"schedule"|"operations"|"system";
type ManagementItem={to:string;title:string;desc:string;icon:LucideIcon;permissions:readonly string[];superOnly?:boolean;group:Group};
const groups:Record<Group,{title:string;desc:string}>={
 data:{title:"Veri Yönetimi",desc:"Bir kez girilir; bütün modüller aynı merkezi kaynağı kullanır."},
 schedule:{title:"Ders Programı",desc:"Ders yükünden kurallara, üretimden doğrulamaya tek çalışma alanı."},
 operations:{title:"İş ve İşlemler",desc:"Takvim, nöbet, ek ders, vekalet ve kurum operasyonları."},
 system:{title:"Sistem ve Yetkiler",desc:"Personel yetkileri, görev şablonları, mevzuat ve yönetim kaynakları."},
};
const items:readonly ManagementItem[]=[
 {group:"data",to:'/calendar',title:'Çalışma Takvimi',desc:'MEB PDF/XLS içe aktarma, okul türüne göre kapsam ve merkezi tarih kaynağı',icon:CalendarDays,permissions:['settings.manage']},
 {group:"data",to:'/classes',title:'Sınıflar & Şubeler',desc:'MEB/e-Okul sınıf-şube raporları, program ve mevcut bilgileri',icon:Users,permissions:['classes.manage']},
 {group:"data",to:'/personnel-admin',title:'Öğretmenler & Personel',desc:'MEB personel aktarımı, branş, ana görev ve birden fazla alt sorumluluk',icon:UserCog,permissions:['personnel.view','personnel.manage']},
 {group:"data",to:'/curriculum',title:'Ders Havuzu & Ders Atamaları',desc:'Ders kataloğu, sınıf ders yükleri ve öğretmen atamaları',icon:BookOpenCheck,permissions:['curriculum.manage']},
 {group:"data",to:'/classrooms',title:'Derslikler / Salonlar',desc:'Kapasite, derslik tipi, bölüm ve gerekli donanım',icon:Building2,permissions:['classrooms.manage']},

 {group:"schedule",to:'/curriculum',title:'Sınıflar / Ders Atamaları',desc:'Ne okutulacak → kim okutacak',icon:BookOpenCheck,permissions:['curriculum.manage']},
 {group:"schedule",to:'/schedule-rules',title:'Kısıtlar & Dağıtım Kuralları',desc:'Zaman, öğretmen tercihleri, blok dağılımı ve eşzamanlı gruplar',icon:SlidersHorizontal,permissions:['schedule.rules']},
 {group:"schedule",to:'/schedule-solver',title:'Program Oluştur',desc:'Senaryolar, repair/backtracking ve kalite puanlama',icon:Sparkles,permissions:['schedule.generate','schedule.apply']},
 {group:"schedule",to:'/schedule',title:'Program',desc:'Haftalık program, manuel düzenleme ve içe aktarma',icon:GraduationCap,permissions:['schedule.view','schedule.edit']},
 {group:"schedule",to:'/schedule-validation',title:'Kontrol',desc:'Hard constraint ve veri bütünlüğü doğrulaması',icon:ShieldCheck,permissions:['schedule.view','schedule.publish']},
 {group:"schedule",to:'/room-assignment',title:'Derslik Atama',desc:'Kapasite, tip, donanım ve çakışmaya göre otomatik atama',icon:Building2,permissions:['schedule.generate','classrooms.manage']},
 {group:"schedule",to:'/schedule-history',title:'Geçmiş',desc:'Geri dönüş noktaları, geri al ve yeniden uygula',icon:History,permissions:['schedule.restore']},
 {group:"schedule",to:'/schedule-archive',title:'Yayın & Arşiv',desc:'Doğrulanmış programların değişmez arşivi',icon:FileClock,permissions:['schedule.publish']},

 {group:"operations",to:'/norm-analysis',title:'Norm Kadro Analizi',desc:'Ders yükü, norm, mevcut öğretmen ve açık/fazla analizi',icon:Scale,permissions:['norm.view','norm.manage']},
 {group:"operations",to:'/norm-settings',title:'Norm Eşleştirmeleri',desc:'Ders → norm alanı ve yürürlükteki norm kuralı',icon:Settings,permissions:['norm.manage']},
 {group:"operations",to:'/payroll',title:'Ek Ders',desc:'Puantaj, faaliyetler, onay ve KBS çıktısı',icon:Table2,permissions:['payroll.view','payroll.calculate','payroll.edit','payroll.approve','payroll.publish']},
 {group:"operations",to:'/payroll-rules',title:'Ek Ders Kuralları',desc:'Yürürlük tarihli kurallar ve KBS veri tipleri',icon:Calculator,permissions:['payroll.edit']},
 {group:"operations",to:'/substitutes',title:'Vekalet',desc:'Devamsızlık, boş ders ve vekalet atamaları',icon:Users,permissions:['substitutes.view','substitutes.manage']},
 {group:"operations",to:'/settings',title:'Nöbet',desc:'Aylık idareci/öğretmen nöbet planı',icon:Settings,permissions:['duty.view','duty.manage','duty.generate','duty.lock']},
 {group:"operations",to:'/duty-book',title:'Nöbet Defteri',desc:'Günlük nöbet, boş ders, gecikme ve olay kayıtları',icon:FileClock,permissions:['duty.view','duty.manage']},

 {group:"system",to:'/legislation',title:'Mevzuat Kütüphanesi',desc:'Mevzuatı kaydet, ara, oku ve personele gönder',icon:BookOpen,permissions:['settings.manage']},
 {group:"system",to:'/settings-permissions',title:'Görev ve Yetki Atama',desc:'Personel bazlı modül, işlem, süre ve delegasyon',icon:KeyRound,permissions:['permissions.manage']},
 {group:"system",to:'/settings-task-roles',title:'Görev Şablonları',desc:'Okula özel tekrar kullanılabilir görev/rol paketleri',icon:BriefcaseBusiness,permissions:['permissions.manage']},
 {group:"system",to:'/super-admin',title:'Süper Admin',desc:'Personel, atama alanı, TTKB, norm ve kaynak girdileri',icon:Crown,permissions:[],superOnly:true},
];
function ManagementHub(){
 const [codes,setCodes]=useState<Set<string>|null>(null),[isSuper,setIsSuper]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{void(async()=>{const [p,s]=await Promise.all([supabase.rpc('get_my_permissions'),supabase.rpc('is_super_admin')]);if(p.error){setError('Görev/yetki bilgileri okunamadı.');setCodes(new Set());return;}setCodes(new Set((p.data??[]).map((x:{code:string})=>x.code)));setIsSuper(Boolean(s.data));})()},[]);
 const visible=useMemo(()=>items.filter(item=>item.superOnly?isSuper:item.permissions.some(code=>codes?.has(code))),[codes,isSuper]);
 return <AppShell title="Yönetim Merkezi" subtitle="Dağınık veri girişleri yerine merkezi veri → ilgili modül kullanımı">
  {error?<div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}{codes===null?<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Yetkiler yükleniyor…</div>:visible.length?<div className="space-y-7">{(Object.keys(groups) as Group[]).map(group=>{const rows=visible.filter(x=>x.group===group);if(!rows.length)return null;return <section key={group}><div className="mb-3"><h2 className="text-base font-semibold">{groups[group].title}</h2><p className="text-xs text-muted-foreground">{groups[group].desc}</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(item=>{const Icon=item.icon;return <Link key={`${group}-${item.to}-${item.title}`} to={item.to as never} className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5"/></div><div><h3 className="font-semibold group-hover:text-primary">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p></div></div></Link>})}</div></section>})}</div>:<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Bu kullanıcıya yönetim görevi atanmadı.</div>}
 </AppShell>;
}
