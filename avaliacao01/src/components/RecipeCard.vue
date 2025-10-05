<template>
  <v-card class="mb-4" :title="recipe.title" :subtitle="recipe.tags?.join(' • ')">
    <v-card-text>
      <div class="text-body-2"><strong>Ingredientes:</strong> {{ recipe.ingredients }}</div>
      <div class="text-body-2 mt-2"><strong>Modo de preparo:</strong> {{ recipe.steps }}</div>

      <div class="d-flex align-center mt-3">
        <v-rating v-model="localRating" @update:modelValue="emit('rate', localRating)" density="comfortable" size="small" />
        <span class="ml-2 text-caption" v-if="localRating">{{ localRating }}/5</span>
        <span class="ml-2 text-caption" v-else>Sem avaliação</span>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn size="small" @click="$emit('edit', recipe)">Editar</v-btn>
      <v-btn size="small" color="error" @click="$emit('remove', recipe.id)">Excluir</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ recipe: { type: Object, required: true } })
const emit = defineEmits(['edit', 'remove', 'rate'])
const localRating = ref(props.recipe.rating || 0)
watch(() => props.recipe.rating, (v) => localRating.value = v || 0)
</script>
