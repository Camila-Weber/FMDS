<template>
  <v-row class="mb-2" align="center">
    <v-col cols="12" md="6">
      <v-text-field
        v-model="q"
        label="Buscar receitas (título ou tag)"
        prepend-inner-icon="mdi-magnify"
        clearable
      />
    </v-col>

    <v-col cols="12" md="6" class="text-right">
      <v-btn
        class="mr-2"
        variant="tonal"
        prepend-icon="mdi-filter-variant"
        @click="advancedOpen = !advancedOpen"
      >
        Filtro avançado
      </v-btn>

      <v-btn color="primary" @click="newRecipe">
        Adicionar Receita
      </v-btn>
    </v-col>
  </v-row>

  <v-expand-transition>
    <v-card v-if="advancedOpen" class="mb-4" elevation="4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="filters.tags"
              :items="allTags"
              label="Filtrar por tags"
              multiple
              chips
              clearable
              prepend-inner-icon="mdi-tag"
              hint="Escolha uma ou mais tags"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.minRating"
              :items="[0,1,2,3,4,5]"
              label="Nota mínima"
              prepend-inner-icon="mdi-star"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3" class="d-flex align-center">
            <v-switch
              v-model="filters.onlyWithTags"
              inset
              color="secondary"
              label="Apenas receitas com tags"
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn variant="text" class="mr-2" @click="clearFilters">
              Limpar filtros
            </v-btn>
            <v-btn color="secondary" @click="advancedOpen = false">
              Aplicar e fechar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-expand-transition>

  <RecipeFormDialog v-model="dialog" :value="current" @submit="handleCreateOrUpdate" />

  <div v-if="listFiltered.length === 0" class="text-center text-medium-emphasis">
    Nenhuma receita encontrada.
  </div>

  <v-row v-else>
    <v-col v-for="r in listFiltered" :key="r.id" cols="12" md="6" lg="4">
      <RecipeCard
        :recipe="r"
        @edit="editRecipe"
        @remove="removeRecipe"
        @rate="rateRecipe(r.id, $event)"
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
import { ref, computed } from 'vue'
import { useRecipesStore } from '@/stores/receitas'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeFormDialog from '@/components/RecipeFormDialog.vue'

const recipes = useRecipesStore()

const q = ref('')
const advancedOpen = ref(false)
const dialog = ref(false)
const current = ref(null)
const snack = ref({ show: false, text: '' })

const filters = ref({
  tags: [],       
  minRating: null, 
  onlyWithTags: false
})

const allTags = computed(() => {
  const set = new Set()
  recipes.items.forEach(r => (r.tags || []).forEach(t => set.add(t)))
  return Array.from(set).sort((a,b)=>a.localeCompare(b))
})

const listFiltered = computed(() => {
  const base = recipes.search(q.value).value

  return base.filter(r => {
    if (filters.value.onlyWithTags && (!r.tags || r.tags.length === 0)) return false

    if (filters.value.minRating != null) {
      const rating = r.rating || 0
      if (rating < filters.value.minRating) return false
    }

  
    if (filters.value.tags?.length) {
      const recipeTags = (r.tags || []).map(t => t.toLowerCase())
      const selected = filters.value.tags.map(t => (t || '').toLowerCase())
      const hasAll = selected.every(t => recipeTags.includes(t))
      if (!hasAll) return false
    }

    return true
  })
})

function newRecipe() {
  current.value = { title: '', tags: [], ingredients: '', steps: '' }
  dialog.value = true
}
function editRecipe(r) {
  current.value = { ...r }
  dialog.value = true
}
function removeRecipe(id) { recipes.remove(id) }
function rateRecipe(id, rating) { recipes.update(id, { rating }) }

function handleCreateOrUpdate(data) {
  if (data.id) {
    recipes.update(data.id, data)
    snack.value = { show: true, text: 'Receita atualizada com sucesso!' }
  } else {
    recipes.create(data)
    snack.value = { show: true, text: 'Receita adicionada com sucesso!' }
  }
}

function clearFilters() {
  filters.value = { tags: [], minRating: null, onlyWithTags: false }
}
</script>
