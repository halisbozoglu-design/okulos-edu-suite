import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:corsHeaders});
const digits=(v:unknown)=>typeof v==="string"?v.replace(/\D/g,""):"";
const emailNorm=(v:unknown)=>typeof v==="string"?v.trim().toLowerCase():"";
function normalizePhone(v:unknown){const d=digits(v);if(/^90\d{10}$/.test(d))return `0${d.slice(2)}`;if(/^5\d{9}$/.test(d))return `0${d}`;return d;}
function validEmail(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function validTckn(v:string){if(!/^\d{11}$/.test(v)||v[0]==="0")return false;const d=v.split("").map(Number);const odd=d[0]+d[2]+d[4]+d[6]+d[8];const even=d[1]+d[3]+d[5]+d[7];const tenth=((odd*7-even)%10+10)%10;const eleventh=d.slice(0,10).reduce((a,b)=>a+b,0)%10;return d[9]===tenth&&d[10]===eleventh;}
function detectedCountry(req:Request){const ip=req.headers.get("cf-ipcountry")??req.headers.get("x-country-code")??req.headers.get("x-vercel-ip-country");if(ip&&/^[A-Za-z]{2}$/.test(ip)&&ip.toUpperCase()!=="XX")return {code:ip.toUpperCase(),source:"IP_CDN"};const locale=req.headers.get("accept-language")?.match(/[-_]([A-Za-z]{2})(?:[,;]|$)/)?.[1];return {code:(locale&&/^[A-Za-z]{2}$/.test(locale)?locale:"TR").toUpperCase(),source:"LOCALE_FALLBACK"};}
function commonSequence(p:string){const s=p.toLocaleLowerCase("tr-TR");return ["123456","12345678","abcdef","abcde","qwerty","qwertyui","asdfgh","password","parola","sifre","şifre"].some(x=>s.includes(x));}
function passwordOk(password:string,personal:string[]){if(password.length<8||!/[A-ZÇĞİÖŞÜ]/.test(password)||!/[a-zçğıöşü]/.test(password)||!(/\d/.test(password))||!(/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(password))||commonSequence(password))return false;const p=password.toLocaleLowerCase("tr-TR").replace(/\s+/g,"");return !personal.filter(x=>x.length>=4).some(x=>p.includes(x.toLocaleLowerCase("tr-TR").replace(/\s+/g,"")));}
function allowedRedirect(v:unknown){if(typeof v!=="string"||!v)return undefined;try{const u=new URL(v);if(u.protocol==="https:"||(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname)))return v;}catch{return undefined;}return undefined;}
async function hmacTckn(tckn:string,keyText:string){const enc=new TextEncoder();const key=await crypto.subtle.importKey("raw",enc.encode(keyText),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,enc.encode(tckn));return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return new Response("Method not allowed",{status:405,headers:corsHeaders});
 let createdUserId:string|undefined;
 try{
  const body=await req.json();
  const institutionCode=digits(body.institutionCode),schoolName=typeof body.schoolName==="string"?body.schoolName.trim():"",principalName=typeof body.principalName==="string"?body.principalName.trim():"",phone=normalizePhone(body.phone),email=emailNorm(body.email),tckn=digits(body.tckn),password=typeof body.password==="string"?body.password:"",redirectTo=allowedRedirect(body.redirectTo),country=detectedCountry(req);
  if(!/^\d{5,10}$/.test(institutionCode))return json({ok:false,code:"INVALID_INSTITUTION_CODE"},400);
  if(schoolName.length<3)return json({ok:false,code:"INVALID_SCHOOL_NAME"},400);
  if(principalName.length<3)return json({ok:false,code:"INVALID_PRINCIPAL_NAME"},400);
  if(!/^05\d{9}$/.test(phone))return json({ok:false,code:"INVALID_PHONE"},400);
  if(!validEmail(email))return json({ok:false,code:"INVALID_EMAIL"},400);
  if(!validTckn(tckn))return json({ok:false,code:"INVALID_IDENTITY"},400);
  const personal=[principalName,schoolName,institutionCode,phone,tckn,email.split("@")[0]??""];
  if(!passwordOk(password,personal))return json({ok:false,code:"WEAK_OR_PERSONAL_PASSWORD"},400);

  const url=Deno.env.get("SUPABASE_URL")!,serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,anonKey=Deno.env.get("SUPABASE_ANON_KEY")!;
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const [{data:school},{data:recovery}]=await Promise.all([
    admin.from("institutions").select("institution_code").eq("institution_code",institutionCode).maybeSingle(),
    admin.from("principal_recovery_identity").select("user_id").eq("email",email).maybeSingle(),
  ]);
  if(school)return json({ok:false,code:"INSTITUTION_ALREADY_REGISTERED"},409);
  if(recovery)return json({ok:false,code:"EMAIL_ALREADY_REGISTERED"},409);

  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:false,user_metadata:{school_registration:true,institution_code:institutionCode,principal_name:principalName}});
  if(createError||!created.user)return json({ok:false,code:"ACCOUNT_CREATE_FAILED"},400);
  createdUserId=created.user.id;
  const masked=`*******${tckn.slice(-4)}`;
  const digest=await hmacTckn(tckn,serviceKey);

  const {error:institutionError}=await admin.from("institutions").insert({institution_code:institutionCode,school_name:schoolName,created_by:createdUserId,country_code:country.code,country_detection_source:country.source,curriculum_source_mode:country.code==="TR"?"OFFICIAL_CATALOG":"MANUAL"});
  if(institutionError)throw institutionError;
  const {error:membershipError}=await admin.from("institution_memberships").insert({institution_code:institutionCode,user_id:createdUserId,membership_role:"principal",is_owner:true,active:true});
  if(membershipError)throw membershipError;
  const {error:legacyPrincipalError}=await admin.from("institution_principals").upsert({institution_code:institutionCode,user_id:createdUserId,active:true},{onConflict:"institution_code,user_id"});
  if(legacyPrincipalError)throw legacyPrincipalError;
  const {error:profileError}=await admin.from("profiles").upsert({user_id:createdUserId,tckn:null,email,full_name:principalName,role:"admin",phone,institution_code:institutionCode},{onConflict:"user_id"});
  if(profileError)throw profileError;
  const {error:recoveryError}=await admin.from("principal_recovery_identity").insert({user_id:createdUserId,institution_code:institutionCode,email,phone,tckn_masked:masked,tckn_hmac:digest});
  if(recoveryError)throw recoveryError;

  const anon=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error:otpError}=await anon.auth.signInWithOtp({email,options:{shouldCreateUser:false,...(redirectTo?{emailRedirectTo:redirectTo}:{})}});
  if(otpError)throw otpError;
  return json({ok:true,institutionCode,tcknMasked:masked});
 }catch(e){
  console.error("register-school",e);
  if(createdUserId){try{const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});await admin.from("institutions").delete().eq("created_by",createdUserId);await admin.auth.admin.deleteUser(createdUserId);}catch(cleanup){console.error("register-school cleanup",cleanup);}}
  return json({ok:false,code:"SERVER_ERROR"},500);
 }
});
