import {describe,expect,test} from "bun:test";
import {parseScheduleVoiceCommand} from "../src/lib/schedule-voice-command";
describe("schedule voice commands",()=>{
 test("places spoken one-hour course",()=>expect(parseScheduleVoiceCommand("7/A Salı birinci saat matematik bir saat")).toEqual({kind:"PLACE_COURSE",classText:"7/A",courseText:"matematik",weekday:2,period:1,hours:1,lock:true}));
 test("blocks first two teacher periods",()=>expect(parseScheduleVoiceCommand("Ahmet Yılmaz Salı ilk iki saat kapalı")).toEqual({kind:"BLOCK_TEACHER",teacherText:"ahmet yilmaz",weekday:2,periods:[1,2]}));
});
