<script setup lang="ts">
const emit = defineEmits(['update:modelValue', 'save', 'close'])

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  modelValue: { type: Boolean, default: false }
})

const proxyValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
    if (newValue === false) emit('close')
  }
})
</script>

<template>
  <UModal
    v-model:open="proxyValue"
    :title="title"
    :description="description"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <slot name="body" />
    </template>

    <template #footer>
      <slot name="footer">
        <UButton label="Сохранить" color="neutral" @click="emit('save')" />
      </slot>
    </template>
  </UModal>
</template>

<style scoped lang="scss">

</style>
