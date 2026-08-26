create or replace function claim_schedule_worker_attempt_v1(p_worker_key text)
returns table(attempt_id uuid,job_id uuid,attempt_no smallint,seed integer,mode text,quality_target smallint,config jsonb)
language plpgsql security definer set search_path=public as $$
declare w uuid;lim smallint;a uuid;
begin
 if auth.role()<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED';end if;
 select id,max_parallel into w,lim from schedule_compute_workers where worker_key=p_worker_key and active and worker_type in('CPU','GPU') and health in('HEALTHY','DEGRADED') and last_heartbeat>now()-interval '5 minutes';
 if w is null then raise exception 'WORKER_NOT_READY';end if;
 if (select count(*) from schedule_solve_attempts where worker_id=w and status='RUNNING')>=lim then return;end if;
 select x.id into a from schedule_solve_attempts x join schedule_solve_jobs j on j.id=x.job_id where x.worker_id=w and x.status='PLANNED' and j.status in('QUEUED','RUNNING') order by j.created_at,x.attempt_no for update of x skip locked limit 1;
 if a is null then return;end if;
 update schedule_solve_attempts set status='RUNNING',started_at=now(),finished_at=null where id=a;
 update schedule_solve_jobs set status='RUNNING',started_at=coalesce(started_at,now()) where id=(select x.job_id from schedule_solve_attempts x where x.id=a);
 return query select x.id,x.job_id,x.attempt_no,x.seed,j.mode,j.quality_target,j.config from schedule_solve_attempts x join schedule_solve_jobs j on j.id=x.job_id where x.id=a;
end$$;

create or replace function complete_schedule_worker_attempt_v1(p_worker_key text,p_attempt_id uuid,p_scenario_id uuid,p_score numeric default null,p_hard_issue_count integer default null,p_unplaced_count integer default null,p_duration_ms integer default null,p_diagnostics jsonb default '{}')
returns boolean language plpgsql security definer set search_path=public as $$
declare j uuid;
begin
 if auth.role()<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED';end if;
 select a.job_id into j from schedule_solve_attempts a join schedule_compute_workers w on w.id=a.worker_id where a.id=p_attempt_id and a.status='RUNNING' and w.worker_key=p_worker_key and w.active;
 if j is null then raise exception 'ATTEMPT_NOT_OWNED';end if;
 if not exists(select 1 from schedule_scenarios where id=p_scenario_id) then raise exception 'SCENARIO_NOT_FOUND';end if;
 update schedule_solve_attempts set status='COMPLETED',scenario_id=p_scenario_id,score=p_score,hard_issue_count=p_hard_issue_count,unplaced_count=p_unplaced_count,duration_ms=p_duration_ms,diagnostics=coalesce(diagnostics,'{}')||coalesce(p_diagnostics,'{}'),finished_at=now() where id=p_attempt_id;
 if not exists(select 1 from schedule_solve_attempts where job_id=j and status in('PLANNED','RUNNING')) then update schedule_solve_jobs set status=case when exists(select 1 from schedule_solve_attempts where job_id=j and status='COMPLETED') then case when exists(select 1 from schedule_solve_attempts where job_id=j and status='FAILED') then 'PARTIAL' else 'COMPLETED' end else 'FAILED' end,finished_at=now() where id=j;end if;
 return true;
end$$;

create or replace function fail_schedule_worker_attempt_v1(p_worker_key text,p_attempt_id uuid,p_diagnostics jsonb default '{}')
returns text language plpgsql security definer set search_path=public as $$
declare j uuid;oldw uuid;oldt text;neww uuid;newkey text;
begin
 if auth.role()<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED';end if;
 select a.job_id,w.id,w.worker_type into j,oldw,oldt from schedule_solve_attempts a join schedule_compute_workers w on w.id=a.worker_id where a.id=p_attempt_id and a.status='RUNNING' and w.worker_key=p_worker_key;
 if j is null then raise exception 'ATTEMPT_NOT_OWNED';end if;
 select w.id,w.worker_key into neww,newkey from schedule_compute_workers w where w.active and w.id<>oldw and w.health in('HEALTHY','DEGRADED') and (w.worker_key='db-native' or w.last_heartbeat>now()-interval '5 minutes') and (w.worker_type=oldt or (oldt='GPU' and w.worker_type='CPU') or w.worker_type='DB') order by case when w.worker_type=oldt then 0 when oldt='GPU' and w.worker_type='CPU' then 1 when w.worker_type='DB' then 2 else 9 end,w.current_load,w.priority limit 1;
 if neww is not null then
  update schedule_solve_attempts set worker_id=neww,status='PLANNED',started_at=null,finished_at=null,diagnostics=coalesce(diagnostics,'{}')||jsonb_build_object('failover_from',p_worker_key,'failed_at',now())||coalesce(p_diagnostics,'{}') where id=p_attempt_id;
  return newkey;
 end if;
 update schedule_solve_attempts set status='FAILED',finished_at=now(),diagnostics=coalesce(diagnostics,'{}')||coalesce(p_diagnostics,'{}') where id=p_attempt_id;
 if not exists(select 1 from schedule_solve_attempts where job_id=j and status in('PLANNED','RUNNING')) then update schedule_solve_jobs set status=case when exists(select 1 from schedule_solve_attempts where job_id=j and status='COMPLETED') then 'PARTIAL' else 'FAILED' end,finished_at=now() where id=j;end if;
 return null;
end$$;