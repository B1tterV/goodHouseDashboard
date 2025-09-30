<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = [
  { label: "Красный", value: "red" },
  { label: "Оранжевый", value: "orange" },
  { label: "Янтарный", value: "amber" },
  { label: "Желтый", value: "yellow" },
  { label: "Лаймовый", value: "lime" },
  { label: "Зеленый", value: "green" },
  { label: "Изумрудный", value: "emerald" },
  { label: "Бирюзовый", value: "teal" },
  { label: "Голубой", value: "cyan" },
  { label: "Небесный", value: "sky" },
  { label: "Синий", value: "blue" },
  { label: "Индиго", value: "indigo" },
  { label: "Фиолетовый", value: "violet" },
  { label: "Пурпурный", value: "purple" },
  { label: "Фуксия", value: "fuchsia" },
  { label: "Розовый", value: "pink" },
  { label: "Розовый (оттенок)", value: "rose" }
]

const neutrals = [
  { label: "Сланцевый", value: "slate" },
  { label: "Серый", value: "gray" },
  { label: "Цинковый", value: "zinc" },
  { label: "Нейтральный", value: "neutral" },
  { label: "Каменный", value: "stone" }
]

const user = ref({
  name: 'Benjamin Canac',
  avatar: {
    src: 'https://github.com/benjamincanac.png',
    alt: 'Benjamin Canac'
  }
})

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar
}], [{
  label: 'Настройки',
  icon: 'i-lucide-settings',
  to: '/settings'
}], [{
  label: 'Цвета темы',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Текст',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color.label,
      chip: color.value,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color.value,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color.value
      }
    }))
  }, {
    label: 'Фон',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color.label,
      chip: color.value === 'neutral' ? 'old-neutral' : color.value,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color.value,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color.value
      }
    }))
  }]
}, {
  label: 'Тема',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()

      colorMode.preference = 'light'
    }
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    }
  }]
}], [{
  label: 'Выход',
  icon: 'i-lucide-log-out'
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>
</template>
