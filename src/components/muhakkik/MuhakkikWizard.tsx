import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ACTOR_ROLES,
  CASE_TYPES,
  STEPS,
  actorLabel,
  emptyCase,
  formatTr,
  sortPeople,
  type ActorRole,
  type MuhakkikCase,
  type PersonKind,
} from "@/lib/muhakkik/types";
import { loadCases, saveCases, upsertCase } from "@/lib/muhakkik/storage";
import { unansweredCount } from "@/lib/muhakkik/questions";
import { demoCase } from "@/lib/muhakkik/demo";
import { Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./steps";

export function MuhakkikWizard() {
  const [cases, setCases] = useState<MuhakkikCase[]>(() => loadCases());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftPerson, setDraftPerson] = useState<{ kind: PersonKind; fullName: string; title: string; school: string }>({
    kind: "sikayetci",
    fullName: "",
    title: "",
    school: "",
  });
  const [fileName, setFileName] = useState("");
  const [annexTitle, setAnnexTitle] = useState("");
  const active = cases.find((c) => c.id === activeId) ?? null;

  function persist(next: MuhakkikCase[]) {
    setCases(next);
    saveCases(next);
  }

  function patch(fn: (c: MuhakkikCase) => MuhakkikCase) {
    if (!active) return;
    persist(upsertCase(cases, fn(active)));
  }

  function createNew() {
    const c = emptyCase();
    persist([c, ...cases]);
    setActiveId(c.id);
  }

  function seedDemo() {
    const c = demoCase();
    persist([c, ...cases.filter((x) => x.id !== c.id)]);
    setActiveId(c.id);
  }

  function removeCase(id: string) {
    const next = cases.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) setActiveId(null);
  }

  const missingAnswers = active ? unansweredCount(active) : 0;
  const orderedPeople = useMemo(() => (active ? sortPeople(active.people) : []), [active]);

  return (
    <div className="space-y-4">
      <RoleBar
        value={active?.actorRole ?? "muhakkik"}
        onChange={(actorRole) => (active ? patch((c) => ({ ...c, actorRole })) : undefined)}
        disabled={!active}
      />

      {!active ? (
        <CaseList cases={cases} onOpen={setActiveId} onNew={createNew} onDemo={seedDemo} onRemove={removeCase} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveId(null)}>Dosyalara dön</Button>
            <span className="text-sm font-medium">{active.subject || "Adsız dosya"}</span>
            <span className="text-xs text-muted-foreground">{CASE_TYPES.find((x) => x.id === active.caseType)?.label} · {formatTr(active.gorevlendirmeTarih)}</span>
          </div>
          <Stepper step={active.currentStep} onGo={(n) => patch((c) => ({ ...c, currentStep: n }))} />
          <section className="rounded-xl border bg-card p-4">
            {active.currentStep === 0 && <Step0 cse={active} patch={patch} />}
            {active.currentStep === 1 && <Step1 cse={active} patch={patch} fileName={fileName} setFileName={setFileName} />}
            {active.currentStep === 2 && <Step2 cse={active} patch={patch} draft={draftPerson} setDraft={setDraftPerson} ordered={orderedPeople} />}
            {active.currentStep === 3 && <Step3 cse={active} patch={patch} ordered={orderedPeople} />}
            {active.currentStep === 4 && <Step4 cse={active} patch={patch} ordered={orderedPeople} missing={missingAnswers} />}
            {active.currentStep === 5 && <Step5 cse={active} patch={patch} annexTitle={annexTitle} setAnnexTitle={setAnnexTitle} />}
            {active.currentStep === 6 && <Step6 cse={active} patch={patch} />}
            {active.currentStep === 7 && <Step7 cse={active} patch={patch} />}
          </section>
          <div className="flex gap-2">
            <Button variant="outline" disabled={active.currentStep === 0} onClick={() => patch((c) => ({ ...c, currentStep: Math.max(0, c.currentStep - 1) }))}>Geri</Button>
            <Button className="flex-1" disabled={active.currentStep === 7} onClick={() => patch((c) => ({ ...c, currentStep: Math.min(7, c.currentStep + 1) }))}>İleri</Button>
          </div>
        </>
      )}
    </div>
  );
}

function RoleBar({ value, onChange, disabled }: { value: ActorRole; onChange: (r: ActorRole) => void; disabled?: boolean }) {
  const current = ACTOR_ROLES.find((r) => r.id === value) ?? ACTOR_ROLES[0];
  return (
    <section className="rounded-xl border bg-card p-4">
      <Label>Rol (yalnız bu modül; genel oturumu değiştirmez)</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACTOR_ROLES.map((r) => (
          <Button key={r.id} type="button" size="sm" variant={value === r.id ? "default" : "outline"} disabled={disabled} onClick={() => onChange(r.id)}>
            {r.label}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{current.note}</p>
    </section>
  );
}

function CaseList({
  cases, onOpen, onNew, onDemo, onRemove,
}: {
  cases: MuhakkikCase[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onDemo: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Soruşturma dosyaları</h2>
      <p className="mt-1 text-xs text-muted-foreground">Kayıtlar bu tarayıcıda tutulur ({`okulos-muhakkik-cases-v1`}). Sunucuya gitmez; v1 için veritabanı yok.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onNew}>Yeni dosya</Button>
        <Button variant="outline" onClick={onDemo}>Demo örnek dosya</Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cases.length ? cases.map((c) => (
          <div key={c.id} className="rounded-xl border p-4">
            <b>{c.subject || "Konu yazılmamış"}</b>
            <p className="mt-1 text-xs text-muted-foreground">{CASE_TYPES.find((x) => x.id === c.caseType)?.label} · {actorLabel(c.actorRole)} · {c.gorevlendirmeNo || "no yok"} · {formatTr(c.gorevlendirmeTarih)}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => onOpen(c.id)}>Aç</Button>
              <Button size="sm" variant="outline" onClick={() => onRemove(c.id)}>Sil</Button>
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">Henüz dosya yok. Yeni dosya veya demo ile başlayın.</p>}
      </div>
    </section>
  );
}

function Stepper({ step, onGo }: { step: number; onGo: (n: number) => void }) {
  return (
    <ol className="grid grid-cols-4 gap-1 md:grid-cols-8">
      {STEPS.map((s) => (
        <li key={s.n}>
          <button
            type="button"
            onClick={() => onGo(s.n)}
            className={`w-full rounded-lg border px-1 py-2 text-[10px] leading-tight ${step === s.n ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            {s.n}. {s.short}
          </button>
        </li>
      ))}
    </ol>
  );
}
