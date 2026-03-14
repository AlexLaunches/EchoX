import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateDrafts(tweetContent: string, personaInstruction: string, nicheName: string) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: `You are an expert X growth agent specializing in high-signal engagement.
Persona: ${personaInstruction}
Niche: ${nicheName}
RULES: Every reply under 240 characters. No hashtags. No corporate jargon. Feel human not AI.`,
    messages: [{
      role: 'user',
      content: `Generate 3 distinct replies to this tweet: "${tweetContent}"

Draft 1 - Value-Adder: Expand with a data-backed insight or strong "Yes, and..." perspective.
Draft 2 - Challenger: Respectfully question a premise to spark debate. Start with "Counterpoint:" if it fits.
Draft 3 - Wit: Short, punchy, humorous observation. Under 120 characters preferred.

Return ONLY valid JSON, no markdown, no preamble:
{"valueAdder": "...", "challenger": "...", "wit": "..."}`
    }]
  })

  const raw = message.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
  const cleaned = raw.replace(/\`\`\`json|\`\`\`/g, '').trim()
  const parsed = JSON.parse(cleaned)

  const truncate = (s: string) => s.length > 240 ? s.slice(0, 237) + '...' : s

  return {
    valueAdder: truncate(parsed.valueAdder ?? ''),
    challenger: truncate(parsed.challenger ?? ''),
    wit: truncate(parsed.wit ?? ''),
  }
}
