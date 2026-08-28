#!/usr/bin/env python3
import json,sys
from pathlib import Path
from ortools.sat.python import cp_model

FIXTURE=Path("tests/fixtures/schedule-impossible-near-impossible.json")

def solve_case(case):
    p=case["problem"];days=[int(d) for d in p["days"]];periods=range(1,int(p["periods"])+1);assignments=p["assignments"];model=cp_model.CpModel();x={}
    for a in assignments:
        aid=a["assignment_id"]
        for d in days:
            for period in periods:x[(aid,d,period)]=model.NewBoolVar(f"x_{aid}_{d}_{period}")
        model.Add(sum(x[(aid,d,period)] for d in days for period in periods)==int(a["assigned_hours"]))
        allowed=a.get("allowed_periods")
        if allowed:
            for d in days:
                for period in periods:
                    if period not in allowed:model.Add(x[(aid,d,period)]==0)
    for d in days:
        for period in periods:
            for field in ("teacher_id","class_id"):
                values={a[field] for a in assignments}
                for value in values:model.Add(sum(x[(a["assignment_id"],d,period)] for a in assignments if a[field]==value)<=1)
    for u in p.get("unavailable",[]):
        for a in assignments:
            if a["teacher_id"]==u["teacher_id"]:model.Add(x[(a["assignment_id"],int(u["weekday"]),int(u["period"]))]==0)
    for row in p.get("locked",[]):model.Add(x[(row["assignment_id"],int(row["weekday"]),int(row["period"]))]==1)
    constraints={c["teacher_id"]:c for c in p.get("teacherConstraints",[])}
    for teacher,c in constraints.items():
        mine=[a for a in assignments if a["teacher_id"]==teacher]
        for d in days:
            daily=[x[(a["assignment_id"],d,period)] for a in mine for period in periods]
            if c.get("max_daily_hours"):model.Add(sum(daily)<=int(c["max_daily_hours"]))
            maximum=c.get("max_consecutive_hours")
            if maximum:
                maximum=int(maximum)
                for start in range(1,int(p["periods"])-maximum+1):model.Add(sum(x[(a["assignment_id"],d,period)] for a in mine for period in range(start,start+maximum+1))<=maximum)
    rules={r["course_id"]:r for r in p.get("courseRules",[])}
    for a in assignments:
        rule=rules.get(a["course_id"],{})
        for d in days:
            if d in (rule.get("prohibited_days") or []):
                for period in periods:model.Add(x[(a["assignment_id"],d,period)]==0)
            for period in rule.get("prohibited_periods") or []:model.Add(x[(a["assignment_id"],d,int(period))]==0)
    for class_id in {a["class_id"] for a in assignments}:
        for course_id,rule in rules.items():
            maximum=rule.get("max_per_day")
            if not maximum:continue
            mine=[a for a in assignments if a["class_id"]==class_id and a["course_id"]==course_id]
            for d in days:model.Add(sum(x[(a["assignment_id"],d,period)] for a in mine for period in periods)<=int(maximum))
    solver=cp_model.CpSolver();solver.parameters.num_search_workers=1;solver.parameters.max_time_in_seconds=10;solver.parameters.random_seed=int(p["seed"]);status=solver.Solve(model)
    return "FEASIBLE" if status in (cp_model.OPTIMAL,cp_model.FEASIBLE) else "INFEASIBLE" if status==cp_model.INFEASIBLE else "UNKNOWN"

def main():
    fixture=json.loads(FIXTURE.read_text());results=[]
    for case in fixture["cases"]:
        observed=solve_case(case);results.append({"id":case["id"],"expected":case["expected"],"observed":observed,"pass":observed==case["expected"]})
    report={"schema":"OKULOS_IMPOSSIBLE_CP_SAT_ORACLE_V1","cases":len(results),"passed":sum(r["pass"] for r in results),"results":results}
    print(json.dumps(report,sort_keys=True))
    if report["cases"]!=9 or report["passed"]!=9:sys.exit(1)

if __name__=="__main__":main()
