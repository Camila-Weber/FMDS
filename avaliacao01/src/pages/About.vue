<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Sobre o Sistema</span>
      <v-chip size="small" color="secondary" variant="tonal" class="ml-2">
        v{{ appVersion }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <p>
        Aplicação didática com <strong>Vue 3</strong> + <strong>Vuetify 3</strong> demonstrando
        <em>CRUD</em>, <em>vue-router</em>, componentização e persistência em <strong>localStorage</strong>.
      </p>

      <v-alert type="info" variant="tonal" class="mt-3">
        Seus dados ficam salvos apenas no seu navegador. Você pode exportar um backup em JSON ou importar novamente.
      </v-alert>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <v-btn color="secondary" prepend-icon="mdi-download" @click="exportData" class="mr-2">
          Exportar dados (JSON)
        </v-btn>

        <v-btn variant="tonal" prepend-icon="mdi-upload" @click="triggerImport">
          Importar dados
        </v-btn>
        <input ref="fileInput" type="file" accept="application/json" class="d-none" @change="handleImport" />

        <v-spacer />

        <v-btn color="error" variant="tonal" prepend-icon="mdi-trash-can-outline" @click="confirmClear = true">
          Limpar todos os dados
        </v-btn>
      </div>
    </v-card-text>
  </v-card>

  <v-card class="mb-4">
    <v-card-title>Dicas gerais</v-card-title>
    <v-card-text>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title prepend-icon="mdi-magnify">Busca e filtro</v-expansion-panel-title>
          <v-expansion-panel-text>
            Use a barra de busca do Catálogo para procurar por título ou tags.
            No <em>Filtro avançado</em>, combine <strong>múltiplas tags</strong> e defina <strong>nota mínima</strong>.
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title prepend-icon="mdi-star">Avaliações</v-expansion-panel-title>
          <v-expansion-panel-text>
            Avalie as receitas pelas <strong>estrelinhas</strong> nos cards para priorizar suas favoritas.
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title prepend-icon="mdi-content-save">Boas práticas</v-expansion-panel-title>
          <v-expansion-panel-text>
            Preencha <strong>Título</strong>, <strong>Ingredientes</strong> e <strong>Modo de preparo</strong> com clareza.
            Use <strong>tags</strong> (ex.: “fit”, “salada”, “doce”) para organizar melhor.
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title prepend-icon="mdi-shield-lock">Conta e segurança</v-expansion-panel-title>
          <v-expansion-panel-text>
            O acesso é feito via Google. Para encerrar a sessão, use o botão <em>Sair</em> na barra superior.
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>

  <v-card>
    <v-card-title>Estatísticas</v-card-title>
    <v-card-text>
      <div>Total de receitas: <strong>{{ total }}</strong></div>
      <div v-if="topTag">Tag mais usada: <strong>{{ topTag.tag }}</strong> ({{ topTag.count }})</div>
      <div v-else>Nenhuma tag cadastrada.</div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="confirmClear" max-width="420">
    <v-card>
      <v-card-title>Limpar todos os dados?</v-card-title>
      <v-card-text>
        Isso removerá todas as receitas salvas no seu navegador (localStorage). Esta ação não pode ser desfeita.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmClear = false">Cancelar</v-btn>
        <v-btn color="error" @click="clearAll">Limpar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar v-model="snack.show" location="top right" timeout="3000" color="secondary" variant="tonal" elevation="6">
    {{ snack.text }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRecipesStore } from '@/stores/receitas'
const store = useRecipesStore()

const appVersion = '1.0.0'

const total = computed(() => store.items.length)
const topTag = computed(() => {
  const count = {}
  store.items.forEach(r => (r.tags || []).forEach(t => (count[t] = (count[t] || 0) + 1)))
  const entries = Object.entries(count).sort((a, b) => b[1] - a[1])
  return entries[0] ? { tag: entries[0][0], count: entries[0][1] } : null
})

const snack = ref({ show: false, text: '' })

const STORAGE_KEY = 'recipes-v1'
const fileInput = ref(null)
const confirmClear = ref(false)

function exportData() {
  try {
    const data = JSON.stringify(store.items, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receitas-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    snack.value = { show: true, text: 'Backup exportado com sucesso!' }
  } catch (e) {
    snack.value = { show: true, text: 'Falha ao exportar backup.' }
  }
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result)
      if (!Array.isArray(parsed)) throw new Error('Formato inválido')
      store.items = parsed
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      snack.value = { show: true, text: 'Backup importado com sucesso!' }
    } catch {
      snack.value = { show: true, text: 'Arquivo inválido. Tente novamente.' }
    } finally {
      e.target.value = '' 
    }
  }
  reader.readAsText(file)
}

function clearAll() {
  try {
    store.items = []
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    snack.value = { show: true, text: 'Dados apagados com sucesso.' }
  } finally {
    confirmClear.value = false
  }
}
</script>
