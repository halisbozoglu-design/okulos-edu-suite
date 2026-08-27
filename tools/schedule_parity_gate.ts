type Status="PASS"|"PARTIAL"|"FAIL";
type Matrix={schema:string;rows:{id:string;capability:string;okulos:Status;evidence:string}[];competitors:Record<string,string>};
const path=new URL("../benchmarks/world/capability-matrix.json",import.meta.url);
const external=(engine:string)=>!["Okulos","CP-SAT"].includes(engine);
const isNotRun=(status:string)=>["NOT_RUN","UNVERIFIED"].includes(status);
const isComparable=(status:string)=>status==="RUN_COMPARABLE";
export async function evaluateParityGate(){
 const m=await Bun.file(path).json() as Matrix;
 const unresolved=m.rows.filter(r=>r.okulos!=="PASS");
 const entries=Object.entries(m.competitors).filter(([engine])=>external(engine));
 const notRun=entries.filter(([,status])=>isNotRun(status));
 const notComparable=entries.filter(([,status])=>!isComparable(status));
 const parityPass=unresolved.length===0&&notRun.length===0;
 return{
  schema:m.schema,
  parity_pass:parityPass,
  superiority_claim_allowed:parityPass&&notComparable.length===0,
  unresolved,
  competitor_not_run:notRun.map(([engine,status])=>({engine,status})),
  competitor_not_comparable:notComparable.map(([engine,status])=>({engine,status}))
 };
}
if(import.meta.main){const r=await evaluateParityGate();console.log("SCHEDULE_PARITY_GATE",JSON.stringify(r));if(process.argv.includes("--require-parity")&&!r.parity_pass)throw new Error("PARITY_NOT_CLOSED");if(process.argv.includes("--require-superiority")&&!r.superiority_claim_allowed)throw new Error("SUPERIORITY_UNVERIFIED")}
