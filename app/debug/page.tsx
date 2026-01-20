"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'
import { useGame } from '@/context/GameContext'
import { useIncomingWebhooks } from '@/hooks/use-incoming-webhooks'
import { getAllWords } from '@/lib/words'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { gameState, players } = useGame()
  const { guesses, events } = useIncomingWebhooks(true)
  const [logs, setLogs] = useState<string[]>([])
  const [isProduction, setIsProduction] = useState(false)
  const [words, setWords] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    setIsProduction(isProd)
    setWords(getAllWords())
  }, [])

  useEffect(() => {
    if (guesses.length > 0) {
      setLogs(prev => [...prev, `📥 [${new Date().toLocaleTimeString()}] ${guesses.length} guesses recibidos`])
    }
  }, [guesses])

  useEffect(() => {
    if (events.length > 0) {
      setLogs(prev => [...prev, `📥 [${new Date().toLocaleTimeString()}] ${events.length} eventos recibidos: ${events.map(e => e.event).join(', ')}`])
    }
  }, [events])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/game">
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Juego
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          🔍 Debug Panel
        </h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Polling Status */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Polling Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProduction ? (
                <div className="text-green-400">
                  ✅ Activado en producción
                </div>
              ) : (
                <div className="text-yellow-400">
                  ⏸️ Desactivado (localhost)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Words Status */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Palabras Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              {words.length > 0 ? (
                <div className="text-green-400">
                  ✅ {words.length} palabras
                </div>
              ) : (
                <div className="text-red-400">
                  ❌ No hay palabras
                  <Link href="/config" className="block text-purple-400 text-sm mt-2">
                    → Ir a Config
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Status */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Estado del Juego</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-slate-300">
                Ronda activa: {gameState.isRunning ? (
                  <span className="text-green-400">✅ Sí</span>
                ) : (
                  <span className="text-yellow-400">⏸️ No</span>
                )}
              </div>
              {gameState.currentWord && (
                <>
                  <div className="text-slate-300">
                    Palabra: <span className="text-purple-400">{gameState.currentWord}</span>
                  </div>
                  <div className="text-slate-300">
                    Letras reveladas: {gameState.revealedIndices.length}/{gameState.currentWord.length}
                  </div>
                  <div className="text-slate-300">
                    Tiempo restante: {gameState.timeLeft}s
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Webhooks Queue */}
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Cola de Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-slate-300">
                Guesses: <span className="text-purple-400">{guesses.length}</span>
              </div>
              <div className="text-slate-300">
                Eventos: <span className="text-purple-400">{events.length}</span>
              </div>
              {events.length > 0 && (
                <div className="text-xs text-slate-400 mt-2">
                  {events.map((e, i) => (
                    <div key={i}>• {e.event} por {e.user}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              Logs en Tiempo Real
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLogs([])}
                className="text-purple-400"
              >
                Limpiar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-slate-500">
                  Esperando webhooks...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mt-6">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-400 mb-4">
              Copia estas URLs y ábrelas en una nueva pestaña para probar:
            </div>
            
            {[
              { name: 'Nueva Ronda', url: '/api/event?user=Debug&event=nueva_ronda' },
              { name: 'Revelar Letra', url: '/api/event?user=Debug&event=reveal_letter' },
              { name: 'Puntos Dobles', url: '/api/event?user=Debug&event=double_points&duration=30' },
            ].map((action) => (
              <div key={action.name} className="flex items-center gap-2">
                <span className="text-white font-medium w-32">{action.name}:</span>
                <code className="flex-1 bg-slate-800/50 text-purple-300 p-2 rounded text-xs overflow-x-auto">
                  {typeof window !== 'undefined' ? window.location.origin : ''}{action.url}
                </code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      (typeof window !== 'undefined' ? window.location.origin : '') + action.url
                    )
                  }}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  📋
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Players */}
        {players.length > 0 && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl mt-6">
            <CardHeader>
              <CardTitle className="text-white">Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.slice(0, 5).map((player, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{i + 1}. {player.name}</span>
                    <span className="text-purple-400">{player.points} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
