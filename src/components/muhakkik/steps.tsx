import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CASE_TYPES,
  PERSON_KINDS,
  personKindLabel,
  sortPeople,
  uid,
  type CaseType,
  type MuhakkikCase,
  type Person,
  type PersonKind,
} from "@/lib/muhakkik/types";
import { SANCTION_OPTIONS, bentLabel, suggestBents } from "@/lib/muhakkik/sanctions";
import { ensureStatement, targetedQuestions } from "@/lib/muhakkik/questions";
import { printCagriKagidi, printIfadeTutanagi } from "@/lib/muhakkik/print";
import { Field } from "./Field";

export function Step0({ cse, patch }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">0. Dosya kimliği</h2>
      <Field label="Tür">
        <div className="flex flex-wrap gap-2">
          {CASE_TYPES.map((t) => (
            <Button key={t.id} type="button" size="sm" variant={cse.caseType === t.id ? "default" : "outline"} onClick={() => patch((c) => ({ ...c, caseType: t.id as CaseType }))}>{t.label}</Button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{CASE_TYPES.find((x) => x.id === cse.caseType)?.note}</p>
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Görevlendirme no"><Input value={cse.gorevlendirmeNo} onChange={(e) => patch((c) => ({ ...c, gorevlendirmeNo: e.target.value }))} /></Field>
        <Field label="Görevlendirme tarihi"><Input type="date" value={cse.gorevlendirmeTarih} onChange={(e) => patch((c) => ({ ...c, gorevlendirmeTarih: e.target.value }))} /></Field>
        <Field label="Makam oluru no"><Input value={cse.olurNo} onChange={(e) => patch((c) => ({ ...c, olurNo: e.target.value }))} /></Field>
        <Field label="Olur tarihi"><Input type="date" value={cse.olurTarih} onChange={(e) => patch((c) => ({ ...c, olurTarih: e.target.value }))} /></Field>
        <Field label="Görevlendiren makam"><Input value={cse.makam} onChange={(e) => patch((c) => ({ ...c, makam: e.target.value }))} placeholder="İlçe Millî Eğitim Müdürlüğü" /></Field>
        <Field label="Muhatap (rapor hitabı)"><Input value={cse.muhatap} onChange={(e) => patch((c) => ({ ...c, muhatap: e.target.value }))} /></Field>
        <Field label="Muhakkik adı"><Input value={cse.muhakkikAdi} onChange={(e) => patch((c) => ({ ...c, muhakkikAdi: e.target.value }))} /></Field>
        <Field label="Unvan"><Input value={cse.muhakkikUnvan} onChange={(e) => patch((c) => ({ ...c, muhakkikUnvan: e.target.value }))} /></Field>
        <Field label="Valilik / Kaymakamlık anteti"><Input value={cse.valilik} onChange={(e) => patch((c) => ({ ...c, valilik: e.target.value }))} placeholder="…… KAYMAKAMLIĞI" /></Field>
        <Field label="Müdürlük anteti"><Input value={cse.mudurluk} onChange={(e) => patch((c) => ({ ...c, mudurluk: e.target.value }))} /></Field>
        <Field label="Süre (gün, bilgi)"><Input value={cse.sureGun} onChange={(e) => patch((c) => ({ ...c, sureGun: e.target.value }))} /></Field>
      </div>
    </div>
  );
}

export function Step1({ cse, patch, fileName, setFileName }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void; fileName: string; setFileName: (s: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">1. Belgeler, konu ve iddia</h2>
      <p className="text-xs text-muted-foreground">Dosyalar adlı liste olarak saklanır (içerik yüklenmez; kota). Konu ve iddiayı siz yazarsınız. 657 m.125 bent önerisi düzenlenebilir.</p>
      <div className="flex gap-2">
        <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Belge adı (ör. dilekçe.pdf)" />
        <Button type="button" variant="outline" onClick={() => {
          const name = fileName.trim();
          if (!name) return;
          patch((c) => ({ ...c, files: [...c.files, { id: uid(), name, note: "" }] }));
          setFileName("");
        }}>Ekle</Button>
      </div>
      <ul className="space-y-1 text-sm">
        {cse.files.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-lg border px-3 py-1.5">
            <span>{f.name}</span>
            <Button size="sm" variant="ghost" onClick={() => patch((c) => ({ ...c, files: c.files.filter((x) => x.id !== f.id) }))}>Kaldır</Button>
          </li>
        ))}
      </ul>
      <Field label="Konu"><Textarea className="min-h-20" value={cse.subject} onChange={(e) => patch((c) => ({ ...c, subject: e.target.value }))} /></Field>
      <Field label="İddia"><Textarea className="min-h-28" value={cse.claims} onChange={(e) => patch((c) => ({ ...c, claims: e.target.value }))} /></Field>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => patch((c) => ({ ...c, suggestedBents: suggestBents(c.subject, c.claims) }))}>657 m.125 bent öner</Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {SANCTION_OPTIONS.flatMap((b) => b.alts).map((alt) => {
          const on = cse.suggestedBents.includes(alt.code);
          return (
            <Button key={alt.code} type="button" size="sm" variant={on ? "default" : "outline"} onClick={() => patch((c) => ({
              ...c,
              suggestedBents: on ? c.suggestedBents.filter((x) => x !== alt.code) : [...c.suggestedBents, alt.code],
            }))}>{alt.code}</Button>
          );
        })}
      </div>
      {cse.suggestedBents.length ? <p className="text-xs text-muted-foreground">{cse.suggestedBents.map(bentLabel).join(" · ")}</p> : null}
    </div>
  );
}

export function Step2({
  cse, patch, draft, setDraft, ordered,
}: {
  cse: MuhakkikCase;
  patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void;
  draft: { kind: PersonKind; fullName: string; title: string; school: string };
  setDraft: (d: { kind: PersonKind; fullName: string; title: string; school: string }) => void;
  ordered: Person[];
}) {
  function addPerson() {
    if (!draft.fullName.trim()) return;
    const person: Person = { id: uid(), kind: draft.kind, fullName: draft.fullName.trim(), title: draft.title.trim(), school: draft.school.trim(), tckn: "", phone: "", address: "" };
    patch((c) => ensureStatement({ ...c, people: sortPeople([...c.people, person]) }, person));
    setDraft({ ...draft, fullName: "" });
  }
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">2. Kişiler — ifade sırası</h2>
      <p className="text-xs text-muted-foreground">Teamül: şikâyetçi → tanıklar → itham edilen en sonda. Hakkında soruşturma yapılanın ifadesi alınmış olmalıdır.</p>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Sıfat">
          <select className="h-10 w-full rounded-md border bg-background px-3" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as PersonKind })}>
            {PERSON_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </Field>
        <Field label="Adı SOYADI"><Input value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field>
        <Field label="Unvan"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
        <Field label="Kurum"><Input value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} /></Field>
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={addPerson}>Kişi ekle</Button>
        <Button type="button" variant="outline" onClick={() => patch((c) => ({ ...c, people: sortPeople(c.people) }))}>Sırayı düzelt</Button>
      </div>
      <ol className="space-y-2">
        {ordered.map((p, i) => (
          <li key={p.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <b>{i + 1}. {p.fullName}</b>
                <p className="text-xs text-muted-foreground">{personKindLabel(p.kind)} · {p.title} · {p.school}{p.kind === "itham_edilen" ? " · EN SON" : ""}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => patch((c) => ({ ...c, people: c.people.filter((x) => x.id !== p.id), statements: c.statements.filter((s) => s.personId !== p.id) }))}>Sil</Button>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <Input placeholder="T.C. Kimlik No" value={p.tckn} onChange={(e) => patch((c) => ({ ...c, people: c.people.map((x) => x.id === p.id ? { ...x, tckn: e.target.value } : x) }))} />
              <Input placeholder="Telefon" value={p.phone} onChange={(e) => patch((c) => ({ ...c, people: c.people.map((x) => x.id === p.id ? { ...x, phone: e.target.value } : x) }))} />
              <Input placeholder="Adres" value={p.address} onChange={(e) => patch((c) => ({ ...c, people: c.people.map((x) => x.id === p.id ? { ...x, address: e.target.value } : x) }))} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Step3({ cse, patch, ordered }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void; ordered: Person[] }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">3. Hedefli sorular · çağrı · tutanak</h2>
      <p className="text-xs text-muted-foreground">Kişi başı 6–12 soru. Yazdırma A4 T.C. antetli HTML + window.print. İfade tutanağı savunma talep yazısı değildir.</p>
      {ordered.map((p) => {
        const st = cse.statements.find((s) => s.personId === p.id);
        return (
          <div key={p.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <b>{p.fullName} · {personKindLabel(p.kind)}</b>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  patch((c) => {
                    const withSt = ensureStatement(c, p);
                    return {
                      ...withSt,
                      statements: withSt.statements.map((s) => s.personId === p.id ? { ...s, questions: targetedQuestions(p.kind, withSt, p), answers: {} } : s),
                    };
                  });
                }}>Soruları yenile</Button>
                <Button size="sm" variant="outline" onClick={() => printCagriKagidi(ensureAndGet(cse, p, patch), p)}>Çağrı kâğıdı</Button>
                <Button size="sm" onClick={() => printIfadeTutanagi(ensureAndGet(cse, p, patch), p)}>İfade tutanağı</Button>
              </div>
            </div>
            {!st ? <p className="mt-2 text-xs">Sorular kişi eklenince oluşur; yenile ile üretilir.</p> : (
              <>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <Input type="date" value={st.date} onChange={(e) => patch((c) => ({ ...c, statements: c.statements.map((s) => s.personId === p.id ? { ...s, date: e.target.value } : s) }))} />
                  <Input value={st.time} onChange={(e) => patch((c) => ({ ...c, statements: c.statements.map((s) => s.personId === p.id ? { ...s, time: e.target.value } : s) }))} />
                  <Input value={st.place} onChange={(e) => patch((c) => ({ ...c, statements: c.statements.map((s) => s.personId === p.id ? { ...s, place: e.target.value } : s) }))} />
                </div>
                <ol className="mt-2 space-y-2">
                  {st.questions.map((q, i) => (
                    <li key={q.id} className="flex gap-2">
                      <span className="mt-2 text-xs text-muted-foreground">{i + 1}.</span>
                      <Textarea className="min-h-16" value={q.text} onChange={(e) => patch((c) => ({
                        ...c,
                        statements: c.statements.map((s) => s.personId === p.id ? { ...s, questions: s.questions.map((x) => x.id === q.id ? { ...x, text: e.target.value } : x) } : s),
                      }))} />
                    </li>
                  ))}
                </ol>
                <Button className="mt-2" size="sm" variant="outline" disabled={(st.questions.length >= 12)} onClick={() => patch((c) => ({
                  ...c,
                  statements: c.statements.map((s) => s.personId === p.id ? { ...s, questions: [...s.questions, { id: uid(), text: "" }] } : s),
                }))}>Soru ekle</Button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ensureAndGet(cse: MuhakkikCase, p: Person, patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void): MuhakkikCase {
  const next = ensureStatement(cse, p);
  if (next !== cse) patch(() => next);
  return next;
}

export { Step4, Step5, Step6, Step7 } from "./stepsLate";
