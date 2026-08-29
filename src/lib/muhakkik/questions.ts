import { uid, type MuhakkikCase, type Person, type PersonKind, type Question } from "./types";

function q(text: string): Question {
  return { id: uid(), text };
}

export function targetedQuestions(kind: PersonKind, cse: MuhakkikCase, person: Person): Question[] {
  const konu = cse.subject.trim() || "soruşturma konusu";
  const iddia = cse.claims.trim() || "görevlendirme emrinde yer alan iddialar";
  const name = person.fullName.trim() || "ilgili";

  if (kind === "sikayetci") {
    return [
      q("Kimlik, görev ve iletişim bilgilerinizi bildiriniz."),
      q(`Şikâyetinizin / ihbarınızın konusunu kendi ifadelerinizle açıklayınız. (Dosya konusu: ${konu})`),
      q("Olayın tarihini, yerini ve varsa saatini belirtiniz."),
      q("Olayı bizzat mı gördünüz, yoksa size mi anlatıldı? Kaynağını belirtiniz."),
      q(`İddia özeti: «${iddia.slice(0, 280)}». Bu iddiayı somut vakıalarla açınız.`),
      q("Olayın tanığı olan kişileri ad, unvan ve görev yeri ile bildiriniz."),
      q("Elinizde belge, yazışma, kayıt, görüntü veya benzeri delil var mıdır? Varsa nelerdir?"),
      q("Daha önce bu hususu resmi makamlara bildirdiniz mi? Sonuç ne oldu?"),
      q("İtham edilen kişi ile aranızda husumet, alacak-verecek veya başka bir ilişki var mıdır?"),
      q("Eklemek istediğiniz başka husus var mıdır?"),
    ];
  }

  if (kind === "tanik") {
    return [
      q("Kimlik, görev ve iletişim bilgilerinizi bildiriniz."),
      q("Şikâyetçi ve itham edilen ile akrabalık, arkadaşlık veya husumet ilişkiniz var mıdır?"),
      q(`«${konu}» konusunda görgü ve bilginiz nedir? Nerede, ne zaman ve nasıl öğrendiniz?`),
      q("Gördüklerinizi ve işittiklerinizi oluş sırasıyla anlatınız; tahmin ile vakıayı ayırınız."),
      q("Başka tanık veya belge biliyor musunuz?"),
      q("Size bu konuda baskı, telkin veya yönlendirme yapıldı mı?"),
      q("İfadenizi etkileyebilecek bir husus var mıdır?"),
      q("Eklemek istediğiniz başka husus var mıdır?"),
    ];
  }

  return [
    q("Kimlik, T.C. kimlik no, unvan, görev yeri ve iletişim bilgilerinizi bildiriniz."),
    q(`${name} olarak hakkınızda yürütülen ${cse.caseType === "on_inceleme_4483" ? "ön inceleme" : "inceleme/soruşturma"} konusunu biliyor musunuz?`),
    q(`Hakkınızdaki iddialar: «${iddia.slice(0, 320)}». Bu iddialara ilişkin açıklamanızı yapınız.`),
    q("İddiaları kabul ediyor musunuz, kısmen kabul ediyor musunuz, yoksa reddediyor musunuz? Gerekçenizi belirtiniz."),
    q("Olayın tarih, yer ve oluş şekline ilişkin kendi anlatımınız nedir?"),
    q("Gösterdiğiniz tanıklar kimlerdir? Hangi vakıaya ilişkin dinlenmelerini istiyorsunuz?"),
    q("Dayandığınız belge, yazışma, kayıt veya başka delil var mıdır?"),
    q("Fiilin öğrenilmesi ve ceza verme zamanaşımı (657 m.127) bakımından belirtmek istediğiniz husus var mıdır?"),
    q("Yeni fiil veya fail olduğunu düşündüğünüz bir husus var mıdır? (Muhakkik kendiliğinden soruşturmayı genişletemez; disiplin amirine bildirir.)"),
    q("Eklemek istediğiniz başka husus var mıdır?"),
  ];
}

export function ensureStatement(cse: MuhakkikCase, person: Person): MuhakkikCase {
  if (cse.statements.some((s) => s.personId === person.id)) return cse;
  return {
    ...cse,
    statements: [
      ...cse.statements,
      {
        personId: person.id,
        date: cse.gorevlendirmeTarih || "",
        time: "10:00",
        place: cse.mudurluk || "Müdürlük yazı işleri odası",
        questions: targetedQuestions(person.kind, cse, person),
        answers: {},
      },
    ],
  };
}

export function unansweredCount(cse: MuhakkikCase): number {
  let n = 0;
  for (const st of cse.statements) {
    for (const qn of st.questions) {
      if (!(st.answers[qn.id] ?? "").trim()) n += 1;
    }
  }
  return n;
}
