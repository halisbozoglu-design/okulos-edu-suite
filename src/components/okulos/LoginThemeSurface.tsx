import type { LoginTheme } from "@/lib/login-theme";

export function LoginThemeSurface({ theme }: { theme: LoginTheme }) {
  return <>
    <style>{`
      @keyframes okulosAuroraA { 0%,100%{transform:translate3d(-8%,-4%,0) scale(1)} 50%{transform:translate3d(16%,12%,0) scale(1.18)} }
      @keyframes okulosAuroraB { 0%,100%{transform:translate3d(10%,14%,0) scale(1.08)} 50%{transform:translate3d(-14%,-8%,0) scale(.92)} }
      @keyframes okulosOrbit { to{transform:rotate(360deg)} }
      @keyframes okulosWave { 0%,100%{transform:translateX(-12%) translateY(0) rotate(-5deg)} 50%{transform:translateX(10%) translateY(-6%) rotate(4deg)} }
      @media (prefers-reduced-motion: reduce) { .okulos-login-motion { animation:none!important; transform:none!important; } }
    `}</style>
    {theme.animation === "aurora" ? <>
      <div className="okulos-login-motion pointer-events-none absolute -left-20 top-12 size-72 rounded-full bg-cyan-300/25 blur-3xl" style={{animation:"okulosAuroraA 11s ease-in-out infinite"}}/>
      <div className="okulos-login-motion pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-violet-300/25 blur-3xl" style={{animation:"okulosAuroraB 13s ease-in-out infinite"}}/>
    </> : null}
    {theme.animation === "orbit" ? <>
      <div className="okulos-login-motion pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-white/20" style={{animation:"okulosOrbit 32s linear infinite"}}><div className="absolute left-1/2 top-0 size-5 -translate-x-1/2 rounded-full bg-white/35 shadow-[0_0_30px_rgba(255,255,255,.35)]"/></div>
      <div className="okulos-login-motion pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full border border-white/10" style={{animation:"okulosOrbit 45s linear infinite reverse"}}/>
    </> : null}
    {theme.animation === "waves" ? <>
      <div className="okulos-login-motion pointer-events-none absolute -bottom-24 -left-24 h-56 w-[140%] rounded-[50%] bg-white/10 blur-sm" style={{animation:"okulosWave 10s ease-in-out infinite"}}/>
      <div className="okulos-login-motion pointer-events-none absolute -bottom-36 -left-32 h-64 w-[150%] rounded-[50%] bg-fuchsia-200/10 blur-md" style={{animation:"okulosWave 14s ease-in-out infinite reverse"}}/>
    </> : null}
  </>;
}
