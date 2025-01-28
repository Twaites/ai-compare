"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { queryAIs } from "./actions"
import Cookies from "js-cookie"
import { Eye, EyeOff } from "lucide-react"
import ReactMarkdown from 'react-markdown'

export default function AICompare() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    deepseek: "",
  })

  // Load cookies after component mounts
  useEffect(() => {
    setApiKeys({
      openai: Cookies.get("openai_api_key") || "",
      anthropic: Cookies.get("anthropic_api_key") || "",
      deepseek: Cookies.get("deepseek_api_key") || "",
    })
  }, [])

  const [results, setResults] = useState({
    openai: "",
    anthropic: "",
    deepseek: "",
  })

  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    deepseek: false,
  })

  const handleApiKeyChange = (provider: "openai" | "anthropic" | "deepseek", value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }))
    if (value) {
      Cookies.set(`${provider}_api_key`, value, { expires: 30, secure: true, sameSite: "Strict" })
    } else {
      Cookies.remove(`${provider}_api_key`)
    }
  }

  const handleDeleteKey = (provider: "openai" | "anthropic" | "deepseek") => {
    setApiKeys((prev) => ({ ...prev, [provider]: "" }))
    Cookies.remove(`${provider}_api_key`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResults({
      openai: "",
      anthropic: "",
      deepseek: "",
    })

    // Only include API keys that have been entered
    const activeKeys = Object.fromEntries(Object.entries(apiKeys).filter(([_, value]) => value.length > 0))

    try {
      const response = await queryAIs(prompt, activeKeys)
      if (response.success && response.results) {
        setResults(response.results)
      } else {
        // Handle error case
        setResults({
          openai: "Error: Failed to query AIs",
          anthropic: "Error: Failed to query AIs",
          deepseek: "Error: Failed to query AIs",
        })
      }
    } catch (error) {
      console.error('Error querying AIs:', error)
      setResults({
        openai: "Error: Failed to query AIs",
        anthropic: "Error: Failed to query AIs",
        deepseek: "Error: Failed to query AIs",
      })
    }

    setLoading(false)
  }

  function LoadingResponse() {
    return (
      <div className="h-full rounded-sm p-4 overflow-y-auto bg-muted animate-pulse">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <main className="container max-w-[1600px] mx-auto p-4 min-h-screen flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">AI Compare</h1>
        <p className="text-muted-foreground">
          Compare responses from leading AI models side by side. Enter your API keys and a prompt to see how different models handle the same query.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>ChatGPT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="API Key"
                  type={showKeys.openai ? "text" : "password"}
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                >
                  {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {apiKeys.openai && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteKey("openai")}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className={`flex-1 h-[400px] rounded-sm p-4 overflow-y-auto whitespace-pre-wrap ${
              results.openai.startsWith('Error:') ? 'bg-red-100' : 'bg-muted'
            }`}>
              {loading ? <LoadingResponse /> : (
                <ReactMarkdown>
                  {results.openai || "ChatGPT results will appear here..."}
                </ReactMarkdown>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Claude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="API Key"
                  type={showKeys.anthropic ? "text" : "password"}
                  value={apiKeys.anthropic}
                  onChange={(e) => handleApiKeyChange("anthropic", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowKeys(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                >
                  {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {apiKeys.anthropic && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteKey("anthropic")}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className={`flex-1 h-[400px] rounded-sm p-4 overflow-y-auto whitespace-pre-wrap ${
              results.anthropic.startsWith('Error:') ? 'bg-red-100' : 'bg-muted'
            }`}>
              {loading ? <LoadingResponse /> : (results.anthropic || "Claude results will appear here...")}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>DeepSeek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="API Key"
                  type={showKeys.deepseek ? "text" : "password"}
                  value={apiKeys.deepseek}
                  onChange={(e) => handleApiKeyChange("deepseek", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowKeys(prev => ({ ...prev, deepseek: !prev.deepseek }))}
                >
                  {showKeys.deepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {apiKeys.deepseek && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteKey("deepseek")}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className={`flex-1 h-[400px] rounded-sm p-4 overflow-y-auto whitespace-pre-wrap ${
              results.deepseek.startsWith('Error:') ? 'bg-red-100' : 'bg-muted'
            }`}>
              {loading ? <LoadingResponse /> : (results.deepseek || "DeepSeek results will appear here...")}
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your query here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[150px]"
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

