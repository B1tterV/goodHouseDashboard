import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useCharacteristicsStore = defineStore('characteristics', () => {
  const createCharacteristic = async (payload: {
    name: string
    characteristics: Array<{
      name: string
      label: string
      value: string
    }>
  }) => {
    return await useApi('/characteristics/', {
      method: 'POST',
      body: payload
    })
  }

  const changeCharacteristic = async (id: number, payload: {
    name: string
    characteristics: Array<{
      name: string
      label: string
      value: string
    }>
  }) => {
    return await useApi(`/characteristics/${id}`, {
      method: 'PUT',
      body: payload
    })
  }

  async function getCharacteristics(params = { page: 1, limit: 10 }) {
    const response = await useApi('/characteristics/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteCharacteristic(id: number) {
    const response = await useApi(`/characteristics/${id}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createCharacteristic,
    changeCharacteristic,
    getCharacteristics,
    deleteCharacteristic
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCharacteristicsStore, import.meta.hot))
}
