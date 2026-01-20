"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GameProvider, useGame } from "@/context/GameContext"
import { getRandomWord } from "@/lib/words"

function GameContent() {
  const { gameState, startNewRound, revealRandomLetter, togglePause, endRound, players, resetPlayers } = useGame()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (gameState.isFinished && !modalOpen) {
      setTimeout(() => setModalOpen(true), 1000)
    }
  }, [gameState.isFinished, modalOpen])

  const handleStartRound = () => {
    const word = getRandomWord(gameState.currentWord)
    if (!word) {
      alert('Add words in config first!')
      return
    }
    startNewRound(word.word, word.hint)
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-block mb-4 text-purple-400 hover:text-purple-300">
          ← Back
        </Link>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="inline-block bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8">
            <div className="text-6xl font-bold text-purple-400">
              {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Word */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 mb-6">
          {gameState.currentWord ? (
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.currentWord.split('').map((letter, i) => (
                <div
                  key={i}
                  className={`w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 ${
                    gameState.revealedIndices.includes(i) || gameState.isFinished
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  {gameState.revealedIndices.includes(i) || gameState.isFinished ? letter : '?'}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleStartRound}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg"
              >
                Start New Round
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        {gameState.currentWord && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-6">
            <div className="text-yellow-400">💡 Hint: {gameState.currentHint}</div>
          </div>
        )}

        {/* Controls */}
        {gameState.currentWord && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={revealRandomLetter}
              disabled={!gameState.isRunning}
              className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg disabled:opacity-50"
            >
              Reveal Letter
            </button>
            <button
              onClick={togglePause}
              className="px-4 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg"
            >
              {gameState.isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => endRound(false)}
              disabled={!gameState.isRunning}
              className="px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg disabled:opacity-50"
            >
              End Round
            </button>
            <button
              onClick={handleStartRound}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
            >
              New Round
            </button>
          </div>
        )}

        {/* Ranking */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-xl">Top Players</h3>
            <button
              onClick={resetPlayers}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Reset
            </button>
          </div>
          {players.length > 0 ? (
            <div className="space-y-2">
              {players.slice(0, 5).map((player, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                  <span className="text-white">{i + 1}. {player.name}</span>
                  <span className="text-purple-400 font-bold">{player.points} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center">No players yet</p>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold text-white mb-4">
                {gameState.winner ? '🏆 Winner!' : '⏱️ Time Up!'}
              </h2>
              {gameState.winner && (
                <p className="text-2xl text-purple-400 mb-4">{gameState.winner} +{gameState.winnerPoints} pts</p>
              )}
              <p className="text-slate-400 mb-6">Word: {gameState.currentWord}</p>
              <button
                onClick={handleStartRound}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg"
              >
                New Round
              </button>
            </div>
          </div>
        )}
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
