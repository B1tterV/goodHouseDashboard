<script setup lang="ts">
import { upperFirst } from 'scule'

// UI
import type { TableColumn } from '@nuxt/ui'

// Types
import type { Row } from '@tanstack/table-core'
import type { Category } from '~/types/category'

// Components
import BasePopup from '@/components/common/BasePopup.vue'

// Store
import { useTagsStore } from '@/stores/admin/tags'

// Resplved components
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const tagsStore = useTagsStore()

const columnVisibility = ref()
const rowSelection = ref({})

const isLoading = ref<boolean>(true)
const categoriesList = ref<Category[] | null>(null)
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
  totalPages: 1
})

const getTags = async () => {
  isLoading.value = true
  try {
    const response = await tagsStore.getTags({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить теги', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      categoriesList.value = data.data

      pagination.value.pageSize = data.pagination.limit
      pagination.value.totalPages = data.pagination.total_pages
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить теги', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  pagination.value.pageIndex = newPage - 1
  getTags()
}

function getRowItems(row: Row<Category>) {
  return [
    {
      type: 'label',
      label: 'Действия'
    },
    {
      type: 'separator'
    },
    {
      label: 'Редактировать',
      icon: 'material-symbols:edit-outline',
      onSelect() {
        editTag(row.original.id, row.original.name, row.original.value)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить тег',
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
        try {
          const response = await tagsStore.deleteTag(row.original.id)

          if (response.status.value === 'success') {
            toast.add({
              title: 'Категория удалена',
              description: 'Категория успешно удалена'
            })
            await handlePageChange(1)
          } else {
            toast.add({
              title: 'Ошибка при удалении',
              description: 'Ошибка при удалении категории.'
            })
          }
        } catch {
          toast.add({
            title: 'Ошибка при удалении',
            description: 'Ошибка при удалении категории.'
          })
        }
      }
    }
  ]
}

const columns: TableColumn<Category>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.name)
        ])
      ])
    }
  },
  {
    accessorKey: 'value',
    header: 'Значение',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.value)
        ])
      ])
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const isPopupOpen = ref<boolean>(false)
const formState = ref({
  id: null as number | null,
  name: '',
  value: ''
})

// Очистка формы
const resetForm = () => {
  formState.value = {
    id: null,
    name: '',
    value: ''
  }
}

const validationTagForm = () => {
  if (!formState.value.name?.trim()) {
    toast.add({ title: 'Ошибка имени', description: 'Введите название тега', color: 'error' })
    return false
  }

  // Проверка формата value (только латинские буквы, цифры, дефисы)
  const valueRegex = /^[a-zA-Z0-9-]+$/
  if (formState.value.value?.trim() && !valueRegex.test(formState.value.value)) {
    toast.add({ title: 'Ошибка Значения', description: 'Значение может содержать только латинские буквы, цифры и дефисы', color: 'error' })
    return false
  }

  return true
}

const saveNewTag = async () => {
  try {
    // Валидация
    if (!validationTagForm()) return

    const response = await tagsStore.createTag(formState.value.name, formState.value.value)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Новый тег успешно создан', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось создать тег', color: 'error' })
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось создать тег', color: 'error' })
  }
}

const saveEditableTag = async () => {
  try {
    // Валидация
    if (!validationTagForm()) return

    const response = await tagsStore.changeTag(formState.value.id, formState.value.name, formState.value.value)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Тег успешно изменен', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось изменить тег', color: 'error' })
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось изменить тег', color: 'error' })
  }
}

const editTag = (id: number, name: string, value: string) => {
  formState.value.id = id
  formState.value.name = name
  formState.value.value = value

  isPopupOpen.value = true
}

const handleSaveCategory = async () => {
  if (formState.value.id) {
    await saveEditableTag()
  } else {
    await saveNewTag()
  }
}

onMounted(() => {
  setTimeout(async () => {
    getTags()
  }, 1)
})
</script>

<template>
  <div>
    <UPageCard
      title="Теги"
      description="Управление тегами сайта"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton
          v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
          label="Удалить"
          color="error"
          variant="subtle"
          icon="i-lucide-trash"
          class="shrink-0 cursor-pointer"
        >
          <template #trailing>
            <UKbd>
              {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
            </UKbd>
          </template>
        </UButton>
        <UButton
          label="Добавить категорию"
          color="neutral"
          class="shrink-0 cursor-pointer"
          @click="isPopupOpen = true"
        />
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                },
                onSelect(e?: Event) {
                  e?.preventDefault()
                }
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Вид таблицы"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-settings-2"
          />
        </UDropdownMenu>
      </div>
    </UPageCard>

    <UTable
      ref="table"
      v-model:column-visibility="columnVisibility"
      v-model:row-selection="rowSelection"
      :data="categoriesList"
      :columns="columns"
      :loading="isLoading"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
      class="shrink-0"
    />

    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
      <div class="text-sm text-muted">
        Выбрано {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} из
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
      </div>

      <div class="flex items-center gap-1.5">
        <UPagination
          :default-page="pagination.pageIndex + 1"
          :items-per-page="pagination.pageSize"
          :total="pagination.totalPages"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <BasePopup
      v-model="isPopupOpen"
      title="Создание тега"
      @save="handleSaveCategory()"
      @close="resetForm()"
    >
      <template #body>
        <UForm :state="formState" class="flex flex-col gap-4">
          <!-- Название -->
          <UFormField label="Название" name="name" required>
            <UInput
              v-model="formState.name"
              placeholder="Новинка"
              class="w-full"
            />
          </UFormField>

          <!-- Slug -->
          <UFormField
            label="Значение"
            name="value"
            required
          >
            <UInput
              v-model="formState.value"
              placeholder="new"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </template>
    </BasePopup>
  </div>
</template>
