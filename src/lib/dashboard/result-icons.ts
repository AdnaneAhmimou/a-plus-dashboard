import {
  Activity,
  Apple,
  Atom,
  Baby,
  Bed,
  Bone,
  Brain,
  Bug,
  Candy,
  Cigarette,
  Coffee,
  Dna,
  Droplet,
  Droplets,
  Dumbbell,
  Ear,
  Egg,
  Eye,
  Flame,
  FlaskConical,
  Footprints,
  Gauge,
  Glasses,
  Hand,
  HeartPulse,
  Microscope,
  Milk,
  Nut,
  Pill,
  Ribbon,
  Ruler,
  Scale,
  Scissors,
  ShieldCheck,
  Smile,
  Snowflake,
  Sparkles,
  Stethoscope,
  Sun,
  Thermometer,
  Timer,
  Waves,
  Wheat,
  Wind,
  type LucideIcon,
} from "lucide-react";

// An icon per result, matched on what the result is ABOUT rather than on
// its category — "Eye clarity" and "Open angle glaucoma" live in
// different categories but both deserve the eye.
//
// Icons come from lucide-react, which the app already depends on for
// every other icon; no extra package, and they inherit currentColor so
// they pick up the accent without per-icon styling.
//
// Order matters: the FIRST pattern that matches wins, so specific terms
// are listed before general ones. "Blood glucose" must reach the glucose
// rule before the blood rule, and "bone mineral density" must reach bone
// before density.
const ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  // Patterns use `\w*` where the term is a stem, so "osteoporos" also
  // matches "osteoporosis". Terms that would swallow unrelated words are
  // kept strict instead: "ear" is bounded both sides, or it matches
  // "early", "search" and "years".

  // Senses
  { match: /\b(?:eye|ocular|cornea\w*|iris|macular|glaucoma|cataract\w*|vision|myopia|intraocular|keratoconus)\b/i, icon: Eye },
  { match: /\b(?:hearing|ear|earlobe|deaf\w*|tinnitus|auditory)\b/i, icon: Ear },
  { match: /\b(?:smell|odor|odour|olfact\w*|aroma)\b/i, icon: Wind },
  { match: /\b(?:taste|bitter|sweet\w*|umami)\b/i, icon: Candy },

  // Head to toe
  { match: /\b(?:hair|redhead|bald\w*|alopecia)\b/i, icon: Scissors },
  { match: /\b(?:tooth|teeth|dental|caries|incisor\w*|periodont\w*|eruption|mouth|ulcer\w*|cleft lip)\b/i, icon: Smile },
  { match: /\b(?:skin|acne|dermatitis|melanin|eczema|psorias\w*|vitiligo|keratosis|wrinkl\w*|facial aging|nasion)\b/i, icon: Sparkles },
  { match: /\b(?:bone|osteoporos\w*|osteoarthritis|skeletal|mineral density|scoliosis|hallux|spinal|spine|stenosis|gout)\b/i, icon: Bone },
  { match: /\b(?:muscle|muscular|tendin\w*|sprinter|endurance|myopathy|fasciitis)\b/i, icon: Dumbbell },
  { match: /\b(?:height|stature)\b/i, icon: Ruler },
  { match: /\b(?:walking|pace|gait|stride)\b/i, icon: Footprints },
  { match: /\b(?:hand|grip|dupuytren\w*|carpal|left-handed\w*|handedness)\b/i, icon: Hand },

  // Organs and systems
  { match: /\b(?:heart|cardiac|cardiomyopath\w*|atrial|myocardial|coronary|angina|arrhythm\w*|qt interval\w*)\b/i, icon: HeartPulse },
  { match: /\b(?:blood pressure|hypertension|systolic|diastolic)\b/i, icon: Gauge },
  { match: /\b(?:glucose|diabet\w*|insulin|glycated)\b/i, icon: Gauge },
  { match: /\b(?:lung|pulmonar\w*|asthma|respirat\w*|breath\w*|copd|exhaled|sneeze|snor\w*)\b/i, icon: Wind },
  { match: /\b(?:kidney|renal|creatinine|urate|urolithiasis|nephro\w*|oxaluria)\b/i, icon: Droplets },
  { match: /\b(?:liver|hepatic|bilirubin|aminotransferase|transferase|cirrhosis|cholestasis|fatty liver|gallstone\w*|gallbladder|biliary)\b/i, icon: FlaskConical },
  { match: /\b(?:thyroid\w*|hypothyroid\w*|hyperthyroid\w*|hashimoto\w*|graves|goiter|tsh)\b/i, icon: Activity },
  { match: /\b(?:stomach|intestin\w*|bowel|colon|colorectal|gastro\w*|reflux|crohn\w*|colitis|celiac|diverticul\w*|hernia|haemorrhoid\w*|hemorrhoid\w*|malabsorption|esophag\w*)\b/i, icon: Wheat },

  // Blood and biochemistry
  { match: /\b(?:cholesterol|hypercholesterol\w*|hyperlipid\w*|lipid\w*|omega|fatty acid\w*|apolipoprotein|triglycerid\w*|hdl|ldl|lipoprotein)\b/i, icon: Droplets },
  { match: /\b(?:blood|haemoglobin|hemoglobin|erythrocyt\w*|platelet\w*|coagulat\w*|thrombo\w*|anemia|leukocyt\w*|lymphocyt\w*|neutrophil\w*|monocyt\w*|eosinophil\w*|spleen|duffy)\b/i, icon: Droplet },
  { match: /\b(?:vitamin|folate|calcium|phosphate|magnesium|iron|zinc|selenium|antioxidant)\b/i, icon: Sun },
  { match: /\b(?:protein|albumin|globulin|resistin|galectin|selectin|cathepsin|c-reactive|phosphatase)\b/i, icon: Atom },
  { match: /\b(?:hormone|estradiol|testosterone|shbg|cortisol|prolactin|menopause|menarche)\b/i, icon: Atom },

  // Brain and behaviour
  { match: /\b(?:brain|cognitiv\w*|mental|memory|alzheimer\w*|parkinson\w*|dementia|neurotic\w*|depress\w*|anxiety|bipolar|schizophren\w*|migraine\w*|headache\w*|epilep\w*|sclerosis|neuropath\w*|narcoleps\w*|agility)\b/i, icon: Brain },
  { match: /\b(?:sleep|insomnia|circadian|morning person|restless legs)\b/i, icon: Bed },
  { match: /\b(?:risk[- ]?tak\w*|personality|temperament)\b/i, icon: Sparkles },

  // Diet and lifestyle
  { match: /\b(?:caffeine|coffee)\b/i, icon: Coffee },
  { match: /\b(?:alcohol\w*|wine|beer)\b/i, icon: Droplet },
  { match: /\b(?:nicotine|smok\w*|tobacco)\b/i, icon: Cigarette },
  { match: /\b(?:lactose|milk|dairy)\b/i, icon: Milk },
  { match: /\b(?:peanut|nut allergy|almond)\b/i, icon: Nut },
  { match: /\b(?:gluten|wheat|farmer\w*)\b/i, icon: Wheat },
  { match: /\b(?:egg)\b/i, icon: Egg },
  { match: /\b(?:diet|nutrition|food|appetite|intake|fruit|vegetable\w*)\b/i, icon: Apple },
  { match: /\b(?:metabolic rate|metabolism|thermogen\w*|heat production|calor\w*)\b/i, icon: Flame },
  { match: /\b(?:weight|bmi|body mass|obes\w*|adipose|body fat|waist)\b/i, icon: Scale },
  { match: /\b(?:exercise|sport\w*|fitness|performance|training)\b/i, icon: Dumbbell },

  // Medicine and pharmacology
  { match: /\b(?:metaboliz\w*|drug\w*|medication|pharmac\w*|warfarin|cyp\d\w*)\b/i, icon: Pill },

  // Disease groups
  { match: /\b(?:cancer|carcinoma|tumou?r\w*|melanoma|leukemi\w*|lymphom\w*|myelom\w*|neoplas\w*|glioma|glioblastoma|neuroblastoma|polyp\w*|gammopathy|leiomyoma|myeloproliferative)\b/i, icon: Ribbon },
  { match: /\b(?:allerg\w*|rhinitis|immun\w*|lupus|arthrit\w*|sarcoid\w*|autoimmune|sclerod\w*|systemic sclerosis|histamine|intoleran\w*)\b/i, icon: ShieldCheck },
  { match: /\b(?:infect\w*|hiv|malaria|virus|viral|bacteri\w*|sepsis|mosquito|bite\w*|itch\w*)\b/i, icon: Bug },
  { match: /\b(?:fever|temperature|hyperthermia)\b/i, icon: Thermometer },
  { match: /\b(?:cold|freez\w*|hypotherm\w*)\b/i, icon: Snowflake },

  // Reproduction and ageing
  { match: /\b(?:pregnan\w*|birth weight|fertilit\w*|ovarian|ovary|uterine|uterus|endometri\w*|prostate|baby|infant)\b/i, icon: Baby },
  { match: /\b(?:telomere|aging|ageing|epigenetic|longevity)\b/i, icon: Timer },

  // Genetics and lab
  { match: /\b(?:gene|genes|variant\w*|chromosom\w*|haplogroup|mutation\w*|allele\w*|genotype|mthfr|comt|mtr|mtrr|hla)\b/i, icon: Dna },
  { match: /\b(?:vein|varicose|aneurysm|arterial|vascular|embolism|stroke|circulat\w*|ischemic)\b/i, icon: Waves },
  { match: /\b(?:glasses|refract\w*|astigmat\w*)\b/i, icon: Glasses },
  { match: /\b(?:syndrome|disease|disorder|deficiency)\b/i, icon: Stethoscope },
];

/**
 * The icon for a result, matched on its name and, failing that, its
 * summary. Falls back to a microscope rather than picking something
 * arbitrary: a wrong-but-confident icon (a coffee cup on a cancer risk)
 * is worse than a neutral one.
 */
export function getResultIcon(name: string, summary = ""): LucideIcon {
  for (const rule of ICON_RULES) {
    if (rule.match.test(name)) return rule.icon;
  }
  for (const rule of ICON_RULES) {
    if (rule.match.test(summary)) return rule.icon;
  }
  return Microscope;
}
