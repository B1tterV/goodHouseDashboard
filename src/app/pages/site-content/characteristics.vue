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
import { useCharacteristicsStore } from '@/stores/admin/characteristics'

// Resolved components
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const characteristicsStore = useCharacteristicsStore()

const columnVisibility = ref()
const rowSelection = ref({})

const isLoading = ref<boolean>(true)
const itemsList = ref<Category[] | null>(null)
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
  totalPages: 1
})

// Тип для характеристики
interface Characteristic {
  name: string
  label: string
  value: string
}

const getCharacteristics = async () => {
  isLoading.value = true
  try {
    const response = await characteristicsStore.getCharacteristics({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить бренды', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      itemsList.value = data.data

      pagination.value.pageSize = data.pagination.limit
      pagination.value.totalPages = data.pagination.total_pages
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить характеристики', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  pagination.value.pageIndex = newPage - 1
  getCharacteristics()
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
        editСharacteristic(row.original.id, row.original.name, row.original.characteristics)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить характеристику',
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
        try {
          const response = await characteristicsStore.deleteCharacteristic(row.original.id)

          if (response.status.value === 'success') {
            toast.add({
              title: 'Характеристика удалена',
              description: 'Характеристика успешно удалена'
            })
            await handlePageChange(1)
          } else {
            toast.add({
              title: 'Ошибка при удалении',
              description: 'Ошибка при удалении характеристики.'
            })
          }
        } catch {
          toast.add({
            title: 'Ошибка при удалении',
            description: 'Ошибка при удалении характеристики.'
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
  characteristics: [] as Characteristic[]
})

// Функция валидации ключа
const validateKey = (key: string): boolean => {
  if (!key) return true // Пустое поле - ок, будет проверено в основной валидации

  // Проверка: только английские буквы в нижнем регистре, цифры и подчеркивания
  const keyRegex = /^[a-z][a-z0-9_]*$/
  return keyRegex.test(key)
}

// Форматирование ключа в реальном времени
const formatKey = (index: number) => {
  const char = formState.value.characteristics[index]
  if (char.name) {
    // Удаляем пробелы, преобразуем в нижний регистр
    let formatted = char.name.toLowerCase().replace(/\s+/g, '_')

    // Удаляем все символы, кроме английских букв, цифр и подчеркиваний
    formatted = formatted.replace(/[^a-z0-9_]/g, '')

    // Убеждаемся, что ключ начинается с буквы
    if (formatted && !/^[a-z]/.test(formatted)) {
      formatted = 'key_' + formatted.replace(/^[^a-z]*/, '')
    }

    formState.value.characteristics[index].name = formatted
  }
}

// Добавление новой характеристики
const addCharacteristic = () => {
  formState.value.characteristics.push({
    name: '',
    label: '',
    value: ''
  })
}

// Удаление характеристики
const removeCharacteristic = (index: number) => {
  formState.value.characteristics.splice(index, 1)
}

// Очистка формы
const resetForm = () => {
  formState.value = {
    id: null,
    name: '',
    characteristics: [{ name: '', label: '', value: '' }] // Одно поле по умолчанию
  }
}

const validationForm = () => {
  if (!formState.value.name?.trim()) {
    toast.add({ title: 'Ошибка имени', description: 'Введите название шаблона характеристик', color: 'error' })
    return false
  }

  // Проверка характеристик
  for (const [index, char] of formState.value.characteristics.entries()) {
    if (!char.name?.trim()) {
      toast.add({ title: 'Ошибка', description: `Введите ключ для характеристики ${index + 1}`, color: 'error' })
      return false
    }

    // Валидация формата ключа
    if (!validateKey(char.name)) {
      toast.add({
        title: 'Ошибка формата ключа',
        description: `Ключ "${char.name}" должен содержать только английские буквы в нижнем регистре, цифры и подчеркивания. Пример: water_absorption`,
        color: 'error'
      })
      return false
    }

    if (!char.label?.trim()) {
      toast.add({ title: 'Ошибка', description: `Введите название для характеристики ${index + 1}`, color: 'error' })
      return false
    }
  }

  return true
}

const saveNewСharacteristic = async () => {
  try {
    // Валидация
    if (!validationForm()) return

    const payload = {
      name: formState.value.name,
      characteristics: formState.value.characteristics.filter(char =>
        char.name.trim() && char.label.trim()
      )
    }

    const response = await characteristicsStore.createCharacteristic(payload)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Новая характеристика успешно создана', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось создать характеристику', color: 'error' })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось создать характеристику',
      color: 'error'
    })
  }
}

const saveEditableСharacteristic = async () => {
  try {
    // Валидация
    if (!validationForm()) return

    const payload = {
      name: formState.value.name,
      characteristics: formState.value.characteristics.filter(char =>
        char.name.trim() && char.label.trim()
      )
    }

    const response = await characteristicsStore.changeCharacteristic(formState.value.id!, payload)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Характеристика успешно изменена', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось изменить характеристику', color: 'error' })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось изменить характеристику',
      color: 'error'
    })
  }
}

const editСharacteristic = (id: number, name: string, characteristics: Characteristic[]) => {
  formState.value.id = id
  formState.value.name = name
  formState.value.characteristics = characteristics && characteristics.length > 0
    ? characteristics
    : [{ name: '', label: '', value: '' }]

  isPopupOpen.value = true
}

const handleSaveCategory = async () => {
  if (formState.value.id) {
    await saveEditableСharacteristic()
  } else {
    await saveNewСharacteristic()
  }
}

// Инициализация формы с одним полем по умолчанию
onMounted(() => {
  resetForm()
  setTimeout(async () => {
    getCharacteristics()
  }, 1)
})
</script>

<template>
  <div>
    <UPageCard
      title="Характеристики"
      description="Шаблоны для характеристик продукта"
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
          label="Добавить характеристику"
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
      :data="itemsList"
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
      :title="formState.id ? 'Редактирование характеристики' : 'Создание характеристики'"
      @save="handleSaveCategory()"
      @close="resetForm()"
    >
      <template #body>
        <UForm :state="formState" class="flex flex-col gap-4">
          <!-- Название -->
          <UFormField label="Название шаблона" name="name" required>
            <UInput
              v-model="formState.name"
              placeholder="Введите название шаблона характеристик"
              class="w-full"
            />
          </UFormField>

          <!-- Характеристики -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-900">Характеристики</label>
              <UButton
                type="button"
                label="Добавить характеристику"
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-lucide-plus"
                @click="addCharacteristic"
              />
            </div>

            <div class="space-y-3">
              <div
                v-for="(char, index) in formState.characteristics"
                :key="index"
                class="flex items-start gap-2 p-1"
              >
                <!-- Ключ -->
                <UFormField
                  label="Ключ"
                  class="flex-1"
                  required
                  :error="char.name && !validateKey(char.name) ? 'Некорректный формат ключа' : undefined"
                >
                  <UInput
                    v-model="char.name"
                    placeholder="water_absorption"
                    class="w-full"
                    :ui="{
                      base: char.name && !validateKey(char.name) ? 'border-red-300' : ''
                    }"
                    @blur="formatKey(index)"
                    @input="formatKey(index)"
                  />
                </UFormField>

                <!-- Название -->
                <UFormField label="Название" class="flex-1" required>
                  <UInput
                    v-model="char.label"
                    placeholder="Водопоглощение, %"
                    class="w-full"
                  />
                </UFormField>

                <!-- Значение -->
                <UFormField label="Значение" class="flex-1">
                  <UInput
                    v-model="char.value"
                    placeholder="19 ± 2%"
                    class="w-full"
                  />
                </UFormField>

                <!-- Кнопка удаления -->
                <UButton
                  v-if="formState.characteristics.length > 1"
                  type="button"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  class="mt-6 shrink-0"
                  @click="removeCharacteristic(index)"
                />
              </div>
            </div>
          </div>
        </UForm>
      </template>
    </BasePopup>
  </div>
</template>
