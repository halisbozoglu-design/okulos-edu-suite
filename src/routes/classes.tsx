import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Trash2, UploadCloud, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { parseEokulFile, type EokulStudentRow } from "@/lib/eokul-import";
import { parseMebClassSummary, type ClassSummaryRow } from "@/lib/meb-data-import";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Sınıf ve Şube Yönetimi — OkulOS" }, { name: "description", content: "MEB/e-Okul PDF, XLS ve XLSX raporlarından sınıf ve şubeleri merkezi veri kaynağına aktarın." }] }),
  component: ClassManagement,
});

type ClassSummary = { id:string; class_name:string; program_type:string|null; composite_key:string|null; split_threshold:number; student_count:number; needs_split:boolean; suggested_group_count:number; imported_student_count?:number|null; advisor_teacher_id?:string|null; };
type Preview = { kind:"summary"; rows:ClassSummaryRow[] } | { kind:"students"; rows:EokulStudentRow[] };

function ClassManagement(){
  const fileRef=useRef<HTMLInputElement>(null);
  const [classes,setClasses]=useState<ClassSummary[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null),[preview,setPreview]=useState<Preview|null>(null),[selectedFile,setSelectedFile]=useState<File|null>(null);

  const loadClasses=useCallback(async()=>{
    const [view,raw]=await Promise.all([
      supabase.from("class_roster_summary").select("id,class_name,program_type,composite_key,split_threshold,student_count,needs_split,suggested_group_count").order("class_name"),
      supabase.from("school_classes").select("id,imported_student_count,advisor_teacher_id").eq("active",true),
    ]);
    if(view.error){setError("Sınıf verileri yüklenemedi.");return;}
    const rawMap=Object.fromEntries((raw.data??[]).map((r:any)=>[r.id,r]));
    setClasses(((view.data??[]) as ClassSummary[]).map((r)=>({ ...r, imported_student_count:rawMap[r.id]?.imported_student_count??null, advisor_teacher_id:rawMap[r.id]?.advisor_teacher_id??null, student_count:Math.max(Number(r.student_count||0),Number(rawMap[r.id]?.imported_student_count||0)) })));
  },[]);
  useEffect(()=>{void loadClasses()},[loadClasses]);
  const totalStudents=useMemo(()=>classes.reduce((s,c)=>s+Number(c.student_count||0),0),[classes]);

  async function handleFile(file:File){
    setBusy(true);setError(null);setSuccess(null);setPreview(null);setSelectedFile(file);
    try{
      if(file.size>10*1024*1024) throw new Error("FILE_TOO_LARGE");
      const ext=file.name.split(".").pop()?.toLowerCase();
      if(ext==="xls"||ext==="xlsx"){
        try{ const rows=await parseMebClassSummary(file); setPreview({kind:"summary",rows}); }
        catch{ const rows=await parseEokulFile(file); if(!rows.length) throw new Error("EMPTY_IMPORT"); setPreview({kind:"students",rows}); }
      } else {
        const rows=await parseEokulFile(file); if(!rows.length) throw new Error("EMPTY_IMPORT"); setPreview({kind:"students",rows});
      }
    }catch(e){console.error(e);setSelectedFile(null);setPreview(null);setError("Dosya okunamadı. Verdiğiniz MEB/e-Okul raporunun PDF/XLS/XLSX düzeni tanınamadı.");}
    finally{setBusy(false)}
  }

  async function importData(){
    if(!selectedFile||!preview)return;
    setBusy(true);setError(null);setSuccess(null);
    let data:any,error: any;
    if(preview.kind==="summary") ({data,error}=await supabase.rpc("import_class_summaries",{p_file_name:selectedFile.name,p_rows:preview.rows}));
    else { const ext=selectedFile.name.split(".").pop()?.toLowerCase()??""; ({data,error}=await supabase.rpc("import_eokul_roster",{p_file_name:selectedFile.name,p_file_type:ext,p_rows:preview.rows})); }
    setBusy(false);
    if(error){setError("İçe aktarma tamamlanamadı. Migration/yetki durumunu kontrol edin.");return;}
    const result=Array.isArray(data)?data[0]:data;
    setSuccess(preview.kind==="summary"?`${result?.affected_classes??preview.rows.length} şube aktarıldı. 0 öğrencili şubeler de korundu.`:`${result?.imported_students??preview.rows.length} öğrenci, ${result?.affected_classes??0} sınıfa aktarıldı.`);
    setPreview(null);setSelectedFile(null);if(fileRef.current)fileRef.current.value="";await loadClasses();
  }
  async function deactivate(id:string){ if(!confirm("Bu sınıf/şube pasife alınsın mı? Veriler silinmez."))return;const {error:e}=await supabase.from("school_classes").update({active:false,updated_at:new Date().toISOString()}).eq("id",id);if(e)setError("Sınıf pasife alınamadı.");else await loadClasses(); }

  const rows=preview?.rows??[];
  return <AppShell title="Sınıf ve Şube Yönetimi" subtitle="MEB/e-Okul PDF · XLS · XLSX içe aktarma">
    <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void handleFile(f)}}/>
    <button type="button" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)void handleFile(f)}} className="w-full rounded-xl border-2 border-dashed border-border bg-card px-4 py-8 text-center hover:border-primary/50">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">{busy?<Loader2 className="size-6 animate-spin"/>:<UploadCloud className="size-6"/>}</div>
      <p className="mt-3 text-sm font-medium">MEB/e-Okul sınıf veya şube raporu yükleyin</p><p className="mt-1 text-xs text-muted-foreground">Öğrenci listesi veya Sınıf-Şube Öğrenci Sayıları raporu · PDF/XLS/XLSX · 10 MB</p><span className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Dosya Seç</span>
    </button>

    {preview?<section className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-4"><div className="flex gap-3"><FileSpreadsheet className="mt-0.5 size-5 text-primary"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{selectedFile?.name}</p><p className="mt-1 text-xs text-muted-foreground">{rows.length} kayıt tanındı · {preview.kind==="summary"?"Şube özet raporu":"Öğrenci listesi"}. İlk 8 kayıt aşağıda.</p>
      <div className="mt-3 overflow-x-auto rounded-lg border bg-card"><table className="min-w-[640px] w-full text-xs"><thead className="bg-muted/60"><tr>{preview.kind==="summary"?<><th className="p-2 text-left">Sınıf</th><th className="p-2 text-left">Program</th><th className="p-2 text-left">Öğrenci</th></>:<><th className="p-2 text-left">No</th><th className="p-2 text-left">Ad Soyad</th><th className="p-2 text-left">Sınıf</th><th className="p-2 text-left">Program</th></>}</tr></thead><tbody>{rows.slice(0,8).map((r:any,i)=><tr key={i} className="border-t">{preview.kind==="summary"?<><td className="p-2 font-medium">{r.className}</td><td className="p-2">{r.programType||"Genel"}</td><td className="p-2">{r.studentCount}</td></>:<><td className="p-2">{r.schoolNumber}</td><td className="p-2">{r.fullName}</td><td className="p-2">{r.className}</td><td className="p-2">{r.programType||"—"}</td></>}</tr>)}</tbody></table></div>
      <div className="mt-3 flex gap-2"><Button onClick={()=>void importData()} disabled={busy} className="flex-1">{busy?"Aktarılıyor...":"Onayla ve Aktar"}</Button><Button variant="outline" onClick={()=>{setPreview(null);setSelectedFile(null)}}>İptal</Button></div></div></div></section>:null}
    {error?<div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>:null}{success?<div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft p-3 text-sm text-primary"><CheckCircle2 className="size-4"/>{success}</div>:null}

    <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Toplam Şube</p><p className="mt-1 text-lg font-semibold">{classes.length}</p></div><div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Toplam Öğrenci</p><p className="mt-1 text-lg font-semibold">{totalStudents}</p></div></div>
    <div className="mt-5 overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[700px] text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="p-3 text-left">Sınıf</th><th className="p-3 text-left">Program</th><th className="p-3 text-left">Mevcut</th><th className="p-3 text-right">Durum</th><th className="p-3 text-right">İşlem</th></tr></thead><tbody>{classes.map(c=><tr key={c.id} className="border-t"><td className="p-3 font-medium">{c.composite_key??c.class_name}</td><td className="p-3"><Badge variant="secondary">{c.program_type||"Genel"}</Badge></td><td className="p-3"><span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-muted-foreground"/>{c.student_count}</span></td><td className="p-3 text-right">{c.needs_split?<span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3.5"/>{c.suggested_group_count} gruba bölünmeli</span>:<span className="text-xs text-muted-foreground">Uygun</span>}</td><td className="p-3 text-right"><Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={()=>void deactivate(c.id)}><Trash2 className="size-3.5"/>Pasife Al</Button></td></tr>)}{!classes.length?<tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Henüz sınıf yok.</td></tr>:null}</tbody></table></div>
    <p className="mt-3 text-xs text-muted-foreground">Aynı sınıf/şube farklı programlarda ayrı kayıt tutulur. 0 öğrencili şubeler filtrelenmez; isterseniz sonradan pasife alabilirsiniz.</p>
  </AppShell>;
}
