import type{DesktopSyncPolicy}from'./desktop-sync-policy';
import type{DesktopSolverEffort}from'./desktop-solver-compute-policy';

type Invoke=(command:string,args?:Record<string,unknown>)=>Promise<unknown>;
type TauriWindow=Window&{__TAURI_INTERNALS__?:{invoke?:Invoke}};
export type DesktopRuntimeEnvelope={id:number;userKey:string;institutionKey:string;module:string;entityType:string;entityId:string;revision:string|null;contentHash:string|null;payloadJson:string;state:string};
export type DesktopRuntimeCapabilities={logicalCpuCount:number;os:string;arch:string;cpuParallelAvailable:boolean;gpuRuntimeProbeRequired:boolean;gpuPolicy:string;canonicalObjectiveAuthority:string;compiledConstraintDispatch:boolean;parallelPortfolio:boolean};
export type DesktopRuntimeComputePlan={backend:'CPU_ONLY'|'CPU_GPU_HYBRID';cpuWorkers:number;gpuCandidateBatching:boolean;gpuObjectiveAuthority:false;compiledConstraintDispatch:true;parallelPortfolio:true;effort:DesktopSolverEffort;searchPolicy:string};

function invoke():Invoke|null{if(typeof window==='undefined')return null;return((window as TauriWindow).__TAURI_INTERNALS__?.invoke??null)}
export function isOkulosDesktop(){return invoke()!==null}
async function call<T>(command:string,args?:Record<string,unknown>):Promise<T>{const fn=invoke();if(!fn)throw new Error('OKULOS_DESKTOP_RUNTIME_UNAVAILABLE');return await fn(command,args)as T}
export const okulosDesktop={
  available:isOkulosDesktop,
  capabilities:()=>call<DesktopRuntimeCapabilities>('desktop_capabilities'),
  computePlan:(effort:DesktopSolverEffort,gpuAvailable:boolean)=>call<DesktopRuntimeComputePlan>('desktop_compute_plan',{effort,gpuAvailable}),
  syncContract:()=>call<Record<string,unknown>>('desktop_sync_contract'),
  saveSyncPolicy:(userKey:string,institutionKey:string,policy:DesktopSyncPolicy)=>call<void>('save_sync_policy',{userKey,institutionKey,policy}),
  loadSyncPolicy:(userKey:string,institutionKey:string)=>call<DesktopSyncPolicy|null>('load_sync_policy',{userKey,institutionKey}),
  queueWebUpdate:(x:{userKey:string;institutionKey:string;module:string;entityType:string;entityId:string;revision?:string|null;contentHash?:string|null;payload:unknown})=>call<number>('queue_web_update',{userKey:x.userKey,institutionKey:x.institutionKey,module:x.module,entityType:x.entityType,entityId:x.entityId,revision:x.revision??null,contentHash:x.contentHash??null,payloadJson:JSON.stringify(x.payload)}),
  pendingWebUpdates:(userKey:string,institutionKey:string,limit=200)=>call<DesktopRuntimeEnvelope[]>('pending_web_updates',{userKey,institutionKey,limit}),
  markWebUpdateSynced:(id:number)=>call<void>('mark_web_update_synced',{id}),
  storeWebPull:(x:{userKey:string;institutionKey:string;module:string;entityType:string;entityId:string;revision?:string|null;contentHash?:string|null;payload:unknown})=>call<void>('store_web_pull',{userKey:x.userKey,institutionKey:x.institutionKey,module:x.module,entityType:x.entityType,entityId:x.entityId,revision:x.revision??null,contentHash:x.contentHash??null,payloadJson:JSON.stringify(x.payload)})
}as const;
