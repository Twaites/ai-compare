"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Cookies from "js-cookie"
import { Eye, EyeOff } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { ThemeToggle } from "@/components/theme-toggle"

export default function AICompare() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    deepseek: "",
  })

  const [showMarkdown, setShowMarkdown] = useState(false)

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

  const [loading, setLoading] = useState({
    openai: false,
    anthropic: false,
    deepseek: false,
  })

  const [prompt, setPrompt] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResults({
      openai: "",
      anthropic: "",
      deepseek: "",
    })
    setLoading({
      openai: true,
      anthropic: true,
      deepseek: true,
    })

    const activeKeys = { ...apiKeys }

    // Function to fetch data for a specific provider
    const fetchData = async (provider: "openai" | "anthropic" | "deepseek") => {
      if (!activeKeys[provider]) {
        setResults((prev) => ({ ...prev, [provider]: "Error: No API key provided" }))
        setLoading((prev) => ({ ...prev, [provider]: false }))
        return
      }

      let endpoint = ""
      switch (provider) {
        case "openai":
          endpoint = "/api/query/openai"
          break
        case "anthropic":
          endpoint = "/api/query/anthropic"
          break
        case "deepseek":
          endpoint = "/api/query/deepseek"
          break
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, apiKey: activeKeys[provider] }),
        })
        const data = await response.json()
        if (data.success) {
          setResults((prev) => ({ ...prev, [provider]: data.text }))
        } else {
          setResults((prev) => ({ ...prev, [provider]: `Error: ${data.error}` }))
        }
      } catch (error: any) {
        setResults((prev) => ({ ...prev, [provider]: `Error: ${error.message}` }))
      } finally {
        setLoading((prev) => ({ ...prev, [provider]: false }))
      }
    }

    // Initiate all fetches concurrently
    fetchData("openai")
    fetchData("anthropic")
    fetchData("deepseek")
  }

  function LoadingResponse() {
    return (
      <div className="h-full rounded-sm p-4 bg-muted animate-pulse">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <main className="container max-w-[1600px] mx-auto p-4 min-h-screen flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Compare</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-markdown"
                checked={!showMarkdown}
                onCheckedChange={(checked) => setShowMarkdown(!checked)}
              />
              <label htmlFor="show-markdown" className="text-sm text-muted-foreground">
                Format Markdown
              </label>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <p className="text-muted-foreground mb-3">
          Compare responses from leading AI models side by side. Enter your API keys and a prompt to see how different models handle the same query.
        </p>
        <div className="bg-muted/50 border rounded-md p-2 text-sm">
          <p className="flex items-center gap-2">
            <strong className="font-bold">Note:</strong>
            API keys are stored in cookies for your convenience. Please ensure you're on a secure device.
          </p>
        </div>
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
            <div className={`flex-1 rounded-sm p-4 whitespace-pre-wrap overflow-y-auto max-h-[650px] bg-muted ${
              results.openai.startsWith('Error:') ? 'border-2 border-destructive' : ''
            }`}>
              {loading.openai ? <LoadingResponse /> : (
                showMarkdown ? (
                  results.openai || "ChatGPT results will appear here..."
                ) : (
                  <ReactMarkdown>
                    {results.openai || "ChatGPT results will appear here..."}
                  </ReactMarkdown>
                )
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
            <div className={`flex-1 rounded-sm p-4 whitespace-pre-wrap overflow-y-auto max-h-[650px] bg-muted ${
              results.anthropic.startsWith('Error:') ? 'border-2 border-destructive' : ''
            }`}>
              {loading.anthropic ? <LoadingResponse /> : (
                showMarkdown ? (
                  results.anthropic || "Claude results will appear here..."
                ) : (
                  <ReactMarkdown>
                    {results.anthropic || "Claude results will appear here..."}
                  </ReactMarkdown>
                )
              )}
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
            <div className={`flex-1 rounded-sm p-4 overflow-y-auto whitespace-pre-wrap max-h-[650px] bg-muted ${
              results.deepseek.startsWith('Error:') ? 'border-2 border-destructive' : ''
            }`}>
              {loading.deepseek ? <LoadingResponse /> : (
                showMarkdown ? (
                  results.deepseek || "DeepSeek results will appear here..."
                ) : (
                  <ReactMarkdown>
                    {results.deepseek || "DeepSeek results will appear here..."}
                  </ReactMarkdown>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your query here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[50px]"
        />
        <Button
          type="submit"
          className="w-full"
          disabled={
            loading.openai || loading.anthropic || loading.deepseek ||
            !prompt ||
            Object.values(apiKeys).every((key) => !key)
          }
        >
          {loading.openai || loading.anthropic || loading.deepseek ? "Querying AIs..." : "Submit Query"}
        </Button>
      </form>

      <footer className="text-center text-sm text-muted-foreground space-y-1">
        <p>Created by Twaites</p>
        <p>
          <a 
            href="https://github.com/Twaites/ai-compare" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4"
          >
            View source code on GitHub
          </a>
        </p>
      </footer>
    </main>
  )
}

