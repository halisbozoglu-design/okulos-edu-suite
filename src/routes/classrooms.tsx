import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/okulos/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/lib/permissions";

export const Route = createFileRoute("/classrooms")({ head: () => ({ meta: [{ title: "Derslik Envanteri — OkulOS" }] }), component: Classrooms });

type Building = { id: string; name: string; code: string | null; active: boolean };
type Pool = { id: string; name: string; capacity: number; max_simultaneous_activities: number; active: boolean };
type Room = { id: string; name: string; room_type: string; capacity: number; department: string | null; hardware: Record<string, unknown>; active: boolean; building_id: string | null; floor: number | null; room_pool_id: string | null };
type Rule = { id: string; subject_pattern: string; required_room_type: string | null; required_department: string | null; required_hardware: Record<string, unknown>; preferred_room_type: string | null; preferred_department: string | null; preferred_hardware: Record<string, unknown>; preferred_building_id: string | null; preferred_room_ids: string[]; avoided_room_ids: string[]; active: boolean };
type Profile = { id: string; periods_per_day: number };
type BreakRow = { after_period: number; minutes: number; transfer_allowed: boolean };
type Travel = { id: string; from_building_id: string; to_building_id: string; minutes: number; active: boolean };
type RoomBundle = { id:string;name:string;active:boolean };
type RoomBundleMember = { bundle_id:string;classroom_id:string;member_role:"PRIMARY"|"SUPPORT";ordinal:number };
type AssignmentChoice = { assignment_id:string;class_name:string;subject:string };
type BundleOption = { teacher_assignment_id:string;bundle_id:string };

const db = supabase as any;

function Classrooms() {
  const { can } = usePermissions();
  const editable = can("classrooms.manage") || can("schedule.rules");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [breaks, setBreaks] = useState<BreakRow[]>([]);
  const [roomBundles,setRoomBundles]=useState<RoomBundle[]>([]);
  const [bundleMembers,setBundleMembers]=useState<RoomBundleMember[]>([]);
  const [assignmentChoices,setAssignmentChoices]=useState<AssignmentChoice[]>([]);
  const [bundleOptions,setBundleOptions]=useState<BundleOption[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [buildingName, setBuildingName] = useState("");
  const [buildingCode, setBuildingCode] = useState("");
  const [poolName, setPoolName] = useState("");
  const [poolCapacity, setPoolCapacity] = useState("60");
  const [poolMax, setPoolMax] = useState("2");
  const [name, setName] = useState("");
  const [type, setType] = useState("standard");
  const [capacity, setCapacity] = useState("30");
  const [department, setDepartment] = useState("");
  const [hardware, setHardware] = useState("{}");
  const [buildingId, setBuildingId] = useState("");
  const [floor, setFloor] = useState("");
  const [poolId, setPoolId] = useState("");

  const [pattern, setPattern] = useState("");
  const [ruleType, setRuleType] = useState("");
  const [ruleDepartment, setRuleDepartment] = useState("");
  const [ruleHardware, setRuleHardware] = useState("{}");
  const [preferredType, setPreferredType] = useState("");
  const [preferredDepartment, setPreferredDepartment] = useState("");
  const [preferredHardware, setPreferredHardware] = useState("{}");
  const [preferredBuildingId, setPreferredBuildingId] = useState("");
  const [preferredRooms, setPreferredRooms] = useState("");
  const [avoidedRooms, setAvoidedRooms] = useState("");

  const [travelFrom, setTravelFrom] = useState("");
  const [travelTo, setTravelTo] = useState("");
  const [travelMinutes, setTravelMinutes] = useState("5");
  const [breakPeriod, setBreakPeriod] = useState("1");
  const [breakMinutes, setBreakMinutes] = useState("10");
  const [transferAllowed, setTransferAllowed] = useState(true);
  const [bundleName,setBundleName]=useState("");
  const [bundlePrimary,setBundlePrimary]=useState("");
  const [bundleSupport,setBundleSupport]=useState("");
  const [bundleAssignment,setBundleAssignment]=useState("");
  const [bundleOption,setBundleOption]=useState("");

  const buildingNames = useMemo(() => Object.fromEntries(buildings.map((x) => [x.id, x.name])), [buildings]);
  const poolNames = useMemo(() => Object.fromEntries(pools.map((x) => [x.id, x.name])), [pools]);

  const load = useCallback(async () => {
    const [r, rr, b, p, t, prof,rb,rm,ac,bo] = await Promise.all([
      db.from("classrooms").select("id,name,room_type,capacity,department,hardware,active,building_id,floor,room_pool_id").order("name"),
      db.from("lesson_room_rules").select("id,subject_pattern,required_room_type,required_department,required_hardware,preferred_room_type,preferred_department,preferred_hardware,preferred_building_id,preferred_room_ids,avoided_room_ids,active").eq("active", true).order("subject_pattern"),
      db.from("schedule_buildings").select("id,name,code,active").eq("active", true).order("name"),
      db.from("schedule_room_pools").select("id,name,capacity,max_simultaneous_activities,active").eq("active", true).order("name"),
      db.from("schedule_building_travel").select("id,from_building_id,to_building_id,minutes,active").eq("active", true),
      db.rpc("get_active_schedule_time_profile"),
      db.from("schedule_room_bundles").select("id,name,active").eq("active",true).order("name"),
      db.from("schedule_room_bundle_members").select("bundle_id,classroom_id,member_role,ordinal").order("ordinal"),
      db.rpc("get_schedule_room_bundle_assignment_choices_v1"),
      db.from("schedule_assignment_room_bundle_options").select("teacher_assignment_id,bundle_id"),
    ]);
    const err = r.error || rr.error || b.error || p.error || t.error || prof.error||rb.error||rm.error||ac.error||bo.error;
    if (err) return setMessage(`Derslik verileri okunamadı: ${err.message}`);
    setRooms((r.data ?? []) as Room[]); setRules((rr.data ?? []) as Rule[]); setBuildings((b.data ?? []) as Building[]); setPools((p.data ?? []) as Pool[]); setTravels((t.data ?? []) as Travel[]);
    setRoomBundles((rb.data??[])as RoomBundle[]);setBundleMembers((rm.data??[])as RoomBundleMember[]);setAssignmentChoices((ac.data??[])as AssignmentChoice[]);setBundleOptions((bo.data??[])as BundleOption[]);
    const activeProfile = (Array.isArray(prof.data) ? prof.data[0] : prof.data) as Profile | null; setProfile(activeProfile ?? null);
    if (activeProfile?.id) {
      const br = await db.from("schedule_period_breaks").select("after_period,minutes,transfer_allowed").eq("time_profile_id", activeProfile.id).order("after_period");
      if (!br.error) setBreaks((br.data ?? []) as BreakRow[]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  function parseJson(value: string) { try { return JSON.parse(value) as Record<string, unknown>; } catch { return null; } }
  function roomIds(text: string) { const wanted = text.split(",").map((x) => x.trim().toLocaleLowerCase("tr-TR")).filter(Boolean); return rooms.filter((r) => wanted.includes(r.name.toLocaleLowerCase("tr-TR"))).map((r) => r.id); }

  async function addBuilding() {
    if (!editable || !buildingName.trim()) return;
    const { error } = await db.from("schedule_buildings").upsert({ name: buildingName.trim(), code: buildingCode.trim() || null, active: true }, { onConflict: "institution_code,name" });
    if (error) return setMessage(`Bina kaydedilemedi: ${error.message}`); setBuildingName(""); setBuildingCode(""); setMessage("Bina kaydedildi."); await load();
  }
  async function addPool() {
    if (!editable || !poolName.trim() || Number(poolCapacity) < 1 || Number(poolMax) < 1) return;
    const { error } = await db.from("schedule_room_pools").upsert({ name: poolName.trim(), capacity: Number(poolCapacity), max_simultaneous_activities: Number(poolMax), active: true }, { onConflict: "institution_code,name" });
    if (error) return setMessage(`Oda havuzu kaydedilemedi: ${error.message}`); setPoolName(""); setMessage("Fiziksel oda havuzu kaydedildi."); await load();
  }
  async function addRoom() {
    if (!editable) return; const hw = parseJson(hardware);
    if (!name.trim() || !Number(capacity) || !hw) return setMessage("Derslik adı, kapasite ve geçerli donanım JSON'u gerekir.");
    const { error } = await db.from("classrooms").upsert({ name: name.trim(), room_type: type.trim() || "standard", capacity: Number(capacity), department: department.trim() || null, hardware: hw, building_id: buildingId || null, floor: floor ? Number(floor) : null, room_pool_id: poolId || null, active: true }, { onConflict: "institution_code,name" });
    if (error) return setMessage(`Derslik kaydedilemedi: ${error.message}`); setName(""); setDepartment(""); setHardware("{}"); setFloor(""); setMessage("Derslik kaydedildi."); await load();
  }
  async function addRule() {
    if (!editable) return; const hardHw = parseJson(ruleHardware), prefHw = parseJson(preferredHardware);
    if (!pattern.trim() || !hardHw || !prefHw) return setMessage("Ders deseni ve donanım JSON alanları geçerli olmalı.");
    const { error } = await db.from("lesson_room_rules").upsert({ subject_pattern: pattern.trim(), required_room_type: ruleType.trim() || null, required_department: ruleDepartment.trim() || null, required_hardware: hardHw, preferred_room_type: preferredType.trim() || null, preferred_department: preferredDepartment.trim() || null, preferred_hardware: prefHw, preferred_building_id: preferredBuildingId || null, preferred_room_ids: roomIds(preferredRooms), avoided_room_ids: roomIds(avoidedRooms), active: true }, { onConflict: "institution_code,subject_pattern" });
    if (error) return setMessage(`Derslik kuralı kaydedilemedi: ${error.message}`); setPattern(""); setMessage("Derslik kuralı kaydedildi."); await load();
  }
  async function addTravel() {
    if (!editable || !travelFrom || !travelTo || travelFrom === travelTo || Number(travelMinutes) < 0) return setMessage("İki farklı bina ve geçerli dakika seçin.");
    const { error } = await db.from("schedule_building_travel").upsert({ from_building_id: travelFrom, to_building_id: travelTo, minutes: Number(travelMinutes), active: true }, { onConflict: "institution_code,from_building_id,to_building_id" });
    if (error) return setMessage(`Geçiş süresi kaydedilemedi: ${error.message}`); setMessage("Binalar arası geçiş süresi kaydedildi."); await load();
  }
  async function saveBreak() {
    if (!editable || !profile?.id || Number(breakPeriod) < 1 || Number(breakMinutes) < 0) return;
    const { error } = await db.from("schedule_period_breaks").upsert({ time_profile_id: profile.id, after_period: Number(breakPeriod), minutes: Number(breakMinutes), transfer_allowed: transferAllowed }, { onConflict: "institution_code,time_profile_id,after_period" });
    if (error) return setMessage(`Teneffüs kaydedilemedi: ${error.message}`); setMessage("Teneffüs/transfer kuralı kaydedildi."); await load();
  }
  async function saveRoomBundle(){
    if(!editable||!bundleName.trim()||!bundlePrimary)return setMessage("Demet adı, ana oda ve en az bir destek odası gerekir.");const support=roomIds(bundleSupport).filter(id=>id!==bundlePrimary);if(!support.length)return setMessage("Destek odalarını derslik adlarıyla virgülle ayırın.");
    const{error}=await db.rpc("upsert_schedule_room_bundle_v1",{p_name:bundleName.trim(),p_primary_classroom_id:bundlePrimary,p_component_classroom_ids:support});if(error)return setMessage(`Oda demeti kaydedilemedi: ${error.message}`);setBundleName("");setBundleSupport("");setMessage("Atomik oda demeti kaydedildi.");await load();
  }
  async function saveBundleOption(){
    if(!editable||!bundleAssignment||!bundleOption)return;const{error}=await db.rpc("set_assignment_room_bundle_option_v1",{p_teacher_assignment_id:bundleAssignment,p_bundle_id:bundleOption,p_enabled:true});if(error)return setMessage(`Ders-demeti seçeneği kaydedilemedi: ${error.message}`);setMessage("Ders için bileşik oda seçeneği kaydedildi.");await load();
  }

  return <AppShell title="Derslik · Bina · Oda Havuzu" subtitle="Kapasite · donanım · bina geçişi · shared/virtual room · HARD/SOFT tercihler" action={<Building2 className="size-5"/>}>
    <div className="grid gap-2 sm:grid-cols-2"><Link to="/room-assignment"><Button variant="outline" className="w-full">Otomatik Derslik Atama</Button></Link><Link to="/timetable"><Button variant="outline" className="w-full">Ders Programı</Button></Link></div>
    {!editable ? <div className="mt-3 rounded-xl border bg-muted/30 p-3 text-sm">Derslik ve bina altyapısı salt okunur.</div> : null}
    {message ? <div className="mt-3 rounded-xl border bg-muted/40 p-3 text-sm">{message}</div> : null}

    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Bina</h2><div className="mt-3 grid gap-2"><Label>Ad</Label><Input disabled={!editable} value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="Ana Bina"/><Label>Kod</Label><Input disabled={!editable} value={buildingCode} onChange={(e) => setBuildingCode(e.target.value)} placeholder="A"/><Button disabled={!editable} onClick={() => void addBuilding()}><Plus className="mr-2 size-4"/>Binayı Kaydet</Button></div></section>
      <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Shared / Virtual Oda Havuzu</h2><p className="mt-1 text-xs text-muted-foreground">Aynı fiziksel alanı paylaşan mantıksal odaları tek havuzda birleştirir.</p><div className="mt-3 grid gap-2"><Label>Havuz adı</Label><Input disabled={!editable} value={poolName} onChange={(e) => setPoolName(e.target.value)}/><Label>Toplam fiziksel kapasite</Label><Input type="number" min={1} disabled={!editable} value={poolCapacity} onChange={(e) => setPoolCapacity(e.target.value)}/><Label>Aynı anda en fazla etkinlik</Label><Input type="number" min={1} disabled={!editable} value={poolMax} onChange={(e) => setPoolMax(e.target.value)}/><Button disabled={!editable} onClick={() => void addPool()}><Plus className="mr-2 size-4"/>Havuzu Kaydet</Button></div></section>
      <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Bina Geçişi</h2><div className="mt-3 grid gap-2"><Label>Başlangıç</Label><select className="h-10 rounded-md border bg-background px-3 text-sm" disabled={!editable} value={travelFrom} onChange={(e) => setTravelFrom(e.target.value)}><option value="">Seç</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><Label>Hedef</Label><select className="h-10 rounded-md border bg-background px-3 text-sm" disabled={!editable} value={travelTo} onChange={(e) => setTravelTo(e.target.value)}><option value="">Seç</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select><Label>Yürüme süresi (dk)</Label><Input type="number" min={0} disabled={!editable} value={travelMinutes} onChange={(e) => setTravelMinutes(e.target.value)}/><Button disabled={!editable} onClick={() => void addTravel()}>Geçişi Kaydet</Button></div></section>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Derslik Ekle / Güncelle</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><Label>Ad</Label><Input disabled={!editable} value={name} onChange={(e) => setName(e.target.value)} placeholder="Fen Laboratuvarı 1"/></div><div><Label>Tip</Label><Input disabled={!editable} value={type} onChange={(e) => setType(e.target.value)} placeholder="standard / lab / gym"/></div><div><Label>Kapasite</Label><Input disabled={!editable} type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)}/></div><div><Label>Bölüm</Label><Input disabled={!editable} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Fen / Spor / Bilişim"/></div><div><Label>Bina</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={buildingId} onChange={(e) => setBuildingId(e.target.value)}><option value="">Belirtilmemiş</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><Label>Kat</Label><Input type="number" disabled={!editable} value={floor} onChange={(e) => setFloor(e.target.value)}/></div><div className="sm:col-span-2"><Label>Fiziksel oda havuzu</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={poolId} onChange={(e) => setPoolId(e.target.value)}><option value="">Bağımsız oda</option>{pools.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="sm:col-span-2"><Label>Donanım JSON</Label><Input disabled={!editable} value={hardware} onChange={(e) => setHardware(e.target.value)} placeholder='{"projector":true}'/></div></div><Button disabled={!editable} className="mt-3 w-full" onClick={() => void addRoom()}><Plus className="mr-2 size-4"/>Dersliği Kaydet</Button></section>
      <section className="rounded-xl border bg-card p-4"><h2 className="font-semibold">Teneffüs / Transfer</h2><p className="mt-1 text-xs text-muted-foreground">Farklı binalardaki ardışık dersler yalnız transfer açık ve süre yeterliyse atanabilir.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><Label>Kaçıncı dersten sonra</Label><Input type="number" min={1} max={Math.max(1,(profile?.periods_per_day ?? 8)-1)} disabled={!editable} value={breakPeriod} onChange={(e) => setBreakPeriod(e.target.value)}/></div><div><Label>Teneffüs (dk)</Label><Input type="number" min={0} disabled={!editable} value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)}/></div><label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" disabled={!editable} checked={transferAllowed} onChange={(e) => setTransferAllowed(e.target.checked)}/>Bu teneffüste bina değişimine izin ver</label></div><Button disabled={!editable || !profile} className="mt-3 w-full" onClick={() => void saveBreak()}>Teneffüs Kuralını Kaydet</Button><div className="mt-3 flex flex-wrap gap-2">{breaks.map((b) => <span key={b.after_period} className="rounded-full border px-2 py-1 text-xs">{b.after_period}. ders sonrası · {b.minutes} dk · {b.transfer_allowed ? "transfer açık" : "kapalı"}</span>)}</div></section>
    </div>

    <section className="mt-4 rounded-xl border bg-card p-4"><h2 className="font-semibold">Atomik Oda Demeti</h2><p className="mt-1 text-xs text-muted-foreground">Bir etkinliğin aynı anda kullanacağı tüm fiziksel odaları birlikte tanımlar. Ana oda programda görünür; destek odaları da HARD kaynak olarak rezerve edilir.</p><div className="mt-3 grid gap-3 md:grid-cols-3"><div><Label>Demet adı</Label><Input disabled={!editable} value={bundleName} onChange={e=>setBundleName(e.target.value)} placeholder="Fen Lab + Hazırlık"/></div><div><Label>Ana oda</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={bundlePrimary} onChange={e=>setBundlePrimary(e.target.value)}><option value="">Seç</option>{rooms.filter(r=>r.active).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div><div><Label>Destek odaları</Label><Input disabled={!editable} value={bundleSupport} onChange={e=>setBundleSupport(e.target.value)} placeholder="Hazırlık Odası, Depo 1"/></div></div><Button disabled={!editable} className="mt-3" onClick={()=>void saveRoomBundle()}><Plus className="mr-2 size-4"/>Oda Demetini Kaydet</Button><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><div><Label>Ders / şube ataması</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={bundleAssignment} onChange={e=>setBundleAssignment(e.target.value)}><option value="">Seç</option>{assignmentChoices.map(a=><option key={a.assignment_id} value={a.assignment_id}>{a.class_name} · {a.subject}</option>)}</select></div><div><Label>İzinli oda demeti</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={bundleOption} onChange={e=>setBundleOption(e.target.value)}><option value="">Seç</option>{roomBundles.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div><Button disabled={!editable} className="self-end" onClick={()=>void saveBundleOption()}>Seçeneği Ekle</Button></div><div className="mt-3 divide-y rounded-lg border">{roomBundles.map(b=>{const ms=bundleMembers.filter(m=>m.bundle_id===b.id),used=bundleOptions.filter(o=>o.bundle_id===b.id).length;return <div key={b.id} className="p-3 text-sm"><b>{b.name}</b><p className="text-xs text-muted-foreground">{ms.map(m=>`${m.member_role==="PRIMARY"?"Ana":"Destek"}: ${rooms.find(r=>r.id===m.classroom_id)?.name??"?"}`).join(" · ")} · {used} ders seçeneği</p></div>})}{!roomBundles.length?<p className="p-4 text-sm text-muted-foreground">Atomik oda demeti tanımlı değil.</p>:null}</div></section>

    <section className="mt-4 rounded-xl border bg-card p-4"><h2 className="font-semibold">Ders → Derslik Kuralı</h2><p className="mt-1 text-xs text-muted-foreground">Zorunlular HARD; tercihler SOFT. Oda listelerinde derslik adlarını virgülle ayırın.</p><div className="mt-3 grid gap-3 md:grid-cols-3"><div><Label>Ders deseni</Label><Input disabled={!editable} value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="%Bilişim%"/></div><div><Label>Zorunlu tip</Label><Input disabled={!editable} value={ruleType} onChange={(e) => setRuleType(e.target.value)}/></div><div><Label>Zorunlu bölüm</Label><Input disabled={!editable} value={ruleDepartment} onChange={(e) => setRuleDepartment(e.target.value)}/></div><div><Label>Zorunlu donanım JSON</Label><Input disabled={!editable} value={ruleHardware} onChange={(e) => setRuleHardware(e.target.value)}/></div><div><Label>Tercih edilen tip</Label><Input disabled={!editable} value={preferredType} onChange={(e) => setPreferredType(e.target.value)}/></div><div><Label>Tercih edilen bölüm</Label><Input disabled={!editable} value={preferredDepartment} onChange={(e) => setPreferredDepartment(e.target.value)}/></div><div><Label>Tercih edilen donanım JSON</Label><Input disabled={!editable} value={preferredHardware} onChange={(e) => setPreferredHardware(e.target.value)}/></div><div><Label>Tercih edilen bina</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" disabled={!editable} value={preferredBuildingId} onChange={(e) => setPreferredBuildingId(e.target.value)}><option value="">Serbest</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><Label>Tercih edilen odalar</Label><Input disabled={!editable} value={preferredRooms} onChange={(e) => setPreferredRooms(e.target.value)} placeholder="Lab 1, Lab 2"/></div><div><Label>Kaçınılacak odalar</Label><Input disabled={!editable} value={avoidedRooms} onChange={(e) => setAvoidedRooms(e.target.value)} placeholder="Salon 3"/></div></div><Button disabled={!editable} className="mt-3 w-full" onClick={() => void addRule()}><Plus className="mr-2 size-4"/>Kuralı Kaydet</Button></section>

    <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="rounded-xl border bg-card p-4"><h3 className="font-semibold">Aktif Derslikler</h3><div className="mt-3 divide-y rounded-lg border">{rooms.filter((x) => x.active).map((r) => <div key={r.id} className="p-3 text-sm"><b>{r.name}</b><p className="text-xs text-muted-foreground">{r.room_type} · {r.capacity} kişi{r.department ? ` · ${r.department}` : ""}{r.building_id ? ` · ${buildingNames[r.building_id] ?? "Bina"}${r.floor != null ? ` / ${r.floor}. kat` : ""}` : ""}{r.room_pool_id ? ` · pool: ${poolNames[r.room_pool_id] ?? "shared"}` : ""}</p></div>)}{!rooms.filter((x) => x.active).length ? <p className="p-4 text-sm text-muted-foreground">Derslik tanımlı değil.</p> : null}</div></section><section className="rounded-xl border bg-card p-4"><h3 className="font-semibold">Bina Geçişleri</h3><div className="mt-3 divide-y rounded-lg border">{travels.map((t) => <div key={t.id} className="p-3 text-sm">{buildingNames[t.from_building_id] ?? "?"} → {buildingNames[t.to_building_id] ?? "?"} · <b>{t.minutes} dk</b></div>)}{!travels.length ? <p className="p-4 text-sm text-muted-foreground">Geçiş tanımlı değil.</p> : null}</div></section></div>
    <Button variant="ghost" className="mt-4 gap-2" onClick={() => void load()}><RefreshCw className="size-4"/>Yenile</Button>
  </AppShell>;
}
