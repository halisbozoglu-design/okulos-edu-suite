import { createFileRoute,Link } from '@tanstack/react-router';
import { useEffect,useMemo,useState } from 'react';
import { BrainCircuit,Database,FileText,Save } from 'lucide-react';
import { AppShell } from '@/components/okulos/AppShell';
import { BriefingSectionStudio,defaultBriefingSections,type BriefingSection } from '@/components/okulos/BriefingSectionStudio';
import { Button } from '@/components/ui/button';
import { missingBriefingSuggestions,type BriefingContext } from '@/lib/briefing-advisor';
import { supabase } from '@/lib/supabase';

export const Route=createFileRoute('/corporate-briefing-studio')({head:()=>({meta:[{title:'Kurumsal Brifing Stüdyosu — OkulOS'}]}),component:Studio});
const KEY='okulos:briefing-studio:v1';
function Studio(){
 const [sections,setSections]=useState<BriefingSection[]>(defaultBriefingSections()),[context,setContext]=useState<BriefingContext>({}),[msg,setMsg]=useState<string|null>(null),[loading,setLoading]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);if(Array.isArray(p.sections))setSections(p.sections);if(p.context)setContext(p.context)}}catch{}},[]);
 const fields=useMemo(()=>Object.fromEntries(sections.map(s=>[s.kind,s.content])),[sections]);
 const missing=useMemo(()=>missingBriefingSuggestions(context,fields),[context,fields]);
 async function sync(){setLoading(true);setMsg(null);const [c,p,projects]=await Promise.all([supabase.from('class_roster_summary').select('student_count'),supabase.from('personnel_registry').select('system_role').eq('active',true),supabase.from('school_projects').select('name').limit(50)]);const students=(c.data??[]).reduce((n:any,r:any)=>n+Number(r.student_count||0),0);const teachers=(p.data??[]).filter((r:any)=>r.system_role==='teacher').length;setContext(x=>({...x,students,teachers,projects:projects.error?x.projects:(projects.data??[]).map((r:any)=>String(r.name||'')).filter(Boolean)}));setMsg(c.error||p.error?'Bazı sistem verileri alınamadı; manuel alanlar açık bırakıldı.':'Mevcut sistem verileri bağlama eklendi. Kullanıcı metinleri değiştirilmedi.');setLoading(false)}
 function save(){localStorage.setItem(KEY,JSON.stringify({sections,context}));setMsg('Stüdyo düzeni ve manuel bölümler bu cihazda kaydedildi.')}
 return <AppShell title="Kurumsal Brifing Stüdyosu" subtitle="Sıralanabilir bölümler · manuel ekleme · sıfır token kurumsal danışman" action={<BrainCircuit className="size-5"/>}>
  <div className="rounded-2xl border bg-card p-4"><div className="flex flex-wrap gap-2"><Button onClick={()=>void sync()} disabled={loading}><Database className="mr-2 size-4"/>{loading?'Okunuyor…':'Sistem Verilerini Oku'}</Button><Button variant="outline" onClick={save}><Save className="mr-2 size-4"/>Kaydet</Button><Link to="/corporate-briefing"><Button variant="outline"><FileText className="mr-2 size-4"/>Brifing Ana Ekranı</Button></Link></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground"><b>Token politikası:</b> Bu stüdyodaki profesyonelleştirme motoru harici LLM/API çağrısı yapmaz. Kurallı, bağlamsal ve cihaz içinde çalışan öneri üretir; Lovable veya ücretli yapay zekâ tokenı tüketmez. Öneriler hiçbir alanın üzerine kullanıcı onayı olmadan yazılmaz.</p>{msg?<p className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">{msg}</p>:null}</div>
  {missing.length?<div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-semibold text-amber-950">Eksik / önerilen brifing verileri</h2><ul className="mt-2 space-y-1 text-xs text-amber-950">{missing.map(x=><li key={x}>• {x}</li>)}</ul></div>:null}
  <section className="mt-5 rounded-2xl border bg-card p-4"><BriefingSectionStudio sections={sections} onChange={setSections} context={context}/></section>
  <section className="mt-5 rounded-2xl border bg-card p-4"><h2 className="font-semibold">Araştırma sonucu eklenmesi önerilen veri aileleri</h2><p className="mt-1 text-xs text-muted-foreground">MEB okul brifing örneklerinde temel kimlik/personel/öğrenci/proje bölümlerinin yanında aşağıdaki bilgiler de sık kullanılıyor. Bunlar zorunlu değil; okul ihtiyacına göre manuel bölüm olarak eklenebilir.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{['Norm kadro ve branş bazlı ihtiyaç/fazlalık','Şube bazlı öğrenci sayıları ve yıllara göre değişim','Devamsızlık / burs / kaynaştırma gibi öğrenci istatistikleri','Sınav ve yerleştirme başarılarının yıllara göre seyri','Sosyal-kültürel-sportif dereceler','Kütüphane, laboratuvar, atölye ve kapasite bilgileri','Kulüp / sosyal etkinlik yapısı','Projelerin amaç-hedef-sonuç göstergeleri','Fizikî ihtiyaçlar ve iyileştirme eylemleri','Kurumsal kimlik materyalleri: logo, QR, fotoğraf, sosyal medya'].map(x=><div key={x} className="rounded-lg border bg-muted/20 p-3 text-xs">{x}</div>)}</div></section>
 </AppShell>
}
