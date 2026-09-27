import {
  Apple,
  Bandage,
  Bike,
  Cigarette,
  Droplet,
  Dumbbell,
  Eye,
  Glasses,
  Heart,
  Milk,
  Moon,
  Pill,
  Salad,
  Scale,
  Shield,
  ShieldCheck,
  Stethoscope,
  Sun,
  Thermometer,
  UtensilsCrossed,
  Wind,
  type LucideIcon,
} from "lucide-react";

// Matches an action-list sentence ("Avoid smoking", "Ensure adequate
// calcium intake...") to a representative icon, the same technique as
// result-icons.ts but tuned to the imperative verbs a Prevention /
// Disease-management sentence actually uses.
//
// This exists as the safe alternative to the per-condition photo tellmeGen
// shows on the same section: that photo is a licensed stock image (see
// DESIGN.md), which we have no rights to redistribute. lucide-react is
// MIT-licensed for any use, so an icon carries none of that risk while
// still giving each row something to visually anchor on, closer to the
// reference design's intent (a distinct glyph per action) than the
// uniform checkmark it replaces.
const ACTION_ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /\b(smok\w*|tobacco|cigarette\w*)\b/i, icon: Cigarette },
  { match: /\b(alcohol\w*|wine|beer|drink\w*)\b/i, icon: Droplet },
  { match: /\b(exercise|sport\w*|physical activity|walk\w*|train\w*|strength)\b/i, icon: Dumbbell },
  { match: /\b(cycl\w*|bike|biking)\b/i, icon: Bike },
  { match: /\b(eye|vision|sight|glaucoma|ophthalmol\w*)\b/i, icon: Eye },
  { match: /\b(glasses|sunglasses|uv protection)\b/i, icon: Glasses },
  { match: /\b(sun\w*|sunscreen|uv\b)\b/i, icon: Sun },
  { match: /\b(sleep|rest|circadian)\b/i, icon: Moon },
  { match: /\b(calcium|dairy|milk|vitamin d)\b/i, icon: Milk },
  { match: /\b(diet|nutrition|food|eat\w*|meal\w*)\b/i, icon: UtensilsCrossed },
  { match: /\b(fruit\w*|vegetable\w*|leafy)\b/i, icon: Salad },
  { match: /\bapple\b/i, icon: Apple },
  { match: /\b(weight|bmi|body mass|obes\w*)\b/i, icon: Scale },
  { match: /\b(blood pressure|hypertension|cholesterol|glucose|heart|cardiac|cardiovascular)\b/i, icon: Heart },
  { match: /\b(medic\w*|drug\w*|supplement\w*|dose|dosing)\b/i, icon: Pill },
  { match: /\b(doctor|physician|consult\w*|screening|check-?up|exam\w*|imaging)\b/i, icon: Stethoscope },
  { match: /\b(fall\w*|injur\w*|fracture\w*|protect\w*)\b/i, icon: Bandage },
  { match: /\b(vaccin\w*|immun\w*)\b/i, icon: ShieldCheck },
  { match: /\b(avoid|prevent\w*|reduce\w* risk|risk factor\w*)\b/i, icon: Shield },
  { match: /\b(temperature|fever|cold\b)\b/i, icon: Thermometer },
  { match: /\b(breath\w*|respirat\w*|air quality|smoke exposure)\b/i, icon: Wind },
];

/**
 * The icon for one "What you can do" row. Falls back to a plain check
 * (via the caller, which already renders Check as the default) — this
 * only returns a value when a term in the sentence is actually
 * recognised, so an unmatched action never gets a misleading icon.
 */
export function getActionIcon(sentence: string): LucideIcon | null {
  for (const rule of ACTION_ICON_RULES) {
    if (rule.match.test(sentence)) return rule.icon;
  }
  return null;
}
