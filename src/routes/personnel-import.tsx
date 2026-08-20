import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Settings2, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";
import { getPersonnelColumns, parsePersonnelSummaryReport, type PersonnelImportRow } from "@/lib/personnel-report-import";

export const Route=createFileRoute("/personnel-import")({head:()=>({meta:[{title:"Personel Veri İçe Aktarma — OkulOS"}]}),component:PersonnelImport});

function PersonnelImport(){
 const fileRef=useRef<HTMLInputElement>(null);const {can,loading}=usePermissions();const editable=can("personnel.manage");
 const [file,setFile]=useState<File|null>(null),[rows,setRows]=useState<PersonnelImportRow[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState<string|null>(null),[isSuper,setIsSuper]=useState(false);
 const columns=useMemo(()=>getPersonnelColumns(rows),[rows]);
 async function selectFile(next:File){setMessage(null);setRows([]);setFile(next);try{const parsed=await parsePersonnelSummaryReport(next);setRows(parsed);const {data}=await supabase.rpc("is_super_admin");setIsSuper(Boolean(data));}catch(e){console.error(e);setFile(null);setMessage("Personel özet raporu tanınamadı. XLS, XLSX veya metin tabanlı PDF raporu kullanın.");}}
 async function doImport(){if(!file||!rows.length)return;setBusy(true);const {data,error}=await supabase.rpc("import_personnel_registry",{p_file_name:file.name,p_rows:rows});setBusy(false);if(error){setMessage("Personel verileri içe aktarılamadı: "+error.message);return;}const result=Array.isArray(data)?data[0]:data;setMessage(`${result?.affected_personnel??rows.length} personel ve rapordaki ${columns.length} sütun içe aktarıldı. Ham alanlar yalnız Süper Admin tarafından yönetilir.`);setRows([]);setFile(null);if(fileRef.current)fileRef.current.value="";}
 if(loading)return <AppShell title="Personel Veri İçe Aktarma"><p className="text-sm text-muted-foreground">Yetki kontrol ediliyor…</p></AppShell>;
 if(!editable)return <AppShell title="Personel Veri İçe Aktarma"><div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Personel yönetme yetkisi yok.</div></AppShell>;
 return <AppShell title="Personel Veri İçe Aktarma" subtitle="Excel/PDF raporundaki bütün sütunları kaybetmeden merkezi personel havuzuna al">
  <div className="grid gap-2 sm:grid-cols-2"><Link to="/personnel-admin"><Button variant="outline" className="w-full">Personel Yönetimi</Button></Link>{isSuper?<Link to="/personnel-field-settings"><Button variant="outline" className="w-full gap-2"><Settings2 className="size-4"/>Sütun Kullanım Ayarları</Button></Link>:null}</div>
  {message?<div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div>:null}
  <input ref={fileRef} className="hidden" type="file" accept=".xls,.xlsx,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>{const f=e.target.files?.[0];if(f)void selectFile(f)}}/>
  <button type="button" onClick={()=>fileRef.current?.click()} className="mt-4 w-full rounded-xl border-2 border-dashed bg-card p-7 text-center transition hover:border-primary/50"><UploadCloud className="mx-auto size-7 text-primary"/><p className="mt-2 font-medium">MEB Personel Özet Bilgiler Excel veya PDF yükle</p><p className="mt-1 text-xs text-muted-foreground">Raporda kaç sütun varsa tamamı alınır. Sistem hiçbir sütunu yükleme aşamasında atmaz.</p></button>
  {rows.length?<section className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-4"><div className="flex items-start gap-2"><FileSpreadsheet className="mt-0.5 size-5 text-primary"/><div><p className="text-sm font-semibold">{file?.name}</p><p className="text-xs text-muted-foreground">{rows.length} personel · {columns.length} farklı sütun algılandı. Önizleme ilk 12 kaydı gösterir; aktarım tüm kayıtları ve tüm sütunları kapsar.</p></div></div>
    <div className="mt-3 overflow-x-auto rounded-lg border bg-card"><table className="min-w-max text-xs"><thead><tr className="border-b bg-muted/40"><th className="sticky left-0 z-10 bg-muted p-2 text-left">Ad Soyad</th>{columns.map(c=><th key={c.key} className="max-w-64 whitespace-nowrap p-2 text-left">{c.label}</th>)}</tr></thead><tbody>{rows.slice(0,12).map((row,i)=><tr key={`${row.fullName}-${i}`} className="border-b"><td className="sticky left-0 bg-card p-2 font-medium">{row.fullName}</td>{columns.map(c=><td key={c.key} className="max-w-64 truncate p-2" title={row.rawFields[c.key]||""}>{row.rawFields[c.key]||"—"}</td>)}</tr>)}</tbody></table></div>
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><b>Veri kullanım kuralı:</b> Tüm kaynak sütunları arşivlenir; hiçbir modül bu ham tabloyu doğrudan okuyamaz. Süper Admin hangi sütunun kullanılacağını ve hangi modüllere açılacağını ayrıca belirler.</div>
    <div className="mt-3 flex gap-2"><Button className="flex-1" disabled={busy} onClick={()=>void doImport()}>{busy?"Aktarılıyor…":"Onayla ve Tüm Sütunları Aktar"}</Button><Button variant="outline" onClick={()=>{setRows([]);setFile(null);if(fileRef.current)fileRef.current.value=""}}>İptal</Button></div>
  </section>:null}
 </AppShell>;
}
