export type Teacher = {
  id: number;
  name: string;
  role: string;
  branch: string;
};

export const teachers: Teacher[] = [
  { id: 1, name: "Ayşe Yılmaz", role: "Öğretmen", branch: "Matematik" },
  { id: 2, name: "Mehmet Demir", role: "Müdür Yardımcısı", branch: "Fizik" },
  { id: 3, name: "Elif Kaya", role: "Öğretmen", branch: "Türk Dili ve Edebiyatı" },
  { id: 4, name: "Burak Şahin", role: "Rehber Öğretmen", branch: "Rehberlik" },
  { id: 5, name: "Zeynep Aydın", role: "Öğretmen", branch: "İngilizce" },
  { id: 6, name: "Can Öztürk", role: "Öğretmen", branch: "Biyoloji" },
];

export type AbsentTeacher = {
  id: number;
  name: string;
  branch: string;
  reason: string;
  lessons: string[];
  status: "pending" | "assigned";
};

export const absentTeachers: AbsentTeacher[] = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    branch: "Matematik",
    reason: "Raporlu (3 gün)",
    lessons: ["9/A · 2. Ders", "10/B · 4. Ders", "11/C · 6. Ders"],
    status: "pending",
  },
  {
    id: 2,
    name: "Elif Kaya",
    branch: "Edebiyat",
    reason: "İdari izin",
    lessons: ["9/B · 1. Ders", "12/A · 5. Ders"],
    status: "pending",
  },
  {
    id: 3,
    name: "Can Öztürk",
    branch: "Biyoloji",
    reason: "Görevlendirme (Ölçme Merkezi)",
    lessons: ["10/A · 3. Ders"],
    status: "assigned",
  },
];

export type DutyTeacher = {
  id: number;
  name: string;
  branch: string;
  freeHours: number;
  load: "Uygun" | "Yoğun";
};

export const dutyTeachers: DutyTeacher[] = [
  { id: 1, name: "Zeynep Aydın", branch: "İngilizce", freeHours: 4, load: "Uygun" },
  { id: 2, name: "Burak Şahin", branch: "Rehberlik", freeHours: 3, load: "Uygun" },
  { id: 3, name: "Mehmet Demir", branch: "Fizik", freeHours: 1, load: "Yoğun" },
  { id: 4, name: "Selin Arslan", branch: "Kimya", freeHours: 2, load: "Uygun" },
];

export type PayrollRow = {
  id: number;
  name: string;
  role: string;
  daily: Record<"gunduz" | "nobet" | "rehberlik", number[]>;
};

const seededHours = (seed: number, max: number) =>
  Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const weekday = (day + seed) % 7;
    if (weekday === 0 || weekday === 6) return 0;
    return (day * seed) % (max + 1);
  });

export const payrollRows: PayrollRow[] = teachers.map((t) => ({
  id: t.id,
  name: t.name,
  role: t.role,
  daily: {
    gunduz: seededHours(t.id, 6),
    nobet: seededHours(t.id + 2, 2),
    rehberlik: seededHours(t.id + 4, 2),
  },
}));

export type SchoolClass = {
  id: string;
  name: string;
  program: string;
  students: number;
};

export const schoolClasses: SchoolClass[] = [
  { id: "9a-fen", name: "9/A", program: "FEN", students: 28 },
  { id: "9a-ihp", name: "9/A", program: "IHP", students: 19 },
  { id: "9b-fen", name: "9/B", program: "FEN", students: 24 },
  { id: "10a-sos", name: "10/A", program: "SOS", students: 31 },
  { id: "10b-fen", name: "10/B", program: "FEN", students: 22 },
  { id: "11c-dil", name: "11/C", program: "DİL", students: 17 },
  { id: "12a-say", name: "12/A", program: "SAY", students: 26 },
];

export type ViceP = {
  id: number;
  name: string;
  days: string[];
};

export const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum"];

export const vicePrincipals: ViceP[] = [
  { id: 1, name: "Mehmet Demir", days: ["Pzt", "Per"] },
  { id: 2, name: "Selin Arslan", days: ["Sal", "Cum"] },
  { id: 3, name: "Hakan Toprak", days: ["Çar"] },
];

export const scheduleRows = [
  { hour: "1. Ders", mon: "9/A Mat", tue: "—", wed: "10/B Mat", thu: "Nöbet", fri: "11/C Mat" },
  { hour: "2. Ders", mon: "9/A Mat", tue: "10/A Mat", wed: "—", thu: "Nöbet", fri: "11/C Mat" },
  { hour: "3. Ders", mon: "—", tue: "10/A Mat", wed: "12/A Mat", thu: "9/B Mat", fri: "—" },
  { hour: "4. Ders", mon: "10/B Mat", tue: "—", wed: "12/A Mat", thu: "9/B Mat", fri: "9/A Mat" },
  { hour: "5. Ders", mon: "10/B Mat", tue: "11/C Mat", wed: "—", thu: "—", fri: "9/A Mat" },
];

export const documents = [
  { id: 1, title: "Ek Ders Puantajı (Temmuz)", type: "PDF", date: "01.08.2026" },
  { id: 2, title: "Nöbet Çizelgesi", type: "XLSX", date: "28.07.2026" },
  { id: 3, title: "Yıllık İzin Formu", type: "DOCX", date: "12.07.2026" },
  { id: 4, title: "Zümre Toplantı Tutanağı", type: "PDF", date: "03.07.2026" },
];

export const payslip = [
  { label: "Gündüz Ek Ders", hours: 42, rate: 78.5 },
  { label: "Nöbet Görevi", hours: 6, rate: 78.5 },
  { label: "Rehberlik", hours: 8, rate: 78.5 },
  { label: "Hazırlık & Planlama", hours: 4, rate: 78.5 },
];