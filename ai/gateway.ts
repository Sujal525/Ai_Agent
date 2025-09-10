import type { JSONValue } from 'ai'
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { createGatewayProvider } from '@ai-sdk/gateway'
import { openai } from '@ai-sdk/openai'
import { Models } from './constants'

const useDirectOpenAI = !process.env.AI_GATEWAY_BASE_URL || process.env.USE_DIRECT_OPENAI === 'true'

const gateway = useDirectOpenAI ? null : createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
})

export async function getAvailableModels() {
  if (useDirectOpenAI) {
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
    ]
  }
  
  try {
    const response = await gateway!.getAvailableModels()
    return response.models
      .map((model) => ({ id: model.id, name: model.name }))
      .concat([{ id: Models.OpenAIGPT5, name: 'GPT-5' }])
  } catch (error) {
    console.error('Failed to fetch models from gateway:', error)
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
    ]
  }
}

export interface ModelOptions {
  model: string
  providerOptions?: Record<string, Record<string, JSONValue>>
  headers?: Record<string, string>
}

export function getModelOptions(
  modelId: string,
  options?: { reasoningEffort?: 'low' | 'medium' }
): ModelOptions {
  if (modelId === Models.OpenAIGPT5) {
    return {
      model: modelId,
      providerOptions: {
        openai: {
          include: ['reasoning.encrypted_content'],
          reasoningEffort: options?.reasoningEffort ?? 'low',
          reasoningSummary: 'auto',
          serviceTier: 'priority',
        } satisfies OpenAIResponsesProviderOptions,
      },
    }
  }

  if (modelId === Models.AnthropicClaude4Sonnet) {
    return {
      model: modelId,
      headers: { 'anthropic-beta': 'fine-grained-tool-streaming-2025-05-14' },
      providerOptions: {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    }
  }

  return {
    model: modelId,
  }
}
