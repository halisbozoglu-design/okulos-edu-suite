import {solveIncrementalSchedule,type JointLocalProblem} from "@/lib/schedule-local-solver-incremental-core";
self.onmessage=(ev:MessageEvent<JointLocalProblem>)=>postMessage(solveIncrementalSchedule(ev.data));
