import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowRight, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({ component: AuthScreen });

function AuthScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">OkulOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kurumsal personel giriş ve kayıt ekranı.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Tabs defaultValue="signup">
            <TabsList className="w-full"><TabsTrigger value="login" className="flex-1">Giriş Yap</TabsTrigger><TabsTrigger value="signup" className="flex-1">Üye Ol</TabsTrigger></TabsList>
            <TabsContent value="login" className="mt-5"><LoginForm /></TabsContent>
            <TabsContent value="signup" className="mt-5"><SignUpFlow /></TabsContent>
          </Tabs>
          <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />Kimlik ve profil verileri yetki kurallarıyla korunur.</p>
        </div>
      </div>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{message}</span></div>;
}

function OtpFields({ otp, setOtp }: { otp: string; setOtp: (value: string) => void }) {
  return <InputOTP maxLength={6} value={otp} onChange={setOtp}><InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP>;
}

async function validateTeacher(tckn: string, email?: string) {
  const { data, error } = await supabase.functions.invoke("validate-teacher", { body: { tckn, email } });
  return !error && Boolean(data?.valid);
}

function LoginForm() {
  const navigate = useNavigate();
  const [tckn, setTckn] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    if (!/^\d{11}$/.test(tckn)) return setError("T.C. Kimlik No tam olarak 11 haneli olmalıdır.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Geçerli bir e-posta adresi giriniz.");
    setBusy(true); setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!(await validateTeacher(tckn, normalizedEmail))) {
      setBusy(false); setError("Kaydınız bulunamadı. Lütfen kurumunuzla iletişime geçiniz."); return;
    }
    const { error: authError } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: false } });
    setBusy(false);
    if (authError) return setError("Giriş kodu gönderilemedi. Bilgilerinizi kontrol ediniz.");
    setCodeSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return setError("6 haneli doğrulama kodunu giriniz.");
    setBusy(true);
    const { error: authError } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "email" });
    setBusy(false);
    if (authError) return setError("Doğrulama kodu geçersiz veya süresi dolmuş.");
    void navigate({ to: "/dashboard" });
  }

  return (
    <form className="space-y-4" onSubmit={verify}>
      <div className="space-y-2"><Label htmlFor="login-tckn">T.C. Kimlik No</Label><Input id="login-tckn" inputMode="numeric" maxLength={11} value={tckn} disabled={codeSent} onChange={(e) => setTckn(e.target.value.replace(/\D/g, "").slice(0,11))} /></div>
      <div className="space-y-2"><Label htmlFor="login-email">E-posta</Label><Input id="login-email" type="email" value={email} disabled={codeSent} onChange={(e) => setEmail(e.target.value)} /></div>
      <Button type="button" className="w-full" onClick={sendCode} disabled={busy}>{codeSent ? "Kodu Tekrar Gönder" : "Kod Gönder"}</Button>
      {codeSent ? <div className="space-y-2"><Label>Doğrulama Kodu</Label><OtpFields otp={otp} setOtp={setOtp} /></div> : null}
      {error ? <ErrorNotice message={error} /> : null}
      <Button type="submit" size="lg" className="w-full gap-2" disabled={!codeSent || busy}>Giriş Yap <ArrowRight className="size-4" /></Button>
    </form>
  );
}

function SignUpFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [tckn, setTckn] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueWithTc(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{11}$/.test(tckn)) return setError("T.C. Kimlik No tam olarak 11 haneli olmalıdır.");
    setBusy(true); setError(null);
    const valid = await validateTeacher(tckn);
    setBusy(false);
    if (!valid) return setError("Kaydınız bulunamadı. Lütfen kurumunuzla iletişime geçiniz.");
    setStep(2);
  }

  async function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Geçerli bir e-posta adresi giriniz.");
    setBusy(true); setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!(await validateTeacher(tckn, normalizedEmail))) {
      setBusy(false); setError("T.C. Kimlik No ile e-posta kaydı eşleşmiyor. Lütfen kurumunuzla iletişime geçiniz."); return;
    }
    const { error: authError } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: true } });
    setBusy(false);
    if (authError) return setError("Doğrulama kodu gönderilemedi.");
    setCodeSent(true);
  }

  async function finalize(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return setError("Lütfen 6 haneli doğrulama kodunu giriniz.");
    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error: authError } = await supabase.auth.verifyOtp({ email: normalizedEmail, token: otp, type: "email" });
    if (authError || !data.user) { setBusy(false); return setError("Doğrulama kodu geçersiz veya süresi dolmuş."); }
    const { error: profileError } = await supabase.from("profiles").upsert({ user_id: data.user.id, tckn, email: normalizedEmail }, { onConflict: "user_id" });
    setBusy(false);
    if (profileError) return setError("Profil kaydı tamamlanamadı. Kurum yöneticinizle iletişime geçiniz.");
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">{step === 1 ? "Adım 1 / 2 · Kimlik Doğrulama" : "Adım 2 / 2 · E-posta Onayı"}</span><div className="ml-auto flex gap-1"><span className="h-1.5 w-6 rounded-full bg-primary" /><span className={step === 2 ? "h-1.5 w-6 rounded-full bg-primary" : "h-1.5 w-6 rounded-full bg-muted"} /></div></div>
      {step === 1 ? (
        <form className="space-y-4" onSubmit={continueWithTc}><div className="space-y-2"><Label htmlFor="signup-tckn">T.C. Kimlik No</Label><Input id="signup-tckn" inputMode="numeric" maxLength={11} value={tckn} onChange={(e) => setTckn(e.target.value.replace(/\D/g, "").slice(0,11))} /><p className="text-xs text-muted-foreground">{tckn.length}/11 hane</p></div>{error ? <ErrorNotice message={error} /> : null}<Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>Devam Et <ArrowRight className="size-4" /></Button></form>
      ) : (
        <form className="space-y-4" onSubmit={finalize}>
          <div className="rounded-xl border border-border bg-primary-soft px-3 py-2 text-xs text-accent-foreground">Kimlik doğrulandı · {tckn.slice(0,2)}*******{tckn.slice(-2)}</div>
          <div className="space-y-2"><Label htmlFor="signup-email">E-posta</Label><Input id="signup-email" type="email" value={email} disabled={codeSent} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button type="button" className="w-full" onClick={sendCode} disabled={busy}>{codeSent ? "Kodu Tekrar Gönder" : "Kod Gönder"}</Button>
          {codeSent ? <div className="space-y-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MailCheck className="size-3.5 text-primary" />6 haneli kod e-posta adresinize gönderildi.</div><Label>Doğrulama Kodu</Label><OtpFields otp={otp} setOtp={setOtp} /></div> : null}
          {error ? <ErrorNotice message={error} /> : null}
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => { setStep(1); setError(null); }}>Geri</Button><Button type="submit" size="lg" className="flex-1" disabled={!codeSent || busy}>Kaydı Tamamla</Button></div>
        </form>
      )}
    </div>
  );
}
