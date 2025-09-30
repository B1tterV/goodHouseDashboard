import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useSubcategoriesStore = defineStore('subcategories', () => {
  async function createSubcategory(formdata: FormData) {
    const response = await useApi('/subcategories/', {
      method: 'POST',
      body: formdata
    })

    return response
  }

  async function changeSubcategory(id: number, formdata: FormData) {
    const response = await useApi(`/subcategories/${id}`, {
      method: 'PATCH',
      body: formdata
    })

    return response
  }

  async function getSubcategories(params = { page: 1, limit: 10 }) {
    const response = await useApi('/subcategories/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteSubcategory(categoryId: number) {
    const response = await useApi(`/subcategories/${categoryId}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createSubcategory,
    changeSubcategory,
    getSubcategories,
    deleteSubcategory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSubcategoriesStore, import.meta.hot))
}
