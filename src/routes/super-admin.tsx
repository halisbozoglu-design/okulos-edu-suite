import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Calculator, Crown, Database, GraduationCap, Plus, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Süper Admin — OkulOS" }] }),
  component: SuperAdminCenter,
});

type Area = { id: string; code: string; name: string; active: boolean };
type Course = { id: string; code: string | null; name: string; short_name: string | null };
type Source = { id: string; code: string; title: string; authority: string; effective_from: string | null; active: boolean };
type Permission = { id: string; teaching_area_id: string; course_id: string; priority_order: number; condition_note: string | null; effective_from: string; effective_to: string | null; active: boolean };
type Personnel = { id: string; tckn_masked: string; full_name: string; email: string | null; role: "admin" | "manager" | "teacher"; teaching_area_id: string | null; active: boolean };
type NormRule = { id: string; code: string; name: string; teacher_category: string; effective_from: string; repeating_block_hours: number | null; remainder_min_hours: number | null; active: boolean };
type NormBand = { id: string; rule_set_id: string; min_hours: number; max_hours: number | null; norm_count: number; sort_order: number };

function SuperAdminCenter() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [normRules, setNormRules] = useState<NormRule[]>([]);
  const [normBands, setNormBands] = useState<NormBand[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [personTc, setPersonTc] = useState("");
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personRole, setPersonRole] = useState<"teacher" | "manager" | "admin">("teacher");
  const [personArea, setPersonArea] = useState("");

  const [areaCode, setAreaCode] = useState("");
  const [areaName, setAreaName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const [permissionArea, setPermissionArea] = useState("");
  const [permissionCourse, setPermissionCourse] = useState("");
  const [permissionPriority, setPermissionPriority] = useState(1);
  const [permissionCondition, setPermissionCondition] = useState("");
  const [permissionSource, setPermissionSource] = useState("");
  const [permissionFrom, setPermissionFrom] = useState("2025-12-19");

  const [sourceCode, setSourceCode] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceAuthority, setSourceAuthority] = useState("Millî Eğitim Bakanlığı");
  const [sourceDate, setSourceDate] = useState("");

  const [normCode, setNormCode] = useState("");
  const [normName, setNormName] = useState("");
  const [normCategory, setNormCategory] = useState("genel_bilgi_meslek");
  const [normFrom, setNormFrom] = useState("");
  const [normBlock, setNormBlock] = useState("");
  const [normRemainder, setNormRemainder] = useState("");
  const [bandRule, setBandRule] = useState("");
  const [bandMin, setBandMin] = useState("");
  const [bandMax, setBandMax] = useState("");
  const [bandNorm, setBandNorm] = useState("");
  const [testRule, setTestRule] = useState("");
  const [testHours, setTestHours] = useState("");
  const [testResult, setTestResult] = useState<number | null>(null);

  const areaMap = useMemo(() => Object.fromEntries(areas.map((x) => [x.id, x.name])), [areas]);
  const courseMap = useMemo(() => Object.fromEntries(courses.map((x) => [x.id, x.name])), [courses]);

  const load = useCallback(async () => {
    const { data: can } = await supabase.rpc("is_super_admin");
    setAllowed(Boolean(can));
    if (!can) return;
    const [a,c,s,p,people,nr,nb] = await Promise.all([
      supabase.from("teaching_areas").select("id,code,name,active").order("name"),
      supabase.from("course_catalog").select("id,code,name,short_name").eq("active",true).order("name"),
      supabase.from("legal_rule_sources").select("id,code,title,authority,effective_from,active").order("effective_from",{ascending:false}),
      supabase.from("area_course_permissions").select("id,teaching_area_id,course_id,priority_order,condition_note,effective_from,effective_to,active").eq("active",true).order("priority_order"),
      supabase.rpc("get_super_admin_personnel"),
      supabase.from("norm_rule_sets").select("id,code,name,teacher_category,effective_from,repeating_block_hours,remainder_min_hours,active").order("name"),
      supabase.from("norm_rule_bands").select("id,rule_set_id,min_hours,max_hours,norm_count,sort_order").order("sort_order"),
    ]);
    setAreas((a.data ?? []) as Area[]); setCourses((c.data ?? []) as Course[]); setSources((s.data ?? []) as Source[]);
    setPermissions((p.data ?? []) as Permission[]); setPersonnel((people.data ?? []) as Personnel[]);
    setNormRules((nr.data ?? []) as NormRule[]); setNormBands((nb.data ?? []) as NormBand[]);
    const ttkb = (s.data ?? []).find((x) => x.code === "TTKB-129-2025");
    if (ttkb && !permissionSource) setPermissionSource(ttkb.id);
  }, [permissionSource]);

  useEffect(() => { void load(); }, [load]);

  async function addPersonnel() {
    setMessage(null);
    const { error } = await supabase.rpc("super_admin_upsert_personnel", { p_tckn: personTc, p_full_name: personName, p_role: personRole, ...(personEmail ? { p_email: personEmail } : {}), ...(personArea ? { p_teaching_area_id: personArea } : {}) });
    if (error) return setMessage(error.message.includes("INVALID_TCKN") ? "T.C. Kimlik No 11 rakam olmalıdır." : "Personel kaydı yapılamadı.");
    setPersonTc(""); setPersonName(""); setPersonEmail(""); setPersonArea(""); setMessage("Personel ön kayıt havuzuna eklendi/güncellendi."); await load();
  }

  async function addArea() {
    const { error } = await supabase.from("teaching_areas").upsert({ code: areaCode.trim().toUpperCase(), name: areaName.trim(), active: true }, { onConflict: "code" });
    if (error) return setMessage("Atama alanı kaydedilemedi.");
    setAreaCode(""); setAreaName(""); setMessage("Atama alanı kaydedildi."); await load();
  }

  async function addCourse() {
    const { error } = await supabase.from("course_catalog").upsert({ code: courseCode.trim() || null, name: courseName.trim(), short_name: null, category: "zorunlu", active: true }, { onConflict: "name" });
    if (error) return setMessage("Ders kaydedilemedi.");
    setCourseCode(""); setCourseName(""); setMessage("Ders kataloğa kaydedildi."); await load();
  }

  async function addPermission() {
    if (!permissionArea || !permissionCourse) return setMessage("Atama alanı ve ders seçilmelidir.");
    const { error } = await supabase.from("area_course_permissions").insert({ teaching_area_id: permissionArea, course_id: permissionCourse, priority_order: permissionPriority, condition_note: permissionCondition || null, source_id: permissionSource || null, effective_from: permissionFrom, active: true });
    if (error) return setMessage("Alan–ders eşleşmesi kaydedilemedi veya aynı yürürlük tarihi zaten mevcut.");
    setPermissionCondition(""); setMessage("TTKB alan–ders eşleşmesi kaydedildi."); await load();
  }

  async function addSource() {
    const { error } = await supabase.from("legal_rule_sources").upsert({ code: sourceCode.trim().toUpperCase(), title: sourceTitle.trim(), authority: sourceAuthority.trim(), effective_from: sourceDate || null, active: true }, { onConflict: "code" });
    if (error) return setMessage("Mevzuat kaynağı kaydedilemedi.");
    setSourceCode(""); setSourceTitle(""); setSourceDate(""); setMessage("Mevzuat kaynağı kaydedildi."); await load();
  }

  async function addNormRule() {
    const { error } = await supabase.from("norm_rule_sets").upsert({ code: normCode.trim().toUpperCase(), name: normName.trim(), teacher_category: normCategory, effective_from: normFrom, repeating_block_hours: normBlock ? Number(normBlock) : null, remainder_min_hours: normRemainder ? Number(normRemainder) : null, active: true }, { onConflict: "code" });
    if (error) return setMessage("Norm kural seti kaydedilemedi.");
    setNormCode(""); setNormName(""); setMessage("Norm kural seti kaydedildi."); await load();
  }

  async function addNormBand() {
    if (!bandRule || !bandMin || !bandNorm) return setMessage("Kural seti, alt sınır ve norm sayısı zorunludur.");
    const { error } = await supabase.from("norm_rule_bands").insert({ rule_set_id: bandRule, min_hours: Number(bandMin), max_hours: bandMax ? Number(bandMax) : null, norm_count: Number(bandNorm), sort_order: normBands.filter((x) => x.rule_set_id === bandRule).length + 1 });
    if (error) return setMessage("Norm saat bandı kaydedilemedi.");
    setBandMin(""); setBandMax(""); setBandNorm(""); setMessage("Norm saat bandı kaydedildi."); await load();
  }

  async function testNorm() {
    if (!testRule || testHours === "") return;
    const { data, error } = await supabase.rpc("calculate_norm_from_rule", { p_rule_set_id: testRule, p_total_hours: Number(testHours) });
    if (error) return setMessage("Norm hesabı yapılamadı; kural setinin bantlarını kontrol edin.");
    setTestResult(Number(data));
  }

  if (allowed === null) return <AppShell title="Süper Admin"><p className="text-sm text-muted-foreground">Yetki kontrol ediliyor…</p></AppShell>;
  if (!allowed) return <AppShell title="Süper Admin"><div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Bu ekran yalnız Süper Admin hesabına açıktır.</div></AppShell>;

  return <AppShell title="Süper Admin" subtitle="Personel · TTKB · norm · sistem girdileri" action={<Crown className="size-5 text-amber-500" />}>
    <div className="grid gap-2 sm:grid-cols-4">
      <Link to="/curriculum"><Button variant="outline" className="w-full">Müfredat & Ders Yükü</Button></Link>
      <Link to="/schedule"><Button variant="outline" className="w-full">Ders Programı</Button></Link>
      <Link to="/schedule-archive"><Button variant="outline" className="w-full">Program Yayın/Arşiv</Button></Link>
      <Link to="/settings"><Button variant="outline" className="w-full">Nöbet Ayarları</Button></Link>
    </div>
    {message ? <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-sm">{message}</div> : null}

    <Tabs defaultValue="personnel" className="mt-5">
      <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-5">
        <TabsTrigger value="personnel">Personel</TabsTrigger><TabsTrigger value="areas">Alan/Ders</TabsTrigger><TabsTrigger value="permissions">TTKB</TabsTrigger><TabsTrigger value="norm">Norm</TabsTrigger><TabsTrigger value="sources">Kaynaklar</TabsTrigger>
      </TabsList>

      <TabsContent value="personnel" className="mt-4 space-y-4">
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><Users className="size-4" /> Personel Ön Kayıt</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2"><div><Label>T.C. Kimlik No</Label><Input inputMode="numeric" maxLength={11} value={personTc} onChange={(e)=>setPersonTc(e.target.value.replace(/\D/g,"").slice(0,11))}/></div><div><Label>Ad Soyad</Label><Input value={personName} onChange={(e)=>setPersonName(e.target.value)}/></div><div><Label>E-posta (opsiyonel)</Label><Input type="email" value={personEmail} onChange={(e)=>setPersonEmail(e.target.value)}/></div><div><Label>Rol</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={personRole} onChange={(e)=>setPersonRole(e.target.value as typeof personRole)}><option value="teacher">Öğretmen</option><option value="manager">İdareci</option><option value="admin">Admin</option></select></div><div className="md:col-span-2"><Label>Atama Alanı</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={personArea} onChange={(e)=>setPersonArea(e.target.value)}><option value="">Henüz seçilmedi</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div></div>
          <Button className="mt-3 w-full gap-2" onClick={()=>void addPersonnel()}><Plus className="size-4"/>Personeli Kaydet</Button>
        </section>
        <div className="overflow-x-auto rounded-xl border bg-card"><table className="min-w-[700px] w-full text-sm"><thead><tr className="border-b bg-muted/40"><th className="p-3 text-left">T.C.</th><th className="p-3 text-left">Ad Soyad</th><th className="p-3 text-left">E-posta</th><th className="p-3 text-left">Rol</th><th className="p-3 text-left">Atama Alanı</th></tr></thead><tbody>{personnel.map(p=><tr key={p.id} className="border-b"><td className="p-3 font-mono">{p.tckn_masked}</td><td className="p-3 font-medium">{p.full_name}</td><td className="p-3">{p.email??"—"}</td><td className="p-3">{p.role}</td><td className="p-3">{p.teaching_area_id?areaMap[p.teaching_area_id]??"—":"—"}</td></tr>)}</tbody></table></div>
      </TabsContent>

      <TabsContent value="areas" className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><GraduationCap className="size-4"/>Atama Alanı Ekle</h2><div className="mt-3 space-y-3"><div><Label>Kod</Label><Input value={areaCode} onChange={(e)=>setAreaCode(e.target.value)} placeholder="MATEMATIK"/></div><div><Label>Alan Adı</Label><Input value={areaName} onChange={(e)=>setAreaName(e.target.value)} placeholder="Matematik"/></div><Button className="w-full" onClick={()=>void addArea()}>Kaydet</Button></div><div className="mt-4 flex flex-wrap gap-2">{areas.map(a=><span key={a.id} className="rounded-full bg-muted px-3 py-1 text-xs">{a.code} · {a.name}</span>)}</div></section>
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><BookOpenCheck className="size-4"/>Ders Kataloğu</h2><div className="mt-3 space-y-3"><div><Label>Ders Kodu</Label><Input value={courseCode} onChange={(e)=>setCourseCode(e.target.value)}/></div><div><Label>Ders Adı</Label><Input value={courseName} onChange={(e)=>setCourseName(e.target.value)}/></div><Button className="w-full" onClick={()=>void addCourse()}>Dersi Kaydet</Button></div><div className="mt-4 max-h-48 overflow-y-auto text-xs">{courses.map(c=><div key={c.id} className="border-b py-2">{c.code?`${c.code} · `:""}{c.name}</div>)}</div></section>
      </TabsContent>

      <TabsContent value="permissions" className="mt-4 space-y-4">
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4"/>TTKB Alan → Okutabileceği Ders</h2><p className="mt-1 text-xs text-muted-foreground">Kaynak ve yürürlük tarihiyle versiyonlanır. Tanımlı eşleşmeye aykırı öğretmen ders ataması veritabanı tarafından engellenir.</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div><Label>Atama Alanı</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={permissionArea} onChange={(e)=>setPermissionArea(e.target.value)}><option value="">Seçiniz</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div><div><Label>Ders</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={permissionCourse} onChange={(e)=>setPermissionCourse(e.target.value)}><option value="">Seçiniz</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><Label>Öncelik</Label><Input type="number" min={1} value={permissionPriority} onChange={(e)=>setPermissionPriority(Number(e.target.value))}/></div><div><Label>Yürürlük Başlangıcı</Label><Input type="date" value={permissionFrom} onChange={(e)=>setPermissionFrom(e.target.value)}/></div><div><Label>Kaynak</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={permissionSource} onChange={(e)=>setPermissionSource(e.target.value)}><option value="">Kaynak seçilmedi</option>{sources.map(s=><option key={s.id} value={s.id}>{s.code} · {s.title}</option>)}</select></div><div><Label>Koşul / Açıklama</Label><Input value={permissionCondition} onChange={(e)=>setPermissionCondition(e.target.value)} placeholder="Varsa sertifika, öncelik vb."/></div></div><Button className="mt-3 w-full" onClick={()=>void addPermission()}>Alan–Ders Eşleşmesini Kaydet</Button></section>
        <div className="overflow-x-auto rounded-xl border bg-card"><table className="min-w-[760px] w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left">Alan</th><th className="p-3 text-left">Ders</th><th className="p-3">Öncelik</th><th className="p-3 text-left">Yürürlük</th><th className="p-3 text-left">Koşul</th></tr></thead><tbody>{permissions.map(p=><tr key={p.id} className="border-b"><td className="p-3">{areaMap[p.teaching_area_id]}</td><td className="p-3">{courseMap[p.course_id]}</td><td className="p-3 text-center">{p.priority_order}</td><td className="p-3">{p.effective_from}</td><td className="p-3">{p.condition_note??"—"}</td></tr>)}</tbody></table></div>
      </TabsContent>

      <TabsContent value="norm" className="mt-4 space-y-4">
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><Calculator className="size-4"/>Norm Kural Seti</h2><p className="mt-1 text-xs text-muted-foreground">Norm değerleri kod içine gömülmez; yürürlük tarihi ve kaynakla girilir. Böylece mevzuat değiştiğinde eski hesap ispatı korunur.</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div><Label>Kural Kodu</Label><Input value={normCode} onChange={(e)=>setNormCode(e.target.value)} placeholder="GENEL-2026"/></div><div><Label>Kural Adı</Label><Input value={normName} onChange={(e)=>setNormName(e.target.value)} placeholder="Genel Bilgi ve Meslek Dersleri"/></div><div><Label>Kategori</Label><Input value={normCategory} onChange={(e)=>setNormCategory(e.target.value)}/></div><div><Label>Yürürlük Başlangıcı</Label><Input type="date" value={normFrom} onChange={(e)=>setNormFrom(e.target.value)}/></div><div><Label>Tekrarlayan Blok Saati</Label><Input type="number" value={normBlock} onChange={(e)=>setNormBlock(e.target.value)} placeholder="Örn. 21"/></div><div><Label>Artan Ders Yükü Eşiği</Label><Input type="number" value={normRemainder} onChange={(e)=>setNormRemainder(e.target.value)} placeholder="Örn. 15"/></div></div><Button className="mt-3 w-full" onClick={()=>void addNormRule()}>Kural Setini Kaydet</Button></section>
        <section className="rounded-xl border bg-card p-4"><h3 className="font-semibold">Saat Bandı Ekle</h3><div className="mt-3 grid gap-3 sm:grid-cols-4"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={bandRule} onChange={(e)=>setBandRule(e.target.value)}><option value="">Kural seti</option>{normRules.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><Input type="number" placeholder="Min saat" value={bandMin} onChange={(e)=>setBandMin(e.target.value)}/><Input type="number" placeholder="Max saat (boş olabilir)" value={bandMax} onChange={(e)=>setBandMax(e.target.value)}/><Input type="number" placeholder="Norm" value={bandNorm} onChange={(e)=>setBandNorm(e.target.value)}/></div><Button variant="secondary" className="mt-3 w-full" onClick={()=>void addNormBand()}>Bandı Ekle</Button></section>
        <section className="rounded-xl border bg-card p-4"><h3 className="font-semibold">Kuralı Test Et</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><select className="h-10 flex-1 rounded-md border bg-background px-3 text-sm" value={testRule} onChange={(e)=>setTestRule(e.target.value)}><option value="">Kural seçin</option>{normRules.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><Input type="number" value={testHours} onChange={(e)=>setTestHours(e.target.value)} placeholder="Toplam ders yükü"/><Button onClick={()=>void testNorm()}>Hesapla</Button></div>{testResult!==null?<p className="mt-3 text-lg font-semibold">Sonuç: {testResult} norm</p>:null}</section>
        {normRules.map(r=><div key={r.id} className="rounded-xl border bg-card p-3 text-sm"><b>{r.code} · {r.name}</b><div className="mt-2 flex flex-wrap gap-2">{normBands.filter(b=>b.rule_set_id===r.id).map(b=><span key={b.id} className="rounded-full bg-muted px-3 py-1 text-xs">{b.min_hours}–{b.max_hours??"∞"} saat = {b.norm_count}</span>)}</div></div>)}
      </TabsContent>

      <TabsContent value="sources" className="mt-4 space-y-4">
        <section className="rounded-xl border bg-card p-4"><h2 className="flex items-center gap-2 font-semibold"><Database className="size-4"/>Mevzuat Kaynağı</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><div><Label>Kod</Label><Input value={sourceCode} onChange={(e)=>setSourceCode(e.target.value)}/></div><div><Label>Başlık</Label><Input value={sourceTitle} onChange={(e)=>setSourceTitle(e.target.value)}/></div><div><Label>Kurum</Label><Input value={sourceAuthority} onChange={(e)=>setSourceAuthority(e.target.value)}/></div><div><Label>Yürürlük Tarihi</Label><Input type="date" value={sourceDate} onChange={(e)=>setSourceDate(e.target.value)}/></div></div><Button className="mt-3 w-full" onClick={()=>void addSource()}>Kaynağı Kaydet</Button></section>
        {sources.map(s=><div key={s.id} className="rounded-xl border bg-card p-3 text-sm"><b>{s.code}</b> · {s.title}<p className="mt-1 text-xs text-muted-foreground">{s.authority} · {s.effective_from??"Tarih belirtilmedi"}</p></div>)}
      </TabsContent>
    </Tabs>
    <Button variant="ghost" className="mt-5 gap-2" onClick={()=>void load()}><RefreshCw className="size-4"/>Tüm Verileri Yenile</Button>
  </AppShell>;
}
