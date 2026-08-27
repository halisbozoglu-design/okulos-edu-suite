import {solveAdaptiveEliteSchedule} from "@/lib/schedule-adaptive-elite-solver";
import {solveIncrementalSchedule,type LocalProblem} from "@/lib/schedule-local-solver-incremental-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>{const p=ev.data;postMessage((p.strategy??"AUTO")==="AUTO"?solveAdaptiveEliteSchedule(p):solveIncrementalSchedule(p));};
