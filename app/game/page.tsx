"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemedTimer } from "@/components/game/themed-timer"
import { RankingBoard } from "@/components/game/ranking-board"
import { GameModal } from "@/components/game/game-modal"
import { ThemedLetterTile } from "@/components/game/themed-letter-tile"
import { ArrowLeft, Play, Pause, Eye, EyeOff, Lightbulb, SkipForward, StopCircle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { themes } from "@/lib/themes"
import { useGame } from "@/context/GameContext"
import { getRandomWord } from "@/lib/words"

export default function GamePage() {
  const { theme } = useTheme()
  const themeConfig = themes[theme]

  // Use Game Context instead of local state
  const {
    gameState,
    players,
    config,
    startNewRound,
    endRound,
    togglePause,
    revealRandomLetter,
    resetPlayers,
  } = useGame()

  // Local UI state
  const [showHint, setShowHint] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // --- Styles ---
  const cardStyle = useMemo(() => {
    const bg = themeConfig?.colors?.cardBg
    const border = themeConfig?.colors?.border
    const style: React.CSSProperties = {}
    if (typeof bg === "string" && (bg.startsWith("#") || bg.startsWith("rgb"))) style.backgroundColor = bg
    if (typeof border === "string" && (border.startsWith("#") || border.startsWith("rgb"))) style.borderColor = border
    return style
  }, [themeConfig])

  const outlineBtnStyle = useMemo(() => {
    const border = themeConfig?.colors?.border
    const text = themeConfig?.colors?.text
    const style: React.CSSProperties = {}
    if (typeof border === "string" && (border.startsWith("#") || border.startsWith("rgb"))) style.borderColor = border
    if (typeof text === "string" && (text.startsWith("#") || text.startsWith("rgb"))) style.color = text
    return style
  }, [themeConfig])

  // Start new round with random word
  const handleStartNewRound = useCallback(() => {
    const randomWord = getRandomWord(gameState.currentWord)
    
    if (!randomWord) {
      alert('No words available! Please add words in the configuration page.')
      return
    }

    startNewRound(randomWord.word, randomWord.hint)
    setShowHint(false)
    setModalOpen(false)
  }, [gameState.currentWord, startNewRound])

  // Handle end round
  const handleEndRound = useCallback((hasWinner: boolean, winnerName?: string, points?: number) => {
    endRound(hasWinner, winnerName, points)
    
    // Open modal after a delay to show the revealed letters
    setTimeout(() => {
      setModalOpen(true)
    }, 1000)
  }, [endRound])

  // Auto-open modal when round finishes
  useMemo(() => {
    if (gameState.isFinished && !modalOpen) {
      setTimeout(() => {
        setModalOpen(true)
      }, 1000)
    }
  }, [gameState.isFinished, modalOpen])

  const handleResetRanking = () => {
    if (!confirm("Are you sure you want to reset the ranking?")) return
    resetPlayers()
  }

  // Sort players for ranking
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.points - a.points)
  }, [players])

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.background} p-4 md:p-8`}>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" style={outlineBtnStyle} className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Timer */}
            <div className="flex justify-center">
              <ThemedTimer 
                timeLeft={gameState.timeLeft} 
                totalTime={config.roundDuration} 
                theme={theme} 
              />
            </div>

            {/* Word Display */}
            <Card className="backdrop-blur-xl border" style={cardStyle}>
              <CardContent className="p-6 md:p-8">
                {gameState.currentWord ? (
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-full mx-auto">
                    {gameState.currentWord.split("").map((letter, index) => (
                      <ThemedLetterTile
                        key={`${gameState.currentWord}-${index}`}
                        letter={letter}
                        revealed={gameState.revealedIndices.includes(index) || gameState.isFinished}
                        isCorrectGuess={gameState.isFinished && gameState.winner !== null}
                        delay={index * 100}
                        theme={theme}
                        wordLength={gameState.currentWord.length}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Button 
                      onClick={handleStartNewRound} 
                      className={`bg-gradient-to-r ${themeConfig.colors.primary} text-white`}
                    >
                      <Play className="w-4 h-4 mr-2" /> Start New Round
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hint Display */}
            {gameState.currentWord && (
              <Card className="backdrop-blur-xl border" style={cardStyle}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <div className="flex-1">
                        {showHint ? (
                          <p className="text-white">{gameState.currentHint}</p>
                        ) : (
                          <p className="text-slate-500">Hint hidden</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowHint(!showHint)} 
                      variant="outline" 
                      style={outlineBtnStyle} 
                      className="bg-transparent"
                    >
                      {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Control Buttons */}
            {gameState.currentWord && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={revealRandomLetter} 
                  disabled={!gameState.isRunning || gameState.isFinished} 
                  className="bg-blue-500/20 border-blue-500/30 text-blue-400"
                >
                  <Eye className="w-4 h-4 mr-2" /> Reveal
                </Button>
                <Button 
                  onClick={togglePause} 
                  disabled={gameState.isFinished} 
                  className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
                >
                  {gameState.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Resume
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleEndRound(false)} 
                  disabled={!gameState.isRunning} 
                  className="bg-red-500/20 border-red-500/30 text-red-400"
                >
                  <StopCircle className="w-4 h-4 mr-2" /> End
                </Button>
                <Button 
                  onClick={handleStartNewRound} 
                  className={`bg-gradient-to-r ${themeConfig.colors.primary} text-white`}
                >
                  <SkipForward className="w-4 h-4 mr-2" /> New Round
                </Button>
              </div>
            )}
          </div>

          {/* Ranking Board */}
          <div className="lg:col-span-1">
            <RankingBoard 
              players={sortedPlayers} 
              onResetRanking={handleResetRanking} 
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <GameModal
        isOpen={modalOpen}
        type={gameState.winner ? "winner" : "no-winner"}
        winner={gameState.winner || ""}
        word={gameState.currentWord}
        points={gameState.winnerPoints}
        onClose={() => setModalOpen(false)}
        onNewRound={handleStartNewRound}
      />
    </div>
  )
}
