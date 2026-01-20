/**
 * WORD BANK - Client-Side
 * 
 * Palabras predefinidas para el juego.
 * Los usuarios pueden agregar más palabras desde la interfaz de configuración.
 */

import type { WordEntry } from '@/types/game'

export const DEFAULT_WORDS: WordEntry[] = [
  // Programming
  { word: 'JAVASCRIPT', hint: 'Popular programming language for web development', difficulty: 'medium', category: 'programming' },
  { word: 'TYPESCRIPT', hint: 'Superset of JavaScript with types', difficulty: 'medium', category: 'programming' },
  { word: 'PYTHON', hint: 'High-level programming language', difficulty: 'easy', category: 'programming' },
  { word: 'ALGORITHM', hint: 'Step-by-step procedure for calculations', difficulty: 'hard', category: 'programming' },
  { word: 'DATABASE', hint: 'Organized collection of data', difficulty: 'medium', category: 'programming' },
  { word: 'FRAMEWORK', hint: 'Software development platform', difficulty: 'medium', category: 'programming' },
  { word: 'FUNCTION', hint: 'Reusable block of code', difficulty: 'easy', category: 'programming' },
  { word: 'VARIABLE', hint: 'Container for storing data', difficulty: 'easy', category: 'programming' },
  
  // Technology
  { word: 'COMPUTER', hint: 'Electronic device for processing data', difficulty: 'easy', category: 'technology' },
  { word: 'TECHNOLOGY', hint: 'Science applied to practical purposes', difficulty: 'medium', category: 'technology' },
  { word: 'SMARTPHONE', hint: 'Mobile device with advanced features', difficulty: 'easy', category: 'technology' },
  { word: 'INTERNET', hint: 'Global network of computers', difficulty: 'easy', category: 'technology' },
  { word: 'ARTIFICIAL', hint: 'Made by humans, not natural', difficulty: 'medium', category: 'technology' },
  { word: 'VIRTUAL', hint: 'Existing in software, not physical', difficulty: 'medium', category: 'technology' },
  { word: 'NETWORK', hint: 'Group of interconnected devices', difficulty: 'easy', category: 'technology' },
  { word: 'SOFTWARE', hint: 'Programs and operating systems', difficulty: 'easy', category: 'technology' },
  
  // Gaming
  { word: 'MINECRAFT', hint: 'Popular sandbox video game', difficulty: 'easy', category: 'gaming' },
  { word: 'FORTNITE', hint: 'Battle royale game', difficulty: 'easy', category: 'gaming' },
  { word: 'ADVENTURE', hint: 'Exciting or unusual experience', difficulty: 'easy', category: 'gaming' },
  { word: 'CHAMPION', hint: 'Winner of a competition', difficulty: 'easy', category: 'gaming' },
  { word: 'MULTIPLAYER', hint: 'Game mode with multiple players', difficulty: 'medium', category: 'gaming' },
  { word: 'GRAPHICS', hint: 'Visual elements in games', difficulty: 'medium', category: 'gaming' },
  { word: 'CONTROLLER', hint: 'Device to play video games', difficulty: 'easy', category: 'gaming' },
  { word: 'PLATFORM', hint: 'Type of gaming system', difficulty: 'easy', category: 'gaming' },
  
  // Internet & Streaming
  { word: 'STREAMING', hint: 'Continuous transmission of audio or video', difficulty: 'easy', category: 'internet' },
  { word: 'YOUTUBE', hint: 'Popular video sharing platform', difficulty: 'easy', category: 'internet' },
  { word: 'TWITCH', hint: 'Live streaming platform for gamers', difficulty: 'easy', category: 'internet' },
  { word: 'DISCORD', hint: 'Communication platform for communities', difficulty: 'easy', category: 'internet' },
  { word: 'SUBSCRIBE', hint: 'Follow a channel or content creator', difficulty: 'easy', category: 'internet' },
  { word: 'DOWNLOAD', hint: 'Transfer data from internet to device', difficulty: 'easy', category: 'internet' },
  { word: 'BROWSER', hint: 'Software to access the internet', difficulty: 'easy', category: 'internet' },
  { word: 'WEBSITE', hint: 'Collection of web pages', difficulty: 'easy', category: 'internet' },
  
  // Culture & Entertainment
  { word: 'CYBERPUNK', hint: 'Futuristic science fiction genre', difficulty: 'medium', category: 'culture' },
  { word: 'ANIMATION', hint: 'Moving images created frame by frame', difficulty: 'medium', category: 'culture' },
  { word: 'SOUNDTRACK', hint: 'Music from a movie or game', difficulty: 'medium', category: 'culture' },
  { word: 'FANTASY', hint: 'Genre with magic and imaginary worlds', difficulty: 'easy', category: 'culture' },
  { word: 'MYSTERY', hint: 'Something unknown or secret', difficulty: 'easy', category: 'culture' },
  { word: 'LEGENDARY', hint: 'Extremely famous or remarkable', difficulty: 'medium', category: 'culture' },
  { word: 'CREATIVE', hint: 'Having imagination and originality', difficulty: 'easy', category: 'culture' },
  { word: 'FESTIVAL', hint: 'Celebration or event', difficulty: 'easy', category: 'culture' },
  
  // General
  { word: 'CHALLENGE', hint: 'Difficult task requiring effort', difficulty: 'easy', category: 'general' },
  { word: 'STRATEGY', hint: 'Plan of action to achieve a goal', difficulty: 'medium', category: 'general' },
  { word: 'VICTORY', hint: 'Success in a battle or competition', difficulty: 'easy', category: 'general' },
  { word: 'TREASURE', hint: 'Valuable or precious items', difficulty: 'easy', category: 'general' },
  { word: 'JOURNEY', hint: 'Long trip or adventure', difficulty: 'easy', category: 'general' },
  { word: 'POWERFUL', hint: 'Having great strength or influence', difficulty: 'easy', category: 'general' },
  { word: 'ULTIMATE', hint: 'Final or best possible', difficulty: 'medium', category: 'general' },
  { word: 'LEGEND', hint: 'Traditional story or famous person', difficulty: 'easy', category: 'general' },
]

// Storage key for custom words
export const CUSTOM_WORDS_KEY = 'wordguess_custom_words'

/**
 * Get all available words (default + custom from localStorage)
 */
export function getAllWords(): WordEntry[] {
  const customWordsJson = localStorage.getItem(CUSTOM_WORDS_KEY)
  let customWords: WordEntry[] = []
  
  if (customWordsJson) {
    try {
      customWords = JSON.parse(customWordsJson)
    } catch (error) {
      console.error('Error parsing custom words:', error)
    }
  }
  
  // Combine and deduplicate
  const allWords = [...DEFAULT_WORDS, ...customWords]
  const uniqueWords = allWords.filter((word, index, self) =>
    index === self.findIndex((w) => w.word.toUpperCase() === word.word.toUpperCase())
  )
  
  return uniqueWords
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
