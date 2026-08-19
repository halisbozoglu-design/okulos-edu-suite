import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type MyPermission={code:string;module_code:string;module_label:string;label:string;action:string;scope:Record<string,unknown>;dangerous:boolean};

export function usePermissions(){
  const [permissions,setPermissions]=useState<MyPermission[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const reload=useCallback(async()=>{
    setLoading(true);setError(null);
    const {data,error:rpcError}=await supabase.rpc("get_my_permissions");
    if(rpcError){setPermissions([]);setError(rpcError.message);setLoading(false);return;}
    setPermissions((data??[]) as MyPermission[]);setLoading(false);
  },[]);
  useEffect(()=>{void reload();},[reload]);
  const codes=useMemo(()=>new Set(permissions.map(p=>p.code)),[permissions]);
  const can=useCallback((code:string)=>codes.has(code),[codes]);
  const any=useCallback((...wanted:string[])=>wanted.some(code=>codes.has(code)),[codes]);
  const all=useCallback((...wanted:string[])=>wanted.every(code=>codes.has(code)),[codes]);
  return {permissions,codes,loading,error,reload,can,any,all};
}
