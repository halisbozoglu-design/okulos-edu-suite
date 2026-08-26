import {solveLocalSchedule,type LocalProblem} from "@/lib/schedule-local-solver-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>postMessage(solveLocalSchedule(ev.data));