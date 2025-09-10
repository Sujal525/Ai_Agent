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
  const checkResult = await checkBotId()
  if (checkResult.isBot) {
    return NextResponse.json({ error: `Bot detected` }, { status: 403 })
  }

  const [models, { messages, modelId = DEFAULT_MODEL, reasoningEffort }] =
    await Promise.all([getAvailableModels(), req.json() as Promise<BodyData>])

  // Use fallback if no OpenAI key or model not found
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: `OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.` },
      { status: 400 }
    )
  }

  const model = models.find((model) => model.id === modelId)
  if (!model) {
    return NextResponse.json(
      { error: `Model ${modelId} not found. Available models: ${models.map(m => m.id).join(', ')}` },
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
}
