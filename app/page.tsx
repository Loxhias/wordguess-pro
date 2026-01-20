"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Settings, Webhook, Copy, Check, Info } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { Badge } from "@/components/ui/badge"
import { useMagicWebhook } from "@/hooks/use-magic-webhook"

export default function HomePage() {
  const [showWebhookInfo, setShowWebhookInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const { t } = useLanguage()
  const { webhookUrl, isEnabled } = useMagicWebhook()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Example webhook URL
  const exampleWebhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/game?webhook=https://your-magic-alerts-url.com/webhook`
    : '/game?webhook=https://your-magic-alerts-url.com/webhook'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {t("wordGuessPro")}
            </h1>
            <p className="text-slate-400 text-lg">{t("professionalPlatform")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/game">
            <Card className="cursor-pointer transition-all hover:scale-105 border-purple-500/30 bg-slate-900/50 backdrop-blur-xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">{t("game")}</CardTitle>
                <CardDescription className="text-slate-400">{t("startPlaying")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/config">
            <Card className="cursor-pointer transition-all hover:scale-105 border-purple-500/30 bg-slate-900/50 backdrop-blur-xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">{t("configuration")}</CardTitle>
                <CardDescription className="text-slate-400">{t("manageSettings")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Webhook Integration Card */}
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Magic Alerts Integration
                    {isEnabled && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Connect with Magic By Loxhias for real-time alerts
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowWebhookInfo(!showWebhookInfo)}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {showWebhookInfo ? "Hide" : "Show"} Info
              </Button>
            </div>
          </CardHeader>

          {showWebhookInfo && (
            <CardContent>
              <div className="space-y-4">
                {/* Current Status */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">Current Status</span>
                  </div>
                  {isEnabled && webhookUrl ? (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Webhook URL configured:</p>
                      <code className="text-xs text-green-400 block break-all font-mono bg-slate-950/50 p-2 rounded">
                        {webhookUrl}
                      </code>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No webhook configured. Add <code className="text-purple-400">?webhook=YOUR_URL</code> to enable.
                    </p>
                  )}
                </div>

                {/* How to Enable */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-purple-500/20">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">How to Enable</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Add the <code className="text-purple-400">?webhook=</code> parameter to the game URL:
                  </p>
                  <code className="text-xs text-slate-300 block break-all font-mono bg-slate-950/50 p-2 rounded mb-2">
                    {exampleWebhookUrl}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(exampleWebhookUrl)}
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Example
                      </>
                    )}
                  </Button>
                </div>

                {/* Events Sent */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3">Events Sent to Webhook</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">🏆 GAME_WIN</span>
                      <span className="text-slate-500">When someone guesses correctly</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">⏱️ ROUND_END</span>
                      <span className="text-slate-500">When time runs out</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">🔤 LETTER_REVEALED</span>
                      <span className="text-slate-500">When a letter is revealed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">🎮 ROUND_START</span>
                      <span className="text-slate-500">When a new round begins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">💎 DOUBLE_POINTS</span>
                      <span className="text-slate-500">When double points activated</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">⚠️ TIMER_WARNING</span>
                      <span className="text-slate-500">10 seconds remaining</span>
                    </div>
                  </div>
                </div>

                {/* Webhook Payload Example */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3">Webhook Payload Example</h3>
                  <pre className="text-xs text-slate-300 font-mono bg-slate-950/50 p-3 rounded overflow-x-auto">
{`{
  "event": "GAME_WIN",
  "timestamp": 1234567890,
  "data": {
    "playerName": "loxhias",
    "points": 10,
    "word": "JAVASCRIPT"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
