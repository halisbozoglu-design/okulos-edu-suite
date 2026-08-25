export type LocalComputeCapability={cpuThreads:number;recommendedCpuWorkers:number;webGpu:boolean;gpuName:string|null;gpuLimits:Record<string,number>;mode:"CPU"|"HYBRID"|"GPU"};

function n(v:unknown){return typeof v==="number"&&Number.isFinite(v)?v:0}

export async function detectLocalScheduleCompute():Promise<LocalComputeCapability>{
 const cpuThreads=Math.max(1,Number(globalThis.navigator?.hardwareConcurrency||2));
 const recommendedCpuWorkers=Math.max(1,Math.min(16,cpuThreads>4?cpuThreads-2:cpuThreads-1||1));
 const nav=globalThis.navigator as Navigator&{gpu?:{requestAdapter:(o?:unknown)=>Promise<any>}};
 if(!nav.gpu)return{cpuThreads,recommendedCpuWorkers,webGpu:false,gpuName:null,gpuLimits:{},mode:"CPU"};
 try{
  const adapter=await nav.gpu.requestAdapter({powerPreference:"high-performance"});
  if(!adapter)return{cpuThreads,recommendedCpuWorkers,webGpu:false,gpuName:null,gpuLimits:{},mode:"CPU"};
  const info=adapter.info??{};const limits=adapter.limits??{};
  const gpuLimits={maxComputeWorkgroupsPerDimension:n(limits.maxComputeWorkgroupsPerDimension),maxComputeInvocationsPerWorkgroup:n(limits.maxComputeInvocationsPerWorkgroup),maxStorageBufferBindingSize:n(limits.maxStorageBufferBindingSize)};
  const capable=gpuLimits.maxComputeInvocationsPerWorkgroup>=128&&gpuLimits.maxStorageBufferBindingSize>=16*1024*1024;
  const gpuName=[info.vendor,info.architecture,info.device,info.description].filter(Boolean).join(" · ")||"WebGPU GPU";
  return{cpuThreads,recommendedCpuWorkers,webGpu:capable,gpuName,gpuLimits,mode:capable?(cpuThreads>=6?"HYBRID":"GPU"):"CPU"};
 }catch{return{cpuThreads,recommendedCpuWorkers,webGpu:false,gpuName:null,gpuLimits:{},mode:"CPU"}}
}

export type LocalWorkerProgress={worker:number;kind:"CPU"|"GPU";status:"idle"|"running"|"done"|"error";progress:number;score?:number;unplaced?:number;durationMs?:number};

export function createCpuScheduleWorker(){return new Worker(new URL("../workers/schedule-local-worker.ts",import.meta.url),{type:"module"})}
