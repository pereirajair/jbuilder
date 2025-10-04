<template>
  <q-page class="q-pa-none">
    <div class="q-pa-none">
     
      <div v-if="!rootView" class="text-negative">View não encontrada.</div>
        <div v-else class="preview-container">
          <component
            :is="ComponentRenderer"
            :component="rootView"
            edit-mode="preview"
            :selected-component-id="null"
            @update-component-value="onUpdateComponentValue"
          />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import ComponentRenderer from 'components/ComponentRenderer.vue'

const route = useRoute()
const rootView = ref(null)
const debug = ref(false)

async function loadJson(project, view) {
  try {
    const url = `/projects/${project}/views/${view}.json`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Falha ao carregar JSON')
    const json = await res.json()

    // Se o JSON contiver um array de componentes, assumir primeiro como root
    // Garantir que seja uma View
    let root = Array.isArray(json) ? json[0] : json
    if (!root || root.name !== 'View') {
      throw new Error('JSON inválido: raiz não é View')
    }
    // Garantir ids
    function ensureIds(node, counter) {
      if (!node.id) node.id = `view_${++counter.value}`
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => ensureIds(child, counter))
      }
    }
    const counter = { value: 0 }
    ensureIds(root, counter)
    // Tornar a árvore reativa profundamente
    const reactiveRoot = reactive(root)
    rootView.value = reactiveRoot
    // Expor árvore raiz globalmente para utilidades que dependem dela
    try {
      const w = typeof window !== 'undefined' ? window : globalThis
      w.__jbuilderRootTree = reactiveRoot
    } catch (e) { /* noop */ }
  } catch (e) {
    console.error(e)
    rootView.value = null
  }
}

onMounted(() => {
  const { project, view } = route.params
  // Habilitar debug via query (?debug=1) ou localStorage
  try {
    debug.value = route.query?.debug === '1' || localStorage.getItem('jbuilder:debug') === '1'
    const w = typeof window !== 'undefined' ? window : globalThis
    w.__jbuilderDebug = debug.value
  } catch (e) { /* noop */ }
  loadJson(project, view)

  // Reagir a atualizações externas da árvore (ex.: datasets sendo atualizados programaticamente)
  window.addEventListener('root-tree-updated', () => {
    if (!rootView.value) return
    // trigger shallow reactive update
    rootView.value = JSON.parse(JSON.stringify(rootView.value))
  })

  window.addEventListener('update-dataset-value', (e) => {
    const { datasetId, data } = e.detail || {}
    if (!datasetId || !rootView.value) return
    const node = findById(rootView.value, datasetId)
    if (node) {
      if (!node.values) node.values = {}
      node.values.value = data
      rootView.value = JSON.parse(JSON.stringify(rootView.value))
    }
  })
})

function onUpdateComponentValue(componentId, newValues) {
  if (!rootView.value) return
  const target = findById(rootView.value, componentId)
  if (!target) return
  if (!target.values) target.values = {}
  Object.assign(target.values, newValues)
  // Forçar reatividade superficial
  rootView.value = JSON.parse(JSON.stringify(rootView.value))
}

function findById(node, id) {
  if (!node) return null
  if (node.id === id) return node
  const children = Array.isArray(node.children) ? node.children : []
  for (const child of children) {
    const found = findById(child, id)
    if (found) return found
  }
  return null
}
</script>

<style scoped>
.preview-container { min-height: 100vh; padding: 0px; }
</style>
