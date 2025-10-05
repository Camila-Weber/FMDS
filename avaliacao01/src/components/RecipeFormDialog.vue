<template>
  <v-dialog v-model="open" max-width="640">
    <v-card>
      <v-card-title>{{ model.id ? 'Editar Receita' : 'Nova Receita' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid" @submit.prevent="save">
          <v-text-field
            v-model="model.title"
            label="Título"
            prepend-inner-icon="mdi-text"
            :rules="[required]"
            required
          />

          <v-combobox
            v-model="tagsInput"
            label="Tags"
            multiple chips clearable
            prepend-inner-icon="mdi-tag"
          />

          <v-textarea
            v-model="model.ingredients"
            label="Ingredientes"
            rows="3" auto-grow
            :rules="[required]"
            required
          />

          <v-textarea
            v-model="model.steps"
            label="Modo de preparo"
            rows="4" auto-grow
            :rules="[required]"
            required
          />

          <div class="d-flex justify-end mt-2">
            <v-btn type="submit" color="primary" :disabled="!isValid">Salvar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, watch, computed, ref, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Object, default: () => ({ title: '', ingredients: '', steps: '', tags: [] }) }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const model = reactive({ ...props.value })
watch(() => props.value, (v) => Object.assign(model, v || {}), { deep: true })

const tagsInput = computed({
  get: () => model.tags || [],
  set: (val) => (model.tags = val)
})

const formRef = ref()
const isValid = ref(false)
const required = (v) =>
  !!(v && v.toString().trim()) || 'Campo obrigatório'

watch(open, (v) => {
  if (v) {
    nextTick(() => formRef.value?.resetValidation())
  }
})

async function save() {
  const r = await formRef.value?.validate()
  if (!r?.valid) return

  const payload = {
    ...model,
    title: (model.title || '').trim(),
    ingredients: (model.ingredients || '').trim(),
    steps: (model.steps || '').trim()
  }
  emit('submit', payload)
  emit('update:modelValue', false)

  nextTick(() => formRef.value?.resetValidation())
}
</script>
