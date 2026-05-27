import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI hint not configured' }, { status: 503 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { dayId, items, userAnswers, isCode } = body

  if (!dayId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const answers = Array.isArray(userAnswers) ? (userAnswers as string[]) : []
  const isCodeMode = isCode === true

  // For code exercises, treat "unchanged starter code" (still has ???) as blank
  const hasAnswers = answers.some((a) => {
    if (typeof a !== 'string' || !a.trim()) return false
    return isCodeMode ? !a.includes('???') : a.trim().length > 0
  })

  let taskContent: string
  if (hasAnswers) {
    taskContent = (items as string[])
      .map((task, i) => {
        const ans = answers[i]?.trim() || ''
        const label = isCodeMode ? 'Student code' : 'Student answer'
        return `Task ${i + 1}: ${task}\n${label}:\n${ans || '(no answer provided)'}`
      })
      .join('\n\n')
  } else {
    taskContent = (items as string[]).map((t, i) => `${i + 1}. ${t}`).join('\n')
  }

  const instruction = isCodeMode
    ? hasAnswers
      ? `Review the student's Python code solutions. Start with an overall score on its own line (e.g. "Score: 7/10"). Then for each exercise: confirm if the logic is correct, point out any bugs or improvements, and give a short tip. Be specific and encouraging.`
      : `Provide a complete working Python solution for each exercise so the student can see what correct code looks like. Include brief inline comments explaining key lines. End with a note encouraging them to attempt it themselves first next time.`
    : hasAnswers
      ? `Review the student's answers. Start with an overall score on its own line (e.g. "Score: 7/10"). Then for each task: acknowledge what they got right, point out gaps, and give a brief tip. Be specific and encouraging.`
      : `Provide a practical example answer for each task so the student understands what a good response looks like. Be helpful and keep answers brief.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a QA testing mentor. ${instruction} You MUST respond with a JSON object containing exactly two keys: "en" and "vi". Each value must be a single plain text string (not a nested object or array) — "en" is your full response in English and "vi" is the same response translated to Vietnamese. Use newlines to separate task responses within each string.`,
        },
        {
          role: 'user',
          content: `I am studying Day ${dayId} of a QA automation testing course.\n\n${taskContent}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const raw = response.choices[0]?.message?.content ?? '{}'
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 502 })
    }

    const normalize = (val: unknown): string => {
      if (typeof val === 'string') return val
      if (val && typeof val === 'object') {
        return Object.entries(val as Record<string, unknown>)
          .map(([k, v]) => `${k}:\n${v}`)
          .join('\n\n')
      }
      return String(val ?? '')
    }

    const en = normalize(parsed.en)
    const vi = normalize(parsed.vi)

    if (!en || !vi) {
      return NextResponse.json({ error: 'Incomplete AI response' }, { status: 502 })
    }

    return NextResponse.json({ answer: { en, vi } })
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }
}
