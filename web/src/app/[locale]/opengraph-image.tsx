import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline = locale === "ur" ? "اپنی زندگی کو طاقت دیں" : SITE.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0B3D2E 0%, #1E8E3E 100%)",
          padding: "80px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#FF8A00",
              color: "#1A1A1A",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            G
          </div>
          <span style={{ fontWeight: 700 }}>{SITE.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{tagline}</div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
            Electronics retail · Repair · Installation — Karachi
          </div>
        </div>
      </div>
    ),
    size,
  );
}
