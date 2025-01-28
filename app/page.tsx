"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { queryAIs } from "./actions"
import Cookies from "js-cookie"

export default function AICompare() {
  const [apiKeys, setApiKeys] = useState(() => ({
    openai: Cookies.get("openai_api_key") || "",
    anthropic: Cookies.get("anthropic_api_key") || "",
    deepseek: Cookies.get("deepseek_api_key") || "",
  }))

  const [results, setResults] = useState({
    openai: "",
    anthropic: "",
    deepseek: "",
  })

  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApiKeyChange = (provider: "openai" | "anthropic" | "deepseek", value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }))
    if (value) {
      Cookies.set(`${provider}_api_key`, value, { expires: 30, secure: true, sameSite: "Strict" })
    } else {
      Cookies.remove(`${provider}_api_key`)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Only include API keys that have been entered
    const activeKeys = Object.fromEntries(Object.entries(apiKeys).filter(([_, value]) => value.length > 0))

    const response = await queryAIs(prompt, activeKeys)
    if (response.success) {
      setResults(response.results)
    }

    setLoading(false)
  }

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">AI Compare</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ChatGPT Card */}
        <Card>
          <CardHeader>
            <CardTitle>ChatGPT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="API Key"
              type="password"
              value={apiKeys.openai}
              onChange={(e) => handleApiKeyChange("openai", e.target.value)}
            />
            <div className="h-[400px] bg-muted rounded-lg p-4 overflow-auto">
              {results.openai || "Response will appear here..."}
            </div>
          </CardContent>
        </Card>

        {/* Claude Card */}
        <Card>
          <CardHeader>
            <CardTitle>Claude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="API Key"
              type="password"
              value={apiKeys.anthropic}
              onChange={(e) => handleApiKeyChange("anthropic", e.target.value)}
            />
            <div className="h-[400px] bg-muted rounded-lg p-4 overflow-auto">
              {results.anthropic || "Response will appear here..."}
            </div>
          </CardContent>
        </Card>

        {/* DeepSeek Card */}
        <Card>
          <CardHeader>
            <CardTitle>DeepSeek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="API Key"
              type="password"
              value={apiKeys.deepseek}
              onChange={(e) => handleApiKeyChange("deepseek", e.target.value)}
            />
            <div className="h-[400px] bg-muted rounded-lg p-4 overflow-auto">
              {results.deepseek || "Response will appear here..."}
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your query here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !prompt || Object.values(apiKeys).every((key) => !key)}
        >
          {loading ? "Querying AIs..." : "Submit Query"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Note: API keys are stored in cookies for your convenience. Please ensure you're on a secure device.
      </p>
    </main>
  )
}

