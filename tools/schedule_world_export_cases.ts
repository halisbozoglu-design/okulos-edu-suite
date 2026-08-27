import{makeWorldProblem}from"./schedule_world_benchmark";
const M=await Bun.file(new URL("../benchmarks/world/manifest.json",import.meta.url)).json()as any,sha=(x:unknown)=>new Bun.CryptoHasher("sha256").update(JSON.stringify(x)).digest("hex");
export function worldCases(){const out:any[]=[];for(const p of M.profiles)for(let i=0;i<M.seed_count;i++){const seed=101+i*7919,problem=makeWorldProblem(p,seed),{seed:_,...normalized}=problem;out.push({schema:M.schema,input_hash:sha(normalized),profile_id:p.id,seed,wall_clock_budget_ms:M.wall_clock_budget_ms,problem})}return out}
if(import.meta.main){const i=process.argv.indexOf("--out"),out=i>=0?process.argv[i+1]:null,body=worldCases().map(x=>JSON.stringify(x)).join("\n")+"\n";if(out)await Bun.write(out,body);else process.stdout.write(body)}
