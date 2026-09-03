import { useMemo,useState } from 'react';
import { GripVertical,Plus,Trash2,WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { improveInstitutionalText,type BriefingContext } from '@/lib/briefing-advisor';

export type BriefingSection={id:string;title:string;content:string;kind:string;locked?:boolean;source?:'system'|'manual'|'mixed'};
export function defaultBriefingSections():BriefingSection[]{return[
 {id:'identity',title:'Kurumsal Kimlik',content:'',kind:'identity',locked:true,source:'system'},
 {id:'mission',title:'Misyon',content:'',kind:'mission',source:'manual'},
 {id:'vision',title:'Vizyon',content:'',kind:'vision',source:'manual'},
 {id:'history',title:'Okulun Tarihçesi',content:'',kind:'history',source:'manual'},
 {id:'facilities',title:'Kurumun Genel Özellikleri ve Fizikî İmkânlar',content:'',kind:'facilities',source:'mixed'},
 {id:'personnel',title:'Personel Bilgileri',content:'',kind:'personnel',source:'system'},
 {id:'students',title:'Öğrenci Bilgileri',content:'',kind:'students',source:'system'},
 {id:'achievements',title:'Kurum Başarıları',content:'',kind:'achievements',source:'mixed'},
 {id:'projects',title:'Yürütülen Projeler',content:'',kind:'projects',source:'mixed'},
 {id:'analysis',title:'Kurumsal Analiz',content:'',kind:'strengths',source:'manual'},
 {id:'planned-actions',title:'Planlanan Çalışmalar',content:'',kind:'plannedActions',source:'manual'},
 {id:'visuals',title:'Kurum Görselleri',content:'',kind:'visuals',source:'mixed'},
 {id:'events',title:'Etkinlikler',content:'',kind:'events',source:'mixed'},
 {id:'contact',title:'İletişim',content:'',kind:'contact',locked:true,source:'mixed'},
]}

export function BriefingSectionStudio({sections,onChange,context}:{sections:BriefingSection[];onChange:(v:BriefingSection[])=>void;context:BriefingContext}){
 const [dragId,setDragId]=useState<string|null>(null),[suggestion,setSuggestion]=useState<{id:string;text:string}|null>(null);
 const ordered=useMemo(()=>sections,[sections]);
 const patch=(id:string,p:Partial<BriefingSection>)=>onChange(sections.map(s=>s.id===id?{...s,...p}:s));
 const add=()=>onChange([...sections,{id:crypto.randomUUID(),title:'Yeni Bölüm',content:'',kind:'custom',source:'manual'}]);
 const remove=(id:string)=>onChange(sections.filter(s=>s.id!==id));
 const drop=(target:string)=>{if(!dragId||dragId===target)return;const a=[...sections],from=a.findIndex(x=>x.id===dragId),to=a.findIndex(x=>x.id===target);if(from<0||to<0)return;const [m]=a.splice(from,1);if(!m)return;a.splice(to,0,m);onChange(a);setDragId(null)};
 return <div className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Brifing bölüm düzeni</h2><p className="text-xs text-muted-foreground">Bölümleri sürükleyip sıralayın. Yeni manuel bölüm ekleyin; sayfa tasarımı aynı kurumsal şablonu kullanır.</p></div><Button variant="outline" size="sm" onClick={add}><Plus className="mr-1 size-4"/>Bölüm Ekle</Button></div>
  {ordered.map((s,i)=><article key={s.id} draggable onDragStart={()=>setDragId(s.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(s.id)} className="rounded-xl border bg-card p-3">
   <div className="flex items-start gap-2"><GripVertical className="mt-2 size-4 cursor-grab text-muted-foreground"/><div className="min-w-0 flex-1">
    <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input className="h-9 rounded-md border bg-background px-2 text-sm font-medium" value={s.title} disabled={s.locked} onChange={e=>patch(s.id,{title:e.target.value})}/><div className="flex items-center gap-1"><span className="rounded-full border px-2 py-1 text-[10px] text-muted-foreground">{i+1}. sıra · {s.source==='system'?'Sistem':s.source==='mixed'?'Sistem + Manuel':'Manuel'}</span>{!s.locked?<Button variant="ghost" size="sm" onClick={()=>remove(s.id)}><Trash2 className="size-4"/></Button>:null}</div></div>
    {!['identity','personnel','students','projects','visuals','contact'].includes(s.kind)?<><textarea rows={4} className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm" value={s.content} onChange={e=>patch(s.id,{content:e.target.value})}/><div className="mt-2 flex gap-2"><Button variant="outline" size="sm" disabled={!s.content.trim()} onClick={()=>{const r=improveInstitutionalText(s.kind,s.content,context);if(r)setSuggestion({id:s.id,text:r.suggestion})}}><WandSparkles className="mr-1 size-4"/>Profesyonel öneri</Button></div></>:<p className="mt-2 text-xs text-muted-foreground">Bu bölüm ana modüldeki yapılandırılmış alanlardan beslenir. Eksik kalan bilgiler ayrıca manuel tamamlanabilir.</p>}
    {suggestion?.id===s.id?<div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-semibold">Sizin verilerinize göre alternatif</p><p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{suggestion.text}</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={()=>{patch(s.id,{content:suggestion.text,source:'mixed'});setSuggestion(null)}}>Öneriyi Kullan</Button><Button variant="outline" size="sm" onClick={()=>setSuggestion(null)}>Benim Metnim Kalsın</Button></div></div>:null}
   </div></div>
  </article>)}
 </div>
}
