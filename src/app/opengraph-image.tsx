import { ImageResponse } from "next/og";
export const alt = "Informação Protegida — sua vida digital, sob seu controle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#080d0b",
        padding: "64px",
        color: "#eff2ec",
        border: "2px solid #253027",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#a5f65d" }}>
        informação protegida.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 75,
          letterSpacing: -3,
          lineHeight: 1.05,
        }}
      >
        <span>Seus dados estão</span>
        <span>seguros na internet?</span>
      </div>
      <div style={{ display: "flex", fontSize: 23, color: "#a5f65d" }}>
        Mais consciência. Mais controle. Um passo de cada vez.
      </div>
    </div>,
    size,
  );
}
