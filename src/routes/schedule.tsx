import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, FileUp, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseScheduleImport } from "@/lib/schedule-import";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Haftalık Ders Programı — OkulOS" },
      { name: "description", content: "Öğretmen, sınıf, öğrenci grubu ve fiziksel derslik kısıtlarıyla haftalık ders programını yönetin." },
    ],
  }),
  component: ScheduleManager,
});

type Teacher = { user_id: string; full_name: string | null };
type SchoolClass = { id: string; class_name: string; program_type: string | null; composite_key: string | null };
type Classroom = { id: string; name: string; room_type: string; capacity: number; department: string | null };
type Subgroup = { id: string; class_id: string; subgroup_key: string; label: string | null };
type ScheduleRow = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  weekday: number;
  period: number;
  class_name: string;
  subject: string;
  classroom_id: string | null;
  classroom: string | null;
  subgroup_id: string | null;
  subgroup_key: string | null;
  is_group_split: boolean;
  active: boolean;
};

type EditorState = {
  id?: string;
  teacherId: string;
  classId: string;
  weekday: number;
  period: number;
  subject: string;
  classroomId: string;
  subgroupId: string;
  isGroupSplit: boolean;
};

const days = [
  { id: 1, label: "Pazartesi" },
  { id: 2, label: "Salı" },
  { id: 3, label: "Çarşamba" },
  { id: 4, label: "Perşembe" },
  { id: 5, label: "Cuma" },
] as const;

const periods = Array.from({ length: 8 }, (_, index) => index + 1);

function emptyEditor(day = 1, period = 1): EditorState {
  return { teacherId: "", classId: "", weekday: day, period, subject: "", classroomId: "", subgroupId: "", isGroupSplit: false };
}

function translateScheduleError(message?: string) {
  const text = message ?? "";
  if (text.includes("TEACHER_DOUBLE_BOOKING") || text.includes("uq_teacher_schedule_teacher_slot")) return "Bu öğretmen seçilen gün ve saatte başka bir derste görevli. Çift görevlendirme yapılamaz.";
  if (text.includes("TEACHER_UNAVAILABLE")) return "Bu öğretmen seçilen gün ve ders saatinde ders veremez olarak işaretlenmiş. Atama engellendi.";
  if (text.includes("TEACHER_WEEKLY_LIMIT_EXCEEDED")) return "Bu atama öğretmenin tanımlı haftalık azami ders yükünü aşıyor.";
  if (text.includes("TEACHER_CONSECUTIVE_LIMIT_EXCEEDED")) return "Bu atama öğretmenin izin verilen azami ardışık ders sayısını aşıyor.";
  if (text.includes("ROOM_DOUBLE_BOOKING") || text.includes("uq_teacher_schedule_classroom_slot")) return "Seçilen derslik/atölye bu gün ve saatte başka bir ders tarafından kullanılıyor.";
  if (text.includes("ROOM_CAPACITY_EXCEEDED")) return "Seçilen dersliğin kapasitesi bu sınıf veya öğrenci grubu için yetersiz.";
  if (text.includes("ROOM_TYPE_MISMATCH")) return "Bu ders, seçilen derslik türünde yapılamaz. Ders için uygun laboratuvar/atölye türünü seçin.";
  if (text.includes("ROOM_DEPARTMENT_MISMATCH")) return "Seçilen atölye/laboratuvar bu dersin bölüm eşleşmesine uygun değil.";
  if (text.includes("ROOM_HARDWARE_MISMATCH")) return "Seçilen derslikte bu ders için gerekli donanım bulunmuyor.";
  if (text.includes("CLASSROOM_NOT_FOUND")) return "Seçilen derslik aktif değil veya sistemde bulunamadı.";
  if (text.includes("CLASS_DOUBLE_BOOKING") || text.includes("uq_teacher_schedule_class_slot")) return "Bu sınıf/şube seçilen saatte zaten başka bir derse atanmış.";
  if (text.includes("CLASS_SUBGROUP_DOUBLE_BOOKING") || text.includes("uq_teacher_schedule_class_subgroup_slot")) return "Aynı alt grup bu ders saatinde zaten atanmış.";
  if (text.includes("STUDENT_GROUP_CONFLICT")) return "Bu alt gruptaki öğrencilerden en az biri aynı saatte başka bir derse atanmış. Öğrenci çakışması nedeniyle kayıt engellendi.";
  if (text.includes("SUBGROUP_CLASS_MISMATCH")) return "Seçilen alt grup bu sınıfa ait değil.";
  if (text.includes("SUBGROUP_REQUIRED")) return "Grup bölünmüş derslerde tanımlı bir alt grup seçilmelidir.";
  if (text.includes("TEACHER_NOT_FOUND")) return "İçe aktarma dosyasındaki öğretmen sistemde bulunamadı.";
  if (text.includes("CLASS_NOT_FOUND")) return "İçe aktarma dosyasındaki sınıf/program anahtarı sistemde bulunamadı.";
  return "Ders programı işlemi tamamlanamadı. Öğretmen, sınıf, öğrenci grubu ve derslik kısıtlarını kontrol edin.";
}

function ScheduleManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [teacherFilter, setTeacherFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    const [teacherRes, classRes, classroomRes, subgroupRes, scheduleRes] = await Promise.all([
      supabase.from("profiles").select("user_id,full_name").eq("role", "teacher").order("full_name"),
      supabase.from("school_classes").select("id,class_name,program_type,composite_key").eq("active", true).order("composite_key"),
      supabase.from("classrooms").select("id,name,room_type,capacity,department").eq("active", true).order("name"),
      supabase.from("class_subgroups").select("id,class_id,subgroup_key,label").eq("active", true).order("subgroup_key"),
      supabase.from("teacher_schedule").select("id,teacher_id,class_id,weekday,period,class_name,subject,classroom_id,classroom,subgroup_id,subgroup_key,is_group_split,active").eq("active", true).order("weekday").order("period"),
    ]);

    if (teacherRes.error || classRes.error || classroomRes.error || subgroupRes.error || scheduleRes.error) {
      setError("Ders programı veya kısıt verileri yüklenemedi.");
      return;
    }

    setTeachers((teacherRes.data ?? []) as Teacher[]);
    setClasses((classRes.data ?? []) as SchoolClass[]);
    setClassrooms((classroomRes.data ?? []) as Classroom[]);
    setSubgroups((subgroupRes.data ?? []) as Subgroup[]);
    setRows((scheduleRes.data ?? []) as ScheduleRow[]);
  }, []);

  useEffect(() => {
    void loadData();
    const channel = supabase
      .channel("schedule-manager-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_schedule" }, () => void loadData())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadData]);

  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((teacher) => [teacher.user_id, teacher.full_name ?? "Öğretmen"])), [teachers]);
  const classMap = useMemo(() => Object.fromEntries(classes.map((item) => [item.id, item])), [classes]);
  const classroomMap = useMemo(() => Object.fromEntries(classrooms.map((room) => [room.id, room])), [classrooms]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (teacherFilter && row.teacher_id !== teacherFilter) return false;
    if (classFilter && row.class_id !== classFilter) return false;
    if (roomFilter && row.classroom_id !== roomFilter) return false;
    return true;
  }), [rows, teacherFilter, classFilter, roomFilter]);

  const editorSubgroups = useMemo(() => editor ? subgroups.filter((group) => group.class_id === editor.classId) : [], [editor, subgroups]);
  function rowsForSlot(day: number, period: number) { return filteredRows.filter((row) => row.weekday === day && row.period === period); }

  function editRow(row: ScheduleRow) {
    setEditor({
      id: row.id,
      teacherId: row.teacher_id,
      classId: row.class_id ?? "",
      weekday: row.weekday,
      period: row.period,
      subject: row.subject,
      classroomId: row.classroom_id ?? "",
      subgroupId: row.subgroup_id ?? "",
      isGroupSplit: row.is_group_split,
    });
  }

  async function saveSchedule() {
    if (!editor) return;
    const selectedClass = classes.find((item) => item.id === editor.classId);
    if (!editor.teacherId || !selectedClass || !editor.subject.trim()) {
      setError("Öğretmen, sınıf ve ders alanları zorunludur.");
      return;
    }
    if (editor.isGroupSplit && !editor.subgroupId) {
      setError("Grup bölünmüş derslerde tanımlı bir alt grup seçilmelidir.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    const selectedRoom = classrooms.find((room) => room.id === editor.classroomId);
    const payload = {
      teacher_id: editor.teacherId,
      class_id: editor.classId,
      weekday: editor.weekday,
      period: editor.period,
      class_name: selectedClass.class_name,
      subject: editor.subject.trim(),
      classroom_id: editor.classroomId || null,
      classroom: selectedRoom?.name ?? null,
      subgroup_id: editor.isGroupSplit ? editor.subgroupId : null,
      subgroup_key: editor.isGroupSplit ? subgroups.find((group) => group.id === editor.subgroupId)?.subgroup_key ?? null : null,
      is_group_split: editor.isGroupSplit,
      active: true,
      updated_at: new Date().toISOString(),
    };

    const result = editor.id
      ? await supabase.from("teacher_schedule").update(payload).eq("id", editor.id)
      : await supabase.from("teacher_schedule").insert(payload);

    setSaving(false);
    if (result.error) { setError(translateScheduleError(result.error.message)); return; }
    setEditor(null);
    setSuccess("Ders programı tüm öğretmen, öğrenci grubu ve derslik kısıtlarından geçerek kaydedildi.");
    await loadData();
  }

  async function deleteSchedule(id: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("teacher_schedule").delete().eq("id", id);
    if (deleteError) { setError(translateScheduleError(deleteError.message)); return; }
    setEditor(null);
    setSuccess("Program kaydı silindi ve değişiklik denetim kaydına işlendi.");
    await loadData();
  }

  async function importFile(file: File) {
    setImporting(true);
    setError(null);
    setSuccess(null);
    try {
      const parsed = await parseScheduleImport(file);
      const fileType = file.name.split(".").pop()?.toLowerCase();
      const { data, error: importError } = await supabase.rpc("import_weekly_schedule", { p_file_name: file.name, p_file_type: fileType, p_rows: parsed });
      if (importError) throw importError;
      const result = Array.isArray(data) ? data[0] : data;
      setSuccess(`${result?.imported_rows ?? parsed.length} program satırı kısıt kontrollerinden geçirilerek içe aktarıldı.`);
      await loadData();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(translateScheduleError(message));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <AppShell title="Haftalık Ders Programı" subtitle="Öğretmen · öğrenci grubu · derslik kısıt motoru">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button onClick={() => setEditor(emptyEditor())} className="gap-2"><Plus className="size-4" /> Ders Ekle</Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing} className="gap-2"><FileUp className="size-4" /> {importing ? "İçe Aktarılıyor..." : "e-Okul Programı İçe Aktar"}</Button>
        <Button variant="outline" onClick={() => void loadData()} className="gap-2"><RefreshCw className="size-4" /> Yenile</Button>
        <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.xls,.csv,.txt" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Tüm öğretmenler</option>{teachers.map((teacher) => <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name ?? "Öğretmen"}</option>)}</select>
        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Tüm sınıf/şubeler</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.composite_key ?? item.class_name}</option>)}</select>
        <select value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Tüm derslik/atölyeler</option>{classrooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.capacity} kişi</option>)}</select>
      </div>

      {error ? <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}</div> : null}
      {success ? <div className="mt-3 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm text-primary">{success}</div> : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="sticky left-0 z-10 w-20 border-r border-border bg-muted/95 px-3 py-2 text-left font-medium">Saat</th>{days.map((day) => <th key={day.id} className="min-w-[175px] border-r border-border px-3 py-2 text-left font-medium last:border-r-0">{day.label}</th>)}</tr></thead>
          <tbody>{periods.map((period) => (
            <tr key={period} className="border-t border-border align-top">
              <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-3 font-semibold">{period}. Ders</td>
              {days.map((day) => {
                const slotRows = rowsForSlot(day.id, period);
                return <td key={day.id} className="border-r border-border p-2 last:border-r-0"><div className="space-y-2">
                  {slotRows.map((row) => {
                    const classInfo = row.class_id ? classMap[row.class_id] : null;
                    const room = row.classroom_id ? classroomMap[row.classroom_id] : null;
                    return <button key={row.id} type="button" onClick={() => editRow(row)} className="block w-full rounded-lg border border-border bg-background p-2 text-left hover:border-primary/40 hover:bg-muted/30">
                      <div className="flex items-start justify-between gap-2"><p className="font-medium leading-tight">{row.subject}</p>{row.is_group_split ? <Badge variant="secondary" className="shrink-0">{row.subgroup_key ?? "Grup"}</Badge> : null}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{classInfo?.composite_key ?? row.class_name}</p>
                      <p className="text-xs text-muted-foreground">{teacherMap[row.teacher_id] ?? "Öğretmen"}{room ? ` · ${room.name}` : row.classroom ? ` · ${row.classroom}` : ""}</p>
                    </button>;
                  })}
                  {!slotRows.length ? <button type="button" onClick={() => setEditor(emptyEditor(day.id, period))} className="w-full rounded-lg border border-dashed border-border px-2 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">+ Ders ekle</button> : null}
                </div></td>;
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Kayıt öncesinde öğretmen, fiziksel derslik, kapasite/donanım ve gerçek öğrenci alt grup çakışmaları veritabanı seviyesinde doğrulanır.</p>

      <Dialog open={Boolean(editor)} onOpenChange={(open) => { if (!open) setEditor(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editor?.id ? "Ders Kaydını Düzenle" : "Ders Ekle"}</DialogTitle><DialogDescription>Uygunluk, yük, öğrenci ve fiziksel alan kısıtları kaydetme sırasında otomatik kontrol edilir.</DialogDescription></DialogHeader>
          {editor ? <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Gün</Label><select value={editor.weekday} onChange={(event) => setEditor({ ...editor, weekday: Number(event.target.value) })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{days.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}</select></div>
              <div className="space-y-2"><Label>Ders Saati</Label><select value={editor.period} onChange={(event) => setEditor({ ...editor, period: Number(event.target.value) })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{Array.from({ length: 12 }, (_, index) => index + 1).map((period) => <option key={period} value={period}>{period}. Ders</option>)}</select></div>
            </div>
            <div className="space-y-2"><Label>Öğretmen</Label><select value={editor.teacherId} onChange={(event) => setEditor({ ...editor, teacherId: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Seçiniz</option>{teachers.map((teacher) => <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name ?? "Öğretmen"}</option>)}</select></div>
            <div className="space-y-2"><Label>Sınıf / Program</Label><select value={editor.classId} onChange={(event) => setEditor({ ...editor, classId: event.target.value, subgroupId: "", isGroupSplit: false })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Seçiniz</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.composite_key ?? item.class_name}</option>)}</select></div>
            <div className="space-y-2"><Label>Ders</Label><Input value={editor.subject} onChange={(event) => setEditor({ ...editor, subject: event.target.value })} placeholder="Örn. Matematik" /></div>
            <div className="space-y-2"><Label>Derslik / Atölye</Label><select value={editor.classroomId} onChange={(event) => setEditor({ ...editor, classroomId: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Derslik seçilmedi</option>{classrooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.room_type} · {room.capacity} kişi</option>)}</select></div>
            <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" checked={editor.isGroupSplit} onChange={(event) => setEditor({ ...editor, isGroupSplit: event.target.checked, subgroupId: event.target.checked ? editor.subgroupId : "" })} />Tanımlı öğrenci alt grubu / paralel grup dersi</label>
            {editor.isGroupSplit ? <div className="space-y-2"><Label>Alt Grup</Label><select value={editor.subgroupId} onChange={(event) => setEditor({ ...editor, subgroupId: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Seçiniz</option>{editorSubgroups.map((group) => <option key={group.id} value={group.id}>{group.label ?? group.subgroup_key}</option>)}</select>{!editorSubgroups.length ? <p className="text-xs text-destructive">Bu sınıf için tanımlı öğrenci alt grubu bulunmuyor.</p> : null}</div> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">{editor.id ? <Button variant="destructive" onClick={() => void deleteSchedule(editor.id!)} className="gap-2"><Trash2 className="size-4" /> Sil</Button> : <span />}<Button onClick={() => void saveSchedule()} disabled={saving} className="gap-2"><Pencil className="size-4" /> {saving ? "Kaydediliyor..." : "Kaydet"}</Button></div>
          </div> : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
