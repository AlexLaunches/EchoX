import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateDrafts(tweetContent: string, personaInstruction: string, nicheName: string) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: `You are an expert X growth agent specializing in high-signal engagement.
Persona: ${personaInstruction}
Niche: ${nicheName}

STRICT RULES:
- Every reply must be under 200 characters — this is a hard limit
- Every reply must be a complete thought — never cut off mid-sentence
- Write in short, punchy human sentences
- Use a line break between sentences where it feels natural
- No hashtags
- No corporate jargon
- Sound like a real person, not an AI`,
    messages: [{
      role: 'user',
      content: `Generate 3 distinct replies to this tweet: "${tweetContent}"

Draft 1 - Value-Adder: Add a concrete insight, stat, or "Yes, and..." that expands the point. Complete thought only.
Draft 2 - Challenger: Respectfully push back on a premise. Start with "Counterpoint:" if it fits. Complete thought only.
Draft 3 - Wit: Short, punchy, human observation. Under 120 characters. Complete thought only.

Return ONLY valid JSON, no markdown, no preamble:
{"valueAdder": "...", "challenger": "...", "wit": "..."}`
    }]
  })

  const raw = message.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
  const cleaned = raw.replace(/\`\`\`json|\`\`\`/g, '').trim()
  const parsed = JSON.parse(cleaned)

  const truncate = (s: string) => s.length > 200 ? s.slice(0, 197) + '...' : s

  return {
    valueAdder: truncate(parsed.valueAdder ?? ''),
    challenger: truncate(parsed.challenger ?? ''),
    wit: truncate(parsed.wit ?? ''),
  }
}
