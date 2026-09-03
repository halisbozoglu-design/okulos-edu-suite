import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileDown,
  FileText,
  ImagePlus,
  Lightbulb,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/corporate-briefing")({
  head: () => ({
    meta: [
      { title: "Kurumsal Brifing Dosyası — OkulOS" },
      {
        name: "description",
        content:
          "Okul verilerinden otomatik beslenen, manuel düzenlenebilen ve resmî çıktı alınabilen kurumsal brifing oluşturucu.",
      },
    ],
  }),
  component: CorporateBriefing,
});

type ProjectRow = {
  name: string;
  type: string;
  purpose: string;
};

type BriefingDraft = {
  academicYear: string;
  schoolName: string;
  institutionCode: string;
  district: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  principal: string;
  educationType: string;
  educationStartYear: string;
  foreignLanguage: string;
  mission: string;
  vision: string;
  history: string;
  buildingSummary: string;
  facilities: string;
  achievements: string;
  strengths: string;
  weaknesses: string;
  improvementAreas: string;
  plannedActions: string;
  events: string;
  instagram: string;
  youtube: string;
  x: string;
  facebook: string;
  projects: ProjectRow[];
};

type LiveStats = {
  classes: number;
  students: number;
  personnel: number;
  teachers: number;
  projectNames: string[];
};

type PhotoAsset = {
  id: string;
  name: string;
  caption: string;
  dataUrl: string;
};

const STORAGE_KEY = "okulos:corporate-briefing:v1";

const emptyDraft: BriefingDraft = {
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  schoolName: "",
  institutionCode: "",
  district: "",
  province: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  principal: "",
  educationType: "Tekli Eğitim",
  educationStartYear: "",
  foreignLanguage: "İngilizce",
  mission: "",
  vision: "",
  history: "",
  buildingSummary: "",
  facilities: "",
  achievements: "",
  strengths: "",
  weaknesses: "",
  improvementAreas: "",
  plannedActions: "",
  events: "",
  instagram: "",
  youtube: "",
  x: "",
  facebook: "",
  projects: [],
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function LongField({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function CorporateBriefing() {
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<BriefingDraft>(emptyDraft);
  const [logo, setLogo] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [stats, setStats] = useState<LiveStats>({ classes: 0, students: 0, personnel: 0, teachers: 0, projectNames: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { draft?: BriefingDraft; logo?: string | null; photos?: PhotoAsset[] };
      if (parsed.draft) setDraft({ ...emptyDraft, ...parsed.draft });
      if (parsed.logo) setLogo(parsed.logo);
      if (Array.isArray(parsed.photos)) setPhotos(parsed.photos);
    } catch {
      // Bozuk eski yerel taslak uygulamayı engellemez.
    }
  }, []);

  const setField = <K extends keyof BriefingDraft>(key: K, value: BriefingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const completeness = useMemo(() => {
    const critical = [
      draft.schoolName,
      draft.institutionCode,
      draft.principal,
      draft.mission,
      draft.vision,
      draft.history,
      draft.achievements,
      draft.strengths,
      draft.weaknesses,
      draft.plannedActions,
    ];
    const filled = critical.filter((value) => value.trim().length > 0).length;
    return Math.round((filled / critical.length) * 100);
  }, [draft]);

  const suggestions = useMemo(() => {
    const rows: string[] = [];
    if (!draft.mission.trim() || !draft.vision.trim()) rows.push("Misyon ve vizyon kurumsal kimlik bölümünü tamamlayın.");
    if (!draft.history.trim()) rows.push("Tarihçeyi kuruluş, dönüşüm ve önemli kilometre taşlarıyla güncelleyin.");
    if (stats.students > 0 && !draft.achievements.trim()) rows.push("Öğrenci sayısı mevcut; son 3-4 yıl LGS/YKS ve derece verilerini başarılar bölümüne ekleyin.");
    if (!draft.projects.length && !stats.projectNames.length) rows.push("Yürütülen projeleri amaçlarıyla birlikte ekleyin; sistemde proje verisi oluştuğunda otomatik çekilebilir.");
    if (!draft.strengths.trim() || !draft.weaknesses.trim()) rows.push("Kurumsal analiz için güçlü ve zayıf yönleri ayrı ayrı girin.");
    if (!draft.plannedActions.trim()) rows.push("Zayıf/geliştirilmesi gereken yönlere ilişkin ölçülebilir eylem planı ekleyin.");
    if (!photos.length) rows.push("Bina, sınıf, kütüphane, laboratuvar, sosyal alan ve etkinlik fotoğrafları ekleyin.");
    if (!draft.phone.trim() || !draft.email.trim() || !draft.website.trim()) rows.push("İletişim sayfası için telefon, e-posta ve web adresini tamamlayın.");
    return rows;
  }, [draft, photos.length, stats.projectNames.length, stats.students]);

  async function loadFromSystem() {
    setLoading(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();

    const [classRes, personnelRes, profileRes, projectRes] = await Promise.all([
      supabase.from("class_roster_summary").select("student_count"),
      supabase.from("personnel_registry").select("full_name,system_role,active").eq("active", true),
      userData.user
        ? supabase.from("profiles").select("full_name").eq("user_id", userData.user.id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from("school_projects").select("name").limit(50),
    ]);

    const classRows = classRes.data ?? [];
    const personnelRows = personnelRes.data ?? [];
    const studentCount = classRows.reduce((sum: number, row: any) => sum + Number(row.student_count || 0), 0);
    const teacherCount = personnelRows.filter((row: any) => row.system_role === "teacher").length;
    const projectNames = projectRes.error ? [] : (projectRes.data ?? []).map((row: any) => String(row.name ?? "")).filter(Boolean);

    setStats({
      classes: classRows.length,
      students: studentCount,
      personnel: personnelRows.length,
      teachers: teacherCount,
      projectNames,
    });

    const principalName = personnelRows.find((row: any) => row.system_role === "principal")?.full_name;
    setDraft((current) => ({
      ...current,
      principal: current.principal || principalName || (profileRes.data as any)?.full_name || "",
      projects:
        current.projects.length || !projectNames.length
          ? current.projects
          : projectNames.map((name) => ({ name, type: "", purpose: "" })),
    }));

    if (classRes.error || personnelRes.error) {
      setMessage("Bazı merkezi okul verileri okunamadı; mevcut taslak korunarak manuel düzenlemeye devam edebilirsiniz.");
    } else {
      setMessage("Sınıf/öğrenci ve personel verileri sistemden güncellendi. Mevcut manuel metinler değiştirilmedi.");
    }
    setLoading(false);
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, logo, photos }));
      setMessage("Brifing taslağı bu cihazda kaydedildi.");
    } catch {
      setMessage("Taslak kaydedilemedi. Büyük görseller tarayıcı depolama sınırını aşmış olabilir.");
    }
  }

  function handleLogo(file: File) {
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handlePhotos(files: FileList) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotos((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            name: file.name,
            caption: file.name.replace(/\.[^.]+$/, ""),
            dataUrl: String(reader.result),
          },
        ]);
      reader.readAsDataURL(file);
    });
  }

  function updatePhoto(id: string, caption: string) {
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, caption } : photo)));
  }

  function addProject() {
    setField("projects", [...draft.projects, { name: "", type: "", purpose: "" }]);
  }

  function updateProject(index: number, key: keyof ProjectRow, value: string) {
    setField(
      "projects",
      draft.projects.map((project, i) => (i === index ? { ...project, [key]: value } : project)),
    );
  }

  function removeProject(index: number) {
    setField(
      "projects",
      draft.projects.filter((_, i) => i !== index),
    );
  }

  function exportOfficial() {
    document.title = `${draft.schoolName || "Okul"} - ${draft.academicYear} Brifing Dosyası`;
    window.print();
  }

  const statCards = [
    ["Şube", stats.classes, Building2],
    ["Öğrenci", stats.students, Users],
    ["Personel", stats.personnel, Users],
    ["Öğretmen", stats.teachers, Users],
  ] as const;

  return (
    <AppShell
      title="Kurumsal Brifing Dosyası"
      subtitle="Kurumsal kimlik · otomatik veri toplama · manuel düzenleme · resmî çıktı"
      action={<Badge variant="secondary">Tamamlanma %{completeness}</Badge>}
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .briefing-print, .briefing-print * { visibility: visible !important; }
          .briefing-print { position: absolute; inset: 0; width: 100%; background: white; color: #111827; }
          .briefing-page { break-after: page; min-height: 277mm; padding: 18mm 16mm; box-sizing: border-box; }
          .briefing-page:last-child { break-after: auto; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      <div className="print:hidden grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void loadFromSystem()} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Sistemden Güncelle
            </Button>
            <Button variant="outline" onClick={saveDraft} className="gap-2">
              <Save className="size-4" /> Taslağı Kaydet
            </Button>
            <Button variant="outline" onClick={exportOfficial} className="gap-2">
              <FileDown className="size-4" /> Resmî PDF / Yazdır
            </Button>
            <Link to="/management">
              <Button variant="ghost">Yönetim Merkezi</Button>
            </Link>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Otomatik güncelleme yalnızca sistemde bulunan merkezi verileri okur; yazdığınız açıklama ve değerlendirmelerin üzerine yazmaz.
            PDF için tarayıcının yazdırma ekranında “PDF olarak kaydet” seçeneğini kullanabilirsiniz.
          </p>
          {message ? <div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[420px]">
          {statCards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl border bg-card p-3">
              <Icon className="size-4 text-primary" />
              <p className="mt-2 text-xl font-semibold">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="print:hidden mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <div className="flex items-center gap-2 font-semibold"><Lightbulb className="size-4" /> Akıllı öneriler</div>
        {suggestions.length ? (
          <ul className="mt-2 space-y-1 text-xs leading-relaxed">
            {suggestions.map((suggestion) => <li key={suggestion}>• {suggestion}</li>)}
          </ul>
        ) : (
          <p className="mt-2 flex items-center gap-2 text-xs"><CheckCircle2 className="size-4" /> Temel brifing alanları tamamlandı.</p>
        )}
      </div>

      <Tabs defaultValue="identity" className="print:hidden mt-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5">
          <TabsTrigger value="identity">Kimlik</TabsTrigger>
          <TabsTrigger value="content">Kurumsal</TabsTrigger>
          <TabsTrigger value="analysis">Analiz</TabsTrigger>
          <TabsTrigger value="visuals">Görseller</TabsTrigger>
          <TabsTrigger value="preview">Önizleme</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-4 space-y-4">
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">Okul bilgi giriş ekranı</h2>
            <p className="mt-1 text-xs text-muted-foreground">Kurumsal kimlik ve iletişim bilgileri. Sistem verisi eksikse manuel girilebilir.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextField label="Eğitim-öğretim yılı" value={draft.academicYear} onChange={(v) => setField("academicYear", v)} />
              <TextField label="Okulun resmî adı" value={draft.schoolName} onChange={(v) => setField("schoolName", v)} />
              <TextField label="Kurum kodu" value={draft.institutionCode} onChange={(v) => setField("institutionCode", v)} />
              <TextField label="İl" value={draft.province} onChange={(v) => setField("province", v)} />
              <TextField label="İlçe" value={draft.district} onChange={(v) => setField("district", v)} />
              <TextField label="Okul müdürü" value={draft.principal} onChange={(v) => setField("principal", v)} />
              <TextField label="Telefon" value={draft.phone} onChange={(v) => setField("phone", v)} />
              <TextField label="E-posta" value={draft.email} onChange={(v) => setField("email", v)} />
              <TextField label="Web sitesi" value={draft.website} onChange={(v) => setField("website", v)} />
              <TextField label="Öğretim şekli" value={draft.educationType} onChange={(v) => setField("educationType", v)} />
              <TextField label="Öğretime başlama yılı" value={draft.educationStartYear} onChange={(v) => setField("educationStartYear", v)} />
              <TextField label="Yabancı dil" value={draft.foreignLanguage} onChange={(v) => setField("foreignLanguage", v)} />
              <TextField label="Instagram" value={draft.instagram} onChange={(v) => setField("instagram", v)} />
              <TextField label="YouTube" value={draft.youtube} onChange={(v) => setField("youtube", v)} />
              <TextField label="X" value={draft.x} onChange={(v) => setField("x", v)} />
              <TextField label="Facebook" value={draft.facebook} onChange={(v) => setField("facebook", v)} />
              <TextField label="Adres" className="sm:col-span-2 lg:col-span-3" value={draft.address} onChange={(v) => setField("address", v)} />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-4">
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4"><LongField label="Misyon" value={draft.mission} onChange={(v) => setField("mission", v)} rows={7} /></div>
            <div className="rounded-2xl border bg-card p-4"><LongField label="Vizyon" value={draft.vision} onChange={(v) => setField("vision", v)} rows={7} /></div>
          </section>
          <section className="rounded-2xl border bg-card p-4 space-y-4">
            <LongField label="Okulun tarihçesi" value={draft.history} onChange={(v) => setField("history", v)} rows={8} />
            <LongField label="Bina / fizikî yapı özeti" value={draft.buildingSummary} onChange={(v) => setField("buildingSummary", v)} placeholder="Yapım yılı, kat, derslik, bahçe, konferans salonu, mülkiyet, erişilebilirlik..." />
            <LongField label="Eğitim ortamları ve imkânlar" value={draft.facilities} onChange={(v) => setField("facilities", v)} placeholder="Kütüphane, laboratuvar, mescit, atölye, spor alanları..." />
            <LongField label="Başarılar" value={draft.achievements} onChange={(v) => setField("achievements", v)} placeholder="LGS/YKS, yarışmalar, ilçe/il/Türkiye/uluslararası dereceler..." />
            <LongField label="Etkinlikler" value={draft.events} onChange={(v) => setField("events", v)} placeholder="Yıl boyunca öne çıkan akademik, sosyal, kültürel ve sportif etkinlikler..." />
          </section>
          <section className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="font-semibold">Yürütülen projeler</h2><p className="text-xs text-muted-foreground">Sistemden gelebilir; her satır manuel düzenlenebilir.</p></div>
              <Button variant="outline" size="sm" onClick={addProject}>Proje Ekle</Button>
            </div>
            <div className="mt-4 space-y-3">
              {draft.projects.map((project, index) => (
                <div key={index} className="grid gap-2 rounded-xl border bg-muted/20 p-3 lg:grid-cols-[1fr_1fr_2fr_auto]">
                  <input className="h-9 rounded-md border bg-background px-2 text-sm" placeholder="Proje adı" value={project.name} onChange={(e) => updateProject(index, "name", e.target.value)} />
                  <input className="h-9 rounded-md border bg-background px-2 text-sm" placeholder="Türü" value={project.type} onChange={(e) => updateProject(index, "type", e.target.value)} />
                  <input className="h-9 rounded-md border bg-background px-2 text-sm" placeholder="Amaç" value={project.purpose} onChange={(e) => updateProject(index, "purpose", e.target.value)} />
                  <Button variant="ghost" size="sm" onClick={() => removeProject(index)}>Sil</Button>
                </div>
              ))}
              {!draft.projects.length ? <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Henüz proje satırı yok.</p> : null}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4 space-y-4">
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4"><LongField label="Güçlü yönler" value={draft.strengths} onChange={(v) => setField("strengths", v)} rows={9} /></div>
            <div className="rounded-2xl border bg-card p-4"><LongField label="Zayıf yönler" value={draft.weaknesses} onChange={(v) => setField("weaknesses", v)} rows={9} /></div>
            <div className="rounded-2xl border bg-card p-4"><LongField label="Geliştirilmesi gereken yönler" value={draft.improvementAreas} onChange={(v) => setField("improvementAreas", v)} rows={9} /></div>
            <div className="rounded-2xl border bg-card p-4"><LongField label="Planlanan çalışmalar / eylem planı" value={draft.plannedActions} onChange={(v) => setField("plannedActions", v)} rows={9} /></div>
          </section>
        </TabsContent>

        <TabsContent value="visuals" className="mt-4 space-y-4">
          <section className="rounded-2xl border bg-card p-4">
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogo(file); }} />
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handlePhotos(e.target.files); }} />
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="rounded-xl border border-dashed p-4 text-center">
                {logo ? <img src={logo} alt="Okul logosu" className="mx-auto max-h-32 max-w-full object-contain" /> : <FileText className="mx-auto size-12 text-muted-foreground" />}
                <Button variant="outline" className="mt-3 gap-2" onClick={() => logoRef.current?.click()}><ImagePlus className="size-4" /> Okul Logosunu Seç</Button>
              </div>
              <div>
                <h3 className="font-semibold">Okul ve etkinlik fotoğrafları</h3>
                <p className="mt-1 text-xs text-muted-foreground">Bina dışı, bahçe, sınıf, öğretmen odası, kütüphane, konferans salonu, mescit, laboratuvar ve etkinlikler için birden çok görsel eklenebilir.</p>
                <Button variant="outline" className="mt-3 gap-2" onClick={() => photoRef.current?.click()}><ImagePlus className="size-4" /> Fotoğraf Ekle</Button>
              </div>
            </div>
          </section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-2xl border bg-card">
                <img src={photo.dataUrl} alt={photo.caption} className="aspect-video w-full object-cover" />
                <div className="p-3">
                  <input className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={photo.caption} onChange={(e) => updatePhoto(photo.id, e.target.value)} />
                  <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => setPhotos((current) => current.filter((x) => x.id !== photo.id))}>Görseli Kaldır</Button>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
            Aşağıdaki A4 önizleme, PDF/yazdırma çıktısında kullanılan kurumsal sayfa düzenidir. Düzenlenebilir alanlar diğer sekmelerdedir.
          </div>
        </TabsContent>
      </Tabs>

      <div className="briefing-print mt-6 overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-sm print:mt-0 print:rounded-none print:border-0 print:shadow-none">
        <section className="briefing-page flex min-h-[820px] flex-col items-center justify-center px-8 py-16 text-center">
          {logo ? <img src={logo} alt="Okul logosu" className="mb-8 max-h-36 max-w-[220px] object-contain" /> : <div className="mb-8 grid size-28 place-items-center rounded-3xl border-2 border-slate-300 text-sm font-semibold text-slate-400">OKUL LOGOSU</div>}
          <div className="h-1 w-24 rounded bg-slate-800" />
          <h1 className="mt-8 max-w-3xl text-3xl font-bold uppercase leading-tight tracking-tight">{draft.schoolName || "OKULUN RESMÎ ADI"}</h1>
          <p className="mt-4 text-lg font-medium">{draft.academicYear} EĞİTİM ÖĞRETİM YILI</p>
          <p className="mt-2 text-2xl font-bold tracking-[0.16em]">BRİFİNG DOSYASI</p>
          <div className="mt-16 text-sm text-slate-500">{[draft.district, draft.province].filter(Boolean).join(" / ")}</div>
        </section>

        <section className="briefing-page px-8 py-10">
          <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">1. KURUMSAL KİMLİK</h2>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border bg-slate-300 text-sm">
            {[
              ["Kurumun Resmî Adı", draft.schoolName], ["Kurum Kodu", draft.institutionCode],
              ["İl / İlçe", [draft.province, draft.district].filter(Boolean).join(" / ")], ["Okul Müdürü", draft.principal],
              ["Adres", draft.address], ["Telefon", draft.phone], ["E-posta", draft.email], ["Web", draft.website],
              ["Öğretim Şekli", draft.educationType], ["Öğretime Başlama Yılı", draft.educationStartYear], ["Yabancı Dil", draft.foreignLanguage], ["Eğitim Yılı", draft.academicYear],
            ].map(([label, value]) => <div key={label} className="contents"><div className="bg-slate-100 p-2 font-semibold">{label}</div><div className="bg-white p-2">{value || "—"}</div></div>)}
          </div>
          <h3 className="mt-8 text-lg font-bold">MİSYON</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.mission || "—"}</p>
          <h3 className="mt-8 text-lg font-bold">VİZYON</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.vision || "—"}</p>
        </section>

        <section className="briefing-page px-8 py-10">
          <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">2. OKULUN TARİHÇESİ VE GENEL ÖZELLİKLERİ</h2>
          <p className="mt-6 whitespace-pre-line text-sm leading-7">{draft.history || "—"}</p>
          <h3 className="mt-8 text-lg font-bold">Fizikî Yapı</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.buildingSummary || "—"}</p>
          <h3 className="mt-8 text-lg font-bold">Eğitim Ortamları ve İmkânlar</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.facilities || "—"}</p>
          <div className="mt-8 grid grid-cols-4 gap-3">
            {statCards.map(([label, value]) => <div key={label} className="rounded-lg border p-3 text-center"><div className="text-2xl font-bold">{value || "—"}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div>)}
          </div>
        </section>

        <section className="briefing-page px-8 py-10">
          <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">3. BAŞARILAR VE YÜRÜTÜLEN PROJELER</h2>
          <h3 className="mt-6 text-lg font-bold">Kurum Başarıları</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.achievements || "—"}</p>
          <h3 className="mt-8 text-lg font-bold">Yürütülen Projeler</h3>
          <table className="mt-3 w-full border-collapse text-xs"><thead><tr><th className="border p-2 text-left">Proje Adı</th><th className="border p-2 text-left">Türü</th><th className="border p-2 text-left">Amacı</th></tr></thead><tbody>{draft.projects.length ? draft.projects.map((p, i) => <tr key={i}><td className="border p-2">{p.name || "—"}</td><td className="border p-2">{p.type || "—"}</td><td className="border p-2">{p.purpose || "—"}</td></tr>) : <tr><td className="border p-2" colSpan={3}>—</td></tr>}</tbody></table>
        </section>

        <section className="briefing-page px-8 py-10">
          <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">4. KURUMSAL ANALİZ</h2>
          {[['Güçlü Yönler', draft.strengths], ['Zayıf Yönler', draft.weaknesses], ['Geliştirilmesi Gereken Yönler', draft.improvementAreas], ['Planlanan Çalışmalar', draft.plannedActions]].map(([title, text]) => <div key={title} className="mt-7"><h3 className="text-base font-bold uppercase">{title}</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{text || "—"}</p></div>)}
        </section>

        {photos.length ? (
          <section className="briefing-page px-8 py-10">
            <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">5. KURUMDAN VE ETKİNLİKLERDEN GÖRSELLER</h2>
            <div className="mt-6 grid grid-cols-2 gap-5">
              {photos.map((photo) => <figure key={photo.id} className="break-inside-avoid"><img src={photo.dataUrl} alt={photo.caption} className="aspect-video w-full rounded-lg border object-cover" /><figcaption className="mt-2 text-center text-xs font-semibold">{photo.caption}</figcaption></figure>)}
            </div>
          </section>
        ) : null}

        <section className="briefing-page flex flex-col px-8 py-10">
          <h2 className="border-b-2 border-slate-900 pb-3 text-xl font-bold">6. ETKİNLİKLER VE İLETİŞİM</h2>
          <h3 className="mt-6 text-lg font-bold">Öne Çıkan Etkinlikler</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{draft.events || "—"}</p>
          <div className="mt-auto rounded-xl border p-5 text-sm leading-7">
            <div><b>Adres:</b> {draft.address || "—"}</div><div><b>Web:</b> {draft.website || "—"}</div><div><b>E-posta:</b> {draft.email || "—"}</div><div><b>Telefon:</b> {draft.phone || "—"}</div>
            <div><b>Instagram:</b> {draft.instagram || "—"}</div><div><b>YouTube:</b> {draft.youtube || "—"}</div><div><b>X:</b> {draft.x || "—"}</div><div><b>Facebook:</b> {draft.facebook || "—"}</div>
          </div>
          <div className="mt-12 text-center"><p className="font-semibold">UYGUNDUR</p><p className="mt-6 font-bold">{draft.principal || "Okul Müdürü"}</p><p className="text-sm">Okul Müdürü</p></div>
        </section>
      </div>
    </AppShell>
  );
}
