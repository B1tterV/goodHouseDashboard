<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  middleware: 'sidebase-auth'
})

const links = [[{
  label: 'Категории',
  icon: 'tabler:category',
  to: '/site-content',
  exact: true
}, {
  label: 'Подкатегории',
  icon: 'material-symbols:category-outline',
  to: '/site-content/subcategories'
}, {
  label: 'Продукты',
  icon: 'ic:baseline-production-quantity-limits',
  to: '/site-content/products'
}, {
  label: 'Характеристики',
  icon: 'ant-design:product-filled',
  to: '/site-content/characteristics'
}, {
  label: 'Фильтры',
  icon: 'material-symbols:filter-list',
  to: '/site-content/filters'
}, {
  label: 'Бренды',
  icon: 'fa7-brands:ioxhost',
  to: '/site-content/brands'
}, {
  label: 'Теги',
  icon: 'jam:tags',
  to: '/site-content/tags'
}]
] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-4' }">
    <template #header>
      <UDashboardNavbar title="Наполнение сайта">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
