import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Database, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export const Route=createFileRoute("/personnel-field-settings")({head:()=>({meta:[{title:"Personel Sütun Kullanımı — OkulOS"}]}),component:PersonnelFieldSettings});

type Field={field_key:string;display_name:string;source_headers:string[];enabled:boolean;module_keys:string[];data_class:string;last_seen_at:string};
const COMMON_MODULES=["personnel","schedule","norm","duty","payroll","guidance","exams","isg","discipline","committees","transport","reports"];

function PersonnelFieldSettings(){
 const [isSuper,setIsSuper]=useState<boolean|null>(null),[fields,setFields]=useState<Field[]>([]),[busy,setBusy]=useState<string|null>(null),[message,setMessage]=useState<string|null>(null),[custom,setCustom]=useState<Record<string,string>>({});
 async function load(){const {data:is}=await supabase.rpc("is_super_admin");setIsSuper(Boolean(is));if(!is)return;const {data,error}=await supabase.from("personnel_field_catalog").select("field_key,display_name,source_headers,enabled,module_keys,data_class,last_seen_at").order("display_name");if(error){setMessage("Personel sütun kataloğu okunamadı.");return;}setFields((data??[]) as Field[]);}
 useEffect(()=>{void load()},[]);
 const moduleSet=useMemo(()=>new Set(COMMON_MODULES),[]);
 async function save(field:Field,nextEnabled=field.enabled,nextModules=field.module_keys){setBusy(field.field_key);setMessage(null);const {error}=await supabase.rpc("set_personnel_field_rule",{p_field_key:field.field_key,p_enabled:nextEnabled,p_module_keys:nextModules});setBusy(null);if(error){setMessage("Alan kuralı kaydedilemedi: "+error.message);return;}setFields(v=>v.map(x=>x.field_key===field.field_key?{...x,enabled:nextEnabled,module_keys:nextModules}:x));}
 function toggleModule(field:Field,module:string,checked:boolean){const next=checked?[...new Set([...field.module_keys,module])]:field.module_keys.filter(x=>x!==module);void save(field,field.enabled,next);}
 function addCustom(field:Field){const value=(custom[field.field_key]??"").trim().toLocaleLowerCase("tr-TR").replace(/\s+/g,"-");if(!value)return;const next=[...new Set([...field.module_keys,value])];setCustom(v=>({...v,[field.field_key]:""}));void save(field,field.enabled,next);}
 if(isSuper===null)return <AppShell title="Personel Sütun Kullanımı"><p className="text-sm text-muted-foreground">Süper Admin kontrol ediliyor…</p></AppShell>;
 if(!isSuper)return <AppShell title="Personel Sütun Kullanımı"><div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Bu ekran yalnız Süper Admin tarafından kullanılabilir.</div></AppShell>;
 return <AppShell title="Personel Sütun Kullanımı" subtitle="Kaynak rapordaki alanları kaybetmeden, hangi modülün hangi alanı kullanacağını belirle">
  <div className="grid gap-2 sm:grid-cols-2"><Link to="/personnel-import"><Button variant="outline" className="w-full">Personel Veri İçe Aktarma</Button></Link><Link to="/super-admin"><Button variant="outline" className="w-full">Süper Admin</Button></Link></div>
  <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p><b>Varsayılan kapalıdır.</b> Yeni keşfedilen her sütun ham veri olarak saklanır fakat hiçbir modüle otomatik açılmaz. Buradan etkinleştirip bir veya daha fazla modülle eşleştirirsiniz. Yeni modül geldikçe modül anahtarını aynı alana sonradan ekleyebilirsiniz.</p></div>
  {message?<div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div>:null}
  <div className="mt-4 space-y-3">{fields.map(field=><section key={field.field_key} className="rounded-xl border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Database className="size-4 text-primary"/><h2 className="font-semibold">{field.display_name}</h2></div><p className="mt-1 text-[11px] text-muted-foreground">Anahtar: {field.field_key} · Kaynak başlıkları: {field.source_headers.join(" / ")}</p></div><label className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"><input type="checkbox" checked={field.enabled} disabled={busy===field.field_key} onChange={e=>void save(field,e.target.checked,field.module_keys)}/>Sistemde kullanılabilir</label></div>
    <div className="mt-3"><p className="mb-2 text-xs font-medium">Bu alanı kullanabilecek modüller</p><div className="flex flex-wrap gap-1.5">{COMMON_MODULES.map(module=><label key={module} className={`rounded-full border px-2 py-1 text-[11px] ${field.module_keys.includes(module)?"border-primary bg-primary-soft text-primary":"text-muted-foreground"}`}><input className="mr-1" type="checkbox" checked={field.module_keys.includes(module)} disabled={busy===field.field_key||!field.enabled} onChange={e=>toggleModule(field,module,e.target.checked)}/>{module}</label>)}{field.module_keys.filter(x=>!moduleSet.has(x)).map(module=><button key={module} disabled={busy===field.field_key||!field.enabled} onClick={()=>toggleModule(field,module,false)} className="rounded-full border border-primary bg-primary-soft px-2 py-1 text-[11px] text-primary" title="Kaldır">{module} ×</button>)}</div></div>
    <div className="mt-3 flex gap-2"><Input value={custom[field.field_key]??""} disabled={!field.enabled} onChange={e=>setCustom(v=>({...v,[field.field_key]:e.target.value}))} placeholder="Yeni modül anahtarı (örn. yatılılık)"/><Button variant="secondary" disabled={!field.enabled||busy===field.field_key} onClick={()=>addCustom(field)}>Modüle Ekle</Button></div>
  </section>)}{!fields.length?<div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">Henüz keşfedilmiş personel sütunu yok. Önce bir Personel Özet Bilgi Excel/PDF dosyası içe aktarın.</div>:null}</div>
 </AppShell>;
}
