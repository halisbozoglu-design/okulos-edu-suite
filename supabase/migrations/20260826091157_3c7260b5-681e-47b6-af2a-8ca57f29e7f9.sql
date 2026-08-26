CREATE OR REPLACE FUNCTION public.heartbeat_schedule_compute_worker_v1(p_worker_key text, p_current_load numeric DEFAULT 0, p_avg_latency_ms integer DEFAULT NULL::integer, p_health text DEFAULT 'HEALTHY'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$begin if auth.role()<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if; if p_health not in ('HEALTHY','DEGRADED') then raise exception 'WORKER_HEALTH_INVALID'; end if; update schedule_compute_workers set current_load=greatest(0,coalesce(p_current_load,0)),avg_latency_ms=coalesce(p_avg_latency_ms,avg_latency_ms),health=p_health,last_heartbeat=now(),updated_at=now(),active=true where worker_key=p_worker_key and worker_type in('CPU','GPU'); if not found then raise exception 'WORKER_NOT_FOUND'; end if; return true; end$function$;