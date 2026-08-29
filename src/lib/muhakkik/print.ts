import { CASE_TYPES, formatTr, personKindLabel, reportTitleFor, signerTitle, type MuhakkikCase, type Person } from "./types";
import { bentLabel } from "./sanctions";

export function escapeHtml(s: string): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function nl(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br/>");
}

function caseTypeLabel(cse: MuhakkikCase): string {
  return CASE_TYPES.find((x) => x.id === cse.caseType)?.label ?? cse.caseType;
}

export function officialHeader(cse: MuhakkikCase): string {
  const vil = escapeHtml(cse.valilik || "........................ VALİLİĞİ / KAYMAKAMLIĞI");
  const mud = escapeHtml(cse.mudurluk || "........................ Müdürlüğü");
  return `<div class="tc">T.C.</div><div class="org">${vil}</div><div class="org">${mud}</div>`;
}

const PRINT_CSS = `@page { size: A4; margin: 18mm 16mm 18mm 20mm; } html, body { background: #fff; color: #000; } body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.45; margin: 0; } .tc { text-align: center; font-weight: 700; letter-spacing: .16em; } .org { text-align: center; font-weight: 700; } .doc-title { text-align: center; font-weight: 700; margin: 16px 0 12px; text-decoration: underline; } .meta { display: flex; justify-content: space-between; margin: 8px 0 16px; } .just { text-align: justify; } .sign-wrap { margin-top: 48px; display: flex; justify-content: space-between; gap: 24px; } .sign { width: 240px; text-align: center; } .sign .line { margin-top: 56px; } table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; } th, td { border: 1px solid #000; padding: 5px 7px; vertical-align: top; } th { background: #f3f3f3; font-size: 11pt; } .ek { text-align: right; font-size: 10pt; margin-top: 8px; } .small { font-size: 10pt; } h2 { font-size: 13pt; margin: 18px 0 8px; } .page-break { page-break-before: always; } .note { font-size: 10pt; font-style: italic; }`;

export function printHtml(title: string, body: string): void {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.open();
  w.document.write(`<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`);
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 250);
}

function ilgi(cse: MuhakkikCase): string {
  const rows = [
    cse.olurNo || cse.olurTarih ? `a) ${escapeHtml(cse.makam || "Makam")}ın ${formatTr(cse.olurTarih)} tarihli ve ${escapeHtml(cse.olurNo || "…")} sayılı inceleme/soruşturma Oluru.` : "",
    `b) ${escapeHtml(cse.makam || "…… Müdürlüğü")}nün ${formatTr(cse.gorevlendirmeTarih)} tarihli ve ${escapeHtml(cse.gorevlendirmeNo || "…")} sayılı görevlendirme emri.`,
  ].filter(Boolean);
  return `<p><b>İlgi</b>:</p><p>${rows.join("<br/>")}</p>`;
}

function isoOrToday(cse: MuhakkikCase): string {
  return cse.updatedAt?.slice(0, 10) || cse.gorevlendirmeTarih;
}

export function printCagriKagidi(cse: MuhakkikCase, person: Person): void {
  const st = cse.statements.find((s) => s.personId === person.id);
  const body = `${officialHeader(cse)}<div class="meta"><span>Sayı: ${escapeHtml(cse.gorevlendirmeNo || "…")}</span><span>${formatTr(st?.date || cse.gorevlendirmeTarih)}</span></div><div class="doc-title">ÇAĞRI KÂĞIDI</div><p class="just">${escapeHtml(person.fullName || "…………")} (${escapeHtml(person.title || personKindLabel(person.kind))})${person.school ? ` — ${escapeHtml(person.school)}` : ""}</p>${ilgi(cse)}<p class="just">İlgi yazılar gereğince yürütülen <b>${escapeHtml(caseTypeLabel(cse))}</b> kapsamında, ${escapeHtml(cse.subject || "soruşturma konusu")} hakkında ifadenize başvurulacaktır.</p><p>Tarih: <b>${formatTr(st?.date || "")}</b> &nbsp; Saat: <b>${escapeHtml(st?.time || "…")}</b></p><p>Yer: <b>${escapeHtml(st?.place || cse.mudurluk || "…")}</b></p><p class="just">Belirtilen gün ve saatte yukarıdaki adreste hazır bulunmanızı, mazeretiniz halinde durumu yazılı olarak bildirmenizi rica ederim.</p><p class="small note">İşbu çağrı, tebliğ-tebellüğ belgesi ile dosyaya bağlanır. 18 yaşından küçüklerde gerektiğinde rehber öğretmen bulundurulur.</p><div class="sign-wrap"><div></div><div class="sign"><div class="line">İmza</div><div><b>${escapeHtml(cse.muhakkikAdi || "Adı SOYADI")}</b></div><div>${escapeHtml(signerTitle(cse.actorRole))}</div></div></div>`;
  printHtml("Çağrı Kâğıdı", body);
}

export function printIfadeTutanagi(cse: MuhakkikCase, person: Person): void {
  const st = cse.statements.find((s) => s.personId === person.id);
  const qs = (st?.questions ?? []).map((qn, i) => {
    const ans = (st?.answers[qn.id] ?? "").trim();
    return `<p><b>Soru ${i + 1} —</b> ${escapeHtml(qn.text)}</p><p class="just"><b>Cevap:</b> ${ans ? nl(ans) : "………………………………………………………………"}</p>`;
  }).join("");
  const body = `${officialHeader(cse)}<div class="ek">Ek sıra no: ……</div><div class="doc-title">${escapeHtml(personKindLabel(person.kind).toLocaleUpperCase("tr-TR"))} İFADE TUTANAĞI</div><p>Tarih: ${formatTr(st?.date || "")} &nbsp; Saat: ${escapeHtml(st?.time || "…")} &nbsp; Yer: ${escapeHtml(st?.place || "…")}</p><table><tr><th>Adı SOYADI</th><td>${escapeHtml(person.fullName)}</td></tr><tr><th>Unvan / görev</th><td>${escapeHtml(person.title)}</td></tr><tr><th>Kurum</th><td>${escapeHtml(person.school)}</td></tr><tr><th>T.C. Kimlik No</th><td>${escapeHtml(person.tckn)}</td></tr><tr><th>Telefon / adres</th><td>${escapeHtml([person.phone, person.address].filter(Boolean).join(" — "))}</td></tr><tr><th>Sıfat</th><td>${escapeHtml(personKindLabel(person.kind))}</td></tr></table><p class="just">657 sayılı Kanun ve Devlet Memurları Disiplin Yönetmeliği hükümleri ile CMK kimlik/usul esasları hatırlatılarak, ${escapeHtml(cse.subject || "soruşturma konusu")} hakkında aşağıdaki sorular yöneltilmiş ve alınan cevaplar aynen yazılmıştır. Bu tutanak ifade tutanağıdır; savunma talep yazısı değildir.</p>${qs}<p class="just">İşbu tutanak huzurumuzda okunarak imza altına alınmıştır.</p><div class="sign-wrap"><div class="sign"><div class="line">İmza</div><div>İfade veren</div><div><b>${escapeHtml(person.fullName || "Adı SOYADI")}</b></div></div><div class="sign"><div class="line">İmza</div><div>${escapeHtml(signerTitle(cse.actorRole))}</div><div><b>${escapeHtml(cse.muhakkikAdi || "Adı SOYADI")}</b></div></div></div>`;
  printHtml("İfade Tutanağı", body);
}

export function printBilgiBelge(cse: MuhakkikCase): void {
  const wanted = cse.missingDocs.filter((d) => d.requested && !d.received);
  const list = (wanted.length ? wanted : cse.missingDocs).map((d) => `<li>${escapeHtml(d.label)}${d.notes ? ` (${escapeHtml(d.notes)})` : ""}</li>`).join("");
  const body = `${officialHeader(cse)}<div class="meta"><span>Sayı: ${escapeHtml(cse.gorevlendirmeNo || "…")}</span><span>${formatTr(isoOrToday(cse))}</span></div><p><b>Konu:</b> Bilgi ve belge isteği</p><p><b>${escapeHtml(cse.muhatap || "........................ MÜDÜRLÜĞÜNE")}</b></p>${ilgi(cse)}<p class="just">İlgi yazılar gereğince yürütülen <b>${escapeHtml(caseTypeLabel(cse))}</b> (${escapeHtml(cse.subject || "…")}) kapsamında, aşağıdaki bilgi ve belgelerin onaylı örneklerinin <b>en kısa sürede</b> Muhakkikliğimize gönderilmesi hususunda gereğini arz/rica ederim.</p><ol>${list}</ol><p class="small">DMDY m.29/4: Atıf yapılan belgelerin asıl veya onaylı örneği eklenir; her sayfa numaralandırılır.</p><div class="sign-wrap"><div></div><div class="sign"><div class="line">İmza</div><div><b>${escapeHtml(cse.muhakkikAdi || "Adı SOYADI")}</b></div><div>${escapeHtml(signerTitle(cse.actorRole))}</div></div></div>`;
  printHtml("Bilgi-Belge İstek Yazısı", body);
}

export function diziPusulasiTable(cse: MuhakkikCase): string {
  const rows = cse.annexes.length
    ? cse.annexes.slice().sort((a, b) => a.number - b.number).map((a) => `<tr><td>${a.number}</td><td>${a.pieces || 1}</td><td>${escapeHtml(a.title)}${a.present ? "" : " (eksik)"}</td></tr>`).join("")
    : `<tr><td>1</td><td>1</td><td>Görevlendirme emri</td></tr><tr><td>2</td><td>1</td><td>Makam oluru ve ekleri</td></tr>`;
  const total = cse.annexes.reduce((n, a) => n + (a.pieces || 1), 0);
  return `<div class="doc-title">DİZİ PUSULASI</div><table><thead><tr><th>Sıra no</th><th>Parça</th><th>Açıklama</th></tr></thead><tbody>${rows}</tbody></table><p>Toplam ek: ${cse.annexes.length || "…"} &nbsp; Toplam parça/sayfa: ${total || "…"}</p><p class="small">Sayılar kapak ve dosya ile birebir uyumlu olmalıdır (2017 Rapor İnceleme Standartları şekil m.7, m.10).</p>`;
}

export function printDiziPusulasi(cse: MuhakkikCase): void {
  printHtml("Dizi Pusulası", `${officialHeader(cse)}${diziPusulasiTable(cse)}`);
}

export function printRapor(cse: MuhakkikCase): void {
  const r = cse.report;
  const ev = cse.evaluation;
  const title = reportTitleFor(cse.actorRole);
  const body = `${officialHeader(cse)}<div class="meta"><span>Sayı: ${escapeHtml(cse.gorevlendirmeNo || "…../….")}</span><span>${formatTr(isoOrToday(cse))}</span></div><p><b>Konu:</b> ${escapeHtml(cse.subject || "…")}</p><p><b>${escapeHtml((cse.muhatap || cse.makam || "........................ MÜDÜRLÜĞÜNE").toLocaleUpperCase("tr-TR"))}</b></p>${ilgi(cse)}<div class="doc-title">${escapeHtml(title)}</div><p class="small note">DMDY m.29/3 zorunlu bölümler. Muhakkik savunma istemez ve ceza vermez; yalnız teklif eder.${cse.caseType === "on_inceleme_4483" ? " 4483 ön incelemesi ayrı hattır; sonuç soruşturma izni verilmesi/verilmemesidir." : ""}</p><h2>1. GİRİŞ BİLGİLERİ</h2><div class="just">${nl(r.giris) || "…"}</div><h2>2. MADDİ DELİL VE BELGELER</h2><div class="just">${nl(r.maddiDelil) || "…"}</div><h2>3. İFADE ve BİLGİSİNE BAŞVURULANLAR</h2><div class="just">${nl(r.ifadeler) || "…"}</div><h2>4. KONUYA İLİŞKİN MEVZUAT</h2><div class="just">${nl(r.mevzuat) || "…"}</div><h2>5. DEĞERLENDİRME ve KANAAT</h2><div class="just">${nl(r.degerlendirme) || "…"}</div><p class="small">Seçilen teklif çerçevesi: mod ${escapeHtml(ev.mode)}${ev.selectedBent ? ` · ${escapeHtml(bentLabel(ev.selectedAlt || ev.selectedBent))}` : ""} · sübut: ${escapeHtml(ev.subut || "—")}</p><h2>6. SONUÇ ve TEKLİF</h2><div class="just">${nl(r.sonucTeklif) || nl(ev.teklif) || "…"}</div><p class="just">Yönündeki tekliflerimizi arz ederiz. ${formatTr(isoOrToday(cse))}</p><div class="sign-wrap"><div></div><div class="sign"><div class="line">İmza</div><div><b>${escapeHtml(cse.muhakkikAdi || "Adı SOYADI")}</b></div><div>${escapeHtml(signerTitle(cse.actorRole))}</div></div></div><p class="ek">Ek: Dizi Pusulasına Bağlı Ekler</p><div class="page-break">${officialHeader(cse)}${diziPusulasiTable(cse)}</div>`;
  printHtml(title, body);
}

export function printDosya(cse: MuhakkikCase): void {
  const extra = cse.people.map((p) => {
    const st = cse.statements.find((s) => s.personId === p.id);
    const qs = (st?.questions ?? []).map((qn, i) => `<p><b>Soru ${i + 1} —</b> ${escapeHtml(qn.text)}</p><p><b>Cevap:</b> ${nl(st?.answers[qn.id] || "…")}</p>`).join("");
    return `<div class="page-break">${officialHeader(cse)}<div class="doc-title">${escapeHtml(personKindLabel(p.kind).toLocaleUpperCase("tr-TR"))} İFADE TUTANAĞI</div><p>${escapeHtml(p.fullName)} · ${escapeHtml(p.title)} · ${escapeHtml(p.school)}</p>${qs}</div>`;
  }).join("");
  const r = cse.report;
  const title = reportTitleFor(cse.actorRole);
  const body = `${officialHeader(cse)}<div class="doc-title">${escapeHtml(title)} — DOSYA</div><h2>1. GİRİŞ BİLGİLERİ</h2><div class="just">${nl(r.giris)}</div><h2>2. MADDİ DELİL VE BELGELER</h2><div class="just">${nl(r.maddiDelil)}</div><h2>3. İFADE ve BİLGİSİNE BAŞVURULANLAR</h2><div class="just">${nl(r.ifadeler)}</div><h2>4. KONUYA İLİŞKİN MEVZUAT</h2><div class="just">${nl(r.mevzuat)}</div><h2>5. DEĞERLENDİRME ve KANAAT</h2><div class="just">${nl(r.degerlendirme)}</div><h2>6. SONUÇ ve TEKLİF</h2><div class="just">${nl(r.sonucTeklif || cse.evaluation.teklif)}</div><div class="sign-wrap"><div></div><div class="sign"><div class="line">İmza</div><div><b>${escapeHtml(cse.muhakkikAdi || "Adı SOYADI")}</b></div><div>${escapeHtml(signerTitle(cse.actorRole))}</div></div></div><div class="page-break">${officialHeader(cse)}${diziPusulasiTable(cse)}</div>${extra}`;
  printHtml("Soruşturma Dosyası", body);
}
