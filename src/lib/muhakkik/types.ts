export const STORAGE_KEY = "okulos-muhakkik-cases-v1";

export type ActorRole = "muhakkik" | "mufettis" | "disiplin_amiri";
export type CaseType = "disiplin" | "inceleme" | "on_inceleme_4483";
export type PersonKind = "sikayetci" | "tanik" | "itham_edilen";
export type SanctionMode = "A" | "B" | "C";
export type SanctionBent = "A" | "B" | "C" | "D" | "E" | "";

export const ACTOR_ROLES: { id: ActorRole; label: string; note: string; reportTitle: string }[] = [
  {
    id: "muhakkik",
    label: "Muhakkik / okul müdürü",
    note: "Varsayılan. Ürün: TKB Örnek 17 Muhakkik Raporu + kapak. Savunma talep yazısı ve ceza kararı muhakkikin değildir (DMDY m.30; 657 m.126/130).",
    reportTitle: "MUHAKKİK RAPORU",
  },
  {
    id: "mufettis",
    label: "Eğitim müfettişi",
    note: "Ürün: TKB Örnek 16 Soruşturma Raporu (Eğitim Müfettişliği Başkanlıkları belge seti). Muhakkik Raporu değildir.",
    reportTitle: "SORUŞTURMA RAPORU",
  },
  {
    id: "disiplin_amiri",
    label: "Disiplin amiri",
    note: "Savunma ve ceza disiplin amirinindir; muhakkik bunları imzalamaz. Bu görünüm inceleme notu içindir, karar mercii rolünü karıştırmaz.",
    reportTitle: "DİSİPLİN AMİRİ İNCELEME NOTU",
  },
];

export const CASE_TYPES: { id: CaseType; label: string; note: string }[] = [
  { id: "disiplin", label: "Disiplin soruşturması", note: "657 + DMDY. Sonuç ürünü muhakkik/soruşturma raporu ve disiplin teklifidir; karar amir/kuruldadır." },
  { id: "inceleme", label: "İnceleme", note: "İdari/mali/usul tespiti. Her zaman ceza teklifi taşımayabilir." },
  { id: "on_inceleme_4483", label: "Ön inceleme (4483)", note: "Ayrı hat. Amaç: kaymakam/valiye soruşturma izni verilmesi veya verilmemesi. Disiplin hükümleri saklıdır (4483 m.2)." },
];

export const PERSON_KINDS: { id: PersonKind; label: string; orderHint: number }[] = [
  { id: "sikayetci", label: "Şikâyetçi / muhbir", orderHint: 1 },
  { id: "tanik", label: "Tanık", orderHint: 2 },
  { id: "itham_edilen", label: "İtham / şikâyet edilen", orderHint: 3 },
];

export const STEPS = [
  { n: 0, title: "Dosya bilgileri", short: "Kimlik" },
  { n: 1, title: "Belgeler ve iddia", short: "Dosya" },
  { n: 2, title: "Kişiler ve ifade sırası", short: "Kişiler" },
  { n: 3, title: "Sorular, çağrı ve tutanak", short: "Sorular" },
  { n: 4, title: "İfade cevapları", short: "Cevaplar" },
  { n: 5, title: "Eksik belgeler ve ekler", short: "Ekler" },
  { n: 6, title: "Değerlendirme ve teklif", short: "Teklif" },
  { n: 7, title: "Rapor ve dizi pusulası", short: "Rapor" },
] as const;

export type NamedFile = { id: string; name: string; note: string };

export type Person = {
  id: string;
  kind: PersonKind;
  fullName: string;
  title: string;
  school: string;
  tckn: string;
  phone: string;
  address: string;
};

export type Question = { id: string; text: string };

export type Statement = {
  personId: string;
  date: string;
  time: string;
  place: string;
  questions: Question[];
  answers: Record<string, string>;
};

export type Annex = {
  id: string;
  number: number;
  title: string;
  pieces: number;
  present: boolean;
  notes: string;
};

export type MissingDoc = {
  id: string;
  label: string;
  requested: boolean;
  received: boolean;
  notes: string;
};

export type Evaluation = {
  mode: SanctionMode;
  selectedBent: SanctionBent;
  selectedAlt: string;
  subut: "erdi" | "ermedi" | "kismi" | "";
  disiplin: string;
  adli: string;
  idari: string;
  mali: string;
  teklif: string;
};

export type ReportSections = {
  giris: string;
  maddiDelil: string;
  ifadeler: string;
  mevzuat: string;
  degerlendirme: string;
  sonucTeklif: string;
};

export type MuhakkikCase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  actorRole: ActorRole;
  caseType: CaseType;
  gorevlendirmeNo: string;
  gorevlendirmeTarih: string;
  olurNo: string;
  olurTarih: string;
  makam: string;
  muhakkikAdi: string;
  muhakkikUnvan: string;
  valilik: string;
  mudurluk: string;
  muhatap: string;
  sureGun: string;
  subject: string;
  claims: string;
  suggestedBents: string[];
  files: NamedFile[];
  people: Person[];
  statements: Statement[];
  annexes: Annex[];
  missingDocs: MissingDoc[];
  evaluation: Evaluation;
  report: ReportSections;
  currentStep: number;
};

export function uid(): string {
  return crypto.randomUUID();
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatTr(iso: string): string {
  if (!iso) return "gg.aa.yyyy";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function emptyEvaluation(): Evaluation {
  return {
    mode: "B",
    selectedBent: "",
    selectedAlt: "",
    subut: "",
    disiplin: "",
    adli: "",
    idari: "",
    mali: "",
    teklif: "",
  };
}

export function emptyReport(): ReportSections {
  return { giris: "", maddiDelil: "", ifadeler: "", mevzuat: "", degerlendirme: "", sonucTeklif: "" };
}

export function defaultMissingDocs(): MissingDoc[] {
  return [
    "Görevlendirme emri",
    "Makam oluru ve ekleri (dilekçe vb.)",
    "Şikâyet dilekçesi / ihbar yazısı",
    "Hizmet cetveli",
    "İzin / devam / nöbet kayıtları",
    "İlgili yazışmalar ve onaylı örnekler",
    "Çağrı kâğıdı ve tebliğ-tebellüğ",
    "İfade tutanakları",
    "Bilgi-belge istek yazıları ve cevapları",
  ].map((label) => ({ id: uid(), label, requested: false, received: false, notes: "" }));
}

export function emptyCase(partial?: Partial<MuhakkikCase>): MuhakkikCase {
  const now = new Date().toISOString();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    actorRole: "muhakkik",
    caseType: "disiplin",
    gorevlendirmeNo: "",
    gorevlendirmeTarih: isoToday(),
    olurNo: "",
    olurTarih: "",
    makam: "",
    muhakkikAdi: "",
    muhakkikUnvan: "Okul Müdürü / Muhakkik",
    valilik: "",
    mudurluk: "",
    muhatap: "",
    sureGun: "20",
    subject: "",
    claims: "",
    suggestedBents: [],
    files: [],
    people: [],
    statements: [],
    annexes: [],
    missingDocs: defaultMissingDocs(),
    evaluation: emptyEvaluation(),
    report: emptyReport(),
    currentStep: 0,
    ...partial,
  };
}

export function sortPeople(people: Person[]): Person[] {
  const rank: Record<PersonKind, number> = { sikayetci: 0, tanik: 1, itham_edilen: 2 };
  return [...people].sort((a, b) => rank[a.kind] - rank[b.kind] || a.fullName.localeCompare(b.fullName, "tr"));
}

export function personKindLabel(kind: PersonKind): string {
  return PERSON_KINDS.find((x) => x.id === kind)?.label ?? kind;
}

export function actorLabel(role: ActorRole): string {
  return ACTOR_ROLES.find((x) => x.id === role)?.label ?? role;
}

export function reportTitleFor(role: ActorRole): string {
  return ACTOR_ROLES.find((x) => x.id === role)?.reportTitle ?? "MUHAKKİK RAPORU";
}

export function signerTitle(role: ActorRole): string {
  if (role === "mufettis") return "Soruşturmacı / Eğitim Müfettişi";
  if (role === "disiplin_amiri") return "Disiplin Amiri";
  return "Muhakkik";
}
