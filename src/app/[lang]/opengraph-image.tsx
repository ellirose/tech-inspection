import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasLocale, type Locale } from "@/i18n/config";
import { home } from "@/content/home";

export const alt = "Tech-Inspection S.A.S. — NDT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paths stay literal at each readFile call: a variable path makes Next trace the whole project into this function.
const dataUrl = async (file: Promise<Buffer>, mime: string) => `data:${mime};base64,${(await file).toString("base64")}`;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "es";
  const [photo, logo, semibold, heavy, mono] = await Promise.all([
    dataUrl(readFile(join(process.cwd(), "src/assets/og-bit.jpg")), "image/jpeg"),
    dataUrl(readFile(join(process.cwd(), "public/media/brand/logo.png")), "image/png"),
    readFile(join(process.cwd(), "src/assets/fonts/jakarta-600.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/jakarta-800.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/geist-mono-500.ttf")),
  ]);
  const h = home.hero;
  const tail = h.titleB[lang].replace(/[.]$/, "").split(" ");
  const last = tail.pop();
  const chips = ["ISO 9001", "ISO 45001", "RUC", { es: "ASNT Nivel II", pt: "ASNT Nível II", en: "ASNT Level II" }[lang], "DS-1"];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f2f7fa", position: "relative", fontFamily: "Jakarta", color: "#071a2e" }}>
        {/* blueprint grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to right, rgba(10,100,191,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,100,191,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div style={{ position: "absolute", right: -120, top: -160, width: 560, height: 560, borderRadius: 999, background: "rgba(31,200,245,0.22)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 0 56px 64px", width: 690, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={240} height={85} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Mono", fontSize: 19, letterSpacing: 3, color: "#0592c4" }}>
              <div style={{ display: "flex", width: 14, height: 14, borderRadius: 99, background: "#1fc8f5" }} />
              {h.eyebrow[lang].toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 62, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.5, marginTop: 18 }}>
              <span>{h.titleA[lang]}</span>
              <span style={{ display: "flex", flexWrap: "wrap", color: "#0a64bf" }}>
                {tail.join(" ")}&nbsp;
                <span style={{ backgroundImage: "linear-gradient(transparent 70%, rgba(134,227,58,0.75) 70%)" }}>{last + "."}</span>
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 600, lineHeight: 1.35, color: "#3a4d63", marginTop: 20 }}>{h.lead[lang]}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", padding: "9px 16px", borderRadius: 999, background: "white", border: "1px solid #dbe5ee", fontSize: 19, fontWeight: 600 }}>
                {c}
              </div>
            ))}
          </div>
        </div>
        {/* tilted photo card */}
        <div style={{ position: "absolute", right: 56, top: 70, width: 410, height: 490, display: "flex", borderRadius: 44, overflow: "hidden", border: "8px solid white", boxShadow: "0 40px 80px -30px rgba(8,45,80,0.45)", transform: "rotate(3deg)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} width={760} height={630} alt="" style={{ width: 410, height: 490, objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", right: 330, top: 52, display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 12px 12px", background: "white", borderRadius: 22, boxShadow: "0 20px 40px -18px rgba(8,45,80,0.45)" }}>
          <div style={{ display: "flex", width: 46, height: 46, borderRadius: 14, background: "#86e33a", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>+10</div>
          <div style={{ display: "flex", fontSize: 19, fontWeight: 800 }}>Oil & Gas</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Jakarta", data: semibold, weight: 600, style: "normal" },
        { name: "Jakarta", data: heavy, weight: 800, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
