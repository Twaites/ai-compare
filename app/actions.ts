"use server"

import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

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

  const TIMEOUT_MS = 30000 // 30 seconds

  // Helper function to timeout a promise
  const withTimeout = (promise: Promise<any>) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out after 30 seconds")), TIMEOUT_MS)
      )
    ])
  }

  // Pre-initialize API clients outside the promise to avoid connection overhead
  const openaiClient = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null
  const anthropicClient = keys.anthropic ? new Anthropic({ apiKey: keys.anthropic }) : null
  const deepseekClient = keys.deepseek ? 
    new OpenAI({ baseURL: 'https://api.deepseek.com/v1', apiKey: keys.deepseek }) : null

  // Optimize API parameters for faster responses
  const openaiParams = {
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024, // Limit response length
    temperature: 0.7, // Lower temperature for faster responses
    presence_penalty: 0,
    frequency_penalty: 0,
  }

  const anthropicParams = {
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  }

  const deepseekParams = {
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  }

  try {
    const responses = await Promise.allSettled([
      // OpenAI call
      openaiClient
        ? withTimeout((async () => {
            const completion = await openaiClient.chat.completions.create({
              ...openaiParams,
              messages: [{ role: "user" as const, content: prompt }]
            })
            return { text: completion.choices[0].message.content || "" }
          })())
        : Promise.reject("No API key provided"),

      // Anthropic call
      anthropicClient
        ? withTimeout((async () => {
            const message = await anthropicClient.messages.create({
              ...anthropicParams,
              messages: [{ role: "user" as const, content: prompt }]
            })
            return { text: message.content[0].type === 'text' ? message.content[0].text : 'Error: No text content' }
          })())
        : Promise.reject("No API key provided"),

      // DeepSeek call
      deepseekClient
        ? withTimeout((async () => {
            const completion = await deepseekClient.chat.completions.create({
              ...deepseekParams,
              messages: [{ role: "user" as const, content: prompt }]
            })
            return { text: completion.choices[0].message.content || "" }
          })())
        : Promise.reject("No API key provided"),
    ])

    // Process results
    if (responses[0].status === "fulfilled") {
      results.openai = responses[0].value.text
    } else {
      results.openai = `Error: ${responses[0].reason}`
    }
    if (responses[1].status === "fulfilled") {
      results.anthropic = responses[1].value.text
    } else {
      results.anthropic = `Error: ${responses[1].reason}`
    }
    if (responses[2].status === "fulfilled") {
      results.deepseek = responses[2].value.text
    } else {
      results.deepseek = `Error: ${responses[2].reason}`
    }

    return { success: true, results }
  } catch (error) {
    return { success: false, error: "Failed to query AIs" }
  }
}

