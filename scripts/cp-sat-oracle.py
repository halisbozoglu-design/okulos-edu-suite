#!/usr/bin/env python3
import json, sys, time
from ortools.sat.python import cp_model

def main():
    data=json.load(sys.stdin); unsupported=data.get('unsupported') or []
    if unsupported:
        json.dump({'status':'UNSUPPORTED','unsupported':unsupported},sys.stdout); return
    days=[int(x) for x in data['days']]; periods=int(data['periods']); assignments=data['assignments']; locked=data.get('locked',[]); unavailable=data.get('unavailable',[]); rules={r['course_id']:r for r in data.get('courseRules',[])}; cons={r['teacher_id']:r for r in data.get('teacherConstraints',[])}; weights=data.get('studentConflictWeights',[])
    m=cp_model.CpModel(); cells={}; task_meta=[]
    locked_count={}
    for r in locked: locked_count[r['assignment_id']]=locked_count.get(r['assignment_id'],0)+1
    for a in assignments:
        left=max(0,int(a['assigned_hours'])-locked_count.get(a['assignment_id'],0)); rule=rules.get(a['course_id'],{}); p=[int(x) for x in (rule.get('block_pattern') or []) if int(x)>0]
        parts=p if p and sum(p)==left else [1]*left
        for ti,dur in enumerate(parts):
            key=(a['assignment_id'],ti); task_meta.append((key,a,dur)); allowed=[]
            for d in days:
                if d in (rule.get('prohibited_days') or []): continue
                for s in range(1,periods-dur+2):
                    ok=True
                    for p0 in range(s,s+dur):
                        if a.get('allowed_periods') and p0 not in a['allowed_periods']: ok=False
                        if p0 in (rule.get('prohibited_periods') or []): ok=False
                        if any(u['teacher_id']==a['teacher_id'] and int(u['weekday'])==d and int(u['period'])==p0 and (u.get('schedule_session_id') is None or u.get('schedule_session_id')==a.get('schedule_session_id')) for u in unavailable): ok=False
                    if ok:
                        v=m.NewBoolVar(f"x_{a['assignment_id']}_{ti}_{d}_{s}"); cells[(key,d,s)]=v; allowed.append(v)
            m.Add(sum(allowed)==1)
    # teacher/class collisions, including locked rows
    for d in days:
      for p0 in range(1,periods+1):
        by_teacher={}; by_class={}
        for key,a,dur in task_meta:
          for s in range(max(1,p0-dur+1),p0+1):
            v=cells.get((key,d,s))
            if v is not None:
              by_teacher.setdefault(a['teacher_id'],[]).append(v); by_class.setdefault(a['class_id'],[]).append(v)
        for r in locked:
          if int(r['weekday'])==d and int(r['period'])==p0:
            by_teacher.setdefault(r['teacher_id'],[]).append(1); by_class.setdefault(r.get('class_id'),[]).append(1)
        for xs in by_teacher.values(): m.Add(sum(xs)<=1)
        for xs in by_class.values(): m.Add(sum(xs)<=1)
    # daily teacher limits
    for teacher,c in cons.items():
      lim=c.get('max_daily_hours')
      if lim:
        for d in days:
          xs=[]
          for key,a,dur in task_meta:
            if a['teacher_id']!=teacher: continue
            for s in range(1,periods-dur+2):
              v=cells.get((key,d,s))
              if v is not None: xs.extend([v]*dur)
          base=sum(1 for r in locked if r['teacher_id']==teacher and int(r['weekday'])==d)
          m.Add(sum(xs)+base<=int(lim))
    # Student conflict + late objective. Exact lexicographic via safe multiplier.
    late_terms=[]; conflict_terms=[]; weight_map={}
    for w in weights:
      a,b=sorted([w['left_assignment_id'],w['right_assignment_id']]); weight_map[(a,b)]=int(w.get('severity_weight') or w.get('student_weight') or 0)
    placements={}
    for key,a,dur in task_meta:
      placements.setdefault(a['assignment_id'],[])
      for d in days:
        for s in range(1,periods-dur+2):
          v=cells.get((key,d,s))
          if v is not None:
            placements[a['assignment_id']].append((d,s,dur,v))
            late_terms.append(max(0,s+dur-1-6)*2*v)
    for (aa,bb),w in weight_map.items():
      if w<=0: continue
      for da,sa,dua,va in placements.get(aa,[]):
        for db,sb,dub,vb in placements.get(bb,[]):
          if da!=db or sa+dua-1<sb or sb+dub-1<sa: continue
          z=m.NewBoolVar(f"z_{aa}_{bb}_{da}_{sa}_{sb}"); m.Add(z<=va); m.Add(z<=vb); m.Add(z>=va+vb-1); conflict_terms.append(w*z)
    medium=sum(conflict_terms) if conflict_terms else 0; soft=sum(late_terms) if late_terms else 0
    m.Minimize(medium*1000000+soft)
    solver=cp_model.CpSolver(); solver.parameters.max_time_in_seconds=float(data.get('timeLimitSeconds',30)); solver.parameters.num_search_workers=int(data.get('workers',1)); solver.parameters.random_seed=int(data.get('seed',1)); solver.parameters.log_search_progress=False
    t=time.time(); status=solver.Solve(m); elapsed=int((time.time()-t)*1000)
    name=solver.StatusName(status); out={'status':name,'elapsedMs':elapsed,'objective':solver.ObjectiveValue() if status in (cp_model.OPTIMAL,cp_model.FEASIBLE) else None,'bestBound':solver.BestObjectiveBound() if status in (cp_model.OPTIMAL,cp_model.FEASIBLE) else None,'rows':[],'unsupported':[]}
    if status in (cp_model.OPTIMAL,cp_model.FEASIBLE):
      out['rows']=[dict(r,locked=True) for r in locked]
      for key,a,dur in task_meta:
        for d in days:
          for s in range(1,periods-dur+2):
            v=cells.get((key,d,s))
            if v is not None and solver.Value(v):
              for p0 in range(s,s+dur): out['rows'].append({'assignment_id':a['assignment_id'],'teacher_id':a['teacher_id'],'class_id':a['class_id'],'weekday':d,'period':p0,'schedule_session_id':a.get('schedule_session_id'),'locked':False,'activity_key':f"{a['assignment_id']}:{key[1]+1}",'activity_duration':dur})
    json.dump(out,sys.stdout,separators=(',',':'))
if __name__=='__main__': main()
