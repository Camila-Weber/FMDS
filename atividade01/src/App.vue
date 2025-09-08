<template>
  <div class="container">
    <header>CRUD de Equipamentos</header>

    <div
      class="tab-buttons"
      style="margin-bottom: 1rem; display: flex; justify-content: center"
    >
      <button
        :class="{ active: activeTab === 'cadastro' }"
        @click="activeTab = 'cadastro'"
        style="margin-right: 5px"
      >
        Cadastro
      </button>
      <button
        :class="{ active: activeTab === 'pesquisa' }"
        @click="activeTab = 'pesquisa'"
      >
        Pesquisa
      </button>
    </div>

    <div class="content">
      <div class="card form-card" v-if="activeTab === 'cadastro'">
        <div class="titulo">
          <h3>{{ editIndex === -1 ? "Adicionar" : "Editar" }}</h3>
          <button v-if="editIndex !== -1" @click="resetForm()">Cancelar</button>
        </div>

        <form @submit.prevent="saveItem">
          <label>
            Nome:
            <input v-model="item.nome" type="text" placeholder="Nome do equipamento" />
            <span v-if="errors.nome" class="error">{{ errors.nome }}</span>
          </label>

          <label>
            Grupo de Categoria:
            <select v-model="item.grupo">
              <option value="">Selecione</option>
              <option value="ti">TI</option>
              <option value="patrimonio">Patrimônio Geral</option>
              <option value="lab">Laboratório</option>
            </select>
            <span v-if="errors.grupo" class="error">{{ errors.grupo }}</span>
          </label>

          <label>
            Categoria:
            <select v-model="item.categoria" :disabled="!item.grupo">
              <option value="">Selecione</option>
              <option v-for="cat in categoriasFiltradas" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
            <span v-if="errors.categoria" class="error">{{ errors.categoria }}</span>
          </label>

          <label>
            Patrimônio:
            <input v-model="item.patrimonio" type="text" placeholder="Patrimônio" />
            <span v-if="errors.patrimonio" class="error">{{ errors.patrimonio }}</span>
          </label>

          <label>
            Status:
            <select v-model="item.status">
              <option value="">Selecione...</option>
              <option value="disponível">Disponível</option>
              <option value="emprestado">Emprestado</option>
            </select>
            <span v-if="errors.status" class="error">{{ errors.status }}</span>
          </label>

          <button class="primary">
            {{ editIndex === -1 ? "Adicionar" : "Salvar Alterações" }}
          </button>
        </form>
      </div>

      <div class="card form-card" v-if="activeTab === 'pesquisa'">
        <h3>Pesquisar</h3>
        <form @submit.prevent>
          <label>
            Nome:
            <input v-model="filtros.nome" type="text" placeholder="Pesquisar por nome" />
          </label>

          <label>
            Grupo de Categoria:
            <select v-model="filtros.grupo">
              <option value="">Todos</option>
              <option value="ti">TI</option>
              <option value="patrimonio">Patrimônio Geral</option>
              <option value="lab">Laboratório</option>
            </select>
          </label>

          <label>
            Categoria:
            <select v-model="filtros.categoria" :disabled="!filtros.grupo">
              <option value="">Todas</option>
              <option v-for="cat in categoriasFiltradasPesquisa" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </label>

          <label>
            Patrimônio:
            <input
              v-model="filtros.patrimonio"
              type="text"
              placeholder="Pesquisar por patrimônio"
            />
          </label>

          <label>
            Status:
            <select v-model="filtros.status">
              <option value="">Todos</option>
              <option value="disponível">Disponível</option>
              <option value="emprestado">Emprestado</option>
            </select>
          </label>

          <button type="button" @click="resetFiltros">Limpar Filtros</button>
        </form>
      </div>

      <aside class="summary">
        <h3>Totais</h3>
        <p>Total: {{ total }}</p>
        <p>Disponíveis: {{ totalDisponivel }}</p>
        <p>Emprestados: {{ totalEmprestado }}</p>
        <p>Grupo TI: {{ totalCatTI }}</p>
        <p>Grupo Laboratório: {{ totalCatLab }}</p>
        <p>Grupo Patrimônio: {{ totalCatPat }}</p>
      </aside>
    </div>

    <div v-if="filteredItems.length > 0" class="card">
      <h3>Lista de Equipamentos</h3>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Grupo</th>
            <th>Categoria</th>
            <th>Patrimônio</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(equip, i) in filteredItems" :key="equip.id">
            <td>{{ equip.id }}</td>
            <td>{{ equip.nome }}</td>
            <td>{{ groupLabel(equip.grupo) }}</td>
            <td>{{ equip.categoria }}</td>
            <td>{{ equip.patrimonio }}</td>
            <td :class="equip.status === 'disponível' ? 'status-ok' : 'status-bad'">
              {{ equip.status === "disponível" ? "Disponível" : "Emprestado" }}
            </td>
            <td class="acoes">
              <button @click="editItem(i)">
                <i class="fa-solid fa-pen-to-square" title="Editar Item"></i>
              </button>
              <button @click="removeItem(i)">
                <i class="fa-solid fa-trash" title="Remover item"></i>
              </button>
              <button
                @click="toggleStatus(i)"
                :class="equip.status !== 'disponível' ? 'status-ok' : 'status-bad'"
              >
                <i
                  class="fa-solid"
                  :class="equip.status !== 'disponível' ? 'fa-check' : 'fa-times'"
                  :title="
                    equip.status !== 'disponível'
                      ? 'Marcar como disponível'
                      : 'Marcar como emprestado'
                  "
                ></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="card empty">
      <p>Nenhum equipamento encontrado.</p>
    </div>
  </div>

  <div v-if="showErrorModal" class="modal-overlay">
    <div class="modal">
      <h3>⚠ Erro de Validação</h3>
      <ul>
        <li v-for="(msg, campo) in errors" :key="campo" v-if="msg">
          {{ msg }}
        </li>
      </ul>
      <button @click="showErrorModal = false">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";

const activeTab = ref("cadastro");
const items = ref([]);
const showErrorModal = ref(false);
const autoCloseTimer = ref(null);

const categorias = {
  ti: [
    "Computador",
    "Notebook",
    "Servidor",
    "Impressora",
    "Monitor",
    "Periféricos",
    "Rede",
    "Software / Licença",
  ],
  patrimonio: [
    "Móveis",
    "Eletrodomésticos",
    "Ferramentas",
    "Equipamentos de escritório",
    "Equipamentos de segurança",
    "Veículos",
  ],
  lab: [
    "Projetor",
    "Microscópio",
    "Equipamentos de medição",
    "Instrumentos de laboratório",
    "Equipamentos multimídia",
  ],
};

const gruposLabels = { ti: "TI", patrimonio: "Patrimônio Geral", lab: "Laboratório" };
const groupLabel = (g) => gruposLabels[g] ?? g;

const item = reactive({
  id: "",
  nome: "",
  grupo: "",
  categoria: "",
  patrimonio: "",
  status: "",
});

let editIndex = -1;
let suspendClear = false;

const filtros = reactive({
  nome: "",
  grupo: "",
  categoria: "",
  patrimonio: "",
  status: "",
});

const errors = reactive({
  nome: "",
  grupo: "",
  categoria: "",
  patrimonio: "",
  status: "",
});

function validateItem() {
  errors.nome = item.nome ? "" : "O campo Nome é obrigatório.";
  errors.grupo = item.grupo ? "" : "Selecione um grupo.";
  errors.categoria = item.categoria ? "" : "Selecione uma categoria.";
  errors.patrimonio = item.patrimonio ? "" : "O campo Patrimônio é obrigatório.";
  errors.status = item.status ? "" : "Selecione o status.";

  return !Object.values(errors).some((e) => e !== "");
}

watch(
  () => item.nome,
  (val) => {
    if (val) errors.nome = "";
  }
);

watch(
  () => item.grupo,
  (val) => {
    if (val) errors.grupo = "";
  }
);

watch(
  () => item.categoria,
  (val) => {
    if (val) errors.categoria = "";
  }
);

watch(
  () => item.patrimonio,
  (val) => {
    if (val) errors.patrimonio = "";
  }
);

watch(
  () => item.status,
  (val) => {
    if (val) errors.status = "";
  }
);

function saveItem() {
  if (!validateItem()) {
    showValidationErrors();
    return;
  }

  if (editIndex === -1) {
    items.value.push({ ...item, id: gerarCodigo() });
  } else {
    items.value[editIndex] = { ...item };
    editIndex = -1;
  }

  resetForm();
  setLocalStorage();
}

function showValidationErrors() {
  showErrorModal.value = true;

  if (autoCloseTimer.value) clearTimeout(autoCloseTimer.value);
  autoCloseTimer.value = setTimeout(() => {
    showErrorModal.value = false;
  }, 3000);
}

function editItem(i) {
  suspendClear = true;
  Object.assign(item, items.value[i]);
  suspendClear = false;
  activeTab.value = "cadastro";
  editIndex = i;
}

function removeItem(i) {
  if (confirm("Tem certeza que deseja excluir?")) {
    items.value.splice(i, 1);
    setLocalStorage();
  }
}
function toggleStatus(index) {
  const equip = items.value[index];
  equip.status = equip.status === "disponível" ? "emprestado" : "disponível";
  setLocalStorage();
}

function resetForm() {
  editIndex = -1;
  item.id = "";
  item.nome = "";
  item.grupo = "";
  item.categoria = "";
  item.patrimonio = "";
  item.status = "";
}

watch(
  () => item.grupo,
  (newG) => {
    if (suspendClear) return;
    if (!newG) {
      item.categoria = "";
      return;
    }
    const cats = categorias[newG] || [];
    if (!cats.includes(item.categoria)) item.categoria = "";
  }
);

watch(
  () => filtros.grupo,
  (newG) => {
    if (!newG) filtros.categoria = "";
    else {
      const cats = categorias[newG] || [];
      if (!cats.includes(filtros.categoria)) filtros.categoria = "";
    }
  }
);

function gerarCodigo() {
  return "EQP-" + Math.floor(Math.random() * 100000);
}
function setLocalStorage() {
  localStorage.setItem("equipamentos", JSON.stringify(items.value));
}

function normalizeLoadedGroup(g) {
  if (!g) return "";
  if (g in categorias) return g;
  const found = Object.keys(gruposLabels).find(
    (k) => gruposLabels[k].toLowerCase() === String(g).toLowerCase()
  );
  return found ?? g;
}

onMounted(() => {
  const dados = localStorage.getItem("equipamentos");
  if (dados) {
    try {
      const parsed = JSON.parse(dados);
      items.value = parsed.map((it) => {
        const copy = { ...it };
        copy.grupo = normalizeLoadedGroup(copy.grupo);
        const cats = categorias[copy.grupo] || [];
        if (!cats.includes(copy.categoria)) copy.categoria = "";
        return copy;
      });
    } catch (e) {
      console.error("Erro ao ler localStorage:", e);
      items.value = [];
    }
  }
});

const total = computed(() => items.value.length);
const totalDisponivel = computed(
  () => items.value.filter((i) => i.status === "disponível").length
);
const totalEmprestado = computed(
  () => items.value.filter((i) => i.status === "emprestado").length
);
const totalCatTI = computed(() => items.value.filter((i) => "ti" === i.grupo).length);
const totalCatLab = computed(() => items.value.filter((i) => "lab" === i.grupo).length);
const totalCatPat = computed(
  () => items.value.filter((i) => "patrimonio" === i.grupo).length
);

const categoriasFiltradas = computed(() => (item.grupo ? categorias[item.grupo] : []));
const categoriasFiltradasPesquisa = computed(() =>
  filtros.grupo ? categorias[filtros.grupo] : []
);

const filteredItems = computed(() => {
  return items.value.filter((i) => {
    return (
      (!filtros.nome || i.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
      (!filtros.grupo || i.grupo === filtros.grupo) &&
      (!filtros.categoria || i.categoria === filtros.categoria) &&
      (!filtros.patrimonio ||
        i.patrimonio.toLowerCase().includes(filtros.patrimonio.toLowerCase())) &&
      (!filtros.status || i.status === filtros.status)
    );
  });
});

function resetFiltros() {
  filtros.nome = "";
  filtros.grupo = "";
  filtros.categoria = "";
  filtros.patrimonio = "";
  filtros.status = "";
}
</script>
