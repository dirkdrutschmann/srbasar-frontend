import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import AuthService from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State mit localStorage Persistierung
  const user = useStorage('user', {})
  const isAdmin = ref(false)

  // Token Validierung
  const isTokenValid = computed(() => {
    if (!user.value || !user.value.token) return false
    
    // Prüfe expireDate falls vorhanden
    if (user.value.expireDate) {
      return Date.now() < user.value.expireDate
    }
    
    // Fallback: Prüfe ob Token vorhanden ist
    return !!user.value.token
  })

  // Authentifizierungsstatus basierend auf Token-Gültigkeit
  const isAuthenticated = computed(() => {
    return isTokenValid.value && user.value !== null
  })

  // Admin-Status basierend auf User-Rollen
  const isUserAdmin = computed(() => {
    if (!user.value || !user.value.role) return false
    return user.value.role === 'admin'
  })

  // Actions
  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials)
      if (response.success && response.data?.token) {
        const userData = {
          ...response.data.user,
          token: response.data.token,
          accessToken: response.data.token // Für Kompatibilität
        }
        user.value = userData
        isAdmin.value = userData.role === 'admin'
        return { success: true, data: userData }
      }
      return { success: false, error: response.message || 'Login fehlgeschlagen' }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login fehlgeschlagen' }
    }
  }

  const logout = () => {
    user.value = null
    isAdmin.value = false
  }

  const resetPassword = async (email) => {
    try {
      const response = await AuthService.reset(email)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Passwort-Reset fehlgeschlagen' }
    }
  }

  const setToken = async (token) => {
    if (!user.value) user.value = {}
    user.value.token = token
    user.value.accessToken = token // Für Kompatibilität
  }

  const setUser = async (userData) => {
    if (!user.value) user.value = {}
    user.value = { ...user.value, ...userData }
    isAdmin.value = userData.role === 'admin'
  }

  // Getters
  const getCurrentUser = () => user.value
  const getIsAuthenticated = () => isAuthenticated.value
  const getIsAdmin = () => isUserAdmin.value
  const getUserName = () => {
    if (!user.value) return 'Benutzer'
    return user.value.name || user.value.username || 'Benutzer'
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin: isUserAdmin,
    
    // Actions
    login,
    logout,
    resetPassword,
    setToken,
    setUser,
    
    // Getters
    getCurrentUser,
    getIsAuthenticated,
    getIsAdmin,
    getUserName
  }}) 