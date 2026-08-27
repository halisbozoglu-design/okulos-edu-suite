#!/usr/bin/env python3
import copy,json
from pathlib import Path
from schedule_cpsat_oracle import solve

fixture=json.loads(Path('tests/fixtures/schedule-cpsat-oracle-small.json').read_text())
r1=solve(fixture,10,12345);r2=solve(fixture,10,12345)
assert r1['status']=='OPTIMAL',r1
assert r1['cp_sat_status']=='OPTIMAL'
assert r1['full_model_exact'] is True
assert r1['gap']==0.0
assert r1['unsupported']==[]
assert r1['rows']==r2['rows'] and r1['objective']==r2['objective']
counts={a['assignment_id']:0 for a in fixture['assignments']}
seen_teacher=set();seen_class=set();by={a['assignment_id']:a for a in fixture['assignments']}
for row in r1['rows']:
    counts[row['assignment_id']]+=1;a=by[row['assignment_id']]
    tk=(a['teacher_id'],row['weekday'],row['period']);ck=(a['class_id'],row['weekday'],row['period'])
    assert tk not in seen_teacher;assert ck not in seen_class;seen_teacher.add(tk);seen_class.add(ck)
assert counts=={a['assignment_id']:a['assigned_hours'] for a in fixture['assignments']}
assert any(x['assignment_id']=='a1' and x['weekday']==1 and x['period']==1 for x in r1['rows'])
assert not any(by[x['assignment_id']]['teacher_id']=='t2' and x['weekday']==1 and x['period']==4 for x in r1['rows'])

# Section 8 parity: mutually exclusive week/term/date scopes may share a physical teacher/class slot.
scope=copy.deepcopy(fixture);scope['time_profile']['teaching_days']=[1];scope['time_profile']['periods_per_day']=1
scope['assignments']=[
 {'assignment_id':'odd','teacher_id':'tx','class_id':'cx','course_id':'co','assigned_hours':1,'week_pattern':'ODD','valid_from':'2026-09-01','valid_to':'2026-12-31','term_no':1,'allowed_periods':[1]},
 {'assignment_id':'even','teacher_id':'tx','class_id':'cx','course_id':'ce','assigned_hours':1,'week_pattern':'EVEN','valid_from':'2026-09-01','valid_to':'2026-12-31','term_no':1,'allowed_periods':[1]},
 {'assignment_id':'term2','teacher_id':'tx','class_id':'cx','course_id':'ct','assigned_hours':1,'week_pattern':'ALL','valid_from':'2027-02-01','valid_to':'2027-06-30','term_no':2,'allowed_periods':[1]},
]
scope['locked_rows']=[];scope['teacher_unavailability']=[];scope['planning_relations']=[];scope['student_conflict_weights']=[]
rs=solve(scope,10,12345);assert rs['status']=='OPTIMAL',rs;assert len(rs['rows'])==3;assert all(x['period']==1 for x in rs['rows']);assert rs['diagnostics']['scope_aware'] is True
# ALL and ODD in the same term/date domain must still collide and therefore be infeasible with one slot.
conflict=copy.deepcopy(scope);conflict['assignments']=conflict['assignments'][:2];conflict['assignments'][1]['week_pattern']='ALL'
rc=solve(conflict,10,12345);assert rc['status']=='INFEASIBLE',rc

unsupported=copy.deepcopy(fixture);unsupported['planning_relations'].append({'id':'r3','relation_type':'MAX_SIMULTANEOUS','mode':'HARD','weight':1,'left_selector':{},'right_selector':{},'parameters':{'max':2}})
r3=solve(unsupported,10,12345)
assert r3['status']=='UNSUPPORTED'
assert r3['full_model_exact'] is False
assert any(x.get('relation_id')=='r3' and x.get('mode')=='HARD' for x in r3['unsupported'])
print(json.dumps({'status':r1['status'],'objective':r1['objective'],'bound':r1['best_bound'],'gap':r1['gap'],'wall_ms':r1['wall_ms'],'rows':len(r1['rows']),'deterministic':True,'unsupported_guard':True,'scope_parity':True},sort_keys=True))
