import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import GamesService from '@/services/games.service'

export const useGamesStore = defineStore('games', () => {
  // State mit localStorage Persistierung
  const games = useStorage('games', [])
  const basarGames = useStorage('basarGames', [])
  const historyGames = useStorage('historyGames', [])
  const loading = useStorage('gamesLoading', false)
  const error = useStorage('gamesError', null)

  // Actions
  const fetchGames = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await GamesService.getAllGames()
      games.value = response
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Fehler beim Laden der Spiele'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchBasarGames = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await GamesService.basar()
      basarGames.value = response.filter(game => {
        const gameDate = new Date(game.kickoffDate)
        const now = new Date()
        const diffTime = Math.abs(now - gameDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 1 // Nur Spiele der nächsten 24 Stunden
      })
      return { success: true, data: basarGames.value }
    } catch (err) {
      error.value = err.message || 'Fehler beim Laden der Basar-Spiele'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchHistoryGames = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await GamesService.history()
      historyGames.value = response
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Fehler beim Laden der Historie'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const takeGame = async (matchId, refereeData) => {
    try {
      loading.value = true
      error.value = null
      const response = await GamesService.uebernehmen(matchId, refereeData)
      
      // Aktualisiere die lokalen Daten
      await fetchBasarGames()
      
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Fehler beim Übernehmen des Spiels'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearGames = () => {
    games.value = []
    basarGames.value = []
    historyGames.value = []
    error.value = null
  }

  // Getters
  const getGames = () => games.value
  const getBasarGames = () => basarGames.value
  const getHistoryGames = () => historyGames.value
  const getLoading = () => loading.value
  const getError = () => error.value

  return {
    // State
    games,
    basarGames,
    historyGames,
    loading,
    error,
    
    // Actions
    fetchGames,
    fetchBasarGames,
    fetchHistoryGames,
    takeGame,
    clearGames,
    
    // Getters
    getGames,
    getBasarGames,
    getHistoryGames,
    getLoading,
    getError
  }
}) 