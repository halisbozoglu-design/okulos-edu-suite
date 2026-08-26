import {solveLocalSchedule,type LocalProblem} from "@/lib/schedule-local-solver-time-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>postMessage(solveLocalSchedule(ev.data));