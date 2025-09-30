import { defineStore, acceptHMRUpdate } from 'pinia'
import { useApi } from '@/composables/useApi'

export const useTagsStore = defineStore('tags', () => {
  async function createTag(name: string, value: string) {
    const response = await useApi('/tags/', {
      method: 'POST',
      body: {
        name,
        value
      }
    })

    return response
  }

  async function changeTag(id: number, name: string, value: string) {
    const response = await useApi(`/tags/${id}`, {
      method: 'PUT',
      body: {
        name,
        value
      }
    })

    return response
  }

  async function getTags(params = { page: 1, limit: 10 }) {
    const response = await useApi('/tags/', {
      method: 'GET',
      params
    }, {}, true)

    return response
  }

  async function deleteTag(tagId: number) {
    const response = await useApi(`/tags/${tagId}`, {
      method: 'DELETE'
    })

    return response
  }

  return {
    createTag,
    changeTag,
    getTags,
    deleteTag
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot))
}
