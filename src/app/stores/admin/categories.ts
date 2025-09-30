import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useCategoriesStore = defineStore('categories', () => {
  async function createCategory(formdata: FormData) {
    const response = await useApi('/categories/', {
      method: 'POST',
      body: formdata
    })

    return response
  }

  async function changeCategory(id: number, formdata: FormData) {
    const response = await useApi(`/categories/${id}`, {
      method: 'PATCH',
      body: formdata
    })

    return response
  }

  async function getCategories(params = { page: 1, limit: 10 }) {
    const response = await useApi('/categories/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteCategory(categoryId: number) {
    const response = await useApi(`/categories/${categoryId}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createCategory,
    getCategories,
    deleteCategory,
    changeCategory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
}
