<script setup lang="ts">
definePageMeta({
  layout: 'login',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
    navigateUnauthenticatedTo: '/login'
  }
})

// Состояние формы
const form = reactive({
  login: '',
  password: ''
})

// Состояние UI
const showPassword = ref(false)

// Уведомления
const toast = useToast()

// Аутентификация
const { login } = useAuthStore()

// Обработка входа
const handleLogin = async () => {
  if (!form.login || !form.password) {
    toast.add({
      title: 'Ошибка',
      description: 'Пожалуйста, заполните все поля',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error'
    })
    return
  }

  try {
    await login({
      login: form.login,
      password: form.password
    })

    toast.add({
      title: 'Успешный вход!',
      description: 'Добро пожаловать в систему',
      icon: 'i-heroicons-check-circle',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Login error:', error)

    toast.add({
      title: 'Ошибка входа',
      description: error.message || 'Неверный логин или пароль',
      icon: 'i-heroicons-x-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="flex justify-center h-dvh items-center">
    <div class="max-w-md w-full space-y-8">
      <!-- Логотип и заголовок -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-violet-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <img src="/images/logo.png" alt="">
        </div>
        <h2 class="mt-6 text-3xl font-bold">
          Добро пожаловать
        </h2>
        <p class="mt-2 text-sm">
          Войдите в свой аккаунт
        </p>
      </div>

      <!-- Форма входа -->
      <UCard class="shadow-xl border-0">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Поле email -->
          <div>
            <UFormField label="Логин" name="login" required>
              <UInput
                v-model="form.login"
                placeholder="JhonDoe"
                icon="i-heroicons-envelope"
                size="lg"
                class="w-full"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              />
            </UFormField>
          </div>

          <!-- Поле пароля -->
          <div>
            <UFormField label="Пароль" name="password" required>
              <UInput
                v-model="form.password"
                placeholder="Введите ваш пароль"
                icon="i-heroicons-lock-closed"
                :type="showPassword ? 'text' : 'password'"
                size="lg"
                class="w-full"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing>
                  <UButton
                    variant="ghost"
                    color="gray"
                    :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <!-- Кнопка входа -->
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            :loading="loading"
            block
            class="transition-all duration-200 hover:shadow-lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            </template>
            Войти
          </UButton>
        </form>
      </UCard>
    </div>

    <!-- Уведомления -->
    <UNotifications />
  </div>
</template>
