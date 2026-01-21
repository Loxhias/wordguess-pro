/**
 * WORD BANK - Client-Side
 * 
 * Palabras predefinidas para el juego.
 * Los usuarios pueden agregar más palabras desde la interfaz de configuración.
 */

import type { WordEntry } from '@/types/game'

// No default words - users must create their own word set
export const DEFAULT_WORDS: WordEntry[] = []

// Storage key for custom words
export const CUSTOM_WORDS_KEY = 'wordguess_custom_words'

/**
 * Get all available words (custom words from localStorage only)
 */
export function getAllWords(): WordEntry[] {
  if (typeof window === 'undefined') return []
  
  const customWordsJson = localStorage.getItem(CUSTOM_WORDS_KEY)
  
  if (!customWordsJson) {
    return []
  }
  
  try {
    return JSON.parse(customWordsJson)
  } catch (error) {
    console.error('Error parsing custom words:', error)
    return []
  }
}

/**
 * Get a random word from the available words
 */
export function getRandomWord(excludeWord?: string): WordEntry | null {
  const allWords = getAllWords()
  
  if (allWords.length === 0) {
    return null
  }
  
  // Filter out the excluded word if provided
  let availableWords = allWords
  if (excludeWord) {
    availableWords = allWords.filter(w => w.word.toUpperCase() !== excludeWord.toUpperCase())
  }
  
  if (availableWords.length === 0) {
    // If all words are excluded, use all words
    availableWords = allWords
  }
  
  // Get random word
  const randomIndex = Math.floor(Math.random() * availableWords.length)
  return availableWords[randomIndex]
}

/**
 * Save custom words to localStorage
 */
export function saveCustomWords(words: WordEntry[]): void {
  if (typeof window === 'undefined') return
  
  const normalized = words.map(w => ({
    word: w.word.toUpperCase().trim(),
    hint: w.hint.trim(),
    difficulty: w.difficulty || 'medium',
    category: w.category || 'custom',
  })).filter(w => w.word && w.hint)
  
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(normalized))
}

/**
 * Add a single custom word
 */
export function addCustomWord(word: string, hint: string, difficulty?: WordEntry['difficulty'], category?: string): void {
  if (typeof window === 'undefined') return
  
  const allWords = getAllWords()
  const customWordsJson = localStorage.getItem(CUSTOM_WORDS_KEY)
  const customWords: WordEntry[] = customWordsJson ? JSON.parse(customWordsJson) : []
  
  const newWord: WordEntry = {
    word: word.toUpperCase().trim(),
    hint: hint.trim(),
    difficulty: difficulty || 'medium',
    category: category || 'custom',
  }
  
  // Check if word already exists
  const exists = allWords.some(w => w.word.toUpperCase() === newWord.word)
  if (!exists) {
    customWords.push(newWord)
    saveCustomWords(customWords)
  }
}

/**
 * Delete a custom word
 */
export function deleteCustomWord(word: string): void {
  if (typeof window === 'undefined') return
  
  const customWordsJson = localStorage.getItem(CUSTOM_WORDS_KEY)
  if (!customWordsJson) return
  
  try {
    const customWords: WordEntry[] = JSON.parse(customWordsJson)
    const filtered = customWords.filter(w => w.word.toUpperCase() !== word.toUpperCase())
    saveCustomWords(filtered)
  } catch (error) {
    console.error('Error deleting custom word:', error)
  }
}

/**
 * Get only custom words
 */
export function getCustomWords(): WordEntry[] {
  const customWordsJson = localStorage.getItem(CUSTOM_WORDS_KEY)
  if (!customWordsJson) return []
  
  try {
    return JSON.parse(customWordsJson)
  } catch (error) {
    console.error('Error loading custom words:', error)
    return []
  }
}
