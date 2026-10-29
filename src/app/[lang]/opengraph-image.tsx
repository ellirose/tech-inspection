import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const alt = "Tech-Inspection S.A.S. — NDT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paths stay literal at each readFile call: a variable path makes Next trace the whole project into this function.
const dataUrl = async (file: Promise<Buffer>, mime: string) => `data:${mime};base64,${(await file).toString("base64")}`;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = hasLocale(raw) ? raw : "es";
  const dict = getDictionary(lang);
  const [photo, mt, logo, bold, semibold] = await Promise.all([
    dataUrl(readFile(join(process.cwd(), "src/assets/og-photo.jpg")), "image/jpeg"),
    dataUrl(readFile(join(process.cwd(), "src/assets/og-mt.jpg")), "image/jpeg"),
    dataUrl(readFile(join(process.cwd(), "public/media/brand/logo.png")), "image/png"),
    readFile(join(process.cwd(), "src/assets/fonts/bricolage-800.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/bricolage-600.ttf")),
  ]);
  const words = dict.meta.ogTitle.split(" ");
  const last = words.pop();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f8fc", position: "relative", fontFamily: "Bricolage" }}>
        {/* blueprint grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to right, rgba(3,10,140,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(3,10,140,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 56px", width: 660, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={250} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 21, fontWeight: 600, letterSpacing: 3, color: "#030a8c", textTransform: "uppercase" }}>
              {dict.hero.eyebrow}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: -3, color: "#0e1433", marginTop: 18 }}>
              {words.join(" ")}&nbsp;
              <span style={{ color: "#030a8c", backgroundImage: "linear-gradient(transparent 60%, rgba(111,209,28,0.55) 60%)" }}>{last}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["ISO 9001", "ISO 45001", "RUC", "ASNT-TC-1A"].map((c) => (
              <div key={c} style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#eef0ff", color: "#030a8c", fontSize: 20, fontWeight: 600 }}>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 0, top: 0, width: 540, height: 630, borderTopLeftRadius: 120, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} width={760} height={630} alt="" style={{ objectFit: "cover", width: 540, height: 630 }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "absolute",
            left: 600,
            bottom: 56,
            padding: 12,
            paddingRight: 26,
            background: "white",
            borderRadius: 28,
            boxShadow: "0 20px 50px rgba(3,10,140,0.25)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mt} width={84} height={84} alt="" style={{ borderRadius: 18 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 16, fontWeight: 600, color: "#3f8a07", letterSpacing: 2 }}>MT · UV</div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: "#0e1433" }}>{dict.hero.indication}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: bold, weight: 800, style: "normal" },
        { name: "Bricolage", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
