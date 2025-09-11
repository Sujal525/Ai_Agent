import { type ChatUIMessage } from '@/components/chat/types'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from 'ai'
import { openai } from '@ai-sdk/openai'
import { DEFAULT_MODEL } from '@/ai/constants'
import { NextResponse } from 'next/server'
import { getAvailableModels, getModelOptions } from '@/ai/gateway'
import { checkBotId } from 'botid/server'
import { tools } from '@/ai/tools'
import prompt from './prompt.md'

interface BodyData {
  messages: ChatUIMessage[]
  modelId?: string
  reasoningEffort?: 'low' | 'medium'
}

export async function POST(req: Request) {
  try {
    const checkResult = await checkBotId()
    if (checkResult.isBot) {
      return NextResponse.json({ error: `Bot detected` }, { status: 403 })
    }

    const [models, { messages, modelId = DEFAULT_MODEL, reasoningEffort }] =
      await Promise.all([getAvailableModels(), req.json() as Promise<BodyData>])

    // Check for API key configuration
    if (!process.env.OPENAI_API_KEY && !process.env.AI_GATEWAY_BASE_URL) {
      return NextResponse.json(
        { 
          error: `Configuration Required: Either OPENAI_API_KEY or Vercel AI Gateway must be configured.`,
          type: 'configuration_error'
        },
        { status: 400 }
      )
    }

    const model = models.find((model) => model.id === modelId)
    if (!model) {
      return NextResponse.json(
        { 
          error: `Model ${modelId} not found. Available models: ${models.map(m => m.id).join(', ')}`,
          type: 'model_not_found'
        },
        { status: 400 }
      )
    }

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: ({ writer }) => {
        const result = streamText({
          model: openai(modelId || 'gpt-3.5-turbo'),
          system: prompt,
          messages: convertToModelMessages(
            messages.map((message) => {
              message.parts = message.parts.map((part) => {
                if (part.type === 'data-report-errors') {
                  return {
                    type: 'text',
                    text:
                      `There are errors in the generated code. This is the summary of the errors we have:\n` +
                      `\`\`\`${part.data.summary}\`\`\`\n` +
                      (part.data.paths?.length
                        ? `The following files may contain errors:\n` +
                          `\`\`\`${part.data.paths?.join('\n')}\`\`\`\n`
                        : '') +
                      `Fix the errors reported.`,
                  }
                }
                return part
              })
              return message
            })
          ),
          stopWhen: stepCountIs(20),
          tools: tools({ modelId, writer }),
          onError: (error) => {
            console.error('Error communicating with AI')
            console.error(JSON.stringify(error, null, 2))
          },
        })
        result.consumeStream()
        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
            sendStart: false,
            messageMetadata: () => ({
              model: model.name,
            }),
          })
        )
      },
    }),
  })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    
    // Check for Vercel AI Gateway billing error
    if (error.message?.includes('credit card') || error.message?.includes('free credits')) {
      return NextResponse.json(
        { 
          error: 'Vercel AI Gateway Billing Required',
          message: 'AI Gateway requires a valid credit card on file. Please visit https://vercel.com/account/billing to add a payment method and unlock your free credits.',
          type: 'gateway_billing_required'
        },
        { status: 402 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'API Error',
        message: error.message || 'Failed to process chat request',
        type: 'api_error'
      },
      { status: 500 }
    )
  }
}
