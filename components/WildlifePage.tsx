"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const THEMES = {
  harit: {
    name: "Harit",
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
  raat: {
    name: "Raat",
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
  ujala: {
    name: "Ujala",
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
    id: "kyun",
    icon: "🌳",
    title: "Jangal Kyun Zaruri Hain?",
    content: [
      "Jangal prithvi ke phephde hain. Dharti ki lagbhag 31% bhoomi par failay huay yeh vaano ka parivar, hamare jeevan ka aadhar hai. Bina janngalon ke, jeevan ki kalpana bhi sambhav nahi.",
      "Duniya ke 80% thi sthaliya jeev-jantu janngalon mein niwas karte hain. Yeh woh jagah hai jahan prakriti apna sabse sundar roop dikhati hai — jahaan ek patte ki sarsarahat se lekar sher ki dahad tak, sab kuch ek mahaan symphony mein band hai.",
      "Bharat mein lagbhag 7.12 lakh varg kilometre kshetrfal mein jangal failay hue hain, jo desh ki kul bhoomi ka lagbhag 21.71% hai. Yeh jangal 500 se adhik prajaatiyon ke parindon, 200+ prajaatiyon ke saanpon aur hazaron keedon-makodon ka ghar hai.",
    ],
  },
  {
    id: "labh",
    icon: "💚",
    title: "Jangalon ke Anmol Labh",
    items: [
      { icon: "💧", head: "Jal Chakra", body: "Jangal barish ko aakarshit karte hain, bhoojal ko recharge karte hain aur nadiyon ko saal bhar pravaahit rakhte hain. Ek paripakvv ped pratidin 400 litre paani waashpeekarit karta hai." },
      { icon: "🌬️", head: "Shuddh Vayu", body: "Ek akela ped ek saal mein 100 kg carbon dioxide absorb karta hai aur itni oxygen deta hai ki 4 log saans le sakein. Jangal hawa ko filter karke hamare liye shuddh oxygen pradaan karte hain." },
      { icon: "🌡️", head: "Jalvayu Niyantran", body: "Vaano ki upasthiti temperature ko 2-8 degree Celsius tak thanda rakh sakti hai. Yeh praakritik air conditioning hai jo sampoorn pariyavarana tantra ko santulit rakhti hai." },
      { icon: "🦁", head: "Jeev Vividhata", body: "Jangal biodiversity ke khajanay hain. Yahan ek choti si jagah mein aise hazaron jeev milte hain jo dharti ke aur kisi bhi kone mein nahi paay jate." },
      { icon: "🌿", head: "Aushadhi Bhandaar", body: "Bharat ke jangalon mein 45,000 se adhik prajaatiyon ke paudhe paay jate hain jinmein se kai hajaaron aushadheey guNon se bharpoor hain. Yeh praakritik dawakhana hai." },
      { icon: "🏔️", head: "Bhoomi Sanrakshan", body: "Jangal bhoomi aparan rokate hain, baadhon ko niyantrit karte hain aur pahadi sthalonpada mein bhooklhan se suraksha pradaan karte hain." },
    ],
  },
  {
    id: "prakriti",
    icon: "🦋",
    title: "Prakriti Ki Madadgaar Shakti",
    content: [
      "Prakriti ka apna ek sucharu tantra hai jo lakho varshon mein viksit hua hai. Har jeev-jantu, har ped-paudha is tantra ka ek avashyak hissa hai. Ek bhi prani ya paudhe ki prajaati ka vinaash is pure tantra ko prabhavit karta hai.",
      "Bagh ek sheershsthi shikari hai jo pure jungle ke ecosystem ko santulit rakhta hai. Agar bagh na ho to hirnon ki sankhya atyadhik badh jaayegi jo ghaans aur poudho ko kha jayenge, jis se jungle nashtho jaayega. Yeh ek chain reaction hai jise 'Trophic Cascade' kehte hain.",
      "Titliyan aur makkhiyaan phoolon ka parag ek phool se doosre phool tak lejaati hain — is kriya ko 'paragan' kehte hain. Bina paragan ke 75% se adhik khadya faslein prajaanan nahi kar sakti. Ek chhoti si titali ka mahatva iss tarah sampurn manav jeevan se judaa hai.",
    ],
    stats: [
      { num: "80%", label: "Khadya faslein paragnkartaaon par nirbhar" },
      { num: "1.6 Bn", label: "Log jangalon se jeevika kamaate hain" },
      { num: "50%", label: "Vanspatiyon ki prajaatiyaan sirf jangalon mein" },
      { num: "2.6 Tn", label: "Tonne carbon jangal saalaana absorb karte hain" },
    ],
  },
  {
    id: "india",
    icon: "🐯",
    title: "Bharat Ka Vanya Vaibhav",
    animals: [
      { name: "Bengal Sher", sci: "Panthera tigris tigris", count: "~3,167", status: "Sankatgrastha", icon: "🐯", desc: "Bharat ka rashtriya pashu. Project Tiger ke tahat inki sankhya mein uplabdhi praapthuv aayi hai." },
      { name: "Ek Singa Gainda", sci: "Rhinoceros unicornis", count: "~3,700", status: "Sanrakshit", icon: "🦏", desc: "Assam ka garv — Kaziranga mein duniya ki sabse adhik awaadhik gainde paaye jaate hain." },
      { name: "Asiatic Haathi", sci: "Elephas maximus", count: "~27,000", status: "Sankatgrastha", icon: "🐘", desc: "Jangal ka architect — yeh aapne raaste banate hain jo chhote jaanwaron ke liye bhi upyogi hote hain." },
      { name: "Snow Cheetah", sci: "Panthera uncia", count: "~700", status: "Savdhan", icon: "🐆", desc: "Himalay ka anmol ratan — pahadi paryaavarana tantra ka raja." },
      { name: "Gangetic Dolphin", sci: "Platanista gangetica", count: "~3,700", status: "Sankatgrastha", icon: "🐬", desc: "Ganga nadi ki shuddhata ka maapnndand — yeh sirf shuddh paani mein jeeti hai." },
      { name: "Indian Vulture", sci: "Gyps indicus", count: "Ghata hua", status: "Atigangrast", icon: "🦅", desc: "Prakriti ka safaayi karmachaari — binaa iske beemar pashuo ke shav saadne lagte." },
    ],
  },
  {
    id: "sanrakshan",
    icon: "🛡️",
    title: "Van Sanrakshan — Hamaari Zimmedaari",
    steps: [
      { num: "01", title: "Ped Lagao, Jeevan Bachao", desc: "Ek ped lagana ek jeevan denay ke barabar hai. Apne janam divas par, shaadi ki saalgirah par — ped lagaao." },
      { num: "02", title: "Kaagaz Bachao", desc: "Ek tonne kaagaz banane mein 17 ped katate hain. Digital documents ka upyog karein, kaagaz bachain aur jangal bachaaon." },
      { num: "03", title: "Vaanya Jeevon Ki Suraksha", desc: "Vaanya jeevon ka shikar, unka byaapaar — yeh aparaadh hai. Kisi bhi sandehajanak gatividhi ki suchna 1800-11-0030 par dein." },
      { num: "04", title: "Eco-Tourism", desc: "Jangal mein jaayen — shuddh mann se, kachra khatam karke. Prakriti se judne se uski suraksha ka sankalp prabal hota hai." },
    ],
  },
];

export default function WildlifePage() {
  const [theme, setTheme]           = useState<ThemeKey>("harit");
  const [menuOpen, setMenuOpen]     = useState(false);
  const [ingressOpen, setIngressOpen] = useState(false);
  const [code, setCode]             = useState("");
  const [codeError, setCodeError]   = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const router                      = useRouter();
  const t                           = THEMES[theme];
  const codeRef                     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (ingressOpen) setTimeout(() => codeRef.current?.focus(), 100);
  }, [ingressOpen]);

  const handleIngress = () => {
    setCodeLoading(true);
    setCodeError("");
    setTimeout(() => {
      if (code.trim().toUpperCase() === "BHAWANI") {
        router.push("/login");
      } else {
        setCodeError("Galat pratham — Prapti niraakrit.");
        setCode("");
        setCodeLoading(false);
      }
    }, 800);
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
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🌿</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", color: t.accent }}>neowildrepository</div>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: t.textMuted, textTransform: "uppercase" }}>Van Vigyan Pranali</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["Jangal","Labh","Jeev-Jantu","Sanrakshan"].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`}
                style={{ fontSize: 13, color: t.textMuted, textDecoration: "none", transition: "color 0.2s" }}
                onMouseOver={e => (e.currentTarget.style.color = t.accent)}
                onMouseOut={e => (e.currentTarget.style.color = t.textMuted)}>
                {n}
              </a>
            ))}
            {/* Menu trigger */}
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
            Prakriti ki Raksha,<br />
            <span style={{ color: t.accent }}>Manav ki Suraksha</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: t.textMuted, maxWidth: 560, margin: "0 auto 36px" }}>
            Rashtriya Van Vigyan Evam Paryaavaran Suchna Pranali — Bharat ke samast vaano, vaanya praaniyon
            aur jaivik vividhata ki sampoorn jaankaari ka ek adbhut sanklan.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[["🌳","7.12 Lakh km²","Jangali Kshetra"],["🐯","3,167+","Bengal Sher"],["🌿","45,000+","Vanaspati Prajaatiyaan"]].map(([icon,num,label]) => (
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

        {/* Jangal kyun zaruri */}
        <section id="jangal" style={{ padding: "72px 0 48px" }}>
          <SectionHead icon={sections[0].icon} title={sections[0].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}>
            {sections[0].content!.map((para, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 28px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontSize: 15, lineHeight: 1.85, color: t.textMuted, margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Labh */}
        <section id="labh" style={{ padding: "48px 0" }}>
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

        {/* Prakriti */}
        <section id="prakriti" style={{ padding: "48px 0" }}>
          <SectionHead icon={sections[2].icon} title={sections[2].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {sections[2].content!.map((para, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 26px", backdropFilter: "blur(12px)" }}>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: t.textMuted, margin: 0 }}>{para}</p>
              </div>
            ))}
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 24 }}>
            {sections[2].stats!.map(s => (
              <div key={s.label} style={{ background: t.accentSoft, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: t.accent }}>{s.num}</div>
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Animals */}
        <section id="jeev-jantu" style={{ padding: "48px 0" }}>
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

        {/* Sanrakshan */}
        <section id="sanrakshan" style={{ padding: "48px 0 80px" }}>
          <SectionHead icon={sections[4].icon} title={sections[4].title} t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {sections[4].steps!.map(s => (
              <div key={s.num} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start", backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.accent, opacity: 0.3, minWidth: 40, fontVariantNumeric: "tabular-nums" }}>{s.num}</div>
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
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>🌿</div>
        <div style={{ fontWeight: 700, fontSize: 14, color: t.accent, marginBottom: 4 }}>neowildrepository</div>
        <div style={{ fontSize: 11, color: t.textMuted }}>Rashtriya Van Vigyan Evam Paryaavaran Suchna Pranali · Bharat Sarkaar</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8, opacity: 0.6 }}>🌱 Swachh Bharat · Harit Bharat · Van Bachao · Jeevan Bachao</div>
      </footer>

      {/* ═══════════ SIDE MENU ═══════════ */}
      {/* Overlay */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(4px)" }} />
      )}
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
        background: t.menuBg, borderLeft: `1px solid ${t.border}`,
        zIndex: 101, transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        backdropFilter: "blur(24px)",
      }}>
        {/* Menu header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Niyantran</span>
          <button onClick={() => setMenuOpen(false)}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Theme selection */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Vishay Chuno</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                <button key={key} onClick={() => { setTheme(key); }}
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

          {/* Divider */}
          <div style={{ height: 1, background: t.border, marginBottom: 28 }} />

          {/* Ingress — hidden option */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Pravesh</div>
            <button
              onClick={() => { setMenuOpen(false); setIngressOpen(true); setCode(""); setCodeError(""); }}
              style={{
                width: "100%", padding: "13px 16px", borderRadius: 12,
                border: `1px solid ${t.border}`, background: t.accentSoft,
                color: t.accent, cursor: "pointer", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = t.accent)}
              onMouseOut={e => (e.currentTarget.style.borderColor = t.border)}>
              <span>🔐</span>
              Ingress
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 10, color: t.textMuted, textAlign: "center", lineHeight: 1.6 }}>
            🌿 Swachh Bharat · Harit Bharat<br />Van Suraksha Abhiyan
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
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>Pratham kunjika darj karein</div>
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
                <div style={{ fontSize: 12, color: "#f87171", textAlign: "center", marginTop: 10, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>
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
              {codeLoading ? "Satyapit ho raha hai..." : "Pravishtam Karein →"}
            </button>

            <button onClick={() => { setIngressOpen(false); setCode(""); setCodeError(""); }}
              style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 12, fontSize: 13, background: "transparent", color: t.textMuted, border: `1px solid ${t.border}`, cursor: "pointer" }}>
              Vaapas Jao
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