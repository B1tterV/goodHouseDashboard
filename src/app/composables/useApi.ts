import { defu } from 'defu'
import type { UseFetchOptions } from '#app'
import { useFetch } from '#imports'

export function useApi<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {},
  requestHeaders: any = {},
  noCache: boolean = false
) {
  const config = useRuntimeConfig()
  //   const router = useRouter()
  const { token } = useAuth()

  if (!config.public.apiHost) {
    throw createError({
      statusCode: 523,
      statusMessage: 'Не указан url для API в конфигурации окружения'
    })
  }

  const headers: any = {
    'X-AD-OS': 'Web',
    'X-Ad-Locale': 'ru',
    ...requestHeaders
  }

  if (token.value) headers['Authorization'] = token.value

  const apiUrl = config.public.apiHost

  const defaults: UseFetchOptions<T> = {
    baseURL: apiUrl,
    headers,

    // Управление кэшированием Nuxt
    key: noCache ? `${typeof url === 'string' ? url : url()}-${Date.now()}` : undefined,
    getCachedData: noCache ? () => undefined : undefined,

    onResponse(_ctx) {
      // Здесь можно сделать что-нибудь с ответом
    },

    async onResponseError(ctx) {
      // Если ошибка 401 - неавторизован
      if (ctx.response.status === 401) {
        const { refresh } = useAuth()
        try {
          await refresh()
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          const { signOut } = useAuth()
          await signOut({ callbackUrl: '/login' })
        }
      }
    }
  }

  const params = defu(options, defaults)

  return useFetch(url, params)
}
