"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GameProvider, useGame } from "@/context/GameContext"
import { getAllWords, saveCustomWords, DEFAULT_WORDS } from "@/lib/words"
import type { WordEntry } from "@/types/game"

function ConfigContent() {
  const { config, updateConfig } = useGame()
  const [words, setWords] = useState<WordEntry[]>([])
  const [newWord, setNewWord] = useState({ word: '', hint: '' })

  useEffect(() => {
    setWords(getAllWords())
  }, [])

  const handleSave = () => {
    const customWords = words.filter(w =>
      !DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === w.word.toUpperCase())
    )
    saveCustomWords(customWords)
    alert('Saved!')
  }

  const handleAdd = () => {
    if (!newWord.word || !newWord.hint) return
    setWords([...words, { word: newWord.word.toUpperCase(), hint: newWord.hint, category: 'custom' }])
    setNewWord({ word: '', hint: '' })
  }

  const handleDelete = (index: number) => {
    const word = words[index]
    const isDefault = DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === word.word.toUpperCase())
    if (isDefault) {
      alert('Cannot delete default words')
      return
    }
    setWords(words.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-4 text-purple-400 hover:text-purple-300">
          ← Back
        </Link>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Configuration
        </h1>

        {/* Game Settings */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-xl mb-4">Game Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 text-sm block mb-2">Round Duration (seconds)</label>
              <input
                type="number"
                value={config.roundDuration}
                onChange={(e) => updateConfig({ roundDuration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-2">Reveal Interval (seconds)</label>
              <input
                type="number"
                value={config.revealInterval}
                onChange={(e) => updateConfig({ revealInterval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm block mb-2">Double Points Duration</label>
              <input
                type="number"
                value={config.doublePointsDuration}
                onChange={(e) => updateConfig({ doublePointsDuration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Words */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold text-xl">Words ({words.length})</h2>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>

          {/* Add Word */}
          <div className="mb-4 p-4 bg-slate-800/30 rounded-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Word"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-lg"
              />
              <input
                type="text"
                placeholder="Hint"
                value={newWord.hint}
                onChange={(e) => setNewWord({ ...newWord, hint: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-purple-500/30 text-white rounded-lg"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newWord.word || !newWord.hint}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              + Add Word
            </button>
          </div>

          {/* Word List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {words.map((word, i) => {
              const isDefault = DEFAULT_WORDS.some(dw => dw.word.toUpperCase() === word.word.toUpperCase())
              return (
                <div key={i} className={`p-3 rounded-lg border ${isDefault ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-800/30 border-slate-700'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-white font-bold">{word.word}</div>
                      <div className="text-slate-400 text-sm">{word.hint}</div>
                    </div>
                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-red-400 hover:text-red-300 px-3 py-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfigPage() {
  return (
    <GameProvider>
      <ConfigContent />
    </GameProvider>
  )
}
