import {solveAdaptiveEliteSchedule} from "@/lib/schedule-adaptive-elite-solver";
import type {LocalProblem} from "@/lib/schedule-local-solver-time-core";
self.onmessage=(ev:MessageEvent<LocalProblem>)=>postMessage(solveAdaptiveEliteSchedule(ev.data));
