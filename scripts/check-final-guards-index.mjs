import { readFile } from "node:fs/promises";
const index=await readFile(new URL("./README-final-guards.md",import.meta.url),"utf8");
const expected=["check-authenticated-entry.mjs","check-route-access-map.mjs","check-route-tree-consistency.mjs","check-no-unclassified-routes.mjs"];
for(const x of expected)if(!index.includes(x)){console.error(`Guard index missing ${x}`);process.exit(1)}
console.log("Final guard index complete.");
