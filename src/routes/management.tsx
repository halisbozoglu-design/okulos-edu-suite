import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, BriefcaseBusiness, Building2, CalendarDays, Calculator, Crown, FileClock, GraduationCap, History, KeyRound, Scale, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Table2, UserCog, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { supabase } from "@/lib/supabase";

export const Route=createFileRoute("/management")({head:()=>({meta:[{title:"Yönetim Merkezi — OkulOS"}]}),component:ManagementHub});
type ManagementItem={to:string;title:string;desc:string;icon:LucideIcon;permissions:readonly string[];superOnly?:boolean};
const items:readonly ManagementItem[]=[
 {to:'/calendar',title:'Çalışma Takvimi',desc:'Akademik yıl, tatil, mesleki çalışma ve sınav aralıkları',icon:CalendarDays,permissions:['settings.manage']},
 {to:'/curriculum',title:'Müfredat & Ders Yükü',desc:'Sınıf dersleri, haftalık saatler ve öğretmen dağıtımı',icon:BookOpenCheck,permissions:['curriculum.manage']},
 {to:'/norm-analysis',title:'Norm Kadro Analizi',desc:'Ders yükü, formal norm, mevcut öğretmen ve açık/fazla analizi',icon:Scale,permissions:['norm.view','norm.manage']},
 {to:'/norm-settings',title:'Norm Eşleştirmeleri',desc:'Ders → norm alanı ve alan → yürürlükteki norm kuralı',icon:Settings,permissions:['norm.manage']},
 {to:'/schedule-rules',title:'Program Kuralları',desc:'Zaman şablonu, öğretmen tercihleri, blok ve eşzamanlı grup kuralları',icon:SlidersHorizontal,permissions:['schedule.rules']},
 {to:'/schedule-solver',title:'Program Çözücü',desc:'Kilitler, 4 senaryo, repair/backtracking ve kalite puanlama',icon:Sparkles,permissions:['schedule.generate','schedule.apply']},
 {to:'/classrooms',title:'Derslik Envanteri',desc:'Kapasite, derslik tipi, bölüm ve gerekli donanım kuralları',icon:Building2,permissions:['classrooms.manage']},
 {to:'/room-assignment',title:'Otomatik Derslik Atama',desc:'Kapasite, tip, donanım ve saat çakışmasına göre atama',icon:Building2,permissions:['schedule.generate','classrooms.manage']},
 {to:'/schedule',title:'Çalışma Programı',desc:'Müfredata bağlı manuel program ve e-Okul/Excel içe aktarma',icon:GraduationCap,permissions:['schedule.view','schedule.edit']},
 {to:'/schedule-validation',title:'Program Doğrulama',desc:'Yayın öncesi hard constraint ve veri bütünlüğü sıfır-hata kapısı',icon:ShieldCheck,permissions:['schedule.view','schedule.publish']},
 {to:'/schedule-history',title:'Program Geçmişi',desc:'Geri dönüş noktaları, geri al ve yeniden uygula',icon:History,permissions:['schedule.restore']},
 {to:'/schedule-archive',title:'Yayın & Arşiv',desc:'Doğrulanmış programların değişmez ispat arşivi',icon:FileClock,permissions:['schedule.publish']},
 {to:'/payroll',title:'Ek Ders 2.0',desc:'Puantaj, faaliyetler, onay ve KBS çıktısı',icon:Table2,permissions:['payroll.view','payroll.calculate','payroll.edit','payroll.approve','payroll.publish']},
 {to:'/payroll-rules',title:'Ek Ders Kuralları',desc:'Yürürlük tarihli mevzuat ve KBS veri tipi kayıtları',icon:Calculator,permissions:['payroll.edit']},
 {to:'/substitutes',title:'Vekalet',desc:'Devamsızlık, boş ders ve vekalet atamaları',icon:Users,permissions:['substitutes.view','substitutes.manage']},
 {to:'/settings',title:'Nöbet Ayarları',desc:'Aylık idareci/öğretmen nöbet planı',icon:Settings,permissions:['duty.view','duty.manage','duty.generate','duty.lock']},
 {to:'/duty-book',title:'Nöbet Defteri',desc:'Günlük nöbet, boş ders, gecikme ve olay kayıtları',icon:FileClock,permissions:['duty.view','duty.manage']},
 {to:'/personnel-admin',title:'Kayıtlı Personel',desc:'Kayıt olmuş personelin atama alanı ve temel sistem ilişkileri',icon:UserCog,permissions:['personnel.view','personnel.manage']},
 {to:'/settings/permissions',title:'Görev ve Yetki Atama',desc:'Personel bazlı modül, işlem, süre ve görev delegasyonu',icon:KeyRound,permissions:['permissions.manage']},
 {to:'/settings-task-roles',title:'Görev Şablonları',desc:'Okula özel tekrar kullanılabilir görev/rol paketleri',icon:BriefcaseBusiness,permissions:['permissions.manage']},
 {to:'/super-admin',title:'Süper Admin',desc:'Personel, atama alanı, TTKB, norm ve kaynak girdileri',icon:Crown,permissions:[],superOnly:true},
];
function ManagementHub(){
 const [codes,setCodes]=useState<Set<string>|null>(null),[isSuper,setIsSuper]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{void(async()=>{const [p,s]=await Promise.all([supabase.rpc('get_my_permissions'),supabase.rpc('is_super_admin')]);if(p.error){setError('Görev/yetki bilgileri okunamadı.');setCodes(new Set());return;}setCodes(new Set((p.data??[]).map((x:{code:string})=>x.code)));setIsSuper(Boolean(s.data));})()},[]);
 const visible=useMemo(()=>items.filter(item=>item.superOnly?isSuper:item.permissions.some(code=>codes?.has(code))),[codes,isSuper]);
 return <AppShell title="Yönetim Merkezi" subtitle="Atanmış görev ve yetkilere göre erişilebilir OkulOS modülleri">{error?<div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}{codes===null?<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Yetkiler yükleniyor…</div>:visible.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item=>{const Icon=item.icon;return <Link key={item.to} to={item.to as never} className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5"/></div><div><h2 className="font-semibold group-hover:text-primary">{item.title}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p></div></div></Link>})}</div>:<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Bu kullanıcıya yönetim görevi atanmadı.</div>}</AppShell>;
}
