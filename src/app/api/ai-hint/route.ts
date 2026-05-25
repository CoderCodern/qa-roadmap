import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI hint not configured' }, { status: 503 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  let body: { dayId?: unknown; items?: unknown; language?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { dayId, items, language } = body

  if (!dayId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const lang = language === 'vi' ? 'Vietnamese' : 'English'
  const taskList = (items as string[])
    .map((t, i) => `${i + 1}. ${t}`)
    .join('\n')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly QA testing mentor helping a beginner student. Provide concise, practical example answers. Respond in ${lang}.`,
        },
        {
          role: 'user',
          content: `I am studying Day ${dayId} of a QA automation testing course. Here are my exercise tasks:\n\n${taskList}\n\nPlease give me a practical example answer for each task to help me understand what a good response looks like. Be helpful and encouraging but keep answers brief.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const answer = response.choices[0]?.message?.content ?? ''
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }
}
