export const MAX_PHOTOS = 4;
export type View = "front" | "side" | "back";

/**
 * Prompts do boneco. Duas ideias centrais:
 *  1) Geometria SIMPLIFICADA de Funko Pop! (rosto liso, cabelo sólido, mãos de luva)...
 *  2) ...mas FOTOGRAFADA em hiper-realismo, nítida e em alta definição (não pode ficar "lavada" ou borrada).
 * Lateral e traseira são geradas a partir da FRENTE já gerada, para os três ângulos serem o mesmo boneco.
 */
const LOOK = [
  "PHOTOGRAPHY: ultra-sharp, high-resolution, hyper-realistic studio product photograph of a REAL physical Funko Pop! vinyl figure on a table. Crisp focus across the whole figure, fine realistic material detail, believable glossy vinyl with natural specular highlights and soft reflections, accurate paint finish, clean mold seams. 85mm lens, soft diffused studio lighting. It must look like a photo of a physical collectible, NOT a soft blurry render, NOT matte or washed-out, NOT a painting, NOT a cartoon illustration.",
];

const ANATOMY = [
  "PROPORTIONS: the head is HUGE: about 55-60% of the figure's total height (base not counted). Head is a smooth rounded-square / slightly egg-shaped vinyl block, wider than the body. The body is tiny and short: very short stubby torso, short stubby legs, short arms. NO neck.",
  "FACE: the face is one smooth, blank, perfectly flat vinyl surface in a single flat skin color, like a mannequin or egg: no relief, no shading changes. On it sit exactly TWO small solid black round dot eyes (each about 1/8 of the head width, flat, with one tiny white highlight), placed wide apart at mid-head. Nothing else on the face: the whole area between the eyes and the chin is completely clean and featureless.",
  "EARS: omitted or tiny smooth bumps, never detailed.",
  "HAIR: a rigid, hard, solid sculpted vinyl hair piece with a smooth glossy surface, like a helmet, painted in ONE single flat color (pick the dominant color from the references; no gradient, no ombre, no highlights, no streaks). Smooth simple silhouette following the reference length and parting, with only 2-4 wide shallow sculpted grooves. The surface is smooth and continuous.",
  "GLASSES (only if the person wears them in the references): simple thin sculpted frame in the right shape and color, clear lenses, the small black dot eyes directly behind the lenses; glasses never change the eye size.",
  "FACIAL HAIR (only if present): smooth molded painted shape, no individual hairs.",
  "CLOTHES: simplified molded vinyl in flat solid colors matching the references (same garment types and colors). NO fabric folds, wrinkles, stitching or texture. Buttons, belts, logos are tiny flat painted or barely raised details.",
  "HANDS: small, simple, rounded mitten-like shapes, NO individual fingers. Both hands are EMPTY.",
  "FEET/SHOES: simple rounded blocky shapes in flat colors, matching the shoe type and color of the references, no laces detail.",
  "POSE (always the same neutral turnaround pose): standing straight, legs together, both arms hanging straight down relaxed at the sides, hands empty, head level, body symmetric. NEVER raise an arm or hand. IGNORE any phone, bag, cup, camera or other object the person holds in the references: do NOT include held objects (unless the customer notes explicitly ask for one). Ignore the original pose, facial expression, background and other people.",
  "BASE: the figure stands on a small round flat black disc base.",
];

const NEGATIVES =
  "AVOID: any realistic human facial features, fingers, hair strands, gradients, fabric folds, skin texture, held objects, raised arms, 2D drawing, anime, plush, blurry or low-detail image, washed-out colors, long legs, normal human proportions, text, logos, watermark, packaging, multiple figures.";

const FRAMING =
  "FRAMING: one single figure, the WHOLE figure including the base fully visible and centered, occupying about 80% of the image height, straight horizontal camera at mid-height of the figure (no top-down or low angle, no perspective distortion), on a plain seamless uniform light-gray (#E8E8EC) studio background with a soft contact shadow under the base. No other objects.";

function notesBlock(extra?: string): string {
  return extra?.trim()
    ? `\nCUSTOMER NOTES (optional details about the person's look; they NEVER override the style, pose and no-held-objects rules above): ${extra.trim().slice(0, 400)}`
    : "";
}

export function buildFrontPrompt(extra?: string): string {
  return [
    "Using the attached reference photos of a person, create the FRONT VIEW of a CUSTOM Funko Pop!-style collectible vinyl figure of that person. Goal: a clearly recognizable likeness (hair color/length/style, skin tone, glasses, clothing and its colors, shoes) translated into the classic minimal Funko Pop! look.",
    "",
    "VIEW: FRONT, the figure faces the camera straight on, perfectly symmetric.",
    "",
    "LOOK:",
    ...LOOK.map((r) => `- ${r}`),
    "",
    "FIGURE RULES (mandatory):",
    ...ANATOMY.map((r) => `- ${r}`),
    "",
    NEGATIVES,
    "",
    FRAMING,
    notesBlock(extra),
  ].join("\n");
}

const TURN: Record<Exclude<View, "front">, string> = {
  side: "Rotate the figure exactly 90 degrees to show the RIGHT SIDE PROFILE: the figure faces the right edge of the image, seen perfectly from the side.",
  back: "Rotate the figure exactly 180 degrees to show the BACK VIEW: seen perfectly from behind, showing the back of the head, hair and clothes.",
};

export function buildTurnPrompt(view: Exclude<View, "front">, extra?: string, hasSide = false): string {
  const refs = hasSide
    ? "The FIRST attached image is the APPROVED FRONT VIEW and the SECOND attached image is the APPROVED SIDE VIEW of the same collectible vinyl figure. The remaining attached images are reference photos of the real person (use them only to infer what the hidden back looks like, e.g. the back of the hair and clothes)."
    : "The FIRST attached image is the APPROVED FRONT VIEW of a collectible vinyl figure. The other attached images are reference photos of the real person (use them only to infer what the hidden side/back looks like, e.g. the back of the hair and clothes).";
  return [
    refs,
    "",
    `Produce the SAME EXACT figure, ${TURN[view]}`,
    "",
    "IDENTICAL-FIGURE RULES (critical): it must be the very same physical toy as in the approved views: same head shape and size, same hair piece (same single flat color, length and silhouette, same smooth finish), same skin color, same glasses, same clothes and colors, same shoes, same black base, same proportions, same scale, same pose (arms straight down, hands empty), same material finish, same lighting, same camera distance, same background color. Do NOT redesign or reinterpret anything and do NOT add any detail that is not in the approved views. Only the viewing angle changes.",
    "",
    "LOOK:",
    ...LOOK.map((r) => `- ${r}`),
    "",
    NEGATIVES,
    "",
    FRAMING,
    notesBlock(extra),
  ].join("\n");
}
