import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useProductsStore = defineStore('products', () => {
  async function createProduct(formdata: FormData) {
    const response = await useApi('/products/', {
      method: 'POST',
      body: formdata
    })

    return response
  }

  async function changeProduct(id: number, formdata: FormData) {
    const response = await useApi(`/products/${id}`, {
      method: 'PATCH',
      body: formdata
    })

    return response
  }

  async function getProducts(params = { page: 1, limit: 10 }) {
    const response = await useApi('/products/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteProduct(id: number) {
    const response = await useApi(`/products/${id}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createProduct,
    changeProduct,
    getProducts,
    deleteProduct
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot))
}
