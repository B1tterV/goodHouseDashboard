<script setup lang="ts">
import { upperFirst } from 'scule'

// UI
import type { TableColumn } from '@nuxt/ui'

// Types
import type { Row } from '@tanstack/table-core'
import type { Product } from '~/types/product'
import type { Subcategory } from '~/types/subcategory'
import type { Brand } from '~/types/brand'

// Components
import BasePopup from '@/components/common/BasePopup.vue'

// Store
import { useProductsStore } from '@/stores/admin/products'
import { useSubcategoriesStore } from '@/stores/admin/subcategories'
import { useBrandsStore } from '@/stores/admin/brands'
import { useCharacteristicsStore } from '@/stores/admin/characteristics'
import { useTagsStore } from '@/stores/admin/tags'

// Resolved components
const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')
const UInputMenu = resolveComponent('UInputMenu')

const toast = useToast()
const table = useTemplateRef('table')
const productsStore = useProductsStore()
const subcategoriesStore = useSubcategoriesStore()
const brandsStore = useBrandsStore()
const characteristicsStore = useCharacteristicsStore()
const tagsStore = useTagsStore()

const columnVisibility = ref()
const rowSelection = ref({})

// Продукты
const isLoading = ref<boolean>(true)
const productsList = ref<Product[] | null>(null)
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
  totalPages: 1
})

// Подкатегории
const subcategoriesLoading = ref<boolean>(false)
const subcategoriesList = ref<Subcategory[]>([])
const subcategoriesSearchQuery = ref<string>('')

// Бренды
const brandsLoading = ref<boolean>(false)
const brandsList = ref<Brand[]>([])
const brandsSearchQuery = ref<string>('')

// Теги
const tagsLoading = ref<boolean>(false)
const tagsList = ref<Tag[]>([])
const tagsSearchQuery = ref<string>('')

// Шаблоны характеристик
const characteristicsLoading = ref<boolean>(false)
const characteristicsTemplatesList = ref<any[]>([])
const characteristicsSearchQuery = ref<string>('')

// Тип для характеристики
interface Characteristic {
  name: string
  label: string
  value: string
}

// Получение подкатегорий
const getSubcategories = async (loadMore: boolean = false) => {
  if (subcategoriesLoading.value && !loadMore) return

  subcategoriesLoading.value = true
  try {
    const response = await subcategoriesStore.getSubcategories({
      page: 1,
      limit: 10,
      ...(subcategoriesSearchQuery.value && { search: subcategoriesSearchQuery.value })
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить подкатегории', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      subcategoriesList.value = data.items || data.data || []
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить подкатегории', color: 'error' })
  } finally {
    subcategoriesLoading.value = false
  }
}

// Получение брендов
const getBrands = async (loadMore: boolean = false) => {
  if (brandsLoading.value && !loadMore) return

  brandsLoading.value = true
  try {
    const response = await brandsStore.getBrands({
      page: 1,
      limit: 10,
      ...(brandsSearchQuery.value && { search: brandsSearchQuery.value })
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить бренды', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      brandsList.value = data.items || data.data || []
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить бренды', color: 'error' })
  } finally {
    brandsLoading.value = false
  }
}

// Получение тегов
const getTags = async (loadMore: boolean = false) => {
  if (tagsLoading.value && !loadMore) return

  tagsLoading.value = true
  try {
    const response = await tagsStore.getTags({
      page: 1,
      limit: 100,
      ...(tagsSearchQuery.value && { search: tagsSearchQuery.value })
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить теги', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      tagsList.value = data.items || data.data || []
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить теги', color: 'error' })
  } finally {
    tagsLoading.value = false
  }
}

// Обработка поиска тегов
const handleTagsSearch = async (query: string) => {
  tagsSearchQuery.value = query
  setTimeout(() => {
    getTags(false)
  }, 300)
}

// Получение шаблонов характеристик
const getCharacteristicsTemplates = async (loadMore: boolean = false) => {
  if (characteristicsLoading.value && !loadMore) return

  characteristicsLoading.value = true
  try {
    const response = await characteristicsStore.getCharacteristics({
      page: 1,
      limit: 10,
      ...(characteristicsSearchQuery.value && { search: characteristicsSearchQuery.value })
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить шаблоны характеристик', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      characteristicsTemplatesList.value = data.items || data.data || []
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить шаблоны характеристик', color: 'error' })
  } finally {
    characteristicsLoading.value = false
  }
}

// Функции для обработки поиска
const handleSubcategorySearch = async (query: string) => {
  subcategoriesSearchQuery.value = query
  setTimeout(() => {
    getSubcategories(false)
  }, 300)
}

const handleBrandSearch = async (query: string) => {
  brandsSearchQuery.value = query
  setTimeout(() => {
    getBrands(false)
  }, 300)
}

const handleCharacteristicsSearch = async (query: string) => {
  characteristicsSearchQuery.value = query
  setTimeout(() => {
    getCharacteristicsTemplates(false)
  }, 300)
}

// Загрузка характеристик из шаблона
const loadCharacteristicsFromTemplate = (templateId: number) => {
  const template = characteristicsTemplatesList.value.find(t => t.id === templateId)
  if (template && template.characteristics) {
    formState.value.characteristics = template.characteristics.map((char: any) => ({
      name: char.name,
      label: char.label,
      value: char.value || ''
    }))
    toast.add({
      title: 'Шаблон загружен',
      description: `Характеристики из шаблона "${template.name}" загружены`,
      color: 'success'
    })
  }
}

const getProducts = async () => {
  isLoading.value = true
  try {
    const response = await productsStore.getProducts({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    })

    if (response.status.value === 'error') {
      toast.add({ title: 'Ошибка', description: 'Не удалось получить продукты', color: 'error' })
      return
    }

    if (response.data.value) {
      const data = response.data.value
      productsList.value = data.items

      pagination.value.pageSize = data.size
      pagination.value.totalPages = data.pages
    }
  } catch {
    toast.add({ title: 'Ошибка', description: 'Не удалось получить продукты', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  pagination.value.pageIndex = newPage - 1
  getProducts()
}

function getRowItems(row: Row<Product>) {
  return [
    {
      type: 'label',
      label: 'Действия'
    },
    {
      label: 'Перейти на страницу продукта',
      icon: 'material-symbols-light:open-jam-rounded',
      onSelect() {
        const productUrl = `${window.location.origin}/products/${row.original.slug}`
        window.open(productUrl, '_blank')
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Редактировать',
      icon: 'material-symbols:edit-outline',
      onSelect() {
        editProduct(row.original)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить продукт',
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
        try {
          const response = await productsStore.deleteProduct(row.original.id)

          if (response.status.value === 'success') {
            toast.add({
              title: 'Продукт удален',
              description: 'Продукт успешно удален'
            })
            await handlePageChange(1)
          } else {
            toast.add({
              title: 'Ошибка при удалении',
              description: 'Ошибка при удалении продукта.'
            })
          }
        } catch (e) {
          console.log(e)
          toast.add({
            title: 'Ошибка при удалении',
            description: 'Ошибка при удалении продукта.'
          })
        }
      }
    }
  ]
}

const columns: TableColumn<Product>[] = [
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
          src: row.original.images?.[0],
          size: 'md',
          alt: row.original.text,
          class: 'p-1'
        }),
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, row.original.text),
          h('p', { class: 'text-sm text-gray-500' }, `Арт: ${row.original.article || '—'}`)
        ])
      ])
    }
  },
  {
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => {
      const originalPrice = row.original.price
      const discount = row.original.discount
      const finalPrice = discount ? originalPrice * (1 - discount / 100) : originalPrice

      return h('div', { class: 'flex flex-col' }, [
        discount ? h('p', { class: 'text-sm text-gray-500 line-through' }, `${originalPrice} ₽`) : null,
        h('p', { class: `font-medium ${discount ? 'text-green-600' : 'text-highlighted'}` },
          `${finalPrice.toFixed(2)} ₽`),
        discount ? h('p', { class: 'text-xs text-red-500' }, `-${discount}%`) : null
      ])
    }
  },
  {
    accessorKey: 'in_stock',
    header: 'В наличии',
    cell: ({ row }) => {
      return h('div', {
        class: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.original.in_stock
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`
      }, row.original.in_stock ? 'Да' : 'Нет')
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
  text: '',
  article: '',
  price: 0,
  discount: 0,
  slug: '',
  in_stock: true,
  small_description: '',
  full_description: '',
  subcategory_id: null as number | null,
  brand_id: null as number | null,
  tag_ids: [] as number[],
  characteristics: [] as Characteristic[],
  images: [] as File[]
})

const imagePreviews = ref<string[]>([])

// Функция валидации ключа
const validateKey = (key: string): boolean => {
  if (!key) return true
  const keyRegex = /^[a-z][a-z0-9_]*$/
  return keyRegex.test(key)
}

// Форматирование ключа в реальном времени
const formatKey = (index: number) => {
  const char = formState.value.characteristics[index]
  if (char.name) {
    let formatted = char.name.toLowerCase().replace(/\s+/g, '_')
    formatted = formatted.replace(/[^a-z0-9_]/g, '')
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

// Обработка загрузки изображений
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)

    // Проверка общего количества изображений
    const totalImages = formState.value.images.length + files.length
    if (totalImages > 15) {
      toast.add({
        title: 'Ошибка',
        description: 'Максимум 15 изображений. Вы пытаетесь загрузить слишком много файлов.',
        color: 'error'
      })
      return
    }

    files.forEach((file) => {
      // Проверка типа файла
      if (!file.type.includes('image')) {
        toast.add({ title: 'Ошибка', description: 'Пожалуйста, выберите только изображения', color: 'error' })
        return
      }

      formState.value.images.push(file)

      // Создание превью
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })

    // Сброс значения input чтобы можно было выбрать те же файлы снова
    input.value = ''
  }
}

// Удаление изображения
const removeImage = (index: number) => {
  formState.value.images.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

// Очистка формы
const resetForm = () => {
  formState.value = {
    id: null,
    text: '',
    article: '',
    price: 0,
    discount: 0,
    slug: '',
    in_stock: true,
    small_description: '',
    full_description: '',
    subcategory_id: null,
    brand_id: null,
    tag_ids: [], // Добавлено
    characteristics: [{ name: '', label: '', value: '' }],
    images: []
  }
  imagePreviews.value = []
  subcategoriesSearchQuery.value = ''
  brandsSearchQuery.value = ''
  tagsSearchQuery.value = '' // Добавлено
  characteristicsSearchQuery.value = ''
}

const validationForm = () => {
  if (!formState.value.text?.trim()) {
    toast.add({ title: 'Ошибка', description: 'Введите название продукта', color: 'error' })
    return false
  }

  if (!formState.value.subcategory_id) {
    toast.add({ title: 'Ошибка', description: 'Выберите подкатегорию', color: 'error' })
    return false
  }

  // Валидация изображений
  if (formState.value.images.length === 0 && !formState.value.id) {
    toast.add({ title: 'Ошибка', description: 'Добавьте хотя бы одно изображение', color: 'error' })
    return false
  }

  if (formState.value.images.length > 15) {
    toast.add({ title: 'Ошибка', description: 'Максимум 15 изображений', color: 'error' })
    return false
  }

  if (formState.value.price <= 0) {
    toast.add({ title: 'Ошибка', description: 'Цена должна быть больше 0', color: 'error' })
    return false
  }

  // Проверка характеристик
  for (const [index, char] of formState.value.characteristics.entries()) {
    if (!char.name?.trim()) {
      toast.add({ title: 'Ошибка', description: `Введите ключ для характеристики ${index + 1}`, color: 'error' })
      return false
    }

    if (!validateKey(char.name)) {
      toast.add({
        title: 'Ошибка формата ключа',
        description: `Ключ "${char.name}" должен содержать только английские буквы в нижнем регистре, цифры и подчеркивания`,
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

const saveNewProduct = async () => {
  try {
    if (!validationForm()) return

    const formdata = new FormData()
    formdata.append('text', formState.value.text)
    formdata.append('price', formState.value.price.toString())
    formdata.append('subcategory_id', formState.value.subcategory_id!.toString())
    formdata.append('in_stock', formState.value.in_stock.toString())

    if (formState.value.article) formdata.append('article', formState.value.article)
    if (formState.value.slug) formdata.append('slug', formState.value.slug)
    if (formState.value.discount) formdata.append('discount', formState.value.discount.toString())
    if (formState.value.brand_id) formdata.append('brand_id', formState.value.brand_id.toString())
    if (formState.value.small_description) formdata.append('small_description', formState.value.small_description)
    if (formState.value.full_description) formdata.append('full_description', formState.value.full_description)

    // Добавляем теги
    if (formState.value.tag_ids.length > 0) {
      formdata.append('tag_ids', JSON.stringify(formState.value.tag_ids))
    }

    // Добавляем характеристики
    if (formState.value.characteristics.length > 0) {
      formdata.append('characteristics', JSON.stringify(
        formState.value.characteristics.filter(char => char.name.trim() && char.label.trim())
      ))
    }

    // Добавляем изображения как массив
    formState.value.images.forEach((image) => {
      formdata.append('images', image)
    })

    const response = await productsStore.createProduct(formdata)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Новый продукт успешно создан', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось создать продукт', color: 'error' })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось создать продукт',
      color: 'error'
    })
  }
}

const saveEditableProduct = async () => {
  try {
    if (!validationForm()) return

    const formdata = new FormData()
    formdata.append('text', formState.value.text)
    formdata.append('price', formState.value.price.toString())
    formdata.append('subcategory_id', formState.value.subcategory_id!.toString())
    formdata.append('in_stock', formState.value.in_stock.toString())
    if (formState.value.small_description !== undefined) formdata.append('small_description', formState.value.small_description)
    if (formState.value.full_description !== undefined) formdata.append('full_description', formState.value.full_description)

    if (formState.value.article) formdata.append('article', formState.value.article)
    if (formState.value.slug) formdata.append('slug', formState.value.slug)
    if (formState.value.discount) formdata.append('discount', formState.value.discount.toString())
    if (formState.value.brand_id) formdata.append('brand_id', formState.value.brand_id.toString())

    if (formState.value.tag_ids.length > 0) {
      formdata.append('tag_ids', JSON.stringify(formState.value.tag_ids))
    }

    // Добавляем характеристики
    if (formState.value.characteristics.length > 0) {
      formdata.append('characteristics', JSON.stringify(
        formState.value.characteristics.filter(char => char.name.trim() && char.label.trim())
      ))
    }

    // Добавляем новые изображения как массив
    formState.value.images.forEach((image) => {
      formdata.append('images', image)
    })

    const response = await productsStore.changeProduct(formState.value.id!, formdata)

    if (response.status.value === 'success') {
      toast.add({ title: 'Успех', description: 'Продукт успешно изменен', color: 'success' })
      isPopupOpen.value = false
      resetForm()
      await handlePageChange(1)
    } else {
      toast.add({ title: 'Ошибка', description: 'Не удалось изменить продукт', color: 'error' })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось изменить продукт',
      color: 'error'
    })
  }
}

const editProduct = (product: Product) => {
  formState.value.id = product.id
  formState.value.text = product.text
  formState.value.article = product.article || ''
  formState.value.price = product.price
  formState.value.discount = product.discount || 0
  formState.value.slug = product.slug || ''
  formState.value.in_stock = product.in_stock
  formState.value.small_description = product.small_description || ''
  formState.value.full_description = product.full_description || ''
  formState.value.subcategory_id = product.subcategory_id
  formState.value.brand_id = product.brand_id
  formState.value.tag_ids = product.tags ? product.tags.map(tag => tag.id) : []
  formState.value.characteristics = product.characteristics && product.characteristics.length > 0
    ? product.characteristics
    : [{ name: '', label: '', value: '' }]

  // Загружаем превью существующих изображений
  if (product.images && product.images.length > 0) {
    imagePreviews.value = [...product.images]
  }

  openPopup()
}

const handleSaveProduct = async () => {
  if (formState.value.id) {
    await saveEditableProduct()
  } else {
    await saveNewProduct()
  }
}

const openPopup = async () => {
  await Promise.all([
    getSubcategories(),
    getBrands(),
    getTags(), // Добавлено
    getCharacteristicsTemplates()
  ])
  isPopupOpen.value = true
}

onMounted(() => {
  setTimeout(async () => {
    getProducts()
  }, 1)
})
</script>

<template>
  <div>
    <UPageCard
      title="Продукты"
      description="Управление продуктами сайта"
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
          label="Добавить продукт"
          color="neutral"
          class="shrink-0 cursor-pointer"
          @click="openPopup()"
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
      :data="productsList"
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
      :title="formState.id ? 'Редактирование продукта' : 'Создание продукта'"
      @save="handleSaveProduct()"
      @close="resetForm()"
    >
      <template #body>
        <UForm :state="formState" class="flex flex-col gap-4">
          <!-- Основная информация -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Название -->
            <UFormField
              label="Название продукта"
              name="text"
              required
              class="md:col-span-2"
            >
              <UInput
                v-model="formState.text"
                placeholder="Введите название продукта"
                class="w-full"
              />
            </UFormField>

            <!-- Краткое описание -->
            <UFormField
              label="Краткое описание"
              name="small_description"
              class="md:col-span-2"
            >
              <UTextarea
                v-model="formState.small_description"
                placeholder="Введите краткое описание продукта"
                class="w-full"
                :rows="3"
              />
            </UFormField>

            <!-- Полное описание -->
            <UFormField
              label="Полное описание"
              name="full_description"
              class="md:col-span-2"
            >
              <UTextarea
                v-model="formState.full_description"
                placeholder="Введите полное описание продукта (сохраняются все отступы и форматирование)"
                class="w-full"
                :rows="6"
              />
            </UFormField>

            <!-- Артикул -->
            <UFormField label="Артикул" name="article">
              <UInput
                v-model="formState.article"
                placeholder="Введите артикул"
                class="w-full"
              />
            </UFormField>

            <!-- Цена -->
            <UFormField label="Цена" name="price" required>
              <UInput
                v-model="formState.price"
                type="number"
                placeholder="0.00"
                class="w-full"
              />
            </UFormField>

            <!-- Скидка -->
            <UFormField label="Скидка (%)" name="discount">
              <UInput
                v-model="formState.discount"
                type="number"
                placeholder="0"
                min="0"
                max="100"
                class="w-full"
              />
            </UFormField>

            <!-- Slug -->
            <UFormField label="Slug" name="slug">
              <UInput
                v-model="formState.slug"
                placeholder="product-slug"
                class="w-full"
              />
            </UFormField>

            <!-- В наличии -->
            <UFormField label="В наличии" name="in_stock">
              <UCheckbox
                v-model="formState.in_stock"
                label="Продукт в наличии"
              />
            </UFormField>
          </div>

          <!-- Категории и бренды -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Подкатегория -->
            <UFormField label="Подкатегория" name="subcategory_id" required>
              <UInputMenu
                v-model="formState.subcategory_id"
                :items="subcategoriesList"
                :loading="subcategoriesLoading"
                value-key="id"
                label-key="text"
                placeholder="Выберите подкатегорию"
                class="w-full"
                @update:search-term="handleSubcategorySearch"
              />
            </UFormField>

            <!-- Бренд -->
            <UFormField label="Бренд" name="brand_id">
              <UInputMenu
                v-model="formState.brand_id"
                :items="brandsList"
                :loading="brandsLoading"
                value-key="id"
                label-key="name"
                placeholder="Выберите бренд"
                class="w-full"
                @update:search-term="handleBrandSearch"
              />
            </UFormField>

            <UFormField label="Теги" name="tag_ids">
              <UInputMenu
                v-model="formState.tag_ids"
                :items="tagsList"
                :loading="tagsLoading"
                value-key="id"
                label-key="name"
                placeholder="Выберите теги"
                multiple
                class="w-full"
                @update:search-term="handleTagsSearch"
              />
            </UFormField>
          </div>

          <!-- Шаблон характеристик -->
          <UFormField label="Загрузить из шаблона характеристик" name="characteristics_template">
            <UInputMenu
              :items="characteristicsTemplatesList"
              :loading="characteristicsLoading"
              value-key="id"
              label-key="name"
              placeholder="Выберите шаблон характеристик"
              class="w-full"
              @update:search-term="handleCharacteristicsSearch"
              @update:model-value="loadCharacteristicsFromTemplate"
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
                    placeholder="Цвет"
                    class="w-full"
                  />
                </UFormField>

                <!-- Значение -->
                <UFormField label="Значение" class="flex-1">
                  <UInput
                    v-model="char.value"
                    placeholder="Красный"
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

          <!-- Изображения -->
          <UFormField
            label="Изображения"
            name="images"
            :help="`Загружено: ${formState.images.length}/15. Минимум 1 изображение.`"
            required
          >
            <div v-if="imagePreviews.length > 0" class="flex flex-wrap gap-2 mb-2">
              <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                <img :src="preview" alt="Preview" class="w-20 h-20 object-cover border rounded">
                <UButton
                  type="button"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="xs"
                  class="absolute -top-2 -right-2 bg-white border rounded-full"
                  @click="removeImage(index)"
                />
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                  {{ index + 1 }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 mb-2">
              <UInput
                type="file"
                accept="image/*"
                multiple
                color="neutral"
                variant="subtle"
                class="w-full"
                @change="handleImageUpload"
              />
            </div>

            <!-- Информация о лимитах -->
            <div class="text-xs text-gray-500 space-y-1">
              <div>• Минимум 1 изображение, максимум 15</div>
              <div>• Поддерживаются все форматы изображений</div>
              <div>• Первое изображение будет главным</div>
              <div v-if="formState.images.length > 0" class="font-medium">
                Текущее количество: {{ formState.images.length }} из 15
              </div>
            </div>
          </UFormField>
        </UForm>
      </template>
    </BasePopup>
  </div>
</template>
