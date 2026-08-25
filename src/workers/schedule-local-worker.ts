type Candidate={id:string;hard:number;unplaced:number;gap:number;late:number;repeat:number;preference:number};
self.onmessage=(ev:MessageEvent<{candidates:Candidate[];weights?:Partial<Record<keyof Omit<Candidate,"id">,number>>}>)=>{
 const started=performance.now(),w={hard:100000,unplaced:10000,gap:8,late:2,repeat:12,preference:-1,...ev.data.weights};
 const scored=ev.data.candidates.map(c=>({id:c.id,score:c.hard*w.hard+c.unplaced*w.unplaced+c.gap*w.gap+c.late*w.late+c.repeat*w.repeat+c.preference*w.preference})).sort((a,b)=>a.score-b.score);
 postMessage({type:"done",best:scored[0]??null,scored,durationMs:Math.round(performance.now()-started)});
};
