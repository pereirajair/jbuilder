<template>
  <q-page class="designer-page" :style="{ height: availableHeight + 'px' }">
    <div class="row full-size no-gutters">
      <div class="col-9 full-height">
        <q-card flat bordered class="full-height full-width" style="padding: 0px;" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white'">
          <q-card-section class="q-pb-none" style="padding: 0px;" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white'">
            <div class="row items-center justify-between q-pr-sm">
              <q-tabs v-model="activeTab" dense align="left" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'" active-color="primary" indicator-color="primary">
                <q-tab name="edit" icon="edit" label="Editor" />
                <q-tab name="preview" icon="visibility" label="Preview" />
                <q-tab name="json" icon="data_object" label="JSON" />
                <q-tab v-if="codeEditor.visible" name="code" icon="code" :label="codeEditor.title || 'Code'" />
              </q-tabs>
              <div class="row items-center q-gutter-sm q-pl-sm">
                <div class="text-caption">{{ currentFileLabel }}</div>
                <q-btn size="sm" color="primary" dense icon="add" label="Nova View" @click="newView" />
                <q-btn size="sm" color="primary" dense icon="save" label="Salvar" @click="saveCurrent" />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-tab-panels v-model="activeTab" animated class="panels-full">
            <q-tab-panel name="edit" class="q-pa-none panel-body">
              <div 
                class="designer-canvas"
                :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
                @dragover.prevent
                @drop="handleDrop"
                @click.self="handleCanvasClick"
              >
                <ComponentRenderer
                  v-if="viewComponents[0]"
                  :component="viewComponents[0]"
                  edit-mode="edit"
                  :selected-component-id="selectedComponentId"
                  @select-component="selectComponent"
                  @open-inspector="openInspector"
                  @delete-component="deleteComponent"
                  @update-component-value="updateComponentValue"
                  @handle-drag-over="handleDragOver"
                  @handle-drop-on-component="handleDropOnComponent"
                  @move-component-to-slot="moveComponentToSlot"
                  @add-component-to-slot="addComponentToSlot"
                  @reorder-component="reorderComponent"
                  @insert-component="insertComponentBeforeAfter"
                  @handle-drag-start="handleDragStart"
                  @handle-drag-end="handleDragEnd"
                />
                <!-- Barra de componentes não-visuais -->
                 <div class="non-visual-bar q-pa-xs" :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-2'" v-if="nonVisualComponents.length > 0">
                   <div class="row items-center q-gutter-sm">
                     <div class="text-caption q-mr-sm"></div>
                     <div 
                       v-for="nv in nonVisualComponents" 
                       :key="nv.id" 
                       class="row items-center q-gutter-xs q-pa-xs non-visual-pill"
                       @click="openInspector(nv)"
                     >
                       <q-icon :name="createObjectInstance(nv.name)?.icon || 'extension'" size="16px" />
                       <div class="text-caption">{{ nv.values?.name || nv.name }}</div>
                       <q-btn dense flat round icon="delete" size="xs" color="negative" @click.stop="confirmDelete(nv.id)" />
                     </div>
                   </div>
                 </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="preview" class="q-pa-none panel-body">
              <div class="designer-canvas preview-mode" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
                <ComponentRenderer
                  v-if="viewComponents[0]"
                  :component="viewComponents[0]"
                  edit-mode="preview"
                  :selected-component-id="null"
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="json" class="q-pa-none panel-body">
              <div class="json-panel">
                <JsonEditor v-model="jsonOutput" />
              </div>
            </q-tab-panel>
            <q-tab-panel v-if="codeEditor.visible" name="code" class="q-pa-none panel-body">
              <div class="json-panel">
                <JsonEditor :visible="true" v-model="codeEditor.content" :language="codeEditor.language" :path="`designer:code:${codeEditor.language}:${codeEditor.key}`" />
              </div>
              <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]"> -->
                <q-fab icon="done" color="primary" style="z-index: 1000; position: absolute; bottom: 18px; right: 18px;" @click="saveCodeEditor">
                  <!-- <q-fab-action @click="saveCodeEditor" color="primary" icon="done" /> -->
                </q-fab>
              <!-- </q-page-sticky> -->
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <div class="col-3 full-height">
        <div class="inspector-container">
          <div class="q-pa-sm flex justify-end" style="position: absolute; bottom: 0; right: 0;">
            <q-btn 
              size="sm" 
              flat 
              dense 
              color="negative" 
              icon="delete" 
              label="Excluir componente" 
              :disable="!selectedComponentId || selectedComponentId === viewComponents[0]?.id"
              @click="selectedComponentId && selectedComponentId !== viewComponents[0]?.id && confirmDelete(selectedComponentId)"/>
          </div>
          <ObjectInspector 
            :model-value="true" 
            :target="selectedComponent || defaultInspectorTarget" 
            :style="{ width: '100%', height: '100%' }"
            @open-code-editor="openCodeEditorFromInspector"
          />
          
        </div>
      </div>
    </div>

    
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { v4 as uuidv4 } from 'uuid'
import ObjectInspector from 'components/ObjectInspector.vue'
import ComponentRenderer from 'components/ComponentRenderer.vue'
import JsonEditor from 'components/JsonEditor.vue'
import { createObjectInstance } from '../objects'
import InputText from '../objects/Input.js'
import Div from '../objects/Div.js'
import View from '../objects/View.js'
import Button from '../objects/Button.js'
import Select from '../objects/Select.js'
import Textarea from '../objects/Textarea.js'
import Card from '../objects/Card.js'
import Image from '../objects/Image.js'
import Spacer from '../objects/Spacer.js'

const $q = useQuasar()

// Estado do designer
const viewComponents = ref([])
const selectedComponentId = ref(null)
const activeTab = ref('edit')
const inspectorOpen = ref(true)

// Altura disponível (descontando header/toolbar)
const availableHeight = ref(window.innerHeight)

function recalcLayout() {
  // console.log('Designer.recalcLayout()', { availableHeight: availableHeight.value })
  const headerEl = document.querySelector('.q-header')
  const headerH = headerEl ? headerEl.offsetHeight : 60
  availableHeight.value = window.innerHeight - headerH
}

// Componentes disponíveis para renderização
const availableComponents = {
  InputText,
  Div,
  View,
  Button,
  Select,
  Textarea,
  Card,
  Image,
  Spacer
}

// Componente selecionado para edição (prover target sempre válido)
const selectedComponent = computed(() => {
  if (!selectedComponentId.value) return null
  const cmp = findComponentById(selectedComponentId.value)
  if (!cmp) return null
  
  // Retornar o componente diretamente para máxima reatividade
  return cmp
})

const defaultInspectorTarget = computed(() => ({ props: {}, emits: {} }))

const codeEditor = ref({ visible: false, title: '', language: 'plaintext', content: '', componentId: null, propName: null, key: 0 })

const nonVisualComponents = computed(() => {
  const root = viewComponents.value[0]
  if (!root) return []
  const all = []
  const walk = (node) => {
    if (!node) return
    if (node !== root) {
      const inst = createObjectInstance(node.name)
      const isNonVisual = !!(inst && typeof inst.isNonVisual === 'function' && inst.isNonVisual())
      if (isNonVisual) all.push(node)
    }
    const ch = Array.isArray(node.children) ? node.children : []
    ch.forEach(walk)
  }
  walk(root)
  return all
})

// JSON output para visualização
const jsonOutput = computed({
  get() { return JSON.stringify(viewComponents.value, null, 2) },
  set(v) {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) viewComponents.value = parsed
    } catch (e) { /* ignore parse errors to keep editor free */ }
  }
})

const currentMeta = ref({ project: '', folder: '', filename: '' })
const currentFileLabel = computed(() => {
  const p = currentMeta.value.project
  const f = currentMeta.value.filename
  if (!p || !f) return 'Sem arquivo'
  return `${p}/${f}`
})

// cria View raiz se não existir
function ensureRootView() {
  console.log('Designer.ensureRootView()', { viewComponentsLength: viewComponents.value.length })
  if (viewComponents.value.length === 0 || viewComponents.value[0]?.name !== 'View') {
    viewComponents.value = [{
      id: uuidv4(),
      name: 'View',
      displayName: 'View Container',
      category: 'layout',
      icon: 'view_module',
      props: {},
      emits: {},
      values: { name: 'View', route: '', backgroundColor: '#ffffff', padding: '0px' },
      children: []
    }]
  }
  updateGlobalRoot()
}

// selecionar View ao clicar no canvas (fora de componentes)
function handleCanvasClick() {
  console.log('Designer.handleCanvasClick()', { hasView: !!viewComponents.value[0] })
  if (viewComponents.value[0]) {
    selectedComponentId.value = viewComponents.value[0].id
  }
}

function loadDesignerJson(json, meta) {
  console.log('Designer.loadDesignerJson()', { json, meta })
  try {
    const data = Array.isArray(json) ? json : [json]
    // Assumir primeira como raiz View
    const root = data[0]
    if (!root || root.name !== 'View') throw new Error('JSON inválido: raiz não é View')
    // garantir ids
    const assignIds = (node) => {
      if (!node.id) node.id = uuidv4()
      if (Array.isArray(node.children)) node.children.forEach(assignIds)
    }
    assignIds(root)
    viewComponents.value = [root]
    selectedComponentId.value = root.id
    if (meta) currentMeta.value = meta
    updateGlobalRoot()
  } catch (e) {
    console.error('Falha ao carregar JSON no designer', e)
  }
}

function updateGlobalRoot() {
  const w = typeof window !== 'undefined' ? window : globalThis
  w.__jbuilderRootTree = viewComponents.value[0] || null
}

// Escutar evento de componente selecionado da toolbar
onMounted(() => {
  ensureRootView()
  window.addEventListener('resize', recalcLayout)
  // Ouvir transições do drawer para recalcular após abrir/fechar
  const drawer = document.querySelector('.q-drawer')
  if (drawer) drawer.addEventListener('transitionend', recalcLayout)
  recalcLayout()
  window.addEventListener('component-selected', handleComponentSelected)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('load-designer-json', (e) => loadDesignerJson(e.detail.data, e.detail.meta))
  // Escutar eventos de slots
  window.addEventListener('move-component-to-slot', (e) => {
    console.log('Designer - recebeu move-component-to-slot:', e.detail)
    moveComponentToSlot(e.detail.component, e.detail.parentId, e.detail.slotName)
  })
  window.addEventListener('add-component-to-slot', (e) => {
    console.log('Designer - recebeu add-component-to-slot:', e.detail)
    addComponentToSlot(e.detail.componentTemplate, e.detail.parentId, e.detail.slotName)
  })
  // Escutar reorder (antes/depois)
  window.addEventListener('reorder-component', (e) => {
    const { sourceId, targetId, position } = e.detail || {}
    console.log('Designer - recebeu reorder-component:', { sourceId, targetId, position })
    if (sourceId && targetId && (position === 'before' || position === 'after')) {
      reorderComponent(sourceId, targetId, position)
    }
  })
  // Inserção de novos componentes antes/depois
  window.addEventListener('insert-component', (e) => {
    const { componentTemplate, targetId, position } = e.detail || {}
    console.log('Designer - recebeu insert-component:', { componentTemplate: componentTemplate?.name, targetId, position })
    if (componentTemplate && targetId && (position === 'before' || position === 'after')) {
      insertComponentBeforeAfter(componentTemplate, targetId, position)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', recalcLayout)
  const drawer = document.querySelector('.q-drawer')
  if (drawer) drawer.removeEventListener('transitionend', recalcLayout)
  window.removeEventListener('component-selected', handleComponentSelected)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('load-designer-json', (e) => loadDesignerJson(e.detail.data, e.detail.meta))
  window.removeEventListener('reorder-component', () => {})
  window.removeEventListener('insert-component', () => {})
})

function onKeyDown(e) {
  console.log('Designer.onKeyDown()', { key: e.key, selectedComponentId: selectedComponentId.value })
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId.value) {
    confirmDelete(selectedComponentId.value)
  }
}

function openCodeEditorFromInspector(payload) {
  codeEditor.value = { 
    visible: true,
    title: `${payload.title} — ${payload.language.toUpperCase()}`,
    language: payload.language || 'plaintext',
    content: payload.content || '',
    componentId: payload.componentId,
    propName: payload.propName,
    key: codeEditor.value.key + 1
  }
  activeTab.value = 'code'
}

function saveCodeEditor() {
  const { componentId, propName, content } = codeEditor.value
  if (!componentId || !propName) {
    codeEditor.value.visible = false
    activeTab.value = 'edit'
    return
  }
  const component = findComponentById(componentId)
  if (component) {
    if (!component.values) component.values = {}
    // Converter conforme tipo/editor da propriedade ou linguagem do editor
    const propMeta = component.props ? component.props[propName] : null
    let newValue = content
    const isJsonLike = (propMeta && (propMeta.editor === 'object' || propMeta.editor === 'array' || propMeta.type === Object || propMeta.type === Array)) || (codeEditor.value.language === 'json')
    if (isJsonLike) {
      try {
        newValue = typeof content === 'string' ? JSON.parse(content) : content
      } catch (e) {
        $q.notify({ type: 'negative', message: 'JSON inválido. Corrija antes de salvar.' })
        return
      }
    }
    component.values[propName] = newValue
  }
  // fechar aba code
  codeEditor.value.visible = false
  activeTab.value = 'edit'
}

function confirmDelete(componentId) {
  console.log('Designer.confirmDelete()', { componentId })
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Deseja realmente excluir este componente?',
    cancel: true,
    ok: { label: 'Excluir', color: 'negative', flat: true },
    persistent: true
  }).onOk(() => deleteComponent(componentId))
}

function handleDragOver(event, targetComponent) {
  console.log('Designer.handleDragOver()', { targetComponent: targetComponent?.name })
  if (!targetComponent) return
  if (targetComponent.name === 'Div' || targetComponent.name === 'View') {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDropOnComponent(event, targetComponent) {
  console.log('Designer.handleDropOnComponent()', { targetComponent: targetComponent?.name })
  if (!targetComponent) return
  if (targetComponent.name === 'Div' || targetComponent.name === 'View') {
    event.preventDefault()
    event.stopPropagation()
    try {
      const componentData = JSON.parse(event.dataTransfer.getData('application/json'))
      if (componentData.type === 'existing-component') {
        moveExistingComponent(componentData.component, targetComponent.id)
      } else if (componentData && componentData.name) {
        addComponentToContainer(componentData, targetComponent.id)
      }
    } catch (error) {
      console.error('Erro ao processar drop no container:', error)
    }
  }
}

function moveExistingComponent(componentToMove, targetContainerId) {
  console.log('Designer.moveExistingComponent()', { componentToMove: componentToMove?.name, targetContainerId })
  deleteComponent(componentToMove.id)
  const container = findComponentById(targetContainerId)
  if (container) container.children.push(componentToMove)
  updateGlobalRoot()
}

function addComponentToContainer(componentTemplate, containerId) {
  console.log('Designer.addComponentToContainer()', { componentTemplate: componentTemplate?.name, containerId })
  const instance = createInstanceFromTemplate(componentTemplate)
  const container = findComponentById(containerId)
  if (container) container.children.push(instance)
  updateGlobalRoot()
}

function findComponentById(id) {
  for (const component of viewComponents.value) {
    if (component.id === id) return component
    const found = findComponentInChildren(component, id)
    if (found) return found
  }
  return null
}

function findComponentInChildren(component, id) {
  if (component.children) {
    for (const child of component.children) {
      if (child.id === id) return child
      const found = findComponentInChildren(child, id)
      if (found) return found
    }
  }
  return null
}

function deleteComponent(componentId) {
  if (viewComponents.value[0] && componentId === viewComponents.value[0].id) return
  const mainIndex = viewComponents.value.findIndex(comp => comp.id === componentId)
  if (mainIndex > -1) {
    viewComponents.value.splice(mainIndex, 1)
    if (selectedComponentId.value === componentId) selectedComponentId.value = null
    return
  }
  for (const component of viewComponents.value) {
    if (removeFromChildren(component, componentId)) {
      if (selectedComponentId.value === componentId) selectedComponentId.value = null
      updateGlobalRoot();
      return
    }
  }
}

function removeFromChildren(component, targetId) {
  if (component.children) {
    const index = component.children.findIndex(child => child.id === targetId)
    if (index > -1) {
      component.children.splice(index, 1)
      return true
    }
    for (const child of component.children) {
      if (removeFromChildren(child, targetId)) return true
    }
  }
  return false
}

function reorderComponent(sourceId, targetId, position) {
  console.log('Designer.reorderComponent()', { sourceId, targetId, position })
  if (sourceId === targetId) return
  // Encontrar pai e índice do source
  const { parent: sourceParent, index: sourceIndex } = findParentAndIndex(sourceId)
  const { parent: targetParent, index: targetIndex } = findParentAndIndex(targetId)
  if (!sourceParent || !targetParent || sourceIndex < 0 || targetIndex < 0) return

  // Remover source
  const [moved] = sourceParent.children.splice(sourceIndex, 1)
  if (!moved) return

  // Se pais diferentes e targetIndex mudou após remoção? Ajustar se necessário
  let insertIndex = targetIndex
  if (sourceParent === targetParent && sourceIndex < targetIndex) {
    insertIndex = insertIndex - 1
  }
  if (position === 'after') insertIndex = insertIndex + 1

  // Garantir limites
  if (insertIndex < 0) insertIndex = 0
  if (insertIndex > targetParent.children.length) insertIndex = targetParent.children.length

  // Ajustar slotName conforme contexto do alvo
  const targetNode = targetParent.children[targetIndex] || findComponentById(targetId)
  const parentInstance = createObjectInstance(targetParent.name)
  if (targetNode && targetNode.slotName) {
    moved.slotName = targetNode.slotName
  } else if (parentInstance && parentInstance.slots && parentInstance.slots.length === 1) {
    moved.slotName = 'default'
  }

  // Inserir
  targetParent.children.splice(insertIndex, 0, moved)

  // Forçar atualização visual
  viewComponents.value = JSON.parse(JSON.stringify(viewComponents.value))
  updateGlobalRoot()
}

function findParentAndIndex(childId) {
  // Checar raiz
  for (const root of viewComponents.value) {
    if (root.children) {
      const res = findInChildrenForParent(root, childId)
      if (res) return res
    }
  }
  return { parent: null, index: -1 }
}

function findInChildrenForParent(parent, childId) {
  if (!parent.children) return null
  const idx = parent.children.findIndex(c => c.id === childId)
  if (idx !== -1) return { parent, index: idx }
  for (const child of parent.children) {
    const res = findInChildrenForParent(child, childId)
    if (res) return res
  }
  return null
}

function insertComponentBeforeAfter(componentTemplate, targetId, position) {
  const targetInfo = findParentAndIndex(targetId)
  if (!targetInfo.parent || targetInfo.index < 0) return
  const instance = createInstanceFromTemplate(componentTemplate)
  let insertIndex = targetInfo.index
  if (position === 'after') insertIndex = insertIndex + 1
  if (insertIndex < 0) insertIndex = 0
  if (insertIndex > targetInfo.parent.children.length) insertIndex = targetInfo.parent.children.length

  // Definir slotName do novo componente conforme o irmão alvo ou slots do pai
  const targetNode = targetInfo.parent.children[targetInfo.index]
  const parentInstance = createObjectInstance(targetInfo.parent.name)
  if (targetNode && targetNode.slotName) {
    instance.slotName = targetNode.slotName
  } else if (parentInstance && parentInstance.slots && parentInstance.slots.length === 1) {
    instance.slotName = 'default'
  }

  targetInfo.parent.children.splice(insertIndex, 0, instance)

  // Forçar atualização visual
  viewComponents.value = JSON.parse(JSON.stringify(viewComponents.value))
  updateGlobalRoot()
}

function handleDragStart(event, component) {
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing-component', component }))
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd(event) {
  // Remover destaques de dropzones (before/after) após finalizar drag
  const hovers = document.querySelectorAll('.reorder-zone.reorder-hover')
  hovers.forEach((el) => el.classList.remove('reorder-hover'))
}

function handleComponentSelected(event) {
  const component = event.detail
  addComponentToView(component)
}

function copyJson() {
  navigator.clipboard.writeText(jsonOutput.value)
}

function addComponentToView(componentTemplate) {
  const instance = createInstanceFromTemplate(componentTemplate)
  viewComponents.value.push(instance)
}

function createInstanceFromTemplate(componentTemplate) {
  const instance = {
    id: uuidv4(),
    name: componentTemplate.name,
    displayName: componentTemplate.displayName,
    category: componentTemplate.category,
    icon: componentTemplate.icon,
    props: { ...componentTemplate.props },
    emits: { ...componentTemplate.emits },
    values: {},
    children: []
  }
  Object.keys(componentTemplate.props).forEach(propName => {
    const prop = componentTemplate.props[propName]
    instance.values[propName] = prop.default !== undefined ? (typeof prop.default === 'function' ? prop.default() : prop.default) : ''
  })
  Object.keys(componentTemplate.emits).forEach(emitName => {
    const emit = componentTemplate.emits[emitName]
    instance.values[emitName] = emit.default !== undefined ? emit.default : null
  })
  return instance
}

function selectComponent(componentId) {
  selectedComponentId.value = componentId
}

function openInspector(component) {
  selectedComponentId.value = component.id
}

function updateComponentValue(componentId, newValue) {
  const component = findComponentById(componentId)
  if (component) Object.assign(component.values, newValue)
}

function handleDrop(event) {
  event.preventDefault()
  try {
    const componentData = JSON.parse(event.dataTransfer.getData('application/json'))
    if (componentData && componentData.name) addComponentToView(componentData)
  } catch (error) {
    console.error('Erro ao processar drop:', error)
  }
}

function handleComponentAdded(component) {
  console.log('Componente adicionado:', component)
}

function handleComponentRemoved(component) {
  console.log('Componente removido:', component)
}

function moveComponentToSlot(componentToMove, parentComponentId, slotName) {
  console.log('Designer.moveComponentToSlot()', { 
    componentToMove: componentToMove?.name, 
    parentComponentId, 
    slotName 
  })
  // Remover componente da posição atual
  deleteComponent(componentToMove.id)
  
  // Encontrar o componente pai
  const parentComponent = findComponentById(parentComponentId)
  if (!parentComponent) return
  
  // Se o componente tem apenas 1 slot, usar 'default'
  const objectInstance = createObjectInstance(parentComponent.name)
  if (objectInstance && objectInstance.slots.length === 1) {
    slotName = 'default'
  }
  
  // Adicionar slotName ao componente
  componentToMove.slotName = slotName
  
  // Adicionar como child do componente pai
  if (!parentComponent.children) {
    parentComponent.children = []
  }
  
  parentComponent.children.push(componentToMove)
  updateGlobalRoot()
}

function addComponentToSlot(componentTemplate, parentComponentId, slotName) {
  console.log('Designer.addComponentToSlot()', { 
    componentTemplate: componentTemplate?.name, 
    parentComponentId, 
    slotName 
  })
  // Criar instância do componente
  const instance = createInstanceFromTemplate(componentTemplate)
  
  // Encontrar o componente pai
  const parentComponent = findComponentById(parentComponentId)
  if (!parentComponent) return
  
  // Se o componente tem apenas 1 slot, usar 'default'
  const objectInstance = createObjectInstance(parentComponent.name)
  if (objectInstance && objectInstance.slots.length === 1) {
    slotName = 'default'
  }
  
  // Adicionar slotName ao componente
  instance.slotName = slotName
  
  // Adicionar como child do componente pai
  if (!parentComponent.children) {
    parentComponent.children = []
  }
  
  parentComponent.children.push(instance)
  updateGlobalRoot()
}

const apiUrl = import.meta.env.API_URL || (typeof process !== 'undefined' ? process.env.API_URL : '') || 'http://localhost:3001'

function saveCurrent() {
  const name = currentMeta.value.filename || 'view'
  const project = currentMeta.value.project || 'exemplo1'
  fetch(`${apiUrl}/api/save/${project}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(viewComponents.value)
  })
    .then((r) => r.json())
    .then(() => {
      console.log('Salvo com sucesso')
    })
    .catch((e) => console.error('Falha ao salvar arquivo', e))
}

function newView() {
  const defaultProject = currentMeta.value.project || 'exemplo1'
  $q.dialog({
    title: 'Nova View',
    message: 'Informe o nome da view',
    prompt: { model: '', isValid: (val) => !!val && /^[a-zA-Z0-9_-]+$/.test(val), type: 'text' },
    cancel: true,
    ok: { label: 'Criar', color: 'primary' }
  }).onOk((viewName) => {
    const root = {
      id: uuidv4(),
      name: 'View',
      displayName: 'View Container',
      category: 'layout',
      icon: 'view_module',
      props: {},
      emits: {},
      values: { name: viewName, route: `/${viewName}`, backgroundColor: '#ffffff', padding: '16px' },
      children: []
    }
    // salvar e carregar
    fetch(`${apiUrl}/api/save/${defaultProject}/${viewName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([root])
    })
      .then((r) => r.json())
      .then(() => {
        loadDesignerJson(root, { project: defaultProject, folder: 'views', filename: viewName })
      })
      .catch((e) => console.error('Falha ao criar view', e))
  })
}
</script>

<style scoped>
/* Página sem margens/paddings e 100% da viewport */
.designer-page {
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
}

.full-size { width: 100%; height: 100%; }
.full-height { height: 100%; }
.no-gutters { margin: 0 !important; }
.no-gutters > [class^='col-'],
.no-gutters > [class*=' col-'] { padding: 0 !important; }

.panels-full { height: calc(100% - 52px); }
.panel-body { height: 100%; }

/* Canvas ocupa toda a área com scroll quando necessário */
.designer-canvas {
  height: 100%;
  background-color: #fafafa;
  /* border: 2px dashed #e0e0e0; */
  border-radius: 0;
  position: relative;
  overflow: auto;
  padding: 0px;
  padding-top: 16px;
}

.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.json-panel { height: 100%; padding: 0px; }

.inspector-container { width: 100%; height: 100%; }

.component-wrapper {
  position: relative;
  margin: 8px 0;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.component-wrapper:hover { border-color: #e0e0e0; }
.component-wrapper.selected { border-color: #1976d2; box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2); }

.edit-button { position: absolute; top: -8px; right: -8px; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.delete-button { position: absolute; top: -8px; right: 18px; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.view-container { position: relative; }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: #f5f5f5; border-bottom: 1px solid #e0e0e0; border-radius: 6px 6px 0 0; }
.view-title { font-weight: 500; color: #333; }
.view-route { font-size: 12px; color: #666; background-color: #e0e0e0; padding: 2px 6px; border-radius: 3px; }

.child-component { margin: 4px 0; padding: 4px; border: 1px solid #e0e0e0; border-radius: 4px; background-color: #f9f9f9; }
.component-render { width: 100%; }

.preview-mode .component-wrapper { border: none !important; cursor: default; }
.preview-mode .component-wrapper:hover { border: none !important; background-color: transparent !important; }
.preview-mode .component-controls, .preview-mode .child-controls, .preview-mode .edit-button, .preview-mode .delete-button { display: none !important; }

.child-controls { position: absolute; top: -4px; right: -4px; z-index: 10; display: flex; gap: 2px; }

.drop-zone { border: 2px dashed #1976d2 !important; background-color: rgba(25, 118, 210, 0.05) !important; }

.empty-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border: 2px dashed #e0e0e0; border-radius: 4px; background-color: #fafafa; min-height: 60px; }

.child-component .child-component { margin: 2px 0; padding: 2px; border: 1px solid #d0d0d0; border-radius: 3px; background-color: #f5f5f5; }
.child-component .child-component .child-component { border: 1px solid #c0c0c0; background-color: #f0f0f0; }

.view-container .view-container { border: 5px solid #1976d2; background-color: rgba(25, 118, 210, 0.02); }

/* JSON editor ocupa altura total da aba */
.q-tab-panel .json-editor { height: 100%; }

/* Minimalistas */
.edit-button, .delete-button { min-width: 20px; width: 20px; height: 20px; padding: 0; }

.non-visual-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e0e0e0;
  height: 50px;
}
.non-visual-pill {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
}
.non-visual-pill:hover {
  background-color: #d0d0d0;
}
</style>
