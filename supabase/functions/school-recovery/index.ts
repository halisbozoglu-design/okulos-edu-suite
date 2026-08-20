import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:corsHeaders});
function validTckn(v:string){if(!/^\d{11}$/.test(v)||v[0]==="0")return false;const d=v.split("").map(Number);const odd=d[0]+d[2]+d[4]+d[6]+d[8],even=d[1]+d[3]+d[5]+d[7];const tenth=((odd*7-even)%10+10)%10,eleventh=d.slice(0,10).reduce((a,b)=>a+b,0)%10;return d[9]===tenth&&d[10]===eleventh;}
function validEmail(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function allowedRedirect(v:unknown){if(typeof v!=="string"||!v)return undefined;try{const u=new URL(v);if(u.protocol==="https:"||(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname)))return v;}catch{return undefined;}return undefined;}
async function hmacTckn(tckn:string,keyText:string){const enc=new TextEncoder();const key=await crypto.subtle.importKey("raw",enc.encode(keyText),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,enc.encode(tckn));return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function safeEqual(a:string,b:string){if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return new Response("Method not allowed",{status:405,headers:corsHeaders});
 try{
  const body=await req.json();const email=typeof body.email==="string"?body.email.trim().toLowerCase():"",tckn=typeof body.tckn==="string"?body.tckn.replace(/\D/g,""):"",redirectTo=allowedRedirect(body.redirectTo);
  if(!validEmail(email)||!validTckn(tckn))return json({ok:false,code:"INVALID_INPUT"},400);
  const url=Deno.env.get("SUPABASE_URL")!,serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,anonKey=Deno.env.get("SUPABASE_ANON_KEY")!;
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await admin.from("principal_recovery_identity").select("tckn_hmac,user_id").eq("email",email).maybeSingle();
  if(error)throw error;
  if(!data)return json({ok:false,code:"NOT_SCHOOL_PRINCIPAL"},404);
  const digest=await hmacTckn(tckn,serviceKey);
  if(!safeEqual(digest,data.tckn_hmac))return json({ok:false,code:"IDENTITY_MISMATCH"},403);
  const anon=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error:otpError}=await anon.auth.signInWithOtp({email,options:{shouldCreateUser:false,...(redirectTo?{emailRedirectTo:redirectTo}:{})}});
  if(otpError)throw otpError;
  return json({ok:true});
 }catch(e){console.error("school-recovery",e);return json({ok:false,code:"SERVER_ERROR"},500);}
});
