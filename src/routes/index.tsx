import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Crown, GraduationCap, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { getPasswordStrength, isValidEmail, isValidTckn, isValidTrMobile, normalizeDigits, normalizeTrPhone } from "@/lib/auth-validation";

export const Route = createFileRoute("/")({ component: AuthScreen });

const SUPER_ADMIN_EMAIL = "halisbozoglu@yahoo.com";
type ValidationResult = { valid: boolean; emailLocked?: boolean; reason?: string };
type LoginMode = "password" | "otp" | "forgot";

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
          <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="login">Giriş Yap</TabsTrigger><TabsTrigger value="signup">Üye Ol</TabsTrigger><TabsTrigger value="superadmin">Süper Admin</TabsTrigger></TabsList>
          <TabsContent value="login" className="mt-5"><LoginForm /></TabsContent>
          <TabsContent value="signup" className="mt-5"><SignUpFlow /></TabsContent>
          <TabsContent value="superadmin" className="mt-5"><SuperAdminLogin /></TabsContent>
        </Tabs>
        <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />Kimlik ve profil verileri yetki kurallarıyla korunur.</p>
      </div>
    </div>
  </div>;
}

function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}

function SuccessNotice({ message }: { message: string }) {
  return <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800"><Check className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}

function OtpFields({ otp, setOtp, disabled = false }: { otp: string; setOtp: (value: string) => void; disabled?: boolean }) {
  return <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} disabled={disabled} autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]*" autoFocus>
    <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
  </InputOTP>;
}

function PasswordChecklist({ password }: { password: string }) {
  const { checks } = getPasswordStrength(password);
  const items = [[checks.length,"En az 10 karakter"],[checks.upper,"En az bir büyük harf"],[checks.lower,"En az bir küçük harf"],[checks.number,"En az bir rakam"],[checks.special,"En az bir özel karakter"]] as const;
  return <div className="grid grid-cols-1 gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">{items.map(([ok,label]) => <span key={label} className={ok ? "text-emerald-700" : ""}>{ok ? "✓" : "○"} {label}</span>)}</div>;
}

async function validateTeacher(tckn: string, email?: string): Promise<ValidationResult> {
  const { data, error } = await supabase.functions.invoke("validate-teacher", { body: { tckn, email } });
  if (error) return { valid: false, reason: "SERVER_ERROR" };
  return (data ?? { valid: false }) as ValidationResult;
}

async function navigateAfterLogin(navigate: ReturnType<typeof useNavigate>) {
  const { data } = await supabase.rpc("is_super_admin");
  void navigate({ to: data ? "/super-admin" : "/dashboard" });
}

function useAutoOtp(otp: string, enabled: boolean, verify: () => Promise<void>) {
  const verifying = useRef(false);
  const verifyRef = useRef(verify);
  verifyRef.current = verify;
  useEffect(() => {
    if (!enabled || otp.length !== 6 || verifying.current) return;
    verifying.current = true;
    void verifyRef.current().finally(() => { verifying.current = false; });
  }, [otp, enabled]);
}

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true); setError(null); setOtp("");
    const { error: e } = await supabase.auth.signInWithOtp({ email: SUPER_ADMIN_EMAIL, options: { shouldCreateUser: true } });
    setBusy(false); if (e) return setError("Süper Admin doğrulama kodu gönderilemedi."); setCodeSent(true);
  }

  async function verify() {
    if (busy || otp.length !== 6) return;
    setBusy(true); setError(null);
    const { data, error: e } = await supabase.auth.verifyOtp({ email: SUPER_ADMIN_EMAIL, token: otp, type: "email" });
    if (e || !data.user) { setBusy(false); setOtp(""); return setError("Doğrulama kodu geçersiz veya süresi dolmuş."); }
    const { error: claimError } = await supabase.rpc("claim_super_admin_profile");
    setBusy(false); if (claimError) return setError("Süper Admin profili oluşturulamadı.");
    setCodeSent(false); void navigate({ to: "/super-admin" });
  }

  useAutoOtp(otp, codeSent, verify);
  return <div className="space-y-4">
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-950"><div className="flex items-start gap-2"><Crown className="mt-0.5 size-4 shrink-0" /><div><b>Süper Admin girişi.</b> Normal personel T.C. akışından ayrıdır.</div></div></div>
    <div className="space-y-2"><Label>Süper Admin E-posta</Label><Input value={SUPER_ADMIN_EMAIL} readOnly autoComplete="username" /></div>
    <Button type="button" className="w-full" onClick={() => void sendCode()} disabled={busy}>{codeSent ? "Kodu Tekrar Gönder" : "6 Haneli Kod Gönder"}</Button>
    {codeSent ? <div className="space-y-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MailCheck className="size-3.5 text-primary" />Kod klavyenin üstünde görünürse dokunun; 6 hane dolunca otomatik giriş yapılır.</div><OtpFields otp={otp} setOtp={setOtp} disabled={busy} /></div> : null}
    {error ? <ErrorNotice message={error} /> : null}
  </div>;
}

function LoginForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetMode(next: LoginMode) {
    setMode(next); setEmail(""); setOtp(""); setCodeSent(false); setOtpVerified(false); setNewPassword(""); setNewPasswordAgain(""); setError(null); setSuccess(null);
  }

  async function passwordLogin(e: React.FormEvent) {
    e.preventDefault(); const id = identifier.trim(); setError(null);
    if (id.includes("@")) { if (!isValidEmail(id)) return setError("Geçerli bir e-posta adresi veya T.C. Kimlik No giriniz."); }
    else if (!isValidTckn(id)) return setError("T.C. Kimlik Numarası yapısal olarak geçerli değil.");
    if (!password) return setError("Şifrenizi giriniz.");
    setBusy(true);
    const { data, error: fnError } = await supabase.functions.invoke("password-login", { body: { identifier: id, password } });
    if (fnError || !data?.ok || !data.access_token || !data.refresh_token) { setBusy(false); return setError("E-posta/T.C. Kimlik No veya şifre hatalı."); }
    const { error: sessionError } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
    setBusy(false); if (sessionError) return setError("Oturum başlatılamadı."); await navigateAfterLogin(navigate);
  }

  async function sendOtp() {
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) return setError("Geçerli bir e-posta adresi giriniz.");
    setBusy(true); setError(null); setSuccess(null); setOtp("");
    const { error: e } = await supabase.auth.signInWithOtp({ email: normalized, options: { shouldCreateUser: false } });
    setBusy(false); if (e) return setError("Kod gönderilemedi. E-posta adresinizi kontrol ediniz.");
    setCodeSent(true); setSuccess("6 haneli kod e-posta adresinize gönderildi.");
  }

  async function verifyLoginOtp() {
    if (busy || otp.length !== 6 || mode !== "otp") return;
    setBusy(true); setError(null);
    const { error: e } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "email" });
    setBusy(false); if (e) { setOtp(""); return setError("Kod geçersiz veya süresi dolmuş."); }
    await navigateAfterLogin(navigate);
  }

  async function verifyForgotOtp() {
    if (busy || otp.length !== 6 || mode !== "forgot") return;
    setBusy(true); setError(null);
    const { error: e } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "email" });
    setBusy(false); if (e) { setOtp(""); return setError("Kod geçersiz veya süresi dolmuş."); }
    setOtpVerified(true); setSuccess("E-posta doğrulandı. Yeni güçlü şifrenizi belirleyin.");
  }

  useAutoOtp(otp, mode === "otp" && codeSent, verifyLoginOtp);
  useAutoOtp(otp, mode === "forgot" && codeSent && !otpVerified, verifyForgotOtp);

  async function saveNewPassword(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!getPasswordStrength(newPassword).valid) return setError("Yeni şifre güçlü şifre koşullarının tamamını sağlamalıdır.");
    if (newPassword !== newPasswordAgain) return setError("Şifreler birbiriyle eşleşmiyor.");
    setBusy(true); const { error: e2 } = await supabase.auth.updateUser({ password: newPassword });
    if (e2) { setBusy(false); return setError("Şifre güncellenemedi."); }
    await supabase.auth.signOut(); setBusy(false); resetMode("password"); setSuccess("Şifreniz yenilendi. Yeni şifrenizle giriş yapabilirsiniz.");
  }

  if (mode === "password") return <form className="space-y-4" onSubmit={passwordLogin}>
    <div className="space-y-2"><Label>E-posta veya T.C. Kimlik No</Label><Input value={identifier} onChange={(e)=>setIdentifier(e.target.value)} autoComplete="username" placeholder="ornek@posta.com veya 11 haneli T.C." /></div>
    <div className="space-y-2"><Label>Şifre</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" /></div>
    {error ? <ErrorNotice message={error} /> : null}{success ? <SuccessNotice message={success} /> : null}
    <Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>Giriş Yap <ArrowRight className="size-4" /></Button>
    <div className="flex items-center justify-between text-xs"><button type="button" className="text-primary hover:underline" onClick={()=>resetMode("forgot")}>Şifremi unuttum</button><button type="button" className="text-primary hover:underline" onClick={()=>resetMode("otp")}>Kod ile gir</button></div>
  </form>;

  if (mode === "forgot" && otpVerified) return <form className="space-y-4" onSubmit={saveNewPassword}>
    <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={()=>resetMode("password")}><ArrowLeft className="size-3.5"/>Giriş ekranına dön</button>
    <div><h3 className="font-semibold">Yeni şifre belirleyin</h3><p className="mt-1 text-xs text-muted-foreground">E-posta doğrulaması tamamlandı.</p></div>
    <div className="space-y-2"><Label>Yeni şifre</Label><Input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} autoComplete="new-password"/><PasswordChecklist password={newPassword}/></div>
    <div className="space-y-2"><Label>Yeni şifre tekrar</Label><Input type="password" value={newPasswordAgain} onChange={(e)=>setNewPasswordAgain(e.target.value)} autoComplete="new-password"/></div>
    {error ? <ErrorNotice message={error}/> : null}{success ? <SuccessNotice message={success}/> : null}<Button className="w-full" type="submit" disabled={busy}>Şifreyi Güncelle</Button>
  </form>;

  return <div className="space-y-4">
    <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={()=>resetMode("password")}><ArrowLeft className="size-3.5"/>Şifre ile girişe dön</button>
    <div><h3 className="font-semibold">{mode === "otp" ? "Kod ile giriş" : "Şifremi unuttum"}</h3><p className="mt-1 text-xs text-muted-foreground">E-posta adresinize 6 haneli doğrulama kodu gönderilir.</p></div>
    <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={email} disabled={codeSent} onChange={(e)=>setEmail(e.target.value)} autoComplete="email"/></div>
    <Button type="button" className="w-full" onClick={()=>void sendOtp()} disabled={busy}>{codeSent ? "Kodu Tekrar Gönder" : "Kod Gönder"}</Button>
    {codeSent ? <div className="space-y-2"><Label>E-postanıza gelen 6 haneli kod</Label><OtpFields otp={otp} setOtp={setOtp} disabled={busy}/><p className="text-[11px] text-muted-foreground">Telefonunuz kodu algılarsa klavyenin üstündeki öneriye dokunun; 6 hane dolunca otomatik doğrulanır.</p></div> : null}
    {error ? <ErrorNotice message={error}/> : null}{success ? <SuccessNotice message={success}/> : null}
  </div>;
}

function SignUpFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1|2|3>(1);
  const [tckn, setTckn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  async function continueWithTc(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!isValidTckn(tckn)) return setError("T.C. Kimlik Numarası 11 haneli olmalı ve kontrol basamakları yapısal olarak geçerli olmalıdır.");
    setBusy(true); const result = await validateTeacher(tckn); setBusy(false);
    if (!result.valid) return setError("Kaydınız bulunamadı. Lütfen kurumunuzla iletişime geçiniz.");
    setStep(2); setSuccess("T.C. Kimlik No doğrulandı. Bu alan artık değiştirilemez.");
  }

  async function createAccount(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSuccess(null);
    const normalizedEmail = email.trim().toLowerCase(); const normalizedPhone = normalizeTrPhone(phone);
    if (!isValidEmail(normalizedEmail)) return setError("Geçerli bir e-posta adresi giriniz.");
    if (!isValidTrMobile(normalizedPhone)) return setError("Cep telefonu 05 ile başlayan 11 haneli biçimde olmalıdır. Örnek: 05336789834");
    if (!getPasswordStrength(password).valid) return setError("Şifreniz güçlü şifre koşullarının tamamını sağlamalıdır.");
    if (password !== passwordAgain) return setError("Şifreler birbiriyle eşleşmiyor.");

    setBusy(true);
    const { data, error: fnError } = await supabase.functions.invoke("register-user", { body: { tckn, email: normalizedEmail, phone: normalizedPhone, password } });
    setBusy(false);
    if (fnError || !data?.ok) {
      const code = data?.code as string | undefined;
      if (code === "EMAIL_MISMATCH") return setError("Bu T.C. Kimlik No için kurumda kayıtlı e-posta farklıdır.");
      if (code === "WEAK_PASSWORD") return setError("Şifre güçlü şifre koşullarını sağlamıyor.");
      return setError("Üyelik başlatılamadı. Bilgileri kontrol edin veya hesap daha önce oluşturulmuş olabilir.");
    }

    setPhone(normalizedPhone); setOtp(""); setStep(3); setSuccess("E-posta adresinize gelen 6 haneli kodu giriniz.");
  }

  async function finalizeSignup() {
    if (busy || otp.length !== 6 || step !== 3) return;
    setBusy(true); setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error: e } = await supabase.auth.verifyOtp({ email: normalizedEmail, token: otp, type: "email" });
    if (e || !data.user) { setBusy(false); setOtp(""); return setError("Doğrulama kodu geçersiz veya süresi dolmuş."); }
    const { error: profileError } = await supabase.from("profiles").upsert({ user_id: data.user.id, tckn, email: normalizedEmail, phone }, { onConflict: "user_id" });
    setBusy(false); if (profileError) return setError("Profil kaydı tamamlanamadı. Kurum yöneticinizle iletişime geçiniz.");
    void navigate({ to: "/dashboard" });
  }

  useAutoOtp(otp, step === 3, finalizeSignup);

  return <div className="space-y-4">
    <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">Adım {step} / 3 · {step===1?"T.C. Doğrulama":step===2?"İletişim ve Şifre":"E-posta Kodu"}</span><div className="ml-auto flex gap-1">{[1,2,3].map(n=><span key={n} className={n<=step?"h-1.5 w-6 rounded-full bg-primary":"h-1.5 w-6 rounded-full bg-muted"}/>)}</div></div>
    {step===1 ? <form className="space-y-4" onSubmit={continueWithTc}>
      <div className="space-y-2"><Label>T.C. Kimlik No</Label><Input inputMode="numeric" autoComplete="off" maxLength={11} value={tckn} onChange={(e)=>setTckn(normalizeDigits(e.target.value).slice(0,11))}/><p className="text-xs text-muted-foreground">11 hane + T.C. kontrol basamakları + kurum ön kayıt kontrolü yapılır.</p></div>
      {error?<ErrorNotice message={error}/>:null}<Button type="submit" className="w-full" disabled={busy}>T.C. Kimlik No'yu Kontrol Et</Button>
    </form>:null}
    {step===2 ? <form className="space-y-4" onSubmit={createAccount}>
      <div className="space-y-2"><Label>Doğrulanmış T.C. Kimlik No</Label><Input value={`${tckn.slice(0,2)}*******${tckn.slice(-2)}`} disabled/><p className="text-[11px] text-emerald-700">✓ Arka tarafta doğrulandı ve kilitlendi.</p></div>
      <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" placeholder="ornek@posta.com"/></div>
      <div className="space-y-2"><Label>Cep telefonu</Label><Input inputMode="tel" value={phone} onChange={(e)=>setPhone(normalizeTrPhone(e.target.value))} autoComplete="tel" placeholder="05336789834" maxLength={11}/></div>
      <div className="space-y-2"><Label>Şifre</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password"/><PasswordChecklist password={password}/></div>
      <div className="space-y-2"><Label>Şifre tekrar</Label><Input type="password" value={passwordAgain} onChange={(e)=>setPasswordAgain(e.target.value)} autoComplete="new-password"/></div>
      {error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}
      <div className="flex gap-2"><Button type="button" variant="ghost" onClick={()=>{setStep(1);setSuccess(null);setError(null);}}><ArrowLeft className="mr-1 size-4"/>Geri</Button><Button type="submit" className="flex-1" disabled={busy}>Üyeliği Başlat</Button></div>
    </form>:null}
    {step===3 ? <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm"><div className="flex gap-2"><KeyRound className="mt-0.5 size-4 shrink-0 text-indigo-700"/><div><b>E-postanıza gelen 6 haneli kodu giriniz.</b><p className="mt-1 text-xs text-muted-foreground">Kod klavyenin üstünde önerilirse dokunmanız yeterli. Alan dolunca üyelik otomatik tamamlanır.</p></div></div></div>
      <OtpFields otp={otp} setOtp={setOtp} disabled={busy}/>{error?<ErrorNotice message={error}/>:null}{success?<SuccessNotice message={success}/>:null}{busy?<p className="text-center text-xs text-muted-foreground">Kod doğrulanıyor…</p>:null}
    </div>:null}
  </div>;
}
