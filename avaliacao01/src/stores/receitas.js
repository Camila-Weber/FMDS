import { defineStore } from 'pinia'
import { watch, ref, computed } from 'vue'

const STORAGE_KEY = 'recipes-v1'

export const useRecipesStore = defineStore('receitas', () => {
  const items = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : seed()
    } catch {
      return seed()
    }
  }

  function seed() {
    return [
      { id: crypto.randomUUID(), title: 'Brownie Fit', tags: ['doce','fit'], ingredients: 'Cacau, ovos, aveia', steps: 'Misture e asse 20min', rating: 4 },
      { id: crypto.randomUUID(), title: 'Salada Mediterrânea', tags: ['salada'], ingredients: 'Tomate, pepino, azeitona', steps: 'Corte e tempere', rating: 5 }
    ]
  }

  watch(items, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function create(recipe) {
    items.value.unshift({ id: crypto.randomUUID(), rating: 0, ...recipe })
  }

  function update(id, patch) {
    const i = items.value.findIndex(r => r.id === id)
    if (i >= 0) items.value[i] = { ...items.value[i], ...patch }
  }

  function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
  }

  const byTag = (tag) => computed(() => items.value.filter(r => r.tags?.includes(tag)))
  const search = (q) => computed(() => {
    const s = (q||'').toLowerCase()
    return items.value.filter(r => r.title.toLowerCase().includes(s) || r.tags?.some(t => t.toLowerCase().includes(s)))
  })

  return { items, create, update, remove, byTag, search }
})
