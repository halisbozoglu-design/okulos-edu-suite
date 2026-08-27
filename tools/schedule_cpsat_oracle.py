#!/usr/bin/env python3
import argparse,hashlib,json,time
from pathlib import Path
from ortools.sat.python import cp_model

def canon_hash(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),default=str).encode()).hexdigest()

def scopes_overlap(a,b):
    ta,tb=a.get('term_no'),b.get('term_no')
    if ta is not None and tb is not None and int(ta)!=int(tb): return False
    wa=str(a.get('week_pattern') or 'ALL').upper(); wb=str(b.get('week_pattern') or 'ALL').upper()
    if {wa,wb}=={'ODD','EVEN'}: return False
    af,at=a.get('valid_from'),a.get('valid_to'); bf,bt=b.get('valid_from'),b.get('valid_to')
    if af and bt and str(af)>str(bt): return False
    if bf and at and str(bf)>str(at): return False
    return True

def slots_from_params(p,days,periods):
    p=p or {}; out=set()
    if isinstance(p.get('slots'),list):
        for s in p['slots']:
            if isinstance(s,dict) and s.get('weekday') is not None and s.get('period') is not None: out.add((int(s['weekday']),int(s['period'])))
    ws=p.get('weekdays') or ([p['weekday']] if p.get('weekday') is not None else days)
    ps=p.get('periods') or ([p['period']] if p.get('period') is not None else periods)
    for d in ws:
        for q in ps: out.add((int(d),int(q)))
    return {(d,p) for d,p in out if d in days and p in periods}

def selector_match(sel,a):
    sel=sel or {}
    for k in ('assignment_id','course_id','teacher_id','class_id'):
        if sel.get(k) not in (None,'') and str(a.get(k))!=str(sel[k]): return False
    return True

def unsupported_relation(r):
    typ=str(r.get('relation_type','')).upper(); left=r.get('left_selector') or {}; right=r.get('right_selector') or {}
    if typ not in {'FORBIDDEN_SLOT','PREFERRED_SLOT'}: return f'{typ}:relation_type'
    if left.get('activity_key'): return f'{typ}:activity_key_selector'
    if any(v not in (None,'',[]) for v in right.values()): return f'{typ}:right_selector'
    return None

def solve(data,limit_s=30.0,seed=1):
    if data.get('schema')!='OKULOS_CP_SAT_ORACLE_V1': raise ValueError('schema must be OKULOS_CP_SAT_ORACLE_V1')
    t0=time.perf_counter(); tp=data.get('time_profile') or {}; days=[int(x) for x in (tp.get('teaching_days') or [1,2,3,4,5])]; ppd=int(tp.get('periods_per_day') or 8); periods=list(range(1,ppd+1)); assignments=data.get('assignments') or []
    unsupported=[]
    for r in data.get('planning_relations') or []:
        why=unsupported_relation(r)
        if why: unsupported.append({'relation_id':r.get('id'),'mode':str(r.get('mode','')).upper(),'reason':why})
    for item in data.get('unsupported') or []: unsupported.append(item)
    hard_unsupported=any(str(x.get('mode','')).upper()=='HARD' for x in unsupported)
    model=cp_model.CpModel(); x={}; by_id={str(a['assignment_id']):a for a in assignments}
    for a in assignments:
        aid=str(a['assignment_id']); allowed={int(p) for p in (a.get('allowed_periods') or periods)} & set(periods)
        if not allowed: unsupported.append({'assignment_id':aid,'mode':'HARD','reason':'NO_ALLOWED_PERIODS'}); hard_unsupported=True; continue
        for d in days:
            for p in sorted(allowed): x[(aid,d,p)]=model.NewBoolVar(f'x_{aid}_{d}_{p}')
        model.Add(sum(v for (z,_,_),v in x.items() if z==aid)==int(a.get('assigned_hours') or 0))
    # Pairwise resource collision constraints are scope-aware: mutually exclusive ODD/EVEN, term or date ranges may share a physical slot.
    for d in days:
        for p in periods:
            for i,a in enumerate(assignments):
                aid=str(a['assignment_id']); va=x.get((aid,d,p))
                if va is None: continue
                for b in assignments[i+1:]:
                    bid=str(b['assignment_id']); vb=x.get((bid,d,p))
                    if vb is None or not scopes_overlap(a,b): continue
                    if str(a.get('teacher_id'))==str(b.get('teacher_id')) or str(a.get('class_id'))==str(b.get('class_id')): model.Add(va+vb<=1)
    for u in data.get('teacher_unavailability') or []:
        if u.get('weekday') is None or u.get('period') is None: continue
        d,p=int(u['weekday']),int(u['period']); us=u.get('schedule_session_id')
        for a in assignments:
            if str(a.get('teacher_id'))!=str(u.get('teacher_id')): continue
            if us and a.get('schedule_session_id') and str(us)!=str(a.get('schedule_session_id')): continue
            key=(str(a['assignment_id']),d,p)
            if key in x:model.Add(x[key]==0)
    for l in data.get('locked_rows') or []:
        key=(str(l.get('assignment_id')),int(l.get('weekday')),int(l.get('period')))
        if key not in x:
            unsupported.append({'assignment_id':l.get('assignment_id'),'mode':'HARD','reason':'LOCK_OUTSIDE_DOMAIN'}); hard_unsupported=True
        else:model.Add(x[key]==1)
    medium=[];soft=[]
    def add_pen(var,weight,mode):
        w=max(1,int(round(float(weight or 1)*1000))); (medium if mode=='MEDIUM' else soft).append((var,w))
    for c in data.get('student_conflict_weights') or []:
        la,ra=str(c.get('left_assignment_id')),str(c.get('right_assignment_id')); aa,bb=by_id.get(la),by_id.get(ra)
        if not aa or not bb or not scopes_overlap(aa,bb): continue
        w=float(c.get('severity_weight') or c.get('student_weight') or 1)
        for d in days:
            for p in periods:
                k1,k2=(la,d,p),(ra,d,p)
                if k1 in x and k2 in x:
                    z=model.NewBoolVar(f'sc_{la}_{ra}_{d}_{p}');model.Add(z<=x[k1]);model.Add(z<=x[k2]);model.Add(z>=x[k1]+x[k2]-1);add_pen(z,w,'MEDIUM')
    for r in data.get('planning_relations') or []:
        if unsupported_relation(r): continue
        typ=str(r.get('relation_type')).upper(); mode=str(r.get('mode','OFF')).upper(); weight=float(r.get('weight') or 1); chosen=[a for a in assignments if selector_match(r.get('left_selector'),a)]; ss=slots_from_params(r.get('parameters'),days,periods)
        if not ss:
            unsupported.append({'relation_id':r.get('id'),'mode':mode,'reason':f'{typ}:EMPTY_SLOT_SET'}); hard_unsupported|=mode=='HARD'; continue
        for a in chosen:
            aid=str(a['assignment_id'])
            for d in days:
                for p in periods:
                    key=(aid,d,p)
                    if key not in x:continue
                    hit=(d,p) in ss; violation=(typ=='FORBIDDEN_SLOT' and hit) or (typ=='PREFERRED_SLOT' and not hit)
                    if not violation:continue
                    if mode=='HARD':model.Add(x[key]==0)
                    elif mode in ('MEDIUM','SOFT'):add_pen(x[key],weight,mode)
    soft_max=sum(w for _,w in soft);scale=soft_max+1
    model.Minimize(sum(v*w*scale for v,w in medium)+sum(v*w for v,w in soft))
    solver=cp_model.CpSolver();solver.parameters.max_time_in_seconds=float(limit_s);solver.parameters.num_search_workers=1;solver.parameters.random_seed=int(seed);solver.parameters.log_search_progress=False
    status=solver.Solve(model); names={cp_model.OPTIMAL:'OPTIMAL',cp_model.FEASIBLE:'FEASIBLE',cp_model.INFEASIBLE:'INFEASIBLE',cp_model.MODEL_INVALID:'UNKNOWN',cp_model.UNKNOWN:'UNKNOWN'}; st=names.get(status,'UNKNOWN')
    objective=float(solver.ObjectiveValue()) if status in (cp_model.OPTIMAL,cp_model.FEASIBLE) else None; bound=float(solver.BestObjectiveBound()) if status in (cp_model.OPTIMAL,cp_model.FEASIBLE) else None
    gap=0.0 if st=='OPTIMAL' else (abs(objective-bound)/max(1.0,abs(objective)) if objective is not None and bound is not None else None)
    rows=[]
    if status in (cp_model.OPTIMAL,cp_model.FEASIBLE):
        for (aid,d,p),v in x.items():
            if solver.Value(v):rows.append({'assignment_id':aid,'weekday':d,'period':p})
        rows.sort(key=lambda z:(z['weekday'],z['period'],z['assignment_id']))
    full_exact=not unsupported and not hard_unsupported; public_status='UNSUPPORTED' if hard_unsupported else st
    return {'schema':'OKULOS_CP_SAT_ORACLE_RESULT_V1','input_hash':canon_hash(data),'status':public_status,'cp_sat_status':st,'full_model_exact':full_exact,'objective':objective,'best_bound':bound,'gap':gap,'wall_ms':round((time.perf_counter()-t0)*1000),'unsupported':unsupported,'rows':rows,'diagnostics':{'assignments':len(assignments),'variables':len(x),'medium_terms':len(medium),'soft_terms':len(soft),'seed':seed,'time_limit_s':limit_s,'objective_scale':scale,'scope_aware':True}}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('input');ap.add_argument('--output');ap.add_argument('--time-limit',type=float,default=30);ap.add_argument('--seed',type=int,default=1);args=ap.parse_args();data=json.loads(Path(args.input).read_text());result=solve(data,args.time_limit,args.seed);txt=json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2);Path(args.output).write_text(txt) if args.output else print(txt)
if __name__=='__main__':main()
