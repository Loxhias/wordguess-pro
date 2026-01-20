"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Trophy, AlertCircle } from "lucide-react"

interface GameModalProps {
  isOpen: boolean
  type: "winner" | "no-winner"
  winner?: string
  word: string
  points?: number
  onClose: () => void
  onNewRound: () => void
}

export function GameModal({ isOpen, type, winner, word, points, onClose, onNewRound }: GameModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md border-purple-500/30 bg-slate-900/95 backdrop-blur-xl animate-scale-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              {type === "winner" ? (
                <>
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                  Winner!
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  Round Over
                </>
              )}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {type === "winner" ? (
            <>
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center animate-glow-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{winner}</p>
                <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <p className="text-3xl font-display font-bold text-purple-300">+{points} points</p>
                </div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                <p className="text-sm text-slate-400 mb-1">Correct Word</p>
                <p className="text-2xl font-display font-bold text-white tracking-wider">{word.toUpperCase()}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl font-bold text-white">No one guessed correctly</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-orange-500/20">
                <p className="text-sm text-slate-400 mb-1">The word was</p>
                <p className="text-2xl font-display font-bold text-white tracking-wider">{word.toUpperCase()}</p>
              </div>
            </>
          )}

          <Button
            onClick={onNewRound}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg h-12"
          >
            New Round
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
