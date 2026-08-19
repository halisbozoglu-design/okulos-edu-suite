import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";

export const Route=createFileRoute("/personnel-admin")({head:()=>({meta:[{title:"Personel Yönetimi — OkulOS"}]}),component:PersonnelAdmin});
type Area={id:string;name:string};
type Person={user_id:string;full_name:string|null;email:string|null;role:string;teaching_area_id:string|null;permission_mode:"role"|"delegated";is_super_admin:boolean;updated_at:string};

function PersonnelAdmin(){
 const {can,any,loading:permissionLoading}=usePermissions();
 const [areas,setAreas]=useState<Area[]>([]);const [people,setPeople]=useState<Person[]>([]);const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState<string|null>(null);const [loadError,setLoadError]=useState<string|null>(null);
 const allowed=any("personnel.view","personnel.manage");const editable=can("personnel.manage");
 const load=useCallback(async()=>{if(permissionLoading||!allowed)return;setLoadError(null);const [a,p]=await Promise.all([supabase.from("teaching_areas").select("id,name").eq("active",true).order("name"),supabase.rpc("get_personnel_admin_list")]);if(a.error||p.error){setLoadError("Personel bilgileri yüklenemedi. Görev/yetki atamasını ve migration durumunu kontrol edin.");return;}setAreas((a.data??[]) as Area[]);setPeople((p.data??[]) as Person[]);},[allowed,permissionLoading]);
 useEffect(()=>{void load();},[load]);
 async function setArea(userId:string,areaId:string){if(!editable)return;setBusy(userId);setMessage(null);const {error}=await supabase.rpc("set_personnel_teaching_area",{p_user_id:userId,p_teaching_area_id:areaId||null});setBusy(null);if(error){setMessage(error.message.includes("CANNOT_MODIFY_SUPER_ADMIN")?"Süper Admin hesabı bu görev yetkisiyle değiştirilemez.":"Personelin atama alanı güncellenemedi.");return;}setMessage("Atama alanı güncellendi.");await load();}
 if(permissionLoading)return <AppShell title="Personel Yönetimi"><p className="text-sm text-muted-foreground">Yetki kontrol ediliyor…</p></AppShell>;
 if(!allowed)return <AppShell title="Personel Yönetimi"><div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Bu kullanıcıya Personel Görüntüleme veya Personel Yönetme görevi atanmadı.</div></AppShell>;
 return <AppShell title="Kayıtlı Personel Yönetimi" subtitle={editable?"Personel listesi · atama alanı yönetimi":"Personel listesi · salt okunur"} action={<Users className="size-5"/>}>
   <div className="grid gap-2 sm:grid-cols-2"><Link to="/management"><Button variant="outline" className="w-full">Yönetim Merkezi</Button></Link>{can("permissions.manage")?<Link to="/settings/permissions"><Button variant="outline" className="w-full">Görev ve Yetki Atama</Button></Link>:<Link to="/norm-analysis"><Button variant="outline" className="w-full">Norm Analizi</Button></Link>}</div>
   {message?<div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div>:null}{loadError?<div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{loadError}</div>:null}
   {!editable?<div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950"><ShieldCheck className="size-4"/>Bu hesapta yalnız personel görüntüleme yetkisi var; alan değişikliği yapılamaz.</div>:null}
   <div className="mt-4 overflow-x-auto rounded-xl border bg-card"><table className="min-w-[820px] w-full text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-3 text-left">Ad Soyad</th><th className="p-3 text-left">E-posta</th><th className="p-3 text-left">Rol</th><th className="p-3 text-left">Yetki Modeli</th><th className="p-3 text-left">Atama Alanı</th><th className="p-3 text-left">Güncelleme</th></tr></thead><tbody>{people.map(p=><tr key={p.user_id} className="border-b"><td className="p-3 font-medium">{p.full_name??"—"}{p.is_super_admin?<span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">Süper Admin</span>:null}</td><td className="p-3 text-muted-foreground">{p.email??"—"}</td><td className="p-3">{p.role}</td><td className="p-3 text-xs">{p.permission_mode==="delegated"?"Görev Bazlı":"Rol Bazlı"}</td><td className="p-3"><select className="h-9 min-w-56 rounded-md border bg-background px-2 text-sm" value={p.teaching_area_id??""} disabled={!editable||busy===p.user_id||(p.is_super_admin&&!can("permissions.manage"))} onChange={e=>void setArea(p.user_id,e.target.value)}><option value="">Atama alanı tanımsız</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></td><td className="p-3 text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleString("tr-TR")}</td></tr>)}{!people.length&&!loadError?<tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Kayıt olmuş personel yok.</td></tr>:null}</tbody></table></div>
   <Button variant="ghost" className="mt-4 gap-2" onClick={()=>void load()}><RefreshCw className="size-4"/>Yenile</Button><p className="mt-2 text-xs text-muted-foreground">Ham T.C. Kimlik No bu ekranda gösterilmez. Kimlik/rol/Süper Admin bootstrap işlemleri görev delegasyonunun dışında tutulur.</p>
 </AppShell>;
}
