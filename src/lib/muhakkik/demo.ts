import { draftReport } from "./report";
import { targetedQuestions } from "./questions";
import { emptyCase, uid, type MuhakkikCase, type Person } from "./types";

export function demoCase(): MuhakkikCase {
  const sikayetci: Person = {
    id: uid(),
    kind: "sikayetci",
    fullName: "Ayşe KAYA",
    title: "Öğretmen",
    school: "Gazi Anadolu Lisesi",
    tckn: "",
    phone: "",
    address: "",
  };
  const tanik: Person = {
    id: uid(),
    kind: "tanik",
    fullName: "Mehmet DEMİR",
    title: "Öğretmen",
    school: "Gazi Anadolu Lisesi",
    tckn: "",
    phone: "",
    address: "",
  };
  const itham: Person = {
    id: uid(),
    kind: "itham_edilen",
    fullName: "Ali YILDIZ",
    title: "Okul Müdürü",
    school: "Gazi Anadolu Lisesi",
    tckn: "",
    phone: "",
    address: "",
  };

  let cse = emptyCase({
    actorRole: "muhakkik",
    caseType: "disiplin",
    gorevlendirmeNo: "2026/142",
    gorevlendirmeTarih: "2026-03-03",
    olurNo: "2026/88",
    olurTarih: "2026-02-24",
    makam: "…… İlçe Millî Eğitim Müdürlüğü",
    muhakkikAdi: "Halis BOZOĞLU",
    muhakkikUnvan: "Okul Müdürü / Muhakkik",
    valilik: "…… KAYMAKAMLIĞI",
    mudurluk: "…… İlçe Millî Eğitim Müdürlüğü",
    muhatap: "…… İLÇE MİLLÎ EĞİTİM MÜDÜRLÜĞÜNE",
    sureGun: "20",
    subject: "Gazi Anadolu Lisesi Müdürü Ali YILDIZ'ın Mayıs 2025 döneminde 15 gün yıllık izinde olduğu halde ek ders ücreti aldığı iddiası",
    claims:
      "Gazi Anadolu Lisesi Öğretmeni Ayşe KAYA'nın 10.02.2026 tarihli şikâyet dilekçesinde; Okul Müdürü Ali YILDIZ'ın Mayıs 2025 döneminde 15 gün yıllık izinde olduğu halde ek ders ücretini tam aldığı iddia edilmiştir.",
    suggestedBents: ["D-c"],
    files: [
      { id: uid(), name: "Şikâyet dilekçesi — Ayşe KAYA.pdf", note: "10.02.2026" },
      { id: uid(), name: "Makam oluru 2026/88.pdf", note: "24.02.2026" },
      { id: uid(), name: "Görevlendirme emri 2026/142.pdf", note: "03.03.2026" },
    ],
    people: [sikayetci, tanik, itham],
    annexes: [
      { id: uid(), number: 1, title: "Görevlendirme emri", pieces: 1, present: true, notes: "" },
      { id: uid(), number: 2, title: "Makam oluru ve dilekçe eki", pieces: 2, present: true, notes: "" },
      { id: uid(), number: 3, title: "Yıllık izin kayıtları (Mayıs 2025)", pieces: 1, present: true, notes: "" },
      { id: uid(), number: 4, title: "Mayıs 2025 ek ders ücret onay çizelgesi", pieces: 1, present: false, notes: "Okuldan istenecek" },
    ],
    evaluation: {
      mode: "B",
      selectedBent: "B",
      selectedAlt: "B-a",
      subut: "erdi",
      disiplin:
        "İzinli olunan günde ek ders tahakkuku 657 m.125 çerçevesinde değerlendirilir. Demo dosyasında asgari-hafif mod seçilmiştir: kusurlu işlem teklifi kınama (B) ile sınırlı tutulmuş, daha ağır ceza uydurulmamıştır. Karar disiplin amirinindir.",
      adli: "Görev sebebiyle suç şüphesi ayrıca 4483 ön incelemesine konu edilebilir; bu demo dosyasında adli teklif için işlem tayinine yer olmadığı yazılmıştır.",
      idari: "Hizmetin gereği bakımından ayrıca idari tedbir gerekmediği değerlendirilmiştir.",
      mali: "Fazla ödenen ek ders ücretinin yasal faizi ile iadesi; 5018 kamu zararı boyutu ilgili mal müdürlüğüne bildirilebilir.",
      teklif:
        "Sübut bulan kusurlu işlem nedeniyle 657 m.125/B (kınama) teklif olunur. Muhakkik ceza vermez; savunma disiplin amiri tarafından istenir.",
    },
    currentStep: 0,
  });

  cse = {
    ...cse,
    statements: [sikayetci, tanik, itham].map((p) => {
      const questions = targetedQuestions(p.kind, cse, p);
      const texts =
        p.kind === "sikayetci"
          ? [
              "Ayşe KAYA, Gazi Anadolu Lisesi öğretmeniyim.",
              "Müdür Ali YILDIZ'ın Mayıs 2025'te yıllık izindeyken ek ders ücretini tam aldığını gördüm.",
              "Mayıs 2025, okul; ek ders listesi Haziran başında panoya asıldı.",
              "Listeyi bizzat gördüm.",
              "İzinli olduğu halde tam ücret yazıldığını fark ettim, müdürü uyardım.",
              "Öğretmen Mehmet DEMİR odadayken konuşmaya şahit oldu.",
              "Ek ders listesinin fotoğrafı telefonda duruyor.",
              "İlçe MEM'e 10.02.2026 tarihli dilekçe verdim.",
              "Husumet yoktur; resmi şikâyettir.",
              "Başka hususum yoktur.",
            ]
          : p.kind === "tanik"
            ? [
                "Mehmet DEMİR, aynı okulda öğretmenim.",
                "Şikâyetçi ve müdür ile mesai arkadaşlığı dışında husumetim yoktur.",
                "Müdür odasında Ayşe KAYA'nın izinli ek ders uyarısını duydum.",
                "Müdür 'yanlışlık varsa düzeltiriz' dedi; iade yapılıp yapılmadığını bilmiyorum.",
                "Başka tanık hatırlamıyorum.",
                "Baskı görmedim.",
                "Yoktur.",
                "Yoktur.",
              ]
            : [
                "Ali YILDIZ, Gazi Anadolu Lisesi müdürüyüm.",
                "Evet, görevlendirme emrini tebellüğ ettim.",
                "Mayıs 2025'te 15 gün yıllık izin kullandım; ek dersin kesilmesi gerektiğini sonradan anladım.",
                "Kasıt olmadığını, sehven yapıldığını beyan ederim; iddiayı kısmen kabul ederim.",
                "Çizelgeyi müdür yardımcısı hazırladı, ben onayladım.",
                "Tanık olarak okul memurunun dinlenmesini isterim.",
                "İzin evrakı ve iade dekontunu sunacağım.",
                "Zamanaşımı itirazım yoktur.",
                "Yeni fiil bildirmiyorum.",
                "Yoktur.",
              ];
      const answers: Record<string, string> = {};
      questions.forEach((q, i) => {
        if (texts[i]) answers[q.id] = texts[i];
      });
      return {
        personId: p.id,
        date: "2026-03-18",
        time: p.kind === "itham_edilen" ? "14:00" : p.kind === "tanik" ? "11:00" : "10:00",
        place: "…… İlçe MEM toplantı salonu",
        questions,
        answers,
      };
    }),
  };

  cse.report = draftReport(cse);
  cse.missingDocs = cse.missingDocs.map((d) => {
    if (d.label.startsWith("Görevlendirme") || d.label.startsWith("Makam") || d.label.startsWith("Şikâyet")) {
      return { ...d, received: true };
    }
    if (d.label.includes("İzin")) return { ...d, requested: true, received: true };
    if (d.label.includes("Bilgi-belge")) return { ...d, requested: true, received: false, notes: "Ek ders çizelgesi bekleniyor" };
    return d;
  });
  return cse;
}
