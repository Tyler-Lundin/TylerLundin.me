import { NextResponse } from 'next/server'
import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('The OPENAI_API_KEY environment variable is not set.')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

export async function POST(request: Request) {
  console.log('🔵 Summarize Journal API: Request received')
  
  try {
    const body = await request.json()
    console.log('🔵 Request body:', { textLength: body.text?.length || 0 })
    
    const { text } = body

    if (!text) {
      console.log('🔴 Error: No text provided in request')
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    let openaiClient: OpenAI
    try {
      openaiClient = getOpenAI()
    } catch (error: any) {
      console.error('🔴 Error getting OpenAI client:', {
        error: error.message,
        stack: error.stack
      })
      return NextResponse.json(
        { error: error.message },
        { status: 500 } 
      )
    }

    console.log('🔵 Initializing OpenAI completion request')
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes journal entries into concise, professional status updates. Keep the summary under 280 characters."
        },
        {
          role: "user",
          content: `Please summarize this journal entry into a short, professional status update: ${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    console.log('🔵 OpenAI response received:', {
      hasChoices: !!completion.choices,
      choicesLength: completion.choices?.length,
      firstChoice: completion.choices?.[0]?.message?.content?.length || 0
    })

    const summary = completion.choices[0]?.message?.content || ''
    
    if (!summary) {
      console.log('🔴 Error: No summary generated from OpenAI')
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      )
    }

    console.log('✅ Summary generated successfully:', {
      summaryLength: summary.length,
      summaryPreview: summary.substring(0, 50) + '...'
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('🔴 Error in summarization:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to summarize journal entry' },
      { status: 500 }
    )
  }
} 