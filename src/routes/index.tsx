import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowRight, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OkulOS — Giriş ve Üyelik" },
      {
        name: "description",
        content:
          "OkulOS'a T.C. kimlik numaranız ve e-posta doğrulama kodu ile güvenli şekilde kayıt olun veya giriş yapın.",
      },
      { property: "og:title", content: "OkulOS — Giriş ve Üyelik" },
      {
        property: "og:description",
        content: "Çok adımlı güvenli kayıt: T.C. kimlik doğrulama, e-posta ve 6 haneli kod.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthScreen,
});

// Mock: kayıtlı olmayan TC numaraları (11111111111 gibi) hata döndürür
const UNREGISTERED = new Set(["11111111111", "00000000000"]);

function AuthScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">OkulOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kurumsal personel giriş ve kayıt ekranı.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Tabs defaultValue="signup">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Giriş Yap
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Üye Ol
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <SignUpFlow />
            </TabsContent>
          </Tabs>

          <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Bilgileriniz yalnızca acil durum ve nöbet organizasyonu için kullanılır.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
          setError("Lütfen e-posta ve şifrenizi giriniz.");
          return;
        }
        setError(null);
        void navigate({ to: "/dashboard" });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">E-posta</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          placeholder="ad.soyad@meb.k12.tr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Şifre</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          maxLength={72}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? <ErrorNotice message={error} /> : null}

      <Button type="submit" size="lg" className="w-full gap-2">
        Giriş Yap <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

function SignUpFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [tckn, setTckn] = useState("");
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stepLabel = step === 1 ? "Adım 1 / 2 · Kimlik Doğrulama" : "Adım 2 / 2 · E-posta Onayı";

  function submitTckn(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{11}$/.test(tckn)) {
      setError("T.C. Kimlik No tam olarak 11 haneli olmalıdır.");
      return;
    }
    if (UNREGISTERED.has(tckn)) {
      setError("Kaydınız bulunamadı. Lütfen kurumunuzla iletişime geçiniz.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return;
    }
    setError(null);
    setCodeSent(true);
  }

  function finalize(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu giriniz.");
      return;
    }
    setError(null);
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stepLabel}</span>
        <div className="ml-auto flex gap-1">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span
            className={step === 2 ? "h-1.5 w-6 rounded-full bg-primary" : "h-1.5 w-6 rounded-full bg-muted"}
          />
        </div>
      </div>

      {step === 1 ? (
        <form className="space-y-4" onSubmit={submitTckn}>
          <div className="space-y-2">
            <Label htmlFor="tckn">T.C. Kimlik No</Label>
            <Input
              id="tckn"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              placeholder="11 haneli kimlik numaranız"
              value={tckn}
              onChange={(e) => setTckn(e.target.value.replace(/\D/g, "").slice(0, 11))}
            />
            <p className="text-xs text-muted-foreground">{tckn.length}/11 hane</p>
          </div>

          {error ? <ErrorNotice message={error} /> : null}

          <Button type="submit" size="lg" className="w-full gap-2">
            Devam Et <ArrowRight className="size-4" />
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={finalize}>
          <div className="rounded-xl border border-border bg-primary-soft px-3 py-2 text-xs text-accent-foreground">
            Kimlik doğrulandı · {tckn.slice(0, 3)}****{tckn.slice(-2)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">E-posta</Label>
            <div className="flex gap-2">
              <Input
                id="signup-email"
                type="email"
                maxLength={255}
                placeholder="ad.soyad@meb.k12.tr"
                value={email}
                disabled={codeSent}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                variant={codeSent ? "outline" : "default"}
                className="shrink-0"
                onClick={sendCode}
              >
                {codeSent ? "Tekrar Gönder" : "Kod Gönder"}
              </Button>
            </div>
          </div>

          {codeSent ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MailCheck className="size-3.5 text-primary" />
                6 haneli kod {email} adresine gönderildi.
              </div>
              <Label htmlFor="otp">Doğrulama Kodu</Label>
              <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          ) : null}

          {error ? <ErrorNotice message={error} /> : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="shrink-0"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
            >
              Geri
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={!codeSent}>
              Kaydı Tamamla
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
