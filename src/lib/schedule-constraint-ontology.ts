export type RelationArity = "unary" | "binary" | "set";
export type RelationSymmetry = "symmetric" | "directional";
export type RelationDomain = "time" | "room" | "sequence" | "placement" | "capacity";
export type PlanningRelationTypeSpec={type:string;arity:RelationArity;symmetry:RelationSymmetry;domain:RelationDomain;parameters:string[];description:string};
const SPECS:PlanningRelationTypeSpec[]=[
{type:"SAME_TIME",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinlik aynı gün ve aynı başlangıç saatinde olmalı."},
{type:"DIFFERENT_TIME",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinlik aynı gün-saat diliminde olmamalı."},
{type:"SAME_START",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"Gün bağımsız aynı başlangıç ders saati."},
{type:"SAME_DAY",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinlik aynı güne yerleşmeli."},
{type:"DIFFERENT_DAY",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinlik farklı günlere yerleşmeli."},
{type:"SAME_ROOM",arity:"binary",symmetry:"symmetric",domain:"room",parameters:[],description:"İki etkinlik aynı derslikte olmalı."},
{type:"DIFFERENT_ROOM",arity:"binary",symmetry:"symmetric",domain:"room",parameters:[],description:"İki etkinlik farklı derslikte olmalı."},
{type:"ORDERED",arity:"binary",symmetry:"directional",domain:"sequence",parameters:[],description:"Sol etkinlik sağ etkinlikten önce olmalı."},
{type:"CONSECUTIVE",arity:"binary",symmetry:"directional",domain:"sequence",parameters:[],description:"Sağ etkinlik sol etkinliğin hemen ardından başlamalı."},
{type:"ADJACENT",arity:"binary",symmetry:"symmetric",domain:"sequence",parameters:[],description:"İki etkinlik aynı gün arada boşluk olmadan komşu olmalı; sıra serbesttir."},
{type:"NOT_ADJACENT",arity:"binary",symmetry:"symmetric",domain:"sequence",parameters:[],description:"İki etkinlik aynı gün bitişik olmamalı."},
{type:"OVERLAP",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinliğin zaman aralıkları kesişmeli."},
{type:"NOT_OVERLAP",arity:"binary",symmetry:"symmetric",domain:"time",parameters:[],description:"İki etkinliğin zaman aralıkları kesişmemeli."},
{type:"MIN_GAP",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["periods","gap","value"],description:"Aynı gün etkinlikler arasında en az N ders saati boşluk."},
{type:"MAX_GAP",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["periods","gap","value"],description:"Aynı gün etkinlikler arasında en fazla N ders saati boşluk."},
{type:"MIN_DAYS",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["days","value"],description:"Etkinliklerin gün farkı en az N olmalı."},
{type:"MAX_DAYS",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["days","value"],description:"Etkinliklerin gün farkı en fazla N olmalı."},
{type:"MIN_START_DISTANCE",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["periods","value"],description:"Aynı gün başlangıç saatleri arasında en az N ders saati fark olmalı."},
{type:"MAX_START_DISTANCE",arity:"binary",symmetry:"symmetric",domain:"time",parameters:["periods","value"],description:"Aynı gün başlangıç saatleri arasında en fazla N ders saati fark olmalı."},
{type:"SAME_ROOM_IF_CONSECUTIVE",arity:"binary",symmetry:"symmetric",domain:"room",parameters:[],description:"Etkinlikler ardışıksa aynı derslik kullanılmalı."},
{type:"STARTS_DAY",arity:"unary",symmetry:"directional",domain:"placement",parameters:["first_period"],description:"Etkinlik günün ilk ders saatinde başlamalı."},
{type:"ENDS_DAY",arity:"unary",symmetry:"directional",domain:"placement",parameters:["last_period"],description:"Etkinlik günün son ders saatinde bitmeli."},
{type:"PREFERRED_START",arity:"unary",symmetry:"directional",domain:"placement",parameters:["days","periods"],description:"Etkinlik yalnız tercih edilen başlangıç gün/saatlerinden birinde başlamalı."},
{type:"PREFERRED_SLOT",arity:"unary",symmetry:"directional",domain:"placement",parameters:["days","periods"],description:"Etkinliğin tamamı tercih edilen zaman yuvaları içinde kalmalı."},
{type:"FORBIDDEN_SLOT",arity:"unary",symmetry:"directional",domain:"placement",parameters:["days","periods"],description:"Etkinlik yasak gün/saat yuvalarından hiçbirini kullanmamalı."},
{type:"PREFERRED_DAYS",arity:"unary",symmetry:"directional",domain:"placement",parameters:["days"],description:"Etkinlik belirtilen günlerden birinde olmalı."},
{type:"FORBIDDEN_DAYS",arity:"unary",symmetry:"directional",domain:"placement",parameters:["days"],description:"Etkinlik belirtilen günlerde olmamalı."},
{type:"PREFERRED_PERIODS",arity:"unary",symmetry:"directional",domain:"placement",parameters:["periods"],description:"Etkinliğin tamamı belirtilen ders saatleri içinde olmalı."},
{type:"FORBIDDEN_PERIODS",arity:"unary",symmetry:"directional",domain:"placement",parameters:["periods"],description:"Etkinlik belirtilen ders saatlerinden hiçbirini kullanmamalı."},
{type:"GROUPED",arity:"set",symmetry:"symmetric",domain:"sequence",parameters:[],description:"Seçilen etkinlikler aynı gün tek kesintisiz grup oluşturmalı."},
{type:"MAX_SIMULTANEOUS",arity:"set",symmetry:"symmetric",domain:"capacity",parameters:["max","days","periods"],description:"Seçilen etkinliklerden aynı anda çalışanların sayısı N'i aşmamalı."},
{type:"MAX_OCCUPIED_SLOTS",arity:"set",symmetry:"symmetric",domain:"capacity",parameters:["max","days","periods"],description:"Seçilen etkinlikler belirtilen zaman kümesinde en fazla N farklı slot işgal etmeli."},
{type:"MAX_DIFFERENT_ROOMS",arity:"set",symmetry:"symmetric",domain:"room",parameters:["max"],description:"Seçilen etkinlikler en fazla N farklı derslik kullanmalı."},
{type:"MIN_OCCUPIED_DAYS",arity:"set",symmetry:"symmetric",domain:"time",parameters:["min","value"],description:"Seçilen etkinlikler en az N farklı güne yayılmalı."},
{type:"MAX_OCCUPIED_DAYS",arity:"set",symmetry:"symmetric",domain:"time",parameters:["max","value"],description:"Seçilen etkinlikler en fazla N farklı güne yayılmalı; serbest gün kurgusunda kullanılabilir."},
{type:"MAX_GAPS_PER_DAY",arity:"set",symmetry:"symmetric",domain:"time",parameters:["max","days"],description:"Seçilen etkinliklerin bir gündeki iç boşluk sayısı N'i aşmamalı."},
{type:"MAX_SPAN_PER_DAY",arity:"set",symmetry:"symmetric",domain:"time",parameters:["max","days"],description:"Seçilen etkinliklerin ilk ve son slot arasındaki günlük yayılımı N'i aşmamalı."},
{type:"MIN_ACTIVITIES_PER_DAY",arity:"set",symmetry:"symmetric",domain:"capacity",parameters:["min","days"],description:"Kullanılan her seçili günde en az N etkinlik bulunmalı."},
{type:"MAX_ACTIVITIES_PER_DAY",arity:"set",symmetry:"symmetric",domain:"capacity",parameters:["max","days"],description:"Seçili bir günde en fazla N etkinlik bulunmalı."},
{type:"INTERVAL_MAX_ACTIVITIES",arity:"set",symmetry:"symmetric",domain:"capacity",parameters:["max","days","periods"],description:"Belirli gün/saat aralığında başlayan seçili etkinlik sayısı N'i aşmamalı."},
];
export const PLANNING_RELATION_TYPES:readonly PlanningRelationTypeSpec[]=SPECS;const BY_TYPE=new Map(SPECS.map(s=>[s.type,s]));
export function getPlanningRelationTypeSpec(type:string){return BY_TYPE.get(String(type??"").trim().toUpperCase())??null}
export function isSupportedPlanningRelationType(type:string){return getPlanningRelationTypeSpec(type)!==null}
export function isSymmetricPlanningRelationType(type:string){return getPlanningRelationTypeSpec(type)?.symmetry==="symmetric"}
export function isUnaryPlanningRelationType(type:string){return getPlanningRelationTypeSpec(type)?.arity==="unary"}
export function isSetPlanningRelationType(type:string){return getPlanningRelationTypeSpec(type)?.arity==="set"}