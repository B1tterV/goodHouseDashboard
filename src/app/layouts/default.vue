<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [[
  {
    label: 'Главная',
    icon: 'i-lucide-house',
    to: '/',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Почта',
    icon: 'i-lucide-inbox',
    to: '/inbox',
    badge: '4',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Наполнение сайта',
    to: '/site-content',
    icon: 'streamline-plump:browser-website-1-remix',
    defaultOpen: true,
    type: 'trigger',
    children: [{
      label: 'Категории',
      to: '/site-content',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Подкатегории',
      to: '/site-content/subcategories',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Продукты',
      to: '/site-content/products',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Фильтры',
      to: '/site-content/filters',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Бренды',
      to: '/site-content/brands',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Теги',
      to: '/site-content/tags',
      onSelect: () => {
        open.value = false
      }
    }]
  }, {
    label: 'Настройки',
    to: '/settings',
    icon: 'i-lucide-settings',
    defaultOpen: true,
    type: 'trigger',
    children: [{
      label: 'Профиль',
      to: '/settings',
      exact: true,
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Команда',
      to: '/settings/members',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Безопасность',
      to: '/settings/security',
      onSelect: () => {
        open.value = false
      }
    }]
  }
]] satisfies NavigationMenuItem[][]

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Мы используем сторонние файлы cookie для улучшения вашего взаимодействия с нашим веб-сайтом.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Принять',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Отклонить',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <img
          src="/images/logo.png"
          alt="good house"
          width="32"
          height="32"
        >
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
