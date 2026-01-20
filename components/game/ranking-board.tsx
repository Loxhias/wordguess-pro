"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

interface Player {
  name: string
  points: number
}

interface RankingBoardProps {
  players: Player[]
  onResetRanking: () => void
}

export function RankingBoard({ players, onResetRanking }: RankingBoardProps) {
  const topPlayers = [...players].sort((a, b) => b.points - a.points).slice(0, 5)

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 1:
        return <Medal className="w-5 h-5 text-slate-300" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-slate-500 font-bold">{index + 1}</div>
    }
  }

  return (
    <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Top 5 Ranking
          </CardTitle>
          <button
            onClick={onResetRanking}
            className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10"
          >
            Reset
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {topPlayers.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No players yet</p>
        ) : (
          topPlayers.map((player, index) => (
            <div
              key={`${player.name}-${index}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30"
                    : index === 1
                      ? "bg-gradient-to-r from-slate-400/10 to-slate-500/10 border border-slate-400/30"
                      : index === 2
                        ? "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/30"
                        : "bg-slate-800/30 border border-slate-700/30"
                }
              `}
            >
              {getIcon(index)}
              <div className="flex-1">
                <p className="text-white font-medium">{player.name}</p>
              </div>
              <div
                className={`
                px-3 py-1 rounded-full font-bold text-sm
                ${
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-400"
                    : index === 1
                      ? "bg-slate-400/20 text-slate-300"
                      : index === 2
                        ? "bg-amber-600/20 text-amber-500"
                        : "bg-purple-500/20 text-purple-400"
                }
              `}
              >
                {player.points} pts
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
