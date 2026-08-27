import {solveIncrementalSchedule,type LocalProblem} from "@/lib/schedule-local-solver-incremental-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>postMessage(solveIncrementalSchedule(ev.data));
