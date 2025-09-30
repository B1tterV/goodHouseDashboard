<script setup lang="ts">
import { upperFirst } from 'scule'

// UI
import type { TableColumn } from '@nuxt/ui'

// Types
import type { Row } from '@tanstack/table-core'
import type { Category } from '~/types/category'
import type { Subcategory } from '~/types/subcategory'

// Components
import BasePopup from '@/components/common/BasePopup.vue'

// Store
import { useSubcategoriesStore } from '@/stores/admin/subcategories'
import { useCategoriesStore } from '@/stores/admin/categories'

// Resplved components
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const subcategoriesStore = useSubcategoriesStore()
const categoriesStore = useCategoriesStore()

const columnVisibility = ref()
const rowSelection = ref({})

// Подкатегория
const isLoading = ref<boolean>(true)
const subcategoriesList = ref<Subcategory[] | null>(null)
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
  totalPages: 1
})

// Категория
const categoriesLoading = ref<boolean>(false)
const categoriesList = ref<Category[]>([])
const categoriesSearchQuery = ref<string>('')

const getSubcategories = async () => {
  isLoading.value = true
  try {
    const response = await subcategoriesStore.getSubcategories({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить подкатегории', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      subcategoriesList.value = data.data

      pagination.value.pageSize = data.pagination.limit
      pagination.value.totalPages = data.pagination.total_pages
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить подкатегории', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const getCategories = async (loadMore: boolean = false) => {
  if (categoriesLoading.value && !loadMore) return

  categoriesLoading.value = true
  try {
    const response = await categoriesStore.getCategories({
      page: 1,
      limit: 10,
      ...(categoriesSearchQuery.value && { search: categoriesSearchQuery.value })
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить категории', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value

      categoriesList.value = data.data.map((item) => {
        const newItem = { ...item }
        delete newItem.icon
        return newItem
      })
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить категории', color: 'error' })
  } finally {
    categoriesLoading.value = false
  }
}

// Функция для обработки поиска категорий
const handleCategorySearch = async (query: string) => {
  categoriesSearchQuery.value = query
  // Дебаунс поиска - ждем 300ms после последнего ввода
  setTimeout(() => {
    getCategories(false)
  }, 300)
}

const handlePageChange = (newPage: number) => {
  pagination.value.pageIndex = newPage - 1
  getSubcategories()
}

function getRowItems(row: Row<Subcategory>) {
  return [
    {
      type: 'label',
      label: 'Действия'
    },
    {
      label: 'Перейти на страницу подкатегории',
      icon: 'material-symbols-light:open-jam-rounded',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Customer ID copied to clipboard'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Редактировать',
      icon: 'material-symbols:edit-outline',
      onSelect() {
        editSubcategory(row.original.id, row.original.text, row.original.slug, row.original.image)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить подкатегорию',
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
        try {
          const response = await subcategoriesStore.deleteSubcategory(row.original.id)

          if (response.status.value === 'success') {
            toast.add({
              title: 'Подкатегория удалена',
              description: 'Подкатегория успешно удалена'
            })
            await handlePageChange(1)
          } else {
            toast.add({
              title: 'Ошибка при удалении',
              description: 'Ошибка при удалении подкатегории.'
            })
          }
        } catch (e) {
          console.log(e)
          toast.add({
            title: 'Ошибка при удалении',
            description: 'Ошибка при удалении подкатегории.'
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
    accessorKey: 'text',
    header: 'Название',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.image,
          size: 'md',
          alt: row.original.text,
          class: 'p-1'
        }),
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.text)
        ])
      ])
    }
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.slug)
        ])
      ])
    }
  },
  {
    accessorKey: 'category_name',
    header: 'Категория',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.category_name)
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
  slug: '',
  category: null as Category | null,
  brand: null,
  image: null as File | null
})

const imagePreview = ref<string | null>(null)

// Обработка загрузки изображения
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // Проверка типа файла
    if (!file.type.includes('svg') && !file.type.includes('png')) {
      alert('Пожалуйста, выберите SVG или PNG файл')
      return
    }

    formState.value.image = file

    // Создание превью
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Очистка формы
const resetForm = () => {
  formState.value = {
    id: null,
    name: '',
    slug: '',
    category: null,
    brand: null,
    image: null
  }
  imagePreview.value = null
  categoriesSearchQuery.value = ''
}

const validationSubcategoryForm = () => {
  if (!formState.value.name?.trim()) {
    toast.add({ title: 'Ошибка имени', description: 'Введите название подкатегории', color: 'error' })
    return false
  }

  if (!formState.value.category) {
    toast.add({ title: 'Ошибка категории', description: 'Выберите категорию', color: 'error' })
    return false
  }

  if (!formState.value.image && !formState.value.id) {
    toast.add({ title: 'Ошибка картинки', description: 'Выберите изображение', color: 'error' })
    return false
  }

  // Проверка формата slug (только латинские буквы, цифры, дефисы)
  const slugRegex = /^[a-zA-Z0-9-]+$/
  if (formState.value.slug?.trim() && !slugRegex.test(formState.value.slug)) {
    toast.add({ title: 'Ошибка Slug', description: 'Slug может содержать только латинские буквы, цифры и дефисы', color: 'error' })
    return false
  }

  return true
}

const saveNewSubcategory = async () => {
  try {
    // Валидация
    if (!validationSubcategoryForm()) return

    const formdata = new FormData()
    formdata.append('image', formState.value.image as File)
    formdata.append('slug', formState.value.slug.trim())
    formdata.append('text', formState.value.name)
    formdata.append('category_id', formState.value.category)

    const response = await subcategoriesStore.createSubcategory(formdata)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Новая подкатегория успешно создана', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось создать подкатегорию', color: 'error' })
    }
  } catch (e) {
    console.log(e)
    toast.add({ title: 'Ошибка', description: 'Не удалось создать подкатегорию', color: 'error' })
  }
}

const saveEditableCategory = async () => {
  try {
    // Валидация
    if (!validationSubcategoryForm()) return

    const formdata = new FormData()
    if (formState.value.image)
      formdata.append('image', formState.value.image as File)
    formdata.append('slug', formState.value.slug.trim())
    formdata.append('text', formState.value.name)
    formdata.append('category_id', formState.value.category)

    const response = await subcategoriesStore.changeSubcategory(formState.value.id, formdata)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Подкатегория успешно изменена', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось изменить подкатегорию', color: 'error' })
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось изменить подкатегорию', color: 'error' })
  }
}

const editSubcategory = (id: number, name: string, slug: string, image: string) => {
  formState.value.id = id
  formState.value.name = name
  formState.value.slug = slug
  imagePreview.value = image

  openPopup()
}

const handleSaveCategory = async () => {
  if (formState.value.id) {
    await saveEditableCategory()
  } else {
    await saveNewSubcategory()
  }
}

const openPopup = async () => {
  await getCategories()
  isPopupOpen.value = true
}

onMounted(() => {
  setTimeout(async () => {
    getSubcategories()
  }, 1)
})
</script>

<template>
  <div>
    <UPageCard
      title="Подкатегории"
      description="Управление подкатегорями сайта"
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
          @click="openPopup();"
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
      :data="subcategoriesList"
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
      title="Создание категории"
      @save="handleSaveCategory()"
      @close="resetForm()"
    >
      <template #body>
        <UForm :state="formState" class="flex flex-col gap-4">
          <!-- Название -->
          <UFormField label="Название" name="name" required>
            <UInput
              v-model="formState.name"
              placeholder="Введите название категории"
              class="w-full"
            />
          </UFormField>

          <!-- Slug -->
          <UFormField
            label="Ссылка на категорию (Slug)"
            name="slug"
            help="Если оставить пустым то сгенирируется автоматически по имени (не рекомендуется для seo)"
          >
            <UInput
              v-model="formState.slug"
              placeholder="test"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Категория" name="category" required>
            <UInputMenu
              v-model="formState.category"
              :items="categoriesList"
              :ui="{
                trailingIcon: 'none'
              }"
              class="w-full"
              value-key="id"
              label-key="text"
              placeholder="Выберите категорию"
              required
              @update:search-term="handleCategorySearch($event)"
            />
          </UFormField>

          <!-- Картинка -->
          <UFormField
            label="Изображение"
            name="image"
            help="Только SVG или PNG файлы"
            required
          >
            <div v-if="imagePreview" class="mb-2">
              <img :src="imagePreview" alt="Preview" class="max-w-10 max-h-10 w-10 h-10 p-1 object-contain border rounded">
            </div>
            <UInput
              type="file"
              accept=".svg,.png"
              color="neutral"
              variant="subtle"
              class="w-full"
              @change="handleImageUpload"
            />
          </UFormField>
        </UForm>
      </template>
    </BasePopup>
  </div>
</template>
