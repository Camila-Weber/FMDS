<template>
  <h2 class="mb-4">Gerenciar Receitas</h2>

  <v-form :key="formKey" ref="formRef" v-model="isValid" validate-on="input" @submit.prevent="onSubmit" class="mb-6">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.title"
          label="Título"
          :rules="[required]"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-combobox v-model="form.tags" label="Tags" multiple chips clearable />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="form.ingredients"
          label="Ingredientes"
          rows="3"
          :rules="[required]"
          required
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="form.steps"
          label="Modo de preparo"
          rows="4"
          :rules="[required]"
          required
        />
      </v-col>

      <v-col cols="12" class="text-right">
        <v-btn type="submit" color="primary" :disabled="isValid === false">
          {{ form.id ? 'Atualizar' : 'Adicionar' }}
        </v-btn>
        <v-btn class="ml-2" @click="reset">Limpar</v-btn>
      </v-col>
    </v-row>
  </v-form>

  <v-divider class="mb-4" />

  <v-row>
    <v-col v-for="r in recipes.items" :key="r.id" cols="12" md="6" lg="4">
      <RecipeCard
        :recipe="r"
        @edit="load(r)"
        @remove="recipes.remove"
        @rate="(val) => recipes.update(r.id, { rating: val })"
      />
    </v-col>
  </v-row>
  <v-snackbar
    v-model="snack.show"
    location="top right"
    timeout="3000"
    color="secondary"
    elevation="6"
    variant="tonal"
  >
    {{ snack.text }}
  </v-snackbar>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRecipesStore } from '@/stores/receitas'
import RecipeCard from '@/components/RecipeCard.vue'

const recipes = useRecipesStore()
const form = reactive({ id: null, title: '', tags: [], ingredients: '', steps: '' })

const formRef = ref()
const isValid = ref(false)
const formKey = ref(0)     
const snack = ref({ show: false, text: '' })
const required = (v) =>
  !!(v && v.toString().trim()) || 'Campo obrigatório'

async function onSubmit() {
  const r = await formRef.value?.validate()
  if (!r?.valid) return

  const data = {
    ...form,
    title: (form.title || '').trim(),
    ingredients: (form.ingredients || '').trim(),
    steps: (form.steps || '').trim()
  }

  if (form.id) {
    recipes.update(form.id, data)
    snack.value = { show: true, text: 'Receita atualizada com sucesso!' }
  } else {
    recipes.create(data)
    snack.value = { show: true, text: 'Receita adicionada com sucesso!' }
  }

  reset() 
}

function reset() {
  Object.assign(form, { id: null, title: '', tags: [], ingredients: '', steps: '' })
  nextTick(() => {
    formRef.value?.resetValidation()
    formKey.value++                 
  })
}

function load(r) {
  Object.assign(form, r)
}
</script>
