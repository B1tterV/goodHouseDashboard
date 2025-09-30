export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  const { signIn, signOut, refresh, data, status } = useAuth()

  // Синхронизация состояния
  watchEffect(() => {
    isAuthenticated.value = status.value === 'authenticated'
    user.value = data.value?.user || null
  })

  const login = async (credentials: { login: string, password: string }, callbackUrl: string = '/') => {
    isLoading.value = true
    try {
      // В sidebase/nuxt-auth signIn автоматически обрабатывает токены
      const result = await signIn(credentials, {
        callbackUrl: callbackUrl,
        redirect: true // Автоматический редирект после успешного входа
      })

      return result
    } catch (error: any) {
      // Обработка ошибок аутентификации
      let errorMessage = 'Ошибка входа'

      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const refreshToken = async () => {
    try {
      await refresh()
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
    }
  }

  // Получение текущего access token
  const getAccessToken = () => {
    return data.value?.accessToken || null
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    logout,
    refreshToken,
    getAccessToken,
    status: readonly(status)
  }
})
