import {describe,expect,test} from "bun:test";
import {buildScheduleConstraintPressureAdvisor} from "../src/lib/schedule-constraint-pressure-advisor";

describe("schedule constraint pressure advisor",()=>{
 test("orders foundational blockers before downstream pressure",()=>{const r=buildScheduleConstraintPressureAdvisor([
  {category:"room",code:"ROOM_RULE_HAS_NO_MATCHING_ROOM",status:"error",affected_count:2,detail:"room"},
  {category:"time",code:"TIME_PROFILE_CONFIGURATION_INVALID",status:"error",affected_count:1,detail:"time"},
  {category:"teacher",code:"TEACHER_ASSIGNED_HOURS_EXCEED_WEEKLY_LIMIT",status:"error",affected_count:3,detail:"teacher"}
 ],{lockedCount:4,unavailabilityCount:8,softPreferenceCount:12});expect(r.ready).toBe(false);expect(r.findings[0].family).toBe("DATA_TIME");expect(r.blockerFamilies).toBe(3);expect(r.totalAffected).toBe(6)});
 test("never describes HARD relaxation as a diagnostic action",()=>{const r=buildScheduleConstraintPressureAdvisor([],{lockedCount:3,unavailabilityCount:5,softPreferenceCount:7});expect(r.ready).toBe(true);expect(r.policy).toContain("otomatik gevşetilmez");expect(r.findings.some(x=>x.severity==="PRESSURE"&&x.family==="LOCKED_MANUAL")).toBe(true);expect(r.findings.some(x=>x.title==="SOFT tercih baskısı")).toBe(true)});
 test("collapses related sync errors into one pressure family",()=>{const r=buildScheduleConstraintPressureAdvisor([
  {category:"sync",code:"SYNC_GROUP_EMPTY",status:"error",affected_count:1,detail:"a"},
  {category:"sync",code:"SYNC_SUBGROUP_STUDENT_OVERLAP",status:"error",affected_count:2,detail:"b"}
 ],{lockedCount:0,unavailabilityCount:0,softPreferenceCount:0});const f=r.findings.find(x=>x.family==="SYNC_GROUP");expect(f?.affected).toBe(3);expect(f?.codes.length).toBe(2)});
});
