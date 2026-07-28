const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4.5";

// Genetic report PDFs can run long; cap the text sent to the model so a
// single request stays well within its context window and cost stays
// predictable. Reports at this scale (a lab panel, not a novel) fit
// comfortably within this budget.
const MAX_INPUT_CHARS = 200_000;

const SYSTEM_PROMPT = `You are extracting structured data from a DNA test report PDF (text already extracted) so it can be displayed in a patient dashboard as a set of individual analyses.

Read the report text and produce a JSON object of the shape:
{
  "results": [
    {
      "category": one of "HEALTH_CONDITIONS" | "HEREDITARY_CONDITIONS" | "PHARMACOLOGY" | "TRAITS" | "WELLNESS" | "ANCESTRY",
      "name": short title of the specific analysis, e.g. "Acne vulgaris",
      "summary": one short line stating the result, e.g. "Low probability of acne",
      "description": a paragraph (plain text, no markdown) explaining the finding in patient-friendly language,
      "probabilities": optional array of { "label": string, "percent": number 0-100 } for any probability/risk breakdown shown for this analysis (e.g. presence vs absence),
      "variantCount": optional string, e.g. "13.5 million variants analyzed",
      "riskLociCount": optional integer, number of risk loci considered,
      "genesAnalyzed": optional string listing the relevant gene(s), comma-separated,
      "technicalNotes": optional string with any technical/methodology detail specific to this analysis,
      "bibliography": optional array of { "label": string, "url": string (optional) } citing sources for this analysis
    }
  ]
}

Rules:
- Map each distinct trait/condition/analysis in the report to exactly one item in "results".
- Use the category that best matches where the report itself groups that analysis (health risks -> HEALTH_CONDITIONS, inherited single-gene conditions -> HEREDITARY_CONDITIONS, drug response -> PHARMACOLOGY, physical/behavioral traits -> TRAITS, diet/fitness/lifestyle -> WELLNESS, origins/ethnicity -> ANCESTRY).
- Only include fields you can actually find evidence for in the text; omit fields you cannot support rather than inventing values.
- "name" and "summary" and "category" are required for every item; everything else is optional.
- Respond with ONLY the JSON object — no markdown code fences, no commentary.`;

export class OpenRouterNotConfiguredError extends Error {
  constructor() {
    super(
      "AI analysis is not configured. Set OPEN_ROUTER_API_KEY in the environment to enable it."
    );
    this.name = "OpenRouterNotConfiguredError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPEN_ROUTER_API_KEY);
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

// Sends extracted report text to the configured model via OpenRouter and
// returns the raw parsed JSON (unvalidated — the caller checks it against
// analysisExtractionSchema). Kept separate from schema validation so this
// function only deals with the network/provider concern.
export async function requestAnalysisExtraction(reportText: string): Promise<unknown> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterNotConfiguredError();
  }

  const truncated = reportText.slice(0, MAX_INPUT_CHARS);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: truncated },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${res.status}): ${body.slice(0, 500)}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  try {
    return JSON.parse(stripCodeFences(content));
  } catch {
    throw new Error("OpenRouter returned a response that was not valid JSON");
  }
}
