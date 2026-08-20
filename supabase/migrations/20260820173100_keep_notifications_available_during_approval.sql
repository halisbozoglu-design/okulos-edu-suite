-- Keep /notifications reachable so principals can receive approval, rejection and maintenance messages.
create or replace function public.get_system_access_state(p_path text default null)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare v_super boolean;v_code text;v_approval text;v_global record;v_feature record;
begin
 v_super:=public.is_super_admin();
 if v_super then return jsonb_build_object('allowed',true,'super_admin',true,'approval_status','approved','maintenance',false); end if;
 v_code:=public.get_my_institution_code();
 if v_code is null then return jsonb_build_object('allowed',true,'super_admin',false,'approval_status','none','maintenance',false); end if;
 select approval_status into v_approval from public.institutions where institution_code=v_code;
 if p_path='/notifications' or p_path like '/notifications/%' then
   select * into v_feature from public.system_feature_catalog where feature_key='notifications';
   if found and (not v_feature.enabled or v_feature.maintenance) then return jsonb_build_object('allowed',false,'reason','feature_maintenance','approval_status',coalesce(v_approval,'pending'),'maintenance',v_feature.maintenance,'feature_key',v_feature.feature_key,'feature_label',v_feature.label,'message',coalesce(v_feature.maintenance_message,'Bildirimler geçici olarak kullanıma kapalıdır.')); end if;
   return jsonb_build_object('allowed',true,'super_admin',false,'approval_status',coalesce(v_approval,'pending'),'maintenance',false);
 end if;
 if coalesce(v_approval,'pending')<>'approved' then return jsonb_build_object('allowed',false,'reason','tenant_'||coalesce(v_approval,'pending'),'approval_status',coalesce(v_approval,'pending'),'maintenance',false); end if;
 select maintenance,maintenance_message into v_global from public.system_runtime_settings where singleton;
 if coalesce(v_global.maintenance,false) then return jsonb_build_object('allowed',false,'reason','system_maintenance','approval_status',v_approval,'maintenance',true,'message',v_global.maintenance_message); end if;
 if p_path is not null then
   select * into v_feature from public.system_feature_catalog f where f.route_prefix is not null and (p_path=f.route_prefix or p_path like f.route_prefix||'/%') order by char_length(f.route_prefix) desc limit 1;
   if found and (not v_feature.enabled or v_feature.maintenance) then return jsonb_build_object('allowed',false,'reason','feature_maintenance','approval_status',v_approval,'maintenance',v_feature.maintenance,'feature_key',v_feature.feature_key,'feature_label',v_feature.label,'message',coalesce(v_feature.maintenance_message,v_feature.label||' geçici olarak kullanıma kapalıdır.')); end if;
 end if;
 return jsonb_build_object('allowed',true,'super_admin',false,'approval_status',v_approval,'maintenance',false);
end $$;
revoke all on function public.get_system_access_state(text) from public;
grant execute on function public.get_system_access_state(text) to authenticated;
