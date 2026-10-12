import { ImageResponse } from "next/og";
export const alt = "SkillWave Academy — Practical IT skills for your future";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(120deg, #305a49, #183d64)", color: "white" }}><div style={{ fontSize: 32, marginBottom: 36 }}>SKILLWAVE ACADEMY</div><div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Practical IT skills.</div><div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>A future you build.</div><div style={{ fontSize: 28, marginTop: 42 }}>Online & in Baduraliya, Sri Lanka</div></div>, size);
}
