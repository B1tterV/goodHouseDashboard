// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiHost: process.env.NUXT_PUBLIC_API_HOST
    }
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  devServer: {
    port: 3001
  },

  compatibilityDate: '2024-07-11',

  auth: {
    originEnvKey: 'NUXT_PUBLIC_API_HOST',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/auth/login', method: 'post' },
        signOut: { path: '/auth/logout', method: 'post' },
        signUp: false,
        getSession: { path: '/auth/users/me', method: 'get' }
      },
      token: {
        signInResponseTokenPointer: '/access_token',
        type: 'Bearer',
        headerName: 'Authorization',
        maxAgeInSeconds: 1800, // 30 минут
        sameSiteAttribute: 'lax',
        secureCookieAttribute: false,
        httpOnlyCookieAttribute: false
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: '/auth/refresh', method: 'post' },
        refreshOnlyToken: false,
        token: {
          signInResponseRefreshTokenPointer: '/refresh_token',
          refreshResponseTokenPointer: '',
          refreshRequestTokenPointer: '/refresh_token',
          maxAgeInSeconds: 2_505_600, // 29 дней
          sameSiteAttribute: 'lax',
          secureCookieAttribute: false,
          httpOnlyCookieAttribute: false
        }
      },
      pages: {
        login: '/login'
      }
    },
    session: {
      enableRefreshPeriodically: 60000, // ✅ Обновлять каждую минуту
      enableRefreshOnWindowFocus: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }

})
