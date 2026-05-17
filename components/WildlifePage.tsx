"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const THEMES = {
  forest: {
    name: "Forest",
    bg: "#030d05",
    bgCard: "rgba(5,28,10,0.85)",
    text: "#d1fae5",
    textMuted: "rgba(167,243,208,0.6)",
    accent: "#22c55e",
    accentSoft: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.15)",
    headerBg: "rgba(2,10,4,0.92)",
    menuBg: "rgba(3,14,6,0.97)",
    hero: "linear-gradient(160deg,#020c04 0%,#042010 60%,#021505 100%)",
  },
  night: {
    name: "Night",
    bg: "#050508",
    bgCard: "rgba(10,10,18,0.85)",
    text: "#e0e7ff",
    textMuted: "rgba(196,181,253,0.6)",
    accent: "#818cf8",
    accentSoft: "rgba(129,140,248,0.12)",
    border: "rgba(129,140,248,0.15)",
    headerBg: "rgba(5,5,10,0.95)",
    menuBg: "rgba(5,5,12,0.97)",
    hero: "linear-gradient(160deg,#040408 0%,#0d0d2b 60%,#050514 100%)",
  },
  light: {
    name: "Light",
    bg: "#f0fdf4",
    bgCard: "rgba(255,255,255,0.85)",
    text: "#14532d",
    textMuted: "rgba(20,83,45,0.55)",
    accent: "#16a34a",
    accentSoft: "rgba(22,163,74,0.1)",
    border: "rgba(22,163,74,0.2)",
    headerBg: "rgba(240,253,244,0.95)",
    menuBg: "rgba(240,253,244,0.98)",
    hero: "linear-gradient(160deg,#dcfce7 0%,#f0fdf4 60%,#d1fae5 100%)",
  },
};
type ThemeKey = keyof typeof THEMES;

const sections = [
  {
    id: "forests",
    icon: "🌳",
    title: "Why Are Forests Essential?",
    content: [
      "Forests are the lungs of the Earth. Covering approximately 31% of the planet's land surface, this vast family of trees and ecosystems forms the very foundation of life as we know it. Without forests, life itself would be unimaginable.",
      "About 80% of the world's terrestrial species — animals, plants, and insects — call forests their home. It is here that nature reveals its most magnificent form, where the rustling of a single leaf and the roar of a tiger together compose one grand symphony of life.",
      "India's forests span approximately 7.12 lakh square kilometres, covering about 21.71% of the country's total land area. These forests shelter over 500 species of birds, more than 200 species of reptiles, and thousands of insects and invertebrates.",
    ],
  },
  {
    id: "benefits",
    icon: "💚",
    title: "The Priceless Benefits of Forests",
    items: [
      { icon: "💧", head: "Water Cycle", body: "Forests attract rainfall, recharge groundwater, and keep rivers flowing year-round. A single mature tree transpires up to 400 litres of water every day, sustaining entire watersheds." },
      { icon: "🌬️", head: "Clean Air", body: "One tree absorbs about 100 kg of carbon dioxide per year and produces enough oxygen for four people to breathe. Forests act as giant air filters, continuously purifying the atmosphere." },
      { icon: "🌡️", head: "Climate Regulation", body: "The presence of forests can lower temperatures by 2–8°C. They serve as natural air conditioning, balancing the entire ecosystem and buffering against extreme weather events." },
      { icon: "🦁", head: "Biodiversity", body: "Forests are treasure troves of biodiversity. Within a small patch of forest, thousands of species thrive that exist nowhere else on Earth — each one irreplaceable." },
      { icon: "🌿", head: "Medicinal Wealth", body: "India's forests harbour over 45,000 plant species, thousands of which possess proven medicinal properties. These living pharmacies have sustained human health for millennia." },
      { icon: "🏔️", head: "Soil Protection", body: "Forests prevent soil erosion, control floods, and protect mountain regions from devastating landslides, securing both land and livelihoods for millions of people." },
    ],
  },
  {
    id: "nature",
    icon: "🦋",
    title: "Nature's Remarkable Power",
    content: [
      "Nature has developed its own intricate system over millions of years. Every creature, every plant is an indispensable part of this grand mechanism. The extinction of even a single species can set off a chain reaction that disrupts the entire system.",
      "The tiger is an apex predator that keeps the entire jungle ecosystem in balance. Without tigers, deer populations would surge unchecked, devouring vegetation and ultimately destroying the forest itself. This chain reaction is known as a 'Trophic Cascade' — a powerful reminder of how every species matters.",
      "Butterflies and bees carry pollen from flower to flower — a process called 'pollination.' Without pollination, more than 75% of the world's food crops would fail to reproduce. The humble butterfly, therefore, is intimately connected to all of human civilisation.",
    ],
    stats: [
      { num: "80%", label: "Food crops depend on pollinators" },
      { num: "1.6 Bn", label: "People earn livelihoods from forests" },
      { num: "50%", label: "Plant species found only in forests" },
      { num: "2.6 Tn", label: "Tonnes of carbon absorbed annually" },
    ],
  },
  {
    id: "wildlife",
    icon: "🐯",
    title: "India's Wildlife Heritage",
    animals: [
      { name: "Bengal Tiger", sci: "Panthera tigris tigris", count: "~3,167", status: "Endangered", icon: "🐯", desc: "India's national animal. Under Project Tiger, their numbers have shown a remarkable recovery over the past four decades." },
      { name: "One-Horned Rhinoceros", sci: "Rhinoceros unicornis", count: "~3,700", status: "Protected", icon: "🦏", desc: "The pride of Assam — Kaziranga National Park is home to the world's highest concentration of one-horned rhinos." },
      { name: "Asiatic Elephant", sci: "Elephas maximus", count: "~27,000", status: "Endangered", icon: "🐘", desc: "The architect of the jungle — elephants create trails and clearings that benefit dozens of other species in the ecosystem." },
      { name: "Snow Leopard", sci: "Panthera uncia", count: "~700", status: "Vulnerable", icon: "🐆", desc: "The jewel of the Himalayas — the supreme ruler of high-altitude mountain ecosystems, shrouded in mystery and grace." },
      { name: "Gangetic Dolphin", sci: "Platanista gangetica", count: "~3,700", status: "Endangered", icon: "🐬", desc: "A living indicator of the Ganga's health — these dolphins survive only in clean, unpolluted river waters." },
      { name: "Indian Vulture", sci: "Gyps indicus", count: "Declining", status: "Critically Endangered", icon: "🦅", desc: "Nature's essential clean-up crew — without vultures, carcasses of sick animals accumulate and spread disease." },
    ],
  },
  {
    id: "conservation",
    icon: "🛡️",
    title: "Forest Conservation — Our Responsibility",
    steps: [
      { num: "01", title: "Plant Trees, Save Lives", desc: "Planting a tree is equivalent to giving a life. Make it a tradition — plant a tree on your birthday, anniversary, or any occasion worth celebrating." },
      { num: "02", title: "Save Paper, Save Forests", desc: "Producing one tonne of paper requires cutting down 17 trees. Opt for digital documents wherever possible, and help preserve our forests one sheet at a time." },
      { num: "03", title: "Protect Wildlife", desc: "Hunting and trading wildlife is a serious crime. Report any suspicious activity to the wildlife helpline: 1800-11-0030." },
      { num: "04", title: "Embrace Eco-Tourism", desc: "Visit forests with a clean heart and leave no trace behind. Connecting with nature strengthens our resolve to protect it for future generations." },
    ],
  },
];

export default function WildlifePage() {
  const [theme, setTheme]             = useState<ThemeKey>("forest");
  const [menuOpen, setMenuOpen]       = useState(false);
  const [ingressOpen, setIngressOpen] = useState(false);
  const [code, setCode]               = useState("");
  const [codeError, setCodeError]     = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const router                        = useRouter();
  const t                             = THEMES[theme];
  const codeRef                       = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef(0);

const handleIngressTap = () => {
  const now = Date.now();
  if (now - lastTapRef.current < 400) {
    lastTapRef.current = 0;
    setIngressOpen(true);
    setCode("");
    setCodeError("");
  } else {
    lastTapRef.current = now;
  }
};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (ingressOpen) setTimeout(() => codeRef.current?.focus(), 100);
  }, [ingressOpen]);

  const handleIngress = async () => {
    setCodeLoading(true);
    setCodeError("");
    const enteredCode = code.trim();

    if (enteredCode === "BHAWANI") {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/portal");
      } else {
        sessionStorage.removeItem("ingress_action");
        router.push("/login");
      }

    } else if (enteredCode === "MAHAKAL") {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const userId = session.user.id;
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, deleted_for")
          .not("deleted_for", "cs", `{${userId}}`);
        if (msgs) {
          for (const m of msgs) {
            const updated = [...(m.deleted_for || []), userId];
            await supabase.from("messages").update({ deleted_for: updated }).eq("id", m.id);
          }
        }
        setCode("");
        setCodeError("✅ Your chat has been cleared. Use BHAWANI to enter.");
        setCodeLoading(false);
      } else {
        sessionStorage.setItem("ingress_action", "MAHAKAL");
        router.push("/login");
      }

    } else {
      setTimeout(() => {
        setCodeError("Access denied — invalid access key.");
        setCode("");
        setCodeLoading(false);
      }, 600);
    }
  };

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: "all 0.4s" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? t.headerBg : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🌿</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", color: t.accent }}>neowildrepository</div>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: t.textMuted, textTransform: "uppercase" }}>Forest Science Portal</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[["Forests","#forests"],["Benefits","#benefits"],["Wildlife","#wildlife"],["Conservation","#conservation"]].map(([n,href]) => (
              <a key={n} href={href}
                style={{ fontSize: 13, color: t.textMuted, textDecoration: "none", transition: "color 0.2s" }}
                onMouseOver={e => (e.currentTarget.style.color = t.accent)}
                onMouseOut={e => (e.currentTarget.style.color = t.textMuted)}>
                {n}
              </a>
            ))}
            <button onClick={() => setMenuOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.accentSoft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 14, height: 1.5, background: t.accent, display: "block", borderRadius: 2 }} />)}
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: t.hero, padding: "100px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(34,197,94,0.3))" }}>🌲🦁🌿</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 20, color: t.text }}>
            Protect Nature,<br />
            <span style={{ color: t.accent }}>Secure Humanity</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: t.textMuted, maxWidth: 560, margin: "0 auto 36px" }}>
            National Forest Science & Environmental Information System — a comprehensive repository of India's forests,
            wildlife, and biodiversity for researchers, conservationists, and nature lovers.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[["🌳","7.12 Lakh km²","Forest Cover"],["🐯","3,167+","Bengal Tigers"],["🌿","45,000+","Plant Species"]].map(([icon,num,label]) => (
              <div key={label} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 24px", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.accent }}>{num}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sections ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* Why Forests */}
        <section id="forests" style={{ padding: "72px 0 48px" }}>
          <SectionHead icon={sections[0].icon} title={sections[0].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}>
            {sections[0].content!.map((para, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 28px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontSize: 15, lineHeight: 1.85, color: t.textMuted, margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" style={{ padding: "48px 0" }}>
          <SectionHead icon={sections[1].icon} title={sections[1].title} t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 32 }}>
            {sections[1].items!.map((item) => (
              <div key={item.head} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px", backdropFilter: "blur(12px)", transition: "transform 0.2s" }}
                onMouseOver={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: t.text }}>{item.head}</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: t.textMuted, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nature's Power */}
        <section id="nature" style={{ padding: "48px 0" }}>
          <SectionHead icon={sections[2].icon} title={sections[2].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {sections[2].content!.map((para, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 26px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: t.textMuted, margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 24 }}>
            {sections[2].stats!.map(s => (
              <div key={s.label} style={{ background: t.accentSoft, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: t.accent }}>{s.num}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Wildlife */}
        <section id="wildlife" style={{ padding: "48px 0" }}>
          <SectionHead icon={sections[3].icon} title={sections[3].title} t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 32 }}>
            {sections[3].animals!.map(a => (
              <div key={a.name} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px", backdropFilter: "blur(12px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{a.name}</div>
                    <div style={{ fontSize: 10, fontStyle: "italic", color: t.textMuted }}>{a.sci}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: t.accentSoft, color: t.accent, fontWeight: 600 }}>{a.count}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", fontWeight: 600 }}>{a.status}</span>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: t.textMuted, margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conservation */}
        <section id="conservation" style={{ padding: "48px 0 80px" }}>
          <SectionHead icon={sections[4].icon} title={sections[4].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {sections[4].steps!.map(s => (
              <div key={s.num} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.accent, opacity: 0.3, minWidth: 40 }}>{s.num}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: t.text }}>{s.title}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: t.textMuted, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

     {/* ── Footer ── */}
<footer style={{ borderTop: `1px solid ${t.border}`, padding: "56px 24px 40px", background: t.bg }}>
  <div style={{ maxWidth: 900, margin: "0 auto" }}>

    {/* Top row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 40, marginBottom: 48 }}>
      {/* Brand */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: t.accent }}>neowildrepository</span>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.8, color: t.textMuted, margin: 0 }}>
          India's foremost digital archive for forest science, wildlife research, and environmental conservation data.
          Established under the Ministry of Environment, Forest and Climate Change.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 11, color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Quick Links</div>
        {["Forest Database","Species Registry","Research Papers","Conservation Map","Field Reports"].map(link => (
          <div key={link} style={{ fontSize: 12, color: t.textMuted, marginBottom: 8, cursor: "default" }}>{link}</div>
        ))}
      </div>

      {/* Contact */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 11, color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Contact</div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.9 }}>
          <div>📍 Van Bhawan, New Delhi - 110003</div>
          <div>📞 1800-11-0030 (Wildlife Helpline)</div>
          <div>✉️ info@neowildrepository.gov.in</div>
          <div style={{ marginTop: 10 }}>Mon–Fri · 09:00–17:30 IST</div>
        </div>
      </div>

      {/* Mission */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 11, color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Our Mission</div>
        <p style={{ fontSize: 12, lineHeight: 1.8, color: t.textMuted, margin: "0 0 10px" }}>
          To document, preserve, and make accessible all scientific knowledge about India's natural heritage for present and future generations.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.8, color: t.textMuted, margin: 0 }}>
          Supporting researchers, conservationists, and policymakers with accurate, real-time ecological data.
        </p>
      </div>
    </div>

    {/* Divider */}
    <div style={{ height: 1, background: t.border, marginBottom: 24 }} />

    {/* Bottom row */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: 11, color: t.textMuted, opacity: 0.6 }}>
        © 2025 neowildrepository · Government of India · All Rights Reserved
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {["Privacy Policy","Terms of Use","RTI","Sitemap"].map(item => (
          <span key={item} style={{ fontSize: 11, color: t.textMuted, opacity: 0.5, cursor: "default" }}>{item}</span>
        ))}
        {/* Hidden Ingress — double-tap to open */}
        <span
          onClick={handleIngressTap}
          style={{ fontSize: 11, color: t.textMuted, opacity: 0.5, cursor: "default", userSelect: "none" }}>
          Ingress
        </span>
      </div>
    </div>

    <div style={{ textAlign: "center", marginTop: 20 }}>
      <div style={{ fontSize: 11, color: t.textMuted, opacity: 0.4 }}>
        🌱 Clean India · Green India · Save Forests · Save Lives
      </div>
    </div>

  </div>
</footer>

      {/* ═══════════ SIDE MENU ═══════════ */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(4px)" }} />
      )}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
        background: t.menuBg, borderLeft: `1px solid ${t.border}`,
        zIndex: 101, transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        backdropFilter: "blur(24px)",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Settings</span>
          <button onClick={() => setMenuOpen(false)}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Choose Theme</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                <button key={key} onClick={() => setTheme(key)}
                  style={{
                    padding: "12px 16px", borderRadius: 12, border: `1px solid ${theme === key ? t.accent : t.border}`,
                    background: theme === key ? t.accentSoft : "transparent",
                    color: theme === key ? t.accent : t.textMuted,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                    fontWeight: theme === key ? 700 : 400, fontSize: 13,
                  }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: th.accent, flexShrink: 0 }} />
                  {th.name}
                  {theme === key && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

        
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 10, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>
            🌿 Clean India · Green India<br />Forest Conservation Mission
          </div>
        </div>
      </div>

      {/* ═══════════ INGRESS MODAL ═══════════ */}
      {ingressOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setIngressOpen(false); setCode(""); setCodeError(""); } }}>
          <div style={{
            background: t.menuBg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "40px 36px", width: "90%", maxWidth: 380,
            boxShadow: `0 0 60px rgba(0,0,0,0.5), 0 0 30px ${t.accent}22`,
          }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: t.accent, marginBottom: 6 }}>Ingress Protocol</div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>Enter your access key to proceed</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <input
                ref={codeRef}
                type="password"
                value={code}
                onChange={e => { setCode(e.target.value); setCodeError(""); }}
                onKeyDown={e => e.key === "Enter" && !codeLoading && handleIngress()}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 12, fontSize: 18,
                  border: `1px solid ${codeError ? "rgba(239,68,68,0.5)" : t.border}`,
                  background: t.accentSoft, color: t.text, outline: "none",
                  letterSpacing: "0.3em", textAlign: "center", boxSizing: "border-box",
                  caretColor: t.accent,
                }}
              />
              {codeError && (
                <div style={{
                  fontSize: 12, color: codeError.startsWith("✅") ? t.accent : "#f87171",
                  textAlign: "center", marginTop: 10, padding: "8px 12px",
                  background: codeError.startsWith("✅") ? t.accentSoft : "rgba(239,68,68,0.08)",
                  borderRadius: 8,
                  border: `1px solid ${codeError.startsWith("✅") ? t.border : "rgba(239,68,68,0.15)"}`,
                }}>
                  {codeError}
                </div>
              )}
            </div>

            <button onClick={handleIngress} disabled={codeLoading || !code.trim()}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: codeLoading ? t.accentSoft : `linear-gradient(135deg, ${t.accent}99, ${t.accent})`,
                color: t.bg, border: "none", cursor: codeLoading ? "not-allowed" : "pointer",
                opacity: !code.trim() ? 0.5 : 1, transition: "all 0.2s",
                boxShadow: `0 4px 20px ${t.accent}33`,
              }}>
              {codeLoading ? "Verifying..." : "Proceed →"}
            </button>

            <button onClick={() => { setIngressOpen(false); setCode(""); setCodeError(""); }}
              style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 12, fontSize: 13, background: "transparent", color: t.textMuted, border: `1px solid ${t.border}`, cursor: "pointer" }}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({ icon, title, t }: { icon: string; title: string; t: typeof THEMES[ThemeKey] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, color: t.text }}>{title}</h2>
        <div style={{ width: 40, height: 2, background: t.accent, marginTop: 6, borderRadius: 2 }} />
      </div>
    </div>
  );
}