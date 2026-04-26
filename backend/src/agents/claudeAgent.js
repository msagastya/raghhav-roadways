const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Stable system prompt — prompt caching kicks in after the first call (~75% cost reduction on reads)
const SYSTEM_PROMPT = `You are the AI brain of Raghhav Roadways, a logistics transport management system built on Express.js + Prisma + PostgreSQL (Supabase).

YOUR JOB:
Analyze errors from this app and return a JSON response that helps users understand what went wrong and how to fix it.

APP ENTITIES: consignments, invoices, payments, vehicles, parties, vehicle-owners, consignor-consignees, users, roles, permissions.

COMMON VALIDATIONS:
- Truck number: Indian format like MH-12-AB-1234
- Phone: exactly 10 digits, starts with 6-9
- Amounts: positive numbers only
- Dates: cannot be in the past for new consignments
- LR number: auto-generated, must be unique

PRISMA ERROR CODES:
- P2002: Unique constraint violation (duplicate record)
- P2003: Foreign key constraint failed (related record missing)
- P2025: Record not found

ERROR TYPES:
- VALIDATION: Bad user input (400) — give specific correction guidance
- DB_CONSTRAINT: Duplicate/missing relation — explain what's conflicting
- AUTH: Session issues — simple message, no technical detail
- NOT_FOUND: Resource missing — check if ID is correct
- CODE_BUG: Internal server error (500) — generic user message, log internally
- EXTERNAL: Email/PDF service failure — suggest retry

RESPONSE FORMAT: Always return valid JSON only. No markdown, no explanation outside the JSON.
Schema: {"userMessage": "string", "suggestion": "string", "errorType": "string", "canAutoFix": boolean, "fixedValue": null | string}`;

async function analyzeError(errorContext, model = 'claude-haiku-4-5') {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 256,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze this error and return JSON:\n${JSON.stringify(errorContext, null, 2)}`,
        },
      ],
    });

    const text = response.content[0]?.text?.trim() || '';
    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

module.exports = { analyzeError };
