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

  try {
    // Parallel API calls for better performance
    const responses = await Promise.allSettled([
      // OpenAI call
      keys.openai
        ? withTimeout((async () => {
            const openai = new OpenAI({ apiKey: keys.openai });
            const completion = await openai.chat.completions.create({
              model: "gpt-4-turbo-preview",
              messages: [{ role: "user", content: prompt }],
              stream: true
            });
            let content = ''
            for await (const chunk of completion) {
              content += chunk.choices[0]?.delta?.content || ''
            }
            return { text: content }
          })())
        : Promise.reject("No API key provided"),

      // Anthropic call
      keys.anthropic
        ? withTimeout((async () => {
            const anthropic = new Anthropic({ apiKey: keys.anthropic });
            const message = await anthropic.messages.create({
              model: "claude-3-5-sonnet-20240620",
              max_tokens: 1024,
              messages: [{ role: "user", content: prompt }],
            });
            return { text: message.content[0].type === 'text' ? message.content[0].text : 'Error: No text content' };
          })())
        : Promise.reject("No API key provided"),

      // DeepSeek call
      keys.deepseek
        ? withTimeout((async () => {
            const deepseek = new OpenAI({
              baseURL: 'https://api.deepseek.com/v1',
              apiKey: keys.deepseek,
            });
            const completion = await deepseek.chat.completions.create({
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
            });
            return { text: completion.choices[0].message.content || "" };
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

