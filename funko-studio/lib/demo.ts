import type { View } from "./prompt";

/** Imagem de exemplo (sem OPENAI_API_KEY): um bonequinho em SVG, vista diferente por ângulo. */
export function demoImage(view: View): string {
  const eyes =
    view === "front"
      ? '<circle cx="-45" cy="250" r="22" fill="#111"/><circle cx="45" cy="250" r="22" fill="#111"/>'
      : view === "side"
        ? '<circle cx="70" cy="250" r="22" fill="#111"/>'
        : "";
  const label = { front: "FRENTE", side: "LATERAL", back: "TRASEIRA" }[view];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#E8E8EC"/>
  <g transform="translate(512 120) scale(1.3)">
    <ellipse cx="0" cy="470" rx="110" ry="18" fill="#000" opacity=".18"/>
    <rect x="-70" y="330" width="140" height="130" rx="40" fill="#7c5cff"/>
    <rect x="-120" y="150" width="240" height="210" rx="90" fill="#ffd9b8"/>
    ${eyes}
    <path d="M-120 230 Q-125 90 0 100 Q125 90 120 230 Q60 150 0 150 Q-60 150 -120 230Z" fill="#3b2a20"/>
    ${view === "back" ? '<rect x="-120" y="120" width="240" height="200" rx="90" fill="#3b2a20"/>' : ""}
  </g>
  <text x="512" y="960" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#777">${label} · demo (sem chave OpenAI)</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
