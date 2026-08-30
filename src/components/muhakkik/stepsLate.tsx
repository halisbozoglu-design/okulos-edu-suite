import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  uid,
  type MuhakkikCase,
  type Person,
  type SanctionBent,
  type SanctionMode,
} from "@/lib/muhakkik/types";
import { MODE_NOTES, bentsForMode } from "@/lib/muhakkik/sanctions";
import { printBilgiBelge, printDiziPusulasi, printDosya, printRapor } from "@/lib/muhakkik/print";
import { draftReport } from "@/lib/muhakkik/report";
import { Field } from "./Field";

export function Step4({ cse, patch, ordered, missing }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void; ordered: Person[]; missing: number }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">4. Cevaplar</h2>
      {missing ? <div className="rounded-xl border bg-muted/40 p-3 text-sm">{missing} soru cevapsız. İmzalı tarama yerine metni buraya yazabilirsiniz.</div> : <p className="text-xs text-muted-foreground">Tüm sorular doldurulmuş.</p>}
      {ordered.map((p) => {
        const st = cse.statements.find((s) => s.personId === p.id);
        if (!st) return <p key={p.id} className="text-sm">{p.fullName}: soru yok (adım 3).</p>;
        return (
          <div key={p.id} className="rounded-lg border p-3">
            <b>{p.fullName}</b>
            {st.questions.map((q, i) => (
              <div key={q.id} className="mt-3">
                <Label>{i + 1}. {q.text}</Label>
                <Textarea className="mt-1 min-h-20" value={st.answers[q.id] ?? ""} onChange={(e) => patch((c) => ({
                  ...c,
                  statements: c.statements.map((s) => s.personId === p.id ? { ...s, answers: { ...s.answers, [q.id]: e.target.value } } : s),
                }))} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function Step5({ cse, patch, annexTitle, setAnnexTitle }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void; annexTitle: string; setAnnexTitle: (s: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">5. Eksik belgeler ve numaralı ekler</h2>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => printBilgiBelge(cse)}>Bilgi-belge istek yazısı</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => printDiziPusulasi(cse)}>Dizi pusulası</Button>
      </div>
      <ul className="space-y-2">
        {cse.missingDocs.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <label className="flex items-center gap-1"><input type="checkbox" checked={d.requested} onChange={(e) => patch((c) => ({ ...c, missingDocs: c.missingDocs.map((x) => x.id === d.id ? { ...x, requested: e.target.checked } : x) }))} /> istendi</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={d.received} onChange={(e) => patch((c) => ({ ...c, missingDocs: c.missingDocs.map((x) => x.id === d.id ? { ...x, received: e.target.checked } : x) }))} /> geldi</label>
            <span className="flex-1">{d.label}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={annexTitle} onChange={(e) => setAnnexTitle(e.target.value)} placeholder="Ek açıklaması" />
        <Button type="button" variant="outline" onClick={() => {
          const title = annexTitle.trim();
          if (!title) return;
          patch((c) => ({ ...c, annexes: [...c.annexes, { id: uid(), number: c.annexes.length + 1, title, pieces: 1, present: true, notes: "" }] }));
          setAnnexTitle("");
        }}>Ek ekle</Button>
      </div>
      <ol className="space-y-2">
        {cse.annexes.map((a) => (
          <li key={a.id} className="grid gap-2 rounded-lg border p-2 md:grid-cols-[3rem_1fr_5rem_auto] md:items-center">
            <Input type="number" value={a.number} onChange={(e) => patch((c) => ({ ...c, annexes: c.annexes.map((x) => x.id === a.id ? { ...x, number: Number(e.target.value) || 1 } : x) }))} />
            <Input value={a.title} onChange={(e) => patch((c) => ({ ...c, annexes: c.annexes.map((x) => x.id === a.id ? { ...x, title: e.target.value } : x) }))} />
            <Input type="number" value={a.pieces} onChange={(e) => patch((c) => ({ ...c, annexes: c.annexes.map((x) => x.id === a.id ? { ...x, pieces: Number(e.target.value) || 1 } : x) }))} />
            <label className="text-xs"><input type="checkbox" checked={a.present} onChange={(e) => patch((c) => ({ ...c, annexes: c.annexes.map((x) => x.id === a.id ? { ...x, present: e.target.checked } : x) }))} /> dosyada</label>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Step6({ cse, patch }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void }) {
  const options = bentsForMode(cse.evaluation.mode);
  const is4483 = cse.caseType === "on_inceleme_4483";
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">6. Değerlendirme ve teklif</h2>
      <p className="text-xs text-muted-foreground">Teklif dili kullanılır. Ceza ve savunma disiplin amiri/kurulunundur. Daha ağır ceza uydurulmaz.</p>
      {is4483 ? <div className="rounded-xl border bg-muted/40 p-3 text-sm">4483 ayrı hat: teklif soruşturma izni verilmesi veya verilmemesidir (kaymakam/vali). Disiplin saklıdır.</div> : null}
      {cse.actorRole === "disiplin_amiri" ? <div className="rounded-xl border bg-muted/40 p-3 text-sm">Bu görünüm inceleme notudur. Savunma talep yazısı ve ceza kararı bu sihirbazın muhakkik ürünü değildir.</div> : null}
      <div className="flex flex-wrap gap-2">
        {(["A", "B", "C"] as SanctionMode[]).map((m) => (
          <Button key={m} type="button" size="sm" variant={cse.evaluation.mode === m ? "default" : "outline"} onClick={() => patch((c) => ({ ...c, evaluation: { ...c.evaluation, mode: m, selectedBent: m === "A" ? "" : c.evaluation.selectedBent, selectedAlt: m === "A" ? "" : c.evaluation.selectedAlt } }))}>
            {m === "A" ? "A Yumuşat / işlem yok" : m === "B" ? "B Asgari-hafif" : "C Tüm 657 m.125"}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{MODE_NOTES[cse.evaluation.mode]}</p>
      <Field label="Sübut">
        <select className="h-10 w-full rounded-md border bg-background px-3" value={cse.evaluation.subut} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, subut: e.target.value as MuhakkikCase["evaluation"]["subut"] } }))}>
          <option value="">Seçiniz</option>
          <option value="erdi">Sübuta erdi</option>
          <option value="kismi">Kısmen sübuta erdi</option>
          <option value="ermedi">Sübuta ermedi</option>
        </select>
      </Field>
      {cse.evaluation.mode !== "A" && !is4483 ? (
        <div className="space-y-2">
          {options.map((b) => (
            <div key={b.bent} className="rounded-lg border p-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="radio" name="bent" checked={cse.evaluation.selectedBent === b.bent} onChange={() => patch((c) => ({ ...c, evaluation: { ...c.evaluation, selectedBent: b.bent as SanctionBent, selectedAlt: "" } }))} />
                {b.bent} — {b.name}
              </label>
              <p className="mt-1 text-[11px] text-muted-foreground">{b.definition} {b.decision}</p>
              {cse.evaluation.selectedBent === b.bent ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.alts.map((alt) => (
                    <Button key={alt.code} type="button" size="sm" variant={cse.evaluation.selectedAlt === alt.code ? "default" : "outline"} onClick={() => patch((c) => ({ ...c, evaluation: { ...c.evaluation, selectedAlt: alt.code } }))}>{alt.code}</Button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Disiplin yönü"><Textarea className="min-h-24" value={cse.evaluation.disiplin} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, disiplin: e.target.value } }))} /></Field>
        <Field label="Adli yön"><Textarea className="min-h-24" value={cse.evaluation.adli} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, adli: e.target.value } }))} /></Field>
        <Field label="İdari yön"><Textarea className="min-h-24" value={cse.evaluation.idari} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, idari: e.target.value } }))} /></Field>
        <Field label="Mali yön"><Textarea className="min-h-24" value={cse.evaluation.mali} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, mali: e.target.value } }))} /></Field>
      </div>
      <Field label="Teklif metni (karar değil)"><Textarea className="min-h-24" value={cse.evaluation.teklif} onChange={(e) => patch((c) => ({ ...c, evaluation: { ...c.evaluation, teklif: e.target.value } }))} /></Field>
    </div>
  );
}

export function Step7({ cse, patch }: { cse: MuhakkikCase; patch: (fn: (c: MuhakkikCase) => MuhakkikCase) => void }) {
  const r = cse.report;
  return (
    <div className="space-y-3">
      <h2 className="font-semibold">7. {cse.actorRole === "mufettis" ? "Soruşturma Raporu" : cse.actorRole === "disiplin_amiri" ? "İnceleme notu" : "Muhakkik Raporu"}</h2>
      <p className="text-xs text-muted-foreground">Bölümler DMDY m.29/3 ve TKB 17/2 başlıklarıdır. Düzenleyip yazdırın.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => patch((c) => ({ ...c, report: draftReport(c) }))}>Taslağı yeniden üret</Button>
        <Button type="button" size="sm" onClick={() => printRapor(cse.report.giris ? cse : { ...cse, report: draftReport(cse) })}>Raporu yazdır</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => printDosya({ ...cse, report: cse.report.giris ? cse.report : draftReport(cse) })}>Tüm dosyayı yazdır</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => printDiziPusulasi(cse)}>Dizi pusulası</Button>
      </div>
      <Field label="1. Giriş bilgileri"><Textarea className="min-h-32" value={r.giris} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, giris: e.target.value } }))} /></Field>
      <Field label="2. Maddi delil ve belgeler"><Textarea className="min-h-28" value={r.maddiDelil} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, maddiDelil: e.target.value } }))} /></Field>
      <Field label="3. İfade ve bilgisine başvurulanlar"><Textarea className="min-h-28" value={r.ifadeler} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, ifadeler: e.target.value } }))} /></Field>
      <Field label="4. Konuya ilişkin mevzuat"><Textarea className="min-h-28" value={r.mevzuat} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, mevzuat: e.target.value } }))} /></Field>
      <Field label="5. Değerlendirme ve kanaat"><Textarea className="min-h-32" value={r.degerlendirme} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, degerlendirme: e.target.value } }))} /></Field>
      <Field label="6. Sonuç ve teklif"><Textarea className="min-h-32" value={r.sonucTeklif} onChange={(e) => patch((c) => ({ ...c, report: { ...c.report, sonucTeklif: e.target.value } }))} /></Field>
    </div>
  );
}
