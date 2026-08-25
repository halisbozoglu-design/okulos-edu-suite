#!/usr/bin/env python3
import os,time,json,random,urllib.request,urllib.error,platform
URL=os.environ["OKULOS_SUPABASE_URL"].rstrip("/"); KEY=os.environ["OKULOS_SERVICE_ROLE_KEY"]
KIND=os.getenv("OKULOS_WORKER_TYPE","CPU").upper(); NAME=os.getenv("OKULOS_WORKER_NAME",f"{platform.node()}-{KIND.lower()}"); MAX=max(1,int(os.getenv("OKULOS_MAX_PARALLEL",str(max(1,(os.cpu_count() or 2)-1)))))
GPU_NAME=None;GPU_MB=None;cp=None
if KIND=="GPU":
 try:
  import cupy as cp
  p=cp.cuda.runtime.getDeviceProperties(0);GPU_NAME=p["name"].decode() if isinstance(p["name"],bytes) else str(p["name"]);GPU_MB=int(p["totalGlobalMem"]//1048576)
 except Exception: KIND="CPU"
def rpc(name,payload):
 data=json.dumps(payload).encode();r=urllib.request.Request(f"{URL}/rest/v1/rpc/{name}",data=data,headers={"apikey":KEY,"Authorization":f"Bearer {KEY}","Content-Type":"application/json"});
 with urllib.request.urlopen(r,timeout=60) as x:
  raw=x.read().decode();return json.loads(raw) if raw else None
def register():
 return rpc("register_schedule_compute_worker_v1",{"p_worker_key":NAME,"p_display_name":NAME,"p_worker_type":KIND,"p_capabilities":{"solver":"greedy-v1","gpu_rank":bool(cp),"platform":platform.platform()},"p_max_parallel":MAX,"p_cpu_threads":os.cpu_count(),"p_gpu_model":GPU_NAME,"p_gpu_memory_mb":GPU_MB,"p_software_version":"1.0"})
def k(*x):return "|".join(map(str,x))
def solve(problem,seed):
 rng=random.Random(seed);assign=problem.get("assignments",[]);locked=problem.get("locked_rows",[]);unav=problem.get("teacher_unavailability",[]);tc={x["teacher_id"]:x for x in problem.get("teacher_constraints",[])};cr={x["course_id"]:x for x in problem.get("course_rules",[])};prof=problem.get("time_profile") or {};days=prof.get("teaching_days",[1,2,3,4,5]);periods=int(prof.get("periods_per_day",8));tb=set();cb=set();td={};cd={};rows=[];lc={}
 for x in locked:
  if not x.get("teacher_assignment_id"):continue
  r={"assignment_id":x["teacher_assignment_id"],"weekday":x["weekday"],"period":x["period"],"classroom_id":x.get("classroom_id"),"subgroup_id":x.get("subgroup_id"),"locked":True};rows.append(r);tb.add(k(x["teacher_id"],x["weekday"],x["period"]));cb.add(k(x.get("class_id"),x["weekday"],x["period"]));lc[x["teacher_assignment_id"]]=lc.get(x["teacher_assignment_id"],0)+1
 blocked={k(x["teacher_id"],x["weekday"],x["period"]) for x in unav if x.get("active",True)};tasks=[]
 for a in assign:tasks += [a]*max(0,int(a["assigned_hours"])-lc.get(a["assignment_id"],0))
 rng.shuffle(tasks)
 for a in tasks:
  rule=cr.get(a["course_id"],{});con=tc.get(a["teacher_id"],{});cand=[]
  for d in days:
   for s in range(1,periods+1):
    if k(a["teacher_id"],d,s) in tb or k(a["class_id"],d,s) in cb or k(a["teacher_id"],d,s) in blocked:continue
    if d in (rule.get("prohibited_days") or []) or s in (rule.get("prohibited_periods") or []):continue
    tdk=k(a["teacher_id"],d);cdk=k(a["class_id"],a["course_id"],d);tdv=td.get(tdk,0);cdv=cd.get(cdk,0)
    if con.get("max_daily_hours") and tdv>=con["max_daily_hours"]:continue
    if rule.get("max_per_day") and cdv>=rule["max_per_day"]:continue
    cand.append((tdv*3+cdv*8+max(0,s-6)*2+rng.random()*4,d,s))
  if not cand:return None
  _,d,s=min(cand);rows.append({"assignment_id":a["assignment_id"],"weekday":d,"period":s,"classroom_id":None,"subgroup_id":None,"locked":False});tb.add(k(a["teacher_id"],d,s));cb.add(k(a["class_id"],d,s));td[k(a["teacher_id"],d)]=td.get(k(a["teacher_id"],d),0)+1;cd[k(a["class_id"],a["course_id"],d)]=cd.get(k(a["class_id"],a["course_id"],d),0)+1
 return rows
def main():
 register();print(f"Okulos accelerator ready: {NAME} {KIND} parallel={MAX}",flush=True)
 while True:
  try:
   rpc("worker_heartbeat_schedule_v1",{"p_worker_key":NAME,"p_load":0,"p_latency_ms":None});job=rpc("worker_claim_schedule_attempt_v1",{"p_worker_key":NAME})
   if not job:time.sleep(1);continue
   st=time.time();rows=solve(job["problem"],int(job.get("seed") or 1));err=None if rows else "NO_COMPLETE_CANDIDATE";rpc("worker_complete_schedule_attempt_v1",{"p_worker_key":NAME,"p_attempt_id":job["attempt_id"],"p_result":{"rows":rows or []},"p_duration_ms":int((time.time()-st)*1000),"p_error":err})
  except KeyboardInterrupt:break
  except Exception as e:print("worker error:",e,flush=True);time.sleep(2)
if __name__=="__main__":main()
