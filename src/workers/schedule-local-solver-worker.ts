import {solveAdaptiveEliteSchedule} from "@/lib/schedule-adaptive-elite-solver";
import {solveIncrementalSchedule} from "@/lib/schedule-local-solver-incremental-core";
import type {LocalProblem} from "@/lib/schedule-local-solver-time-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>postMessage(ev.data.strategy==="AUTO"?solveAdaptiveEliteSchedule(ev.data):solveIncrementalSchedule(ev.data));
