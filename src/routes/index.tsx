import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Check, GraduationCap, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { lovable } from "@/integrations/lovable";
import { getPasswordStrength, isValidEmail, isValidTckn, isValidTrMobile, normalizeDigits, normalizeTrPhone } from "@/lib/auth-validation";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98 1.4-2.06 1.4-3.04.6-1.08-.9-1.87-.8-3.04 0-1.35.9-2.13.7-3.04-.6-2.17-3.1-1.84-7.7 1.04-9.4 1.44-.8 2.68-.6 3.64.2.96-.8 2.2-1 3.64-.2 1.47.9 2.03 2.9 1.68 4.9-.15.9-.46 1.8-.88 2.5zm-4.47-13.5c.05-1.9 1.6-3.5 3.4-3.55-.2 2.05-1.85 3.6-3.4 3.55z" />
    </svg>
  );
}

export const Route = createFileRoute("/")({ component: AuthScreen });

const SUPER_ADMIN_EMAIL = "halisbozoglu@yahoo.com";
type ValidationResult = { valid: boolean; emailLocked?: boolean; reason?: string };
type LoginMode = "password" | "otp" | "forgot";

function callbackUrl() {
  return typeof window === "undefined" ? undefined : `${window.location.origin}/auth/callback`;
}

function AuthScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">OkulOS</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kurumsal personel giriş ve kayıt ekranı.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">Giriş Yap</TabsTrigger><TabsTrigger value="signup">Üye Ol</TabsTrigger></TabsList>
          <TabsContent value="login" className="mt-5"><LoginForm /></TabsContent>
          <TabsContent value="signup" className="mt-5"><SignUpFlow /></TabsContent>
        </Tabs>
        <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />Yetki, girişten sonra kullanıcı profilinden otomatik belirlenir. Ayrı yönetici giriş ekranı yoktur.</p>
      </div>
      <Link to="/school-registration" className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition hover:border-primary/40 hover:bg-primary/10">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="size-5"/></div>
        <div><p className="text-sm font-semibold">Yeni okul kaydı</p><p className="mt-0.5 text-xs text-muted-foreground">Okulunuzu ayrı bir kurum / tenant olarak kaydedin ve müdür hesabını oluşturun.</p></div>
      </Link>
    </div>
  </div>;
}

function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}
function SuccessNotice({ message }: { message: string }) {
  return <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800"><Check className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}
function OtpFields({ otp, setOtp, disabled=false }: { otp:string; setOtp:(value:string)=>void; disabled?:boolean }) {
  return <InputOTP maxLength={6} value={otp} onChange={(v)=>setOtp(v.replace(/\D/g,"").slice(0,6))} disabled={disabled} autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]*" autoFocus><InputOTPGroup>{[0,1,2,3,4,5].map(i=><InputOTPSlot key={i} index={i}/>)}</InputOTPGroup></InputOTP>;
}
function PasswordChecklist({ password }: { password:string }) {
  const { checks }=getPasswordStrength(password); const items=[[checks.length,"En az 10 karakter"],[checks.upper,"En az bir büyük harf"],[checks.lower,"En az bir küçük harf"],[checks.number,"En az bir rakam"],[checks.special,"En az bir özel karakter"]] as const;
  return <div className="grid grid-cols-1 gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">{items.map(([ok,label])=><span key={label} className={ok?"text-emerald-700":""}>{ok?"✓":"○"} {label}</span>)}</div>;
}
async function validateTeacher(tckn:string,email?:string):Promise<ValidationResult>{const {data,error}=await supabase.functions.invoke("validate-teacher",{body:{tckn,email}});if(error)return{valid:false,reason:"SERVER_ERROR"};return(data??{valid:false}) as ValidationResult;}

async function finalizeAuthenticatedUser(navigate:ReturnType<typeof useNavigate>) {
  const { data:userData, error:userError }=await supabase.auth.getUser();
  if(userError||!userData.user) throw new Error("Oturum kullanıcısı doğrulanamadı.");
  if((userData.user.email??"").toLowerCase()===SUPER_ADMIN_EMAIL){
    const {error:claimError}=await supabase.rpc("claim_super_admin_profile");
    if(claimError) throw new Error("Yönetici profili doğrulanamadı.");
  }
  const {data:isSuper,error:roleError}=await supabase.rpc("is_super_admin");
  if(roleError) throw new Error("Kullanıcı yetkisi okunamadı.");
  await navigate({to:isSuper?"/super-admin":"/dashboard",replace:true});
}
function useAutoOtp(otp:string,enabled:boolean,verify:()=>Promise<void>){const verifying=useRef(false),verifyRef=useRef(verify);verifyRef.current=verify;useEffect(()=>{if(!enabled||otp.length!==6||verifying.current)return;verifying.current=true;void verifyRef.current().finally(()=>{verifying.current=false})},[otp,enabled]);}

function LoginForm(){
  const navigate=useNavigate();
  const [mode,setMode]=useState<LoginMode>("password"),[identifier,setIdentifier]=useState(""),[password,setPassword]=useState(""),[email,setEmail]=useState(""),[recoveryTckn,setRecoveryTckn]=useState(""),[otp,setOtp]=useState(""),[codeSent,setCodeSent]=useState(false),[otpVerified,setOtpVerified]=useState(false),[newPassword,setNewPassword]=useState(""),[newPasswordAgain,setNewPasswordAgain]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null);
  function resetMode(next:LoginMode){setMode(next);setEmail("");setRecoveryTckn("");setOtp("");setCodeSent(false);setOtpVerified(false);setNewPassword("");setNewPasswordAgain("");setError(null);setSuccess(null)}
  async function passwordLogin(e:React.FormEvent){e.preventDefault();const id=identifier.trim().toLowerCase();setError(null);if(id.includes("@")){if(!isValidEmail(id))return setError("Geçerli bir e-posta adresi veya T.C. Kimlik No giriniz.")}else if(!isValidTckn(id))return setError("T.C. Kimlik Numarası yapısal olarak geçerli değil.");if(!password)return setError("Şifrenizi giriniz.");setBusy(true);const {data,error:fnError}=await supabase.functions.invoke("password-login",{body:{identifier:id,password}});if(fnError||!data?.ok||!data.access_token||!data.refresh_token){setBusy(false);return setError("E-posta/T.C. Kimlik No veya şifre hatalı.")}const {error:sessionError}=await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});if(sessionError){setBusy(false);return setError("Oturum başlatılamadı.")}try{await finalizeAuthenticatedUser(navigate)}catch(err){setBusy(false);return setError(err instanceof Error?err.message:"Giriş tamamlanamadı.")}setBusy(false)}
  async function sendOtp(){const normalized=email.trim().toLowerCase();if(!isValidEmail(normalized))return setError("Geçerli bir e-posta adresi giriniz.");setBusy(true);setError(null);setSuccess(null);setOtp("");if(mode==="forgot"){
      const {data,error:fnError}=await supabase.functions.invoke("school-recovery",{body:{email:normalized,tckn:recoveryTckn,redirectTo:callbackUrl()}});setBusy(false);if(fnError||!data?.ok){const code=data?.code as string|undefined;if(code==="PRINCIPAL_TCKN_REQUIRED")return setError("Okul müdürü hesabında şifre sıfırlama için T.C. Kimlik Numarası teyidi zorunludur.");if(code==="IDENTITY_MISMATCH")return setError("T.C. Kimlik Numarası bu müdür hesabıyla eşleşmiyor.");return setError("Şifre sıfırlama doğrulaması gönderilemedi.");}setCodeSent(true);setSuccess("Kimlik/e-posta kontrolü tamamlandı. Doğrulama e-postası gönderildi.");return;
    }
    const {error:e}=await supabase.auth.signInWithOtp({email:normalized,options:{shouldCreateUser:normalized===SUPER_ADMIN_EMAIL,emailRedirectTo:callbackUrl()}});setBusy(false);if(e)return setError("Giriş doğrulaması gönderilemedi. E-posta adresinizi kontrol ediniz.");setCodeSent(true);setSuccess("Doğrulama e-postası gönderildi. 6 haneli kod geldiyse aşağıya girin; bağlantı geldiyse bağlantıya dokunun.")}
  async function verifyLoginOtp(){if(busy||otp.length!==6||mode!=="otp")return;setBusy(true);setError(null);const {error:e}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:otp,type:"email"});if(e){setBusy(false);setOtp("");return setError("Kod geçersiz veya süresi dolmuş.")}try{await finalizeAuthenticatedUser(navigate)}catch(err){setBusy(false);return setError(err instanceof Error?err.message:"Giriş tamamlanamadı.")}setBusy(false)}
  async function verifyForgotOtp(){if(busy||otp.length!==6||mode!=="forgot")return;setBusy(true);setError(null);const {error:e}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:otp,type:"email"});setBusy(false);if(e){setOtp("");return setError("Kod geçersiz veya süresi dolmuş.")}setOtpVerified(true);setSuccess("E-posta doğrulandı. Yeni güçlü şifrenizi belirleyin.")}
  useAutoOtp(otp,mode==="otp"&&codeSent,verifyLoginOtp);useAutoOtp(otp,mode==="forgot"&&codeSent&&!otpVerified,verifyForgotOtp);
  async function saveNewPassword(e:React.FormEvent){e.preventDefault();setError(null);if(!getPasswordStrength(newPassword).valid)return setError("Yeni şifre güçlü şifre koşullarının tamamını sağlamalıdır.");if(newPassword!==newPasswordAgain)return setError("Şifreler birbiriyle eşleşmiyor.");setBusy(true);const {error:e2}=await supabase.auth.updateUser({password:newPassword});if(e2){setBusy(false);return setError("Şifre güncellenemedi.")}await supabase.auth.signOut();setBusy(false);resetMode("password");setSuccess("Şifreniz yenilendi. Yeni şifrenizle giriş yapabilirsiniz.")}
  async function signInWithGoogle(){setBusy(true);setError(null);const result=await lovable.auth.signInWithOAuth("google",{redirect_uri:window.location.origin});setBusy(false);if(result.error||result.redirected===false)setError("Google ile giriş başlatılamadı.");}
  async function signInWithApple(){setBusy(true);setError(null);const {error:e}=await supabase.auth.signInWithOAuth({provider:"apple",options:{redirectTo:callbackUrl()}});setBusy(false);if(e)setError("Apple ile giriş başlatılamadı.");}
  if(mode==="password")return <form className="space-y-4" onSubmit={passwordLogin}><div className="space-y-2"><Label>E-posta veya T.C. Kimlik No</Label><Input value={identifier} onChange={e=>setIdentifier(e.target.value)} autoComplete="username" placeholder="ornek@posta.com veya 11 haneli T.C."/></div><div className="space-y-2"><Label>Şifre</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div>{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}<Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>Giriş Yap <ArrowRight className="size-4"/></Button><div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">veya</span></div></div><div className="grid grid-cols-1 gap-2"><Button type="button" variant="outline" className="w-full gap-2" onClick={()=>void signInWithGoogle()} disabled={busy}><GoogleIcon className="size-4" /> Google ile Giriş Yap</Button><Button type="button" variant="outline" className="w-full gap-2" onClick={()=>void signInWithApple()} disabled={busy}><AppleIcon className="size-4" /> Apple ile Giriş Yap</Button></div><div className="flex items-center justify-between text-xs"><button type="button" className="text-primary hover:underline" onClick={()=>resetMode("forgot")}>Şifremi unuttum</button><button type="button" className="text-primary hover:underline" onClick={()=>resetMode("otp")}>Kod ile gir</button></div></form>;
  if(mode==="forgot"&&otpVerified)return <form className="space-y-4" onSubmit={saveNewPassword}><button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={()=>resetMode("password")}><ArrowLeft className="size-3.5"/>Giriş ekranına dön</button><div><h3 className="font-semibold">Yeni şifre belirleyin</h3><p className="mt-1 text-xs text-muted-foreground">E-posta doğrulaması tamamlandı.</p></div><div className="space-y-2"><Label>Yeni şifre</Label><Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password"/><PasswordChecklist password={newPassword}/></div><div className="space-y-2"><Label>Yeni şifre tekrar</Label><Input type="password" value={newPasswordAgain} onChange={e=>setNewPasswordAgain(e.target.value)} autoComplete="new-password"/></div>{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}<Button className="w-full" type="submit" disabled={busy}>Şifreyi Güncelle</Button></form>;
  return <div className="space-y-4"><button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={()=>resetMode("password")}><ArrowLeft className="size-3.5"/>Şifre ile girişe dön</button><div><h3 className="font-semibold">{mode==="otp"?"Kod / bağlantı ile giriş":"Şifremi unuttum"}</h3><p className="mt-1 text-xs text-muted-foreground">{mode==="forgot"?"Okul müdürü hesaplarında kayıt sırasında verilen T.C. Kimlik No ayrıca teyit edilir. Diğer personel hesaplarında T.C. alanı boş bırakılabilir.":"E-postanıza 6 haneli kod veya güvenli giriş bağlantısı gönderilir."}</p></div><div className="space-y-2"><Label>E-posta</Label><Input type="email" value={email} disabled={codeSent} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></div>{mode==="forgot"?<div className="space-y-2"><Label>T.C. Kimlik No <span className="font-normal text-muted-foreground">(okul müdürü hesabı için)</span></Label><Input type="password" inputMode="numeric" maxLength={11} value={recoveryTckn} disabled={codeSent} onChange={e=>setRecoveryTckn(normalizeDigits(e.target.value).slice(0,11))} autoComplete="off"/><p className="text-[11px] text-muted-foreground">Açık T.C. numarası sistemde saklanmaz; yalnız kayıtlı güvenli özetle eşleşme kontrolü yapılır.</p></div>:null}<Button type="button" className="w-full" onClick={()=>void sendOtp()} disabled={busy}>{codeSent?"Tekrar Gönder":"Doğrulama Gönder"}</Button>{codeSent?<div className="space-y-2"><Label>6 haneli kod geldiyse</Label><OtpFields otp={otp} setOtp={setOtp} disabled={busy}/><p className="text-[11px] text-muted-foreground">E-postada yalnız “Giriş Yap” bağlantısı görünüyorsa kod beklemeyin; bağlantıya dokunduğunuzda OkulOS callback ekranı oturumu tamamlar.</p></div>:null}{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}</div>;
}

function SignUpFlow(){
  const navigate=useNavigate();const [step,setStep]=useState<1|2|3>(1),[tckn,setTckn]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[password,setPassword]=useState(""),[passwordAgain,setPasswordAgain]=useState(""),[otp,setOtp]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null);
  async function continueWithTc(e:React.FormEvent){e.preventDefault();setError(null);if(!isValidTckn(tckn))return setError("T.C. Kimlik Numarası 11 haneli olmalı ve kontrol basamakları geçerli olmalıdır.");setBusy(true);const result=await validateTeacher(tckn);setBusy(false);if(!result.valid)return setError("Kaydınız bulunamadı. Lütfen kurumunuzla iletişime geçiniz.");setStep(2);setSuccess("T.C. Kimlik No doğrulandı.")}
  async function createAccount(e:React.FormEvent){e.preventDefault();setError(null);setSuccess(null);const normalizedEmail=email.trim().toLowerCase(),normalizedPhone=normalizeTrPhone(phone);if(!isValidEmail(normalizedEmail))return setError("Geçerli bir e-posta adresi giriniz.");if(!isValidTrMobile(normalizedPhone))return setError("Cep telefonu 05 ile başlayan 11 haneli biçimde olmalıdır.");if(!getPasswordStrength(password).valid)return setError("Şifreniz güçlü şifre koşullarının tamamını sağlamalıdır.");if(password!==passwordAgain)return setError("Şifreler birbiriyle eşleşmiyor.");setBusy(true);const {data,error:fnError}=await supabase.functions.invoke("register-user",{body:{tckn,email:normalizedEmail,phone:normalizedPhone,password,redirectTo:callbackUrl()}});setBusy(false);if(fnError||!data?.ok){const code=data?.code as string|undefined;if(code==="EMAIL_MISMATCH")return setError("Bu T.C. Kimlik No için kurumda kayıtlı e-posta farklıdır.");if(code==="WEAK_PASSWORD")return setError("Şifre güçlü şifre koşullarını sağlamıyor.");return setError("Üyelik başlatılamadı. Bilgileri kontrol edin veya hesap daha önce oluşturulmuş olabilir.")}setPhone(normalizedPhone);setOtp("");setStep(3);setSuccess("Doğrulama e-postası gönderildi. Kod geldiyse aşağıya girin; bağlantı geldiyse bağlantıya dokunun.")}
  async function finalizeSignup(){if(busy||otp.length!==6||step!==3)return;setBusy(true);setError(null);const normalizedEmail=email.trim().toLowerCase();const {data,error:e}=await supabase.auth.verifyOtp({email:normalizedEmail,token:otp,type:"email"});if(e||!data.user){setBusy(false);setOtp("");return setError("Doğrulama kodu geçersiz veya süresi dolmuş.")}const {error:profileError}=await supabase.from("profiles").upsert({user_id:data.user.id,tckn,email:normalizedEmail,phone},{onConflict:"user_id"});setBusy(false);if(profileError)return setError("Profil kaydı tamamlanamadı. Kurum yöneticinizle iletişime geçiniz.");await navigate({to:"/dashboard",replace:true})}
  useAutoOtp(otp,step===3,finalizeSignup);
  return <div className="space-y-4"><div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">Adım {step} / 3 · {step===1?"T.C. Doğrulama":step===2?"İletişim ve Şifre":"E-posta Doğrulama"}</span><div className="ml-auto flex gap-1">{[1,2,3].map(n=><span key={n} className={n<=step?"h-1.5 w-6 rounded-full bg-primary":"h-1.5 w-6 rounded-full bg-muted"}/>)}</div></div>{step===1?<form className="space-y-4" onSubmit={continueWithTc}><div className="space-y-2"><Label>T.C. Kimlik No</Label><Input inputMode="numeric" autoComplete="off" maxLength={11} value={tckn} onChange={e=>setTckn(normalizeDigits(e.target.value).slice(0,11))}/></div>{error?<ErrorNotice message={error}/>:null}<Button type="submit" className="w-full" disabled={busy}>T.C. Kimlik No'yu Kontrol Et</Button></form>:null}{step===2?<form className="space-y-4" onSubmit={createAccount}><div className="space-y-2"><Label>Doğrulanmış T.C.</Label><Input value={`${tckn.slice(0,2)}*******${tckn.slice(-2)}`} disabled/></div><div className="space-y-2"><Label>E-posta</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></div><div className="space-y-2"><Label>Cep telefonu</Label><Input inputMode="tel" value={phone} onChange={e=>setPhone(normalizeTrPhone(e.target.value))} autoComplete="tel" maxLength={11}/></div><div className="space-y-2"><Label>Şifre</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/><PasswordChecklist password={password}/></div><div className="space-y-2"><Label>Şifre tekrar</Label><Input type="password" value={passwordAgain} onChange={e=>setPasswordAgain(e.target.value)} autoComplete="new-password"/></div>{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}<div className="flex gap-2"><Button type="button" variant="ghost" onClick={()=>{setStep(1);setSuccess(null);setError(null)}}><ArrowLeft className="mr-1 size-4"/>Geri</Button><Button type="submit" className="flex-1" disabled={busy}>Üyeliği Başlat</Button></div></form>:null}{step===3?<div className="space-y-4"><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm"><div className="flex gap-2"><KeyRound className="mt-0.5 size-4 shrink-0 text-indigo-700"/><div><b>E-postanızı doğrulayın.</b><p className="mt-1 text-xs text-muted-foreground">6 haneli kod geldiyse girin. Güvenli bağlantı geldiyse bağlantıya dokunun.</p></div></div></div><OtpFields otp={otp} setOtp={setOtp} disabled={busy}/>{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}</div>:null}</div>;
}
