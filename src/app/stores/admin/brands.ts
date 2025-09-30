import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useBrandsStore = defineStore('brands', () => {
  async function createBrand(formdata: FormData) {
    const response = await useApi('/brands/', {
      method: 'POST',
      body: formdata
    })

    return response
  }

  async function changeBrand(id: number, formdata: FormData) {
    const response = await useApi(`/brands/${id}`, {
      method: 'PUT',
      body: formdata
    })

    return response
  }

  async function getBrands(params = { page: 1, limit: 10 }) {
    const response = await useApi('/brands/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteBrand(id: number) {
    const response = await useApi(`/brands/${id}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createBrand,
    changeBrand,
    getBrands,
    deleteBrand
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBrandsStore, import.meta.hot))
}
