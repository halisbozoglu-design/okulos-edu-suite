export type BentOption = {
  bent: "A" | "B" | "C" | "D" | "E";
  name: string;
  definition: string;
  decision: string;
  alts: { code: string; text: string; keywords: string[] }[];
};

export const SANCTION_OPTIONS: BentOption[] = [
  {
    bent: "A",
    name: "Uyarma",
    definition: "Görevinde ve davranışlarında daha dikkatli olması gerektiğinin yazı ile bildirilmesidir.",
    decision: "Disiplin amiri verir. Muhakkik yalnızca teklif eder.",
    alts: [
      { code: "A-a", text: "Emir ve görevlerin tam ve zamanında yapılmasında, usul esaslarda, belge/araç bakımında kayıtsızlık veya düzensizlik", keywords: ["kayıtsız", "düzensiz", "zamanında yapmam"] },
      { code: "A-b", text: "Özürsüz veya izinsiz göreve geç gelmek, erken ayrılmak, görev mahallini terketmek", keywords: ["geç gel", "erken ayrıl", "mahallini terk"] },
      { code: "A-c", text: "Kurumca belirlenen tasarruf tedbirlerine riayet etmemek", keywords: ["tasarruf"] },
      { code: "A-d", text: "Usulsüz müracaat veya şikâyette bulunmak", keywords: ["usulsüz müracaat", "usulsüz şikayet"] },
      { code: "A-e", text: "Devlet memuru vakarına yakışmayan tutum ve davranış", keywords: ["vakar"] },
      { code: "A-f", text: "Görevine veya iş sahiplerine karşı kayıtsızlık / ilgisizlik", keywords: ["ilgisiz"] },
      { code: "A-g", text: "Kılık ve kıyafet hükümlerine aykırı davranmak", keywords: ["kılık", "kıyafet"] },
      { code: "A-h", text: "Görevin işbirliği içinde yapılması ilkesine aykırı davranış", keywords: ["işbirliği"] },
    ],
  },
  {
    bent: "B",
    name: "Kınama",
    definition: "Görevinde ve davranışlarında kusurlu olduğunun yazı ile bildirilmesidir.",
    decision: "Disiplin amiri verir. Muhakkik yalnızca teklif eder.",
    alts: [
      { code: "B-a", text: "Emir ve görevlerin yerine getirilmesinde kusurlu davranmak", keywords: ["kusurlu"] },
      { code: "B-c", text: "Görev sırasında amire hal ve hareketi ile saygısız davranmak", keywords: ["saygısız", "amire"] },
      { code: "B-d", text: "Hizmet dışında itibar ve güven duygusunu sarsacak davranış", keywords: ["itibar", "güven duygusu"] },
      { code: "B-e", text: "Devlete ait resmi araç, gereç ve benzeri eşyayı özel işlerinde kullanmak", keywords: ["özel iş", "resmi araç"] },
      { code: "B-f", text: "Devlete ait resmî belge, araç, gereç kaybetmek", keywords: ["kaybet"] },
      { code: "B-g", text: "İş arkadaşlarına, maiyete veya iş sahiplerine kötü muamele", keywords: ["kötü muamele"] },
      { code: "B-h", text: "Söz veya hareketle sataşmak", keywords: ["sataş"] },
      { code: "B-j", text: "Verilen emirlere itiraz etmek", keywords: ["itiraz"] },
      { code: "B-l", text: "Kurumların huzur, sükûn ve çalışma düzenini bozmak", keywords: ["huzur", "çalışma düzeni"] },
    ],
  },
  {
    bent: "C",
    name: "Aylıktan kesme",
    definition: "Brüt aylıktan 1/30 – 1/8 arasında kesinti yapılmasıdır.",
    decision: "Disiplin amiri verir. Muhakkik yalnızca teklif eder.",
    alts: [
      { code: "C-a", text: "Kasten emir ve görevleri tam ve zamanında yapmamak", keywords: ["kasten", "yapmamak"] },
      { code: "C-b", text: "Özürsüz olarak bir veya iki gün göreve gelmemek", keywords: ["göreve gelmemek", "devamsız"] },
      { code: "C-c", text: "Resmi belge/araç/gereci özel menfaat sağlamak için kullanmak", keywords: ["özel menfaat"] },
      { code: "C-d", text: "Görevle ilgili konularda yalan ve yanlış beyanda bulunmak", keywords: ["yalan beyan", "yanlış beyan"] },
      { code: "C-e", text: "Görev sırasında amirine sözle saygısızlık etmek", keywords: ["sözle saygısız"] },
      { code: "C-ı", text: "Hizmet içinde itibar ve güven duygusunu sarsacak davranış", keywords: ["hizmet içinde itibar"] },
    ],
  },
  {
    bent: "D",
    name: "Kademe ilerlemesinin durdurulması",
    definition: "Fiilin ağırlık derecesine göre bulunduğu kademede ilerlemenin 1–3 yıl durdurulmasıdır.",
    decision: "Disiplin kurulu kararı → atamaya yetkili amir (il disiplin kurulunda vali). Muhakkik karar vermez.",
    alts: [
      { code: "D-c", text: "Görevi ile ilgili olarak her ne şekilde olursa olsun çıkar sağlamak", keywords: ["çıkar", "ek ders", "haksız ücret", "izinli olduğu halde"] },
      { code: "D-d", text: "Amirine veya maiyetindekilere karşı küçük düşürücü veya aşağılayıcı fiil", keywords: ["aşağılay", "küçük düşür", "psikolojik baskı"] },
      { code: "D-f", text: "Gerçeğe aykırı rapor ve belge düzenlemek", keywords: ["gerçeğe aykırı", "sahte", "belge düzenle"] },
      { code: "D-n", text: "Verilen görev ve emirleri kasten yapmamak", keywords: ["kasten yapmamak"] },
      { code: "D-l", text: "Hakaret veya tehdit", keywords: ["hakaret", "tehdit"] },
    ],
  },
  {
    bent: "E",
    name: "Devlet memurluğundan çıkarma",
    definition: "Bir daha Devlet memurluğuna atanmamak üzere memurluktan çıkarmaktır.",
    decision: "Yüksek disiplin kurulu. Muhakkik bu cezayı veremez; yalnız teklif edebilir.",
    alts: [
      { code: "E-d", text: "Özürsüz olarak bir yılda toplam 20 gün göreve gelmemek", keywords: ["20 gün"] },
      { code: "E-f", text: "Amirlerine, maiyetindekilere ve iş sahiplerine fiili tecavüz", keywords: ["fiili tecavüz", "darp"] },
      { code: "E-g", text: "Memurluk sıfatı ile bağdaşmayacak yüz kızartıcı ve utanç verici hareket", keywords: ["yüz kızartıcı"] },
    ],
  },
];

export function bentLabel(code: string): string {
  for (const b of SANCTION_OPTIONS) {
    if (b.bent === code) return `657 m.125/${b.bent} — ${b.name}`;
    const alt = b.alts.find((a) => a.code === code);
    if (alt) return `657 m.125/${alt.code} — ${alt.text}`;
  }
  return code;
}

export function suggestBents(subject: string, claims: string): string[] {
  const hay = `${subject} ${claims}`.toLocaleLowerCase("tr-TR");
  const hits: string[] = [];
  for (const b of SANCTION_OPTIONS) {
    for (const alt of b.alts) {
      if (alt.keywords.some((k) => hay.includes(k.toLocaleLowerCase("tr-TR")))) {
        if (!hits.includes(alt.code)) hits.push(alt.code);
      }
    }
  }
  return hits.slice(0, 8);
}

export function bentsForMode(mode: "A" | "B" | "C"): BentOption[] {
  if (mode === "A") return [];
  if (mode === "B") return SANCTION_OPTIONS.filter((b) => b.bent === "A" || b.bent === "B");
  return SANCTION_OPTIONS;
}

export const MODE_NOTES = {
  A: "Yumuşat / işlem yok: sübuta ermeme, şüpheden uzak kesin sonuç bulunmama veya yaptırıma yer olmama teklifi. Daha ağır ceza uydurulmaz.",
  B: "Asgari-hafif: mümkünse uyarma veya kınama (657 m.125 A–B). Ölçülülük; olumlu sicilde bir derece hafif uygulanabilir (m.125).",
  C: "Mevzuatın tüm seçenekleri (A uyarma, B kınama, C aylıktan kesme, D kademe, E çıkarma). Kullanıcı seçer. Karar yine amir/kuruldadır.",
} as const;
