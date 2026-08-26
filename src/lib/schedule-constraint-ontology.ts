export type RelationArity = "unary" | "binary";
export type RelationSymmetry = "symmetric" | "directional";
export type RelationDomain = "time" | "room" | "sequence" | "placement";

export type PlanningRelationTypeSpec = {
  type: string;
  arity: RelationArity;
  symmetry: RelationSymmetry;
  domain: RelationDomain;
  parameters: string[];
  description: string;
};

const SPECS: PlanningRelationTypeSpec[] = [
  { type: "SAME_TIME", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinlik aynı gün ve aynı başlangıç saatinde olmalı." },
  { type: "DIFFERENT_TIME", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinlik aynı gün-saat diliminde olmamalı." },
  { type: "SAME_START", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "Gün bağımsız olarak aynı başlangıç ders saati." },
  { type: "SAME_DAY", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinlik aynı güne yerleşmeli." },
  { type: "DIFFERENT_DAY", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinlik farklı günlere yerleşmeli." },
  { type: "SAME_ROOM", arity: "binary", symmetry: "symmetric", domain: "room", parameters: [], description: "İki etkinlik aynı derslikte olmalı (derslik bilinmiyorsa değerlendirilmez)." },
  { type: "DIFFERENT_ROOM", arity: "binary", symmetry: "symmetric", domain: "room", parameters: [], description: "İki etkinlik farklı dersliklerde olmalı (derslik bilinmiyorsa değerlendirilmez)." },
  { type: "ORDERED", arity: "binary", symmetry: "directional", domain: "sequence", parameters: [], description: "Sol etkinlik sağ etkinlikten önce olmalı." },
  { type: "CONSECUTIVE", arity: "binary", symmetry: "directional", domain: "sequence", parameters: [], description: "Sağ etkinlik, sol etkinliğin hemen ardından aynı gün başlamalı." },
  { type: "OVERLAP", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinliğin zaman aralıkları kesişmeli." },
  { type: "NOT_OVERLAP", arity: "binary", symmetry: "symmetric", domain: "time", parameters: [], description: "İki etkinliğin zaman aralıkları kesişmemeli." },
  { type: "MIN_GAP", arity: "binary", symmetry: "symmetric", domain: "time", parameters: ["periods", "gap", "value"], description: "Aynı gün içindeki iki etkinlik arasında en az N ders saati boşluk." },
  { type: "MAX_GAP", arity: "binary", symmetry: "symmetric", domain: "time", parameters: ["periods", "gap", "value"], description: "Aynı gün içindeki iki etkinlik arasında en fazla N ders saati boşluk." },
  { type: "MIN_DAYS", arity: "binary", symmetry: "symmetric", domain: "time", parameters: ["days", "value"], description: "İki etkinliğin gün farkı en az N olmalı." },
  { type: "MAX_DAYS", arity: "binary", symmetry: "symmetric", domain: "time", parameters: ["days", "value"], description: "İki etkinliğin gün farkı en fazla N olmalı." },
  { type: "STARTS_DAY", arity: "unary", symmetry: "directional", domain: "placement", parameters: ["first_period"], description: "Etkinlik günün ilk ders saatinde başlamalı." },
  { type: "ENDS_DAY", arity: "unary", symmetry: "directional", domain: "placement", parameters: ["last_period"], description: "Etkinlik günün son ders saatinde bitmeli." },
  { type: "PREFERRED_SLOT", arity: "unary", symmetry: "directional", domain: "placement", parameters: ["days", "periods"], description: "Etkinlik tercih edilen gün/saat kümesinin dışına yerleşmemeli." },
  { type: "FORBIDDEN_SLOT", arity: "unary", symmetry: "directional", domain: "placement", parameters: ["days", "periods"], description: "Etkinlik yasak gün/saat kümesine yerleşmemeli." },
];

export const PLANNING_RELATION_TYPES: readonly PlanningRelationTypeSpec[] = SPECS;

const BY_TYPE = new Map(SPECS.map((s) => [s.type, s]));

export function getPlanningRelationTypeSpec(type: string): PlanningRelationTypeSpec | null {
  return BY_TYPE.get(String(type ?? "").trim().toUpperCase()) ?? null;
}

export function isSupportedPlanningRelationType(type: string): boolean {
  return getPlanningRelationTypeSpec(type) !== null;
}

export function isSymmetricPlanningRelationType(type: string): boolean {
  return getPlanningRelationTypeSpec(type)?.symmetry === "symmetric";
}

export function isUnaryPlanningRelationType(type: string): boolean {
  return getPlanningRelationTypeSpec(type)?.arity === "unary";
}
