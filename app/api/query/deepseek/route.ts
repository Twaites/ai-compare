import { NextResponse } from "next/server"
import { queryDeepSeek } from "@/app/actions"

export async function POST(request: Request) {
  const { prompt, apiKey } = await request.json()

  if (!prompt || !apiKey) {
    return NextResponse.json({ success: false, error: "Prompt and API key are required." }, { status: 400 })
  }

  const result = await queryDeepSeek(prompt, apiKey)
  return NextResponse.json(result)
} 