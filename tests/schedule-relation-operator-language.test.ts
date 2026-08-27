import {describe,expect,test} from "bun:test";
import {PLANNING_RELATION_TYPES} from "../src/lib/schedule-constraint-ontology";
import {relationOperatorText,RELATION_OPERATOR_LANGUAGE_POLICY} from "../src/lib/schedule-relation-operator-language";
describe("relation operator language",()=>{
 test("every canonical relation type has an operator label and keeps its canonical id",()=>{for(const s of PLANNING_RELATION_TYPES){const x=relationOperatorText(s.type);expect(x.type).toBe(s.type);expect(x.label.length).toBeGreaterThan(3);expect(x.description).toBe(s.description)}});
 test("common rules are expressed in school operator language",()=>{expect(relationOperatorText("SAME_DAY").label).toBe("Aynı gün olsun");expect(relationOperatorText("NOT_OVERLAP").label).toBe("Zamanları çakışmasın");expect(relationOperatorText("MAX_DIFFERENT_ROOMS").group).toBe("Derslik")});
 test("labels never become a new solver authority",()=>expect(RELATION_OPERATOR_LANGUAGE_POLICY).toContain("solver semantiği değişmez"));
});
