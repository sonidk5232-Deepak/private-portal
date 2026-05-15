"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const canvasRef               = useRef<HTMLCanvasElement>(null);
  const router                  = useRouter();
  const supabase                = createClient();

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // ── Particle fireflies ──────────────────────────────────────────────
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number; da: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random(),
        da: (Math.random() - 0.5) * 0.015,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.da;
        if (p.alpha <= 0 || p.alpha >= 1) p.da *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134,239,172,${p.alpha * 0.7})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
    } else {
      router.push("/portal");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, #020c06 0%, #041a0a 40%, #061f0c 70%, #020c06 100%)" }}>

      {/* ── Animated forest background ── */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* ── SVG Forest trees ── */}
      <svg className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none w-full"
        viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg">
        {/* Far trees — darkest */}
        {[60,180,300,420,540,660,780,900,1020,1140,1260,1380].map((x, i) => (
          <g key={i} opacity="0.25">
            <polygon points={`${x},${320-i%3*20} ${x-30},400 ${x+30},400`} fill="#14532d" />
            <polygon points={`${x},${280-i%3*20} ${x-20},340 ${x+20},340`} fill="#166534" />
            <polygon points={`${x},${250-i%3*20} ${x-14},295 ${x+14},295`} fill="#15803d" />
          </g>
        ))}
        {/* Mid trees */}
        {[0,120,240,360,480,600,720,840,960,1080,1200,1320,1440].map((x, i) => (
          <g key={i} opacity="0.5">
            <polygon points={`${x},${290-i%4*15} ${x-45},400 ${x+45},400`} fill="#14532d" />
            <polygon points={`${x},${245-i%4*15} ${x-30},315 ${x+30},315`} fill="#166534" />
            <polygon points={`${x},${210-i%4*15} ${x-20},260 ${x+20},260`} fill="#16a34a" />
          </g>
        ))}
        {/* Front trees — brightest */}
        {[-30,90,200,310,430,560,680,790,910,1040,1170,1290,1410].map((x, i) => (
          <g key={i} opacity="0.85">
            <polygon points={`${x},${260-i%3*10} ${x-55},400 ${x+55},400`} fill="#052e16" />
            <polygon points={`${x},${210-i%3*10} ${x-38},290 ${x+38},290`} fill="#14532d" />
            <polygon points={`${x},${170-i%3*10} ${x-24},228 ${x+24},228`} fill="#166534" />
            <polygon points={`${x},${140-i%3*10} ${x-16},178 ${x+16},178`} fill="#15803d" />
          </g>
        ))}
        {/* Ground */}
        <rect x="0" y="390" width="1440" height="10" fill="#052e16" opacity="0.9" />
      </svg>

      {/* ── Moon / glow ── */}
      <div className="absolute top-12 right-16 z-0 pointer-events-none">
        <div className="w-24 h-24 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(187,247,208,0.25) 0%, transparent 70%)", filter: "blur(8px)" }} />
        <div className="w-14 h-14 rounded-full absolute top-5 left-5"
          style={{ background: "radial-gradient(circle, rgba(220,252,231,0.15) 0%, transparent 80%)" }} />
      </div>

      {/* ── Top mist ── */}
      <div className="absolute top-0 left-0 right-0 h-40 z-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(2,12,6,0.7) 0%, transparent 100%)" }} />

      {/* ── Login Card ── */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{
          background: "rgba(2, 14, 6, 0.75)",
          border: "1px solid rgba(74, 222, 128, 0.18)",
          borderRadius: "20px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 0 60px rgba(22,101,52,0.25), 0 0 120px rgba(22,101,52,0.08), inset 0 1px 0 rgba(134,239,172,0.1)",
        }}>

        {/* Top accent line */}
        <div className="h-px w-full rounded-t-xl" style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)" }} />

        <div className="px-8 py-9">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(22,101,52,0.6) 0%, rgba(20,83,45,0.4) 100%)",
                border: "1px solid rgba(74,222,128,0.25)",
                boxShadow: "0 0 24px rgba(22,163,74,0.2)",
              }}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                <path d="M20 4 C20 4 8 12 8 22 C8 28.6 13.4 34 20 34 C26.6 34 32 28.6 32 22 C32 12 20 4 20 4Z"
                  fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.6)" strokeWidth="1.5" />
                <path d="M20 34 L20 20" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M20 24 C20 24 14 20 12 15" stroke="rgba(74,222,128,0.35)" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M20 20 C20 20 26 17 28 13" stroke="rgba(74,222,128,0.35)" strokeWidth="1.2" strokeLinecap="round" />
                {/* Roots */}
                <path d="M20 34 C18 36 15 37 13 36" stroke="rgba(74,222,128,0.3)" strokeWidth="1" strokeLinecap="round" />
                <path d="M20 34 C22 36 25 37 27 36" stroke="rgba(74,222,128,0.3)" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-1">
            <h1 className="font-bold tracking-tight"
              style={{
                fontSize: "22px",
                background: "linear-gradient(135deg, #86efac 0%, #4ade80 50%, #22c55e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.3px",
              }}>
              neowildrepository
            </h1>
            <p className="text-xs mt-1.5 font-medium tracking-widest uppercase"
              style={{ color: "rgba(74,222,128,0.45)" }}>
              Van Sanrakshan Pranali
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(74,222,128,0.3)" }}>
              Pramanik Pehchaan
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "rgba(74,222,128,0.5)" }}>
                Prajati ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prajaati@vanraksha.in"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: "rgba(5, 46, 22, 0.5)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  color: "#d1fae5",
                  caretColor: "#4ade80",
                }}
                onFocus={(e) => e.target.style.border = "1px solid rgba(74,222,128,0.4)"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(74,222,128,0.15)"}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "rgba(74,222,128,0.5)" }}>
                Suraksha Kunjika
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: "rgba(5, 46, 22, 0.5)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  color: "#d1fae5",
                  caretColor: "#4ade80",
                }}
                onFocus={(e) => e.target.style.border = "1px solid rgba(74,222,128,0.4)"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(74,222,128,0.15)"}
              />
            </div>

            {error && (
              <p className="text-xs text-center py-2 px-3 rounded-lg"
                style={{ color: "#fca5a5", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)",
                color: "#d1fae5",
                boxShadow: "0 4px 24px rgba(22,163,74,0.3), inset 0 1px 0 rgba(134,239,172,0.2)",
                border: "1px solid rgba(74,222,128,0.25)",
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Satyapit ho raha hai...
                </span>
              ) : "Pravishtam Karein →"}
            </button>
          </form>

          {/* Bottom note */}
          <div className="mt-7 pt-5" style={{ borderTop: "1px solid rgba(74,222,128,0.08)" }}>
            <p className="text-[10px] text-center leading-relaxed"
              style={{ color: "rgba(74,222,128,0.25)" }}>
              🌿 Swachh Bharat · Harit Bharat · Van Suraksha Abhiyan
            </p>
            <p className="text-[9px] text-center mt-1.5"
              style={{ color: "rgba(74,222,128,0.15)" }}>
              Rashtriya Van Vigyan Evam Paryavaran Suchna Pranali
            </p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full rounded-b-xl" style={{ background: "linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent)" }} />
      </div>
    </div>
  );
}