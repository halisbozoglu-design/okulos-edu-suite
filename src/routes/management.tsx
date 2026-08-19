import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, BookOpenCheck, Building2, CalendarDays, Calculator, Crown, FileClock, GraduationCap, History, Scale, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Table2, UserCog, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";

export const Route=createFileRoute("/management")({head:()=>({meta:[{title:"Yönetim Merkezi — OkulOS"}]}),component:ManagementHub});
const items=[
 {to:'/calendar',title:'Çalışma Takvimi',desc:'Akademik yıl, tatil, mesleki çalışma ve sınav aralıkları',icon:CalendarDays},
 {to:'/curriculum',title:'Müfredat & Ders Yükü',desc:'Sınıf dersleri, haftalık saatler ve öğretmen dağıtımı',icon:BookOpenCheck},
 {to:'/norm-analysis',title:'Norm Kadro Analizi',desc:'Ders yükü, formal norm, mevcut öğretmen ve açık/fazla analizi',icon:Scale},
 {to:'/norm-settings',title:'Norm Eşleştirmeleri',desc:'Ders → norm alanı ve alan → yürürlükteki norm kuralı',icon:Settings},
 {to:'/schedule-rules',title:'Program Kuralları',desc:'Zaman şablonu, öğretmen tercihleri, blok ve eşzamanlı grup kuralları',icon:SlidersHorizontal},
 {to:'/schedule-solver',title:'Program Çözücü',desc:'Kilitler, 4 senaryo, repair/backtracking ve kalite puanlama',icon:Sparkles},
 {to:'/classrooms',title:'Derslik Envanteri',desc:'Kapasite, derslik tipi, bölüm ve gerekli donanım kuralları',icon:Building2},
 {to:'/room-assignment',title:'Otomatik Derslik Atama',desc:'Kapasite, tip, donanım ve saat çakışmasına göre atama',icon:Building2},
 {to:'/schedule',title:'Çalışma Programı',desc:'Müfredata bağlı manuel program ve e-Okul/Excel içe aktarma',icon:GraduationCap},
 {to:'/schedule-validation',title:'Program Doğrulama',desc:'Yayın öncesi hard constraint ve veri bütünlüğü sıfır-hata kapısı',icon:ShieldCheck},
 {to:'/schedule-history',title:'Program Geçmişi',desc:'Geri dönüş noktaları, geri al ve yeniden uygula',icon:History},
 {to:'/schedule-archive',title:'Yayın & Arşiv',desc:'Doğrulanmış programların değişmez ispat arşivi',icon:FileClock},
 {to:'/payroll',title:'Ek Ders 2.0',desc:'Puantaj, faaliyetler, onay ve KBS çıktısı',icon:Table2},
 {to:'/payroll-rules',title:'Ek Ders Kuralları',desc:'Yürürlük tarihli mevzuat ve KBS veri tipi kayıtları',icon:Calculator},
 {to:'/substitutes',title:'Vekalet',desc:'Devamsızlık, boş ders ve vekalet atamaları',icon:Users},
 {to:'/settings',title:'Nöbet Ayarları',desc:'Aylık idareci/öğretmen nöbet planı',icon:Settings},
 {to:'/duty-book',title:'Nöbet Defteri',desc:'Günlük nöbet, boş ders, gecikme ve olay kayıtları',icon:FileClock},
 {to:'/notifications',title:'Bildirim & PWA',desc:'Supabase Web Push, Service Worker ve Telegram',icon:BellRing},
 {to:'/personnel-admin',title:'Kayıtlı Personel',desc:'Kayıt olmuş personelin atama alanı ve temel sistem ilişkileri',icon:UserCog},
 {to:'/super-admin',title:'Süper Admin',desc:'Personel, atama alanı, TTKB, norm ve kaynak girdileri',icon:Crown},
] as const;
function ManagementHub(){return <AppShell title="Yönetim Merkezi" subtitle="OkulOS operasyon, ders programı ve mevzuat modülleri"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=>{const Icon=item.icon;return <Link key={item.to} to={item.to as never} className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5"/></div><div><h2 className="font-semibold group-hover:text-primary">{item.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p></div></div></Link>})}</div></AppShell>}
