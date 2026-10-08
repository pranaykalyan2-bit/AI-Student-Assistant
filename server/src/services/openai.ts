import OpenAI from 'openai'

// OpenRouter is OpenAI-compatible — only baseURL and apiKey differ
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3001',
    'X-Title': 'AI Student Assistant',
  },
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'openrouter/free',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  const content = response.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from AI provider')
  return content
}
