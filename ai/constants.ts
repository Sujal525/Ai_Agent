import { type GatewayModelId } from '@ai-sdk/gateway'

export enum Models {
  OpenAIGPT35Turbo = 'gpt-3.5-turbo',
  OpenAIGPT4 = 'gpt-4',
  AmazonNovaPro = 'amazon/nova-pro',
  AnthropicClaude4Sonnet = 'anthropic/claude-4-sonnet',
  GoogleGeminiFlash = 'google/gemini-2.5-flash',
  MoonshotKimiK2 = 'moonshotai/kimi-k2',
  OpenAIGPT5 = 'gpt-5',
  XaiGrok3Fast = 'xai/grok-3-fast',
}

export const DEFAULT_MODEL = Models.OpenAIGPT35Turbo

export const SUPPORTED_MODELS: GatewayModelId[] = [
  Models.OpenAIGPT35Turbo,
  Models.OpenAIGPT4,
  Models.AmazonNovaPro,
  Models.AnthropicClaude4Sonnet,
  Models.GoogleGeminiFlash,
  Models.MoonshotKimiK2,
  Models.OpenAIGPT5,
  Models.XaiGrok3Fast,
]

export const TEST_PROMPTS = [
  'Generate a Next.js app that allows to list and search Pokemons',
  'Create a `golang` server that responds with "Hello World" to any request',
]
