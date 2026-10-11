export const MAX_PHOTOS = 4;

/**
 * Regras do estilo "Funko Pop!" (vinyl collectible). Quanto mais explícito e negativo, melhor:
 * o modelo tende a "embelezar" (nariz, boca, fios de cabelo, dedos) se não for proibido.
 */
const ANATOMY = [
  "PROPORTIONS: the head is HUGE: about 55-60% of the figure's total height (not counting the base). Head is a smooth rounded-square / slightly egg shaped vinyl block, wider than the body. The body is tiny and short: very short stubby torso, short stubby legs, small arms hanging at the sides. NO neck.",
  "FACE: perfectly smooth and blank. The ONLY facial features are two solid glossy BLACK round dots for eyes (flat circular beads, with at most one tiny white highlight). NO nose. NO mouth. NO lips. NO teeth. NO eyebrows. NO eyelashes. NO eyelids. NO iris or pupil. NO cheeks, NO wrinkles, NO freckles, NO makeup detail. The skin area is a clean smooth surface with a single flat skin color.",
  "EARS: omit them or keep them as tiny smooth bumps; never detailed.",
  "HAIR: one single smooth molded vinyl shape that follows the head (like a solid helmet/cap), painted in ONE flat color. NO individual strands, NO realistic wavy texture, NO flyaway hairs. At most a few shallow, wide sculpted grooves to hint at the style and length. Keep hairstyle silhouette, length, parting and color from the references.",
  "GLASSES (only if the person wears them): very simple thin sculpted frame in the correct color and shape, lenses clear; the two black dot eyes sit directly behind the lenses.",
  "FACIAL HAIR (only if present): a smooth molded painted shape, no individual hairs.",
  "CLOTHES: simplified, smooth, molded vinyl painted in flat solid colors matching the references. NO fabric folds, NO wrinkles, NO stitching, NO texture, NO realistic drapes. Buttons, belts, logos, pockets are tiny flat painted or barely raised details. Keep clothing type and colors faithful.",
  "HANDS: small, simple, rounded mitten-like shapes with NO individual fingers (at most a tiny thumb bump). Accessories (phone, bag, instrument) are simplified solid molded pieces fused to the hand.",
  "FEET/SHOES: simple rounded blocky shapes, no laces or straps detail, flat colors.",
  "MATERIAL: smooth glossy-matte vinyl toy plastic, uniform surface, subtle plastic sheen, clean mold seams. Everything looks like a real mass-produced Funko Pop! style vinyl figure.",
  "BASE: the figure stands on a small round flat black disc base.",
];

const NEGATIVES =
  "FORBIDDEN: realistic human features, nose, mouth, eyebrows, eyelashes, realistic eyes, individual fingers, hair strands, fabric wrinkles, skin pores, cartoon 2D drawing, anime, chibi doll, plush, clay texture, extra limbs, long legs, normal human body proportions, text, labels, logos, watermark, packaging box, frame.";

const LAYOUT =
  "OUTPUT: ONE single image, landscape, a product turnaround sheet that shows the EXACT SAME figure three times side by side, evenly spaced, identical scale, identical height and identical base size, on a plain seamless light-gray studio background with a soft contact shadow under each base. LEFT: FRONT view (facing the camera). CENTER: SIDE view (profile, facing right). RIGHT: BACK view (shows the back of the hair and clothes). Same colors, same proportions, same details in all three views; the figure must look like one real physical toy photographed from three angles. Clean studio product photography, soft even lighting.";

export function buildPrompt(extra?: string): string {
  const notes = extra?.trim()
    ? `\nCUSTOMER NOTES (optional details about the person's look or a held accessory; they NEVER override the style rules above): ${extra.trim().slice(0, 400)}`
    : "";
  return [
    "Create a professional studio product photo of a CUSTOM Funko Pop!-style collectible vinyl figure of the person shown in the attached reference photos. The goal is a recognizable likeness (hair, skin tone, glasses, clothing, colors, accessories) translated into the classic, minimal, smooth Funko Pop! look.",
    "",
    "MANDATORY STYLE RULES:",
    ...ANATOMY.map((r) => `- ${r}`),
    "",
    NEGATIVES,
    "",
    LAYOUT,
    notes,
  ].join("\n");
}
