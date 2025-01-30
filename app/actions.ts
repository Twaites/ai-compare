"use server"

import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import axios from 'axios'

export async function queryOpenAI(prompt: string, apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey, timeout: 45000 })
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      stream: false, // Set to true if you want streaming
      max_tokens: 1024,
      temperature: 0.7,
    })
    return { success: true, text: completion.choices[0].message.content || "" }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to query OpenAI" }
  }
}

export async function queryAnthropic(prompt: string, apiKey: string) {
  try {
    const anthropic = new Anthropic({ 
      apiKey,
      maxRetries: 0,
      timeout: 45000 // 45 second timeout
    })
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : 'Error: No text content'
    return { success: true, text }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to query Anthropic" }
  }
}

export async function queryDeepSeek(prompt: string, apiKey: string) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        messages: [
          {
            content: "You are a helpful assistant",
            role: "system"
          },
          {
            content: prompt,
            role: "user"
          }
        ],
        model: "deepseek-chat",
        frequency_penalty: 0,
        max_tokens: 2048,
        presence_penalty: 0,
        response_format: {
          type: "text"
        },
        stop: null,
        stream: false,
        temperature: 1,
        top_p: 1,
        tools: null,
        tool_choice: "none",
        logprobs: false,
        top_logprobs: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 45000, // 45 second timeout
        maxBodyLength: Infinity
      }
    )

    return { success: true, text: response.data.choices[0].message.content || "" }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Failed to query DeepSeek"
    return { success: false, error: errorMessage }
  }
}

