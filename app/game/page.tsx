"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Pause, Eye, SkipForward, Lightbulb } from "lucide-react"
import { GameProvider, useGame } from "@/context/GameContext"
import { getRandomWord } from "@/lib/words"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { ThemedLetterTile } from "@/components/game/themed-letter-tile"
import { ThemedTimer } from "@/components/game/themed-timer"
import { GameModal } from "@/components/game/game-modal"
import { RankingBoard } from "@/components/game/ranking-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function GameContent() {
  const { gameState, startNewRound, revealRandomLetter, togglePause, endRound, players, resetPlayers, config } = useGame()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)

  useEffect(() => {
    if (gameState.isFinished && !modalOpen) {
      setTimeout(() => setModalOpen(true), 1000)
    }
  }, [gameState.isFinished, modalOpen])

  const handleStartRound = () => {
    const word = getRandomWord(gameState.currentWord)
    if (!word) {
      alert(t('addWordsFirst'))
      return
    }
    startNewRound(word.word, word.hint)
    setModalOpen(false)
    setHintRevealed(false)
  }

  const themeColors = {
    cyberpunk: 'from-slate-900 via-purple-900 to-slate-900',
    neon: 'from-slate-950 via-blue-950 to-slate-950',
    matrix: 'from-black via-green-950 to-black',
    retro: 'from-purple-950 via-pink-900 to-orange-950',
    galaxy: 'from-indigo-950 via-purple-950 to-slate-950',
    ocean: 'from-blue-950 via-teal-950 to-slate-950',
    sunset: 'from-orange-950 via-red-950 to-slate-950',
    forest: 'from-emerald-950 via-green-950 to-slate-950',
    minimal: 'from-white via-slate-50 to-slate-100',
    dark: 'from-black via-zinc-950 to-black',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors[theme]} p-4 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            {gameState.currentWord && (
              <div className="flex justify-center">
                <ThemedTimer
                  timeLeft={gameState.timeLeft}
                  totalTime={config.roundDuration}
                  theme={theme}
                />
              </div>
            )}

            {/* Word Display */}
            <Card className={`border-purple-500/30 bg-slate-900/50 backdrop-blur-xl ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
              <CardContent className="p-8">
                {gameState.currentWord ? (
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {gameState.currentWord.split('').map((letter, i) => (
                      <ThemedLetterTile
                        key={i}
                        letter={letter}
                        revealed={gameState.revealedIndices.includes(i) || gameState.isFinished}
                        isCorrectGuess={gameState.isFinished && gameState.winner !== null}
                        delay={i * 100}
                        theme={theme}
                        wordLength={gameState.currentWord.length}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-6 text-lg">{t('noActiveRound')}</p>
                    <Button
                      onClick={handleStartRound}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {t('startNewRound')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hint */}
            {gameState.currentWord && gameState.currentHint && (
              <Card className={`border-yellow-500/30 bg-slate-900/50 backdrop-blur-xl ${theme === 'minimal' ? 'bg-white/90' : ''}`}>
                <CardContent className="p-6">
                  {!hintRevealed ? (
                    <button
                      onClick={() => setHintRevealed(true)}
                      className="w-full flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>{t('clickToRevealHint')}</span>
                    </button>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-400 mb-1">{t('hint')}</p>
                        <p className="text-white font-medium">{gameState.currentHint}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            {gameState.currentWord && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={revealRandomLetter}
                  disabled={!gameState.isRunning || gameState.revealedIndices.length >= gameState.currentWord.length}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('revealLetter')}
                </Button>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  {gameState.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      {t('pause')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t('resume')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => endRound(false)}
                  disabled={!gameState.isRunning}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  {t('endRound')}
                </Button>
                <Button
                  onClick={handleStartRound}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t('newRound')}
                </Button>
              </div>
            )}

            {/* Double Points Indicator */}
            {gameState.doublePointsActive && (
              <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl animate-pulse">
                <CardContent className="p-4 text-center">
                  <p className="text-yellow-400 font-bold text-lg">
                    🔥 {t('doublePointsDuration')} ACTIVE! 🔥
                  </p>
                  <p className="text-yellow-300 text-sm mt-1">
                    {Math.ceil((gameState.doublePointsUntil - Date.now()) / 1000)}s {t('timeLeft')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Ranking */}
          <div className="lg:col-span-1">
            <RankingBoard players={players} onResetRanking={resetPlayers} />
          </div>
        </div>

        {/* Game Modal */}
        <GameModal
          isOpen={modalOpen}
          type={gameState.winner ? "winner" : "no-winner"}
          winner={gameState.winner || undefined}
          word={gameState.currentWord}
          points={gameState.winnerPoints}
          onClose={() => setModalOpen(false)}
          onNewRound={handleStartRound}
        />
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
