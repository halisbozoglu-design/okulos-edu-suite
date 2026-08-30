import {
  CASE_TYPES,
  formatTr,
  personKindLabel,
  reportTitleFor,
  sortPeople,
  type MuhakkikCase,
} from "./types";
import { bentLabel } from "./sanctions";

function caseTypeLabel(cse: MuhakkikCase): string {
  return CASE_TYPES.find((x) => x.id === cse.caseType)?.label ?? cse.caseType;
}

export function draftReport(cse: MuhakkikCase): MuhakkikCase["report"] {
  const people = sortPeople(cse.people);
  const accused = people.filter((p) => p.kind === "itham_edilen");
  const complainants = people.filter((p) => p.kind === "sikayetci");
  const witnesses = people.filter((p) => p.kind === "tanik");
  const ev = cse.evaluation;
  const bent = ev.selectedAlt || ev.selectedBent ? bentLabel(ev.selectedAlt || ev.selectedBent) : "";
  const is4483 = cse.caseType === "on_inceleme_4483";

  const giris = `İlgi (b)'de kayıtlı görevlendirme emri ekinde yer alan İlgi (a)'da kayıtlı Makam Oluru gereğince; ${accused.map((p) => `${p.school || ""} ${p.title || ""} ${p.fullName}`.trim()).join(" ve ") || "ilgili personel"} hakkında yürütülen ${caseTypeLabel(cse)} çalışmaları gerçekleştirilmiş olup, tespit edilen hususlar aşağıda açıklanmıştır.\n\n1.1. İnceleme/Soruşturmanın Konusu:\n${cse.subject || "…"}\n\nİddialar:\n${cse.claims || "…"}\n\n1.2. İnceleme/Soruşturma Sürecinde Gerçekleştirilen İş Ve İşlemler\nGörevlendirme no: ${cse.gorevlendirmeNo || "…"}  tarih: ${formatTr(cse.gorevlendirmeTarih)}.\nMuhakkik: ${cse.muhakkikAdi || "…"} (${cse.muhakkikUnvan || "Muhakkik"}).\nYüklenen belgeler: ${cse.files.map((f) => f.name).join(", ") || "—"}.\nİfadesine başvurulanlar: şikâyetçi ${complainants.length}, tanık ${witnesses.length}, itham edilen ${accused.length} (itham edilen en sonda dinlenir).\n${is4483 ? "Bu dosya 4483 sayılı Kanun kapsamında ön inceleme hattıdır; sonuç ürünü soruşturma izni verilmesi veya verilmemesi teklifidir. Disiplin hükümleri saklıdır." : "Muhakkik savunma istemez ve ceza vermez; DMDY m.29 uyarınca rapor ve teklif düzenler."}`;

  const maddiDelil = cse.annexes.length
    ? cse.annexes
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((a) => `${a.number}. ${a.title} (${a.pieces || 1} parça)${a.present ? "" : " — henüz dosyaya girmemiştir"}`)
      .join("\n")
    : `Alınıp değerlendirildikten sonra rapora ek yapılacak belgeler dizi pusulasında gösterilecektir. Görevlendirme emrinden başlayarak sıra: olur, bilgi-belge, çağrı, ifade tutanakları, ispat belgeleri, ${reportTitleFor(cse.actorRole).toLocaleLowerCase("tr-TR")}, dizi pusulası.`;

  const ifadeler = people.length
    ? people
      .map((p, i) => {
        const st = cse.statements.find((s) => s.personId === p.id);
        const answered = st ? st.questions.filter((q) => (st.answers[q.id] ?? "").trim()).length : 0;
        const total = st?.questions.length ?? 0;
        const summary = st
          ? st.questions
            .map((q) => (st.answers[q.id] ?? "").trim())
            .filter(Boolean)
            .slice(0, 2)
            .join(" ")
          : "";
        return `${i + 1}. ${p.title || personKindLabel(p.kind)} ${p.fullName}${p.school ? ` (${p.school})` : ""} — ${personKindLabel(p.kind)}; ${answered}/${total} soru cevaplı.${summary ? ` Özet: ${summary.slice(0, 400)}` : ""}`;
      })
      .join("\n")
    : "İfadesine başvurulan bulunmamaktadır.";

  const mevzuat = is4483
    ? `Hukuka uygunluk değerlendirmesinde esas alınan mevzuat:\n4.1. 4483 sayılı Memurlar ve Diğer Kamu Görevlilerinin Yargılanması Hakkında Kanun (ön inceleme; izin mercii ilçede kaymakam, il/merkez ilçede vali),\n4.2. 657 sayılı Devlet Memurları Kanunu (disiplin hükümleri saklıdır),\n4.3. 5237 sayılı Türk Ceza Kanunu (görev sebebiyle işlenen suç iddiası halinde),\n4.4. Fiil tarihindeki diğer ilgili mevzuat.\n\nÖn inceleme süresi: öğrenmeden itibaren en geç 30 gün (+ zorunlu halde bir kez 15 gün uzatma) (4483 m.7).`
    : `Hukuka uygunluk değerlendirmesinde esas alınan mevzuat:\n4.1. 657 sayılı Devlet Memurları Kanunu (m.124–135; disiplin cezaları m.125 A–E),\n4.2. Devlet Memurları Disiplin Yönetmeliği (muhakkik usulü m.28–30; savunma m.30 — disiplin amiri ister),\n4.3. Millî Eğitim Bakanlığı Disiplin Amirleri Yönetmeliği,\n4.4. Fiil tarihindeki diğer ilgili mevzuat (yönetici-öğretmen ek ders kararı, 5018 sayılı Kanun vb. iddia bağlamına göre).\n\nZamanaşımı (657 m.127): uyarma–kınama–aylıktan kesme–kademe için öğrenmeden 1 ay içinde soruşturmaya başlanmalı; çıkarmada 6 ay. Fiilden en geç 2 yıl içinde ceza verilmelidir.`;

  const yon = [
    ev.disiplin && `Disiplin yönünden: ${ev.disiplin}`,
    ev.adli && `Adli yönden: ${ev.adli}`,
    ev.idari && `İdari yönden: ${ev.idari}`,
    ev.mali && `Mali yönden: ${ev.mali}`,
  ].filter(Boolean).join("\n\n");

  const degerlendirme = `İddialar ${ev.subut === "erdi" ? "sübuta ermiştir" : ev.subut === "ermedi" ? "sübuta ermemiştir" : ev.subut === "kismi" ? "kısmen sübuta ermiştir" : "sübut yönünden değerlendirilecektir"}.\n\n${yon || "Her iddia disiplin / adli / idari / mali yönlerden ayrı ayrı değerlendirilir (2017 Standartlar usul m. tahlil-münakaşa)."}\n\nTeklif modu: ${ev.mode === "A" ? "A — yumuşat / işlem yok" : ev.mode === "B" ? "B — asgari-hafif (uyarma/kınama mümkünse)" : "C — 657 m.125 tüm seçenekler, kullanıcı seçimi"}.\n${bent ? `Dayanak bent: ${bent}.` : ""}\nÖlçülülük esastır; benzer nitelikteki eylemler aynı neviden cezaya bağlanabilir. Tekerrürde bir derece ağır, olumlu sicilde bir derece hafif ceza uygulanabilir. Daha ağır ceza uydurulmaz.`;

  const accusedLine = accused.map((p) => `${p.title || ""} ${p.fullName}${p.tckn ? ` (T.C. Kimlik No: ${p.tckn})` : ""}`.trim()).join("; ");

  let sonuc: string;
  if (is4483) {
    sonuc = `Raporun önceki bölümlerinde açıklandığı üzere,\n${cse.claims || "iddialar"} bakımından ${ev.subut === "erdi" ? "ön inceleme neticesinde soruşturma izni verilmesi" : ev.subut === "ermedi" ? "soruşturma izni verilmemesi" : "izin merciinin takdirine sunulacak hususlar"} teklif olunur.\n\nYetkili merci: ilçede kaymakam, il/merkez ilçede vali (4483 m.3).\nDisiplin soruşturması saklıdır.\n\n${ev.teklif || ""}\n\nYönündeki teklifimizi arz ederiz.`;
  } else if (ev.mode === "A" || ev.subut === "ermedi") {
    sonuc = `Raporun önceki bölümlerinde açıklandığı üzere,\n«${cse.subject || "iddia"}» ${ev.subut === "ermedi" ? "sübuta ermediğinden" : "yaptırım uygulanmasını gerektirir kesinliğe ulaşmadığından"} herhangi bir işlem tayinine yer olmadığı,\n\nyönündeki teklifimizi arz ederiz.\n\nMuhakkik ceza vermez; karar disiplin amiri / kurulundadır. Savunma, soruşturmanın son aşamasında disiplin amiri tarafından istenir (DMDY m.30).`;
  } else {
    const cezaTeklif = bent
      ? `${accusedLine || "ilgili personel"} hakkında ${bent} uyarınca işlem tesis edilmesi TEKLİF olunur`
      : `${accusedLine || "ilgili personel"} hakkında 657 sayılı Kanun'un 125 inci maddesi çerçevesinde disiplin amirinin/kurulun takdirine uygun ceza TEKLİF olunur`;
    sonuc = `Raporun önceki bölümlerinde açıklandığı üzere,\n\n${cezaTeklif}.\n\na) DİSİPLİN YÖNÜNDEN: ${ev.disiplin || (bent ? `${bent} kapsamında teklif` : "işlem tayinine yer olup olmadığı takdirde belirtilir")}. Karar mercii: uyarma/kınama/aylıktan kesme için disiplin amiri; kademe için disiplin kurulu; çıkarma için yüksek disiplin kurulu. Muhakkik karar vermez.\nb) ADLİ YÖNDEN: ${ev.adli || "Görev sebebiyle suç iddiası varsa 4483 kapsamında izin mercie bildirim değerlendirilir; aksi halde işlem tayinine yer olmadığı."}\nc) İDARİ YÖNDEN: ${ev.idari || "Kamu yararı / hizmet gereği idari tedbir gerekip gerekmediği."}\nd) MALİ YÖNDEN: ${ev.mali || "Kamu zararı / iade / 5018 değerlendirmesi."}\n\n${ev.teklif || ""}\n\nYönündeki tekliflerimizi arz ederiz.`;
  }

  return { giris, maddiDelil, ifadeler, mevzuat, degerlendirme, sonucTeklif: sonuc };
}
