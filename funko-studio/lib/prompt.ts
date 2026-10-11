export const MAX_PHOTOS = 4;

/**
 * Regras do estilo "vinyl collectible figure" (boneco colecionável de cabeção).
 * Tudo que for ajustado no visual do boneco deve ser mexido aqui.
 */
export const STYLE_RULES = [
  "Stylized vinyl collectible toy figure: oversized round head (about half of the total height), tiny cylindrical torso, short stubby arms and legs, no neck.",
  "Eyes are solid glossy black round beads with a tiny white specular highlight. NO mouth detail beyond, at most, a very small simple line. Nose is minimal or absent.",
  "Smooth matte-glossy vinyl surfaces with subtle plastic sheen, clean seams, simplified hands without individual fingers (mitten-like).",
  "Hair, beard, glasses, skin tone, clothing, colors, accessories and distinctive traits MUST be faithfully translated from the reference photos into the toy style so the person is recognizable.",
  "Simplify details into flat, clean color blocks; keep logos and text only if clearly visible in the references.",
  "Sits on a small round black base disc.",
];

export const VIEW_RULES =
  "Produce ONE single image: a character turnaround sheet showing the SAME figure three times side by side, evenly spaced, same scale, same height, on a plain light-gray studio background with soft shadow under each figure. Left: FRONT view. Center: SIDE view (facing right). Right: BACK view. All three must be consistent in proportions, colors and details (back view shows the back of the hair/clothes). No text, no labels, no borders, no watermark.";

export function buildPrompt(extra?: string): string {
  const notes = extra?.trim()
    ? `\nExtra notes from the customer (apply only if compatible with the rules above): ${extra.trim().slice(0, 400)}`
    : "";
  return [
    "Create a professional product-render of a custom collectible vinyl figure of the person shown in the attached reference photos.",
    "",
    "STYLE RULES (mandatory):",
    ...STYLE_RULES.map((r) => `- ${r}`),
    "",
    "LAYOUT:",
    VIEW_RULES,
    notes,
  ].join("\n");
}
