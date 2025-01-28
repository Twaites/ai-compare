"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { deepseek } from "@ai-sdk/deepseek"

export async function queryAIs(
  prompt: string,
  keys: {
    openai?: string
    anthropic?: string
    deepseek?: string
  },
) {
  const results = {
    openai: "",
    anthropic: "",
    deepseek: "",
  }

  try {
    // Parallel API calls for better performance
    const responses = await Promise.allSettled([
      // OpenAI call
      keys.openai
        ? generateText({
            model: openai("gpt-4-turbo"),
            prompt,
            apiKey: keys.openai,
          })
        : Promise.reject("No API key provided"),

      // Anthropic call
      keys.anthropic
        ? generateText({
            model: anthropic("claude-3"),
            prompt,
            apiKey: keys.anthropic,
          })
        : Promise.reject("No API key provided"),

      // DeepSeek call
      keys.deepseek
        ? generateText({
            model: deepseek("deepseek-chat"),
            prompt,
            apiKey: keys.deepseek,
          })
        : Promise.reject("No API key provided"),
    ])

    // Process results
    if (responses[0].status === "fulfilled") {
      results.openai = responses[0].value.text
    }
    if (responses[1].status === "fulfilled") {
      results.anthropic = responses[1].value.text
    }
    if (responses[2].status === "fulfilled") {
      results.deepseek = responses[2].value.text
    }

    return { success: true, results }
  } catch (error) {
    return { success: false, error: "Failed to query AIs" }
  }
}

