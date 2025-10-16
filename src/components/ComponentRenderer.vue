<template>
  <div 
    class="component-box"
    :class="{ 'selected': selectedComponentId === component.id, 'edit-mode': editMode === 'edit' }"
    @click.stop="selectComponent(component.id)"
  >
    <!-- Controles (somente no modo edição) -->
    <div v-if="editMode === 'edit' && selectedComponentId === component.id" class="component-controls">
      <q-btn
        class="drag-button"
        size="xs"
        flat
        round
        dense
        icon="drag_indicator"
        draggable="true"
        @dragstart.stop="handleReorderDragStart"
        @dragend.stop="handleReorderDragEnd"
      />
      <!-- <q-btn
        class="edit-button"
        size="xs"
        flat
        round
        dense
        icon="edit"
        @click.stop="openInspector(component)"
      /> -->
      <q-btn
        class="delete-button"
        size="xs"
        flat
        round
        dense
        icon="delete"
        @click.stop="emit('delete-component', component.id)"
      />
    </div>

    <div class="component-render">
      <!-- Dropzone BEFORE for reordering -->
      <div
        v-if="editMode === 'edit'"
        class="reorder-zone before"
        @dragover.stop="onReorderDragOver"
        @dragleave.stop="onReorderDragLeave"
        @drop.stop="onReorderDropBefore"
      />
      <!-- {{ renderInfo.component }} -->
      <component
        v-if="renderInfo"
        :is="renderInfo.component"
        v-bind="renderInfo.props"
        @click="handleClick"
        @dragover.stop="handleDragOverSelf"
        @drop.stop="handleDropOnSelf"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
      >
        <!-- Renderizar VNodes dos slots -->
        <template v-for="(node, idx) in renderInfo.children" :key="`vnode-${idx}`">
          <VNodeRenderer v-if="node && node.tag" :node="node"></VNodeRenderer>
        </template>
        <!-- Renderizar children agrupados por slot -->
        <template v-for="(slotChildren, slotName) in childrenBySlot" :key="`slot-${slotName}`">
          <ComponentRenderer
            v-for="child in slotChildren"
            :key="child.id"
            :component="child"
            :edit-mode="editMode"
            :selected-component-id="selectedComponentId"
            @select-component="selectComponent"
            @open-inspector="openInspector"
            @delete-component="deleteComponent"
            @handle-drag-over="handleDragOver"
            @handle-drop-on-component="handleDropOnComponent"
            @handle-drag-start="handleDragStart"
            @handle-drag-end="handleDragEnd"
          />
        </template>
       
      </component>
      
      <!-- <div v-else class="text-grey-6">
        <q-icon name="error" />
        <span>Componente não encontrado: {{ component.name }}</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed, h, resolveComponent, getCurrentInstance } from 'vue'
import { createObjectInstance } from '../objects'
import { getQuasarComponent, isQuasarComponent } from '../lib/quasarComponents'
import BaseObject from 'src/objects/BaseObject'
defineOptions({ name: 'ComponentRenderer' })

const props = defineProps({
  component: { type: Object, required: true },
  editMode: { type: String, default: 'edit' },
  selectedComponentId: { type: String, default: null }
})

const emit = defineEmits([
  'focus',
  'click',
  'blur',
  'mouseleave',
  'mouseenter',
  'component-selected',
  'select-component',
  'open-inspector', 
  'delete-component',
  'update-component-value',
  'handle-drag-over',
  'handle-drop-on-component',
  'handle-drag-start',
  'handle-drag-end',
  'move-component-to-slot',
  'add-component-to-slot',
  'reorder-component',
  'insert-component',
  // repasse de eventos comuns de componentes (ex.: Form)
  'submit',
  'reset'
])

function renderNode(node) {
  // console.log('renderNode()', { node });
  if (!node || !node.tag) return null
  const originalTag = node.tag
  let Comp
  if (originalTag === 'ComponentRenderer') {
    // Preferir a própria instância do componente
    const self = getCurrentInstance()?.type
    Comp = self || resolveComponent('ComponentRenderer')
  } else {
    Comp = isQuasarComponent(originalTag) ? getQuasarComponent(originalTag) : originalTag
  }
  const children = Array.isArray(node.children) ? node.children : (node.children ? [node.children] : [])
  const renderedChildren = children.map((child) => (child && typeof child === 'object') ? renderNode(child) : child)

  const outProps = { ...(node.props || {}) }

  // Registrar refs globais para formulários por nome (ex.: form1.value.validate())
  if (originalTag === 'q-form') {
    const formName = outProps.name || outProps.id
    if (formName && !outProps.ref) {
      outProps.ref = (inst) => {
        const w = typeof window !== 'undefined' ? window : globalThis
        if (!w.__jbuilderForms) w.__jbuilderForms = {}
        if (inst) {
          w.__jbuilderForms[formName] = { value: inst }
          // Atalho direto no escopo global (ex.: form1)
          try { w[formName] = w.__jbuilderForms[formName] } catch (e) { /* no-op */ }
        } else {
          delete w.__jbuilderForms[formName]
          try { delete w[formName] } catch (e) { /* no-op */ }
        }
      }
    }
  }

  // Converter children para função de slot se necessário
  const slotContent = renderedChildren.length > 0 
    ? () => renderedChildren 
    : undefined

  return h(Comp, outProps, slotContent)
}


const VNodeRenderer = {
  name: 'VNodeRenderer',
  inheritAttrs: false,
  props: { node: { type: Object, required: false } },
  setup(p) {
    return () => renderNode(p.node)
  }
}

const renderInfo = computed(() => {
  const objectInstance = createObjectInstance(props.component.name)
  if (!objectInstance) return null

  const ctx = {
    component: props.component,
    editMode: props.editMode,
    onUpdate: (key, value) => emit('update-component-value', props.component.id, { [key]: value }),
    emit: (event, data) => emit(event, data)
  }

  const renderData = props.editMode === 'preview' 
    ? objectInstance.renderPreview(ctx)
    : objectInstance.renderEdit(ctx)

  if (!renderData || !renderData.tag) return null

  const resolved = isQuasarComponent(renderData.tag)
    ? { component: getQuasarComponent(renderData.tag) }
    : { component: renderData.tag }

  return { ...resolved, props: renderData.props || {}, children: renderData.children || [] }
})

// Agrupar children por slotName
const childrenBySlot = computed(() => {
  const children = props.component.children || []
  const grouped = {}
  
  children.forEach(child => {
    const slotName = child.slotName || 'default'
    // Filtrar não-visuais no modo edição para não poluírem os slots do designer
    const inst = createObjectInstance(child.name)
    const isNonVisual = !!(inst && typeof inst.isNonVisual === 'function' && inst.isNonVisual())
    if (props.editMode === 'edit' && isNonVisual) {
      return
    }
    if (!grouped[slotName]) {
      grouped[slotName] = []
    }
    grouped[slotName].push(child)
  })
  
  return grouped
})


function handleSlotDragOver(event, slot) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  // Adicionar classe visual de hover no slot
  event.currentTarget.style.borderColor = '#1976d2'
  event.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
}

function handleSlotDrop(event, slot, parentComponent) {
  event.preventDefault()
  event.stopPropagation()
  
  // Remover classes visuais
  event.currentTarget.style.borderColor = '#e0e0e0'
  event.currentTarget.style.backgroundColor = '#fafafa'
  
  try {
    const componentData = JSON.parse(event.dataTransfer.getData('application/json'))
    
    if (componentData.type === 'existing-component') {
      // Mover componente existente para o slot
      emit('move-component-to-slot', componentData.component, parentComponent.id, slot.name)
    } else if (componentData && componentData.name) {
      // Adicionar novo componente ao slot
      emit('add-component-to-slot', componentData, parentComponent.id, slot.name)
    }
  } catch (error) {
    console.error('Erro ao processar drop no slot:', error)
  }
}

function selectComponent(componentId) { 
  // console.log('ComponentRenderer.selectComponent()', { componentId })
  emit('select-component', componentId) 
}
function openInspector(component) { 
  console.log('ComponentRenderer.openInspector()', { component: component?.name })
  emit('open-inspector', component) 
}
function deleteComponent(componentId) { 
  console.log('ComponentRenderer.deleteComponent()', { componentId })
  emit('delete-component', componentId) 
}
function handleClick() { 
  // console.log('ComponentRenderer.handleClick()', { componentId: props.component.id })
  emit('select-component', props.component.id) 
}
function handleDragOver(event, component) { 
  console.log('ComponentRenderer.handleDragOver()', { component: component?.name })
  emit('handle-drag-over', event, component) 
}
function handleDropOnComponent(event, component) { 
  console.log('ComponentRenderer.handleDropOnComponent()', { component: component?.name })
  emit('handle-drop-on-component', event, component) 
}
function handleDragOverSelf(event) { 
  // console.log('ComponentRenderer.handleDragOverSelf()', { isSlot: !!event.target.closest('.slot-drop-area') })
  // Só processar se não foi um slot que capturou o evento
  if (!event.target.closest('.slot-drop-area')) {
    emit('handle-drag-over', event, props.component) 
  }
}
function handleDropOnSelf(event) { 
  console.log('ComponentRenderer.handleDropOnSelf()', { isSlot: !!event.target.closest('.slot-drop-area') })
  // Só processar se não foi um slot que capturou o evento
  if (!event.target.closest('.slot-drop-area')) {
    emit('handle-drop-on-component', event, props.component) 
  }
}
function handleDragStart(event, component) {
  console.log('ComponentRenderer.handleDragStart()', { component: component?.name, editMode: props.editMode })
  if (props.editMode === 'edit') {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing-component', component }))
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('handle-drag-start', event, component)
}
function handleDragEnd(event) { 
  console.log('ComponentRenderer.handleDragEnd()')
  emit('handle-drag-end', event) 
}

// ===== Reorder (move before/after) =====
let reorderPayload = null
function handleReorderDragStart(e) {
  console.log('ComponentRenderer.handleReorderDragStart()', { component: props.component?.name })
  reorderPayload = { type: 'reorder', component: props.component }
  e.dataTransfer.setData('application/json', JSON.stringify(reorderPayload))
  e.dataTransfer.effectAllowed = 'move'
}
function handleReorderDragEnd() {
  reorderPayload = null
  clearHoverZones()
}
function onReorderDragOver(e) {
  e.preventDefault()
  e.currentTarget.classList.add('reorder-hover')
}
function onReorderDragLeave(e) {
  e.currentTarget.classList.remove('reorder-hover')
}
function onReorderDropBefore(e) {
  const position = 'before'
  e.preventDefault()
  e.stopPropagation()
  e.currentTarget.classList.remove('reorder-hover')
  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'))
    // Reorder via drag-handle
    if (data?.type === 'reorder' && data.component?.id) {
      emit('reorder-component', data.component.id, props.component.id, position)
      window.dispatchEvent(new CustomEvent('reorder-component', { detail: { sourceId: data.component.id, targetId: props.component.id, position } }))
      clearHoverZones()
      return
    }
    // Mover componente existente arrastado pelo próprio componente
    if (data?.type === 'existing-component' && data.component?.id) {
      emit('reorder-component', data.component.id, props.component.id, position)
      window.dispatchEvent(new CustomEvent('reorder-component', { detail: { sourceId: data.component.id, targetId: props.component.id, position } }))
      clearHoverZones()
      return
    }
    // Inserir um novo componente (da toolbar) antes
    if (data && data.name) {
      emit('insert-component', data, props.component.id, position)
      window.dispatchEvent(new CustomEvent('insert-component', { detail: { componentTemplate: data, targetId: props.component.id, position } }))
      clearHoverZones()
      return
    }
  } catch (err) {
    console.error('Erro ao processar reorder drop:', err)
  }
}

function clearHoverZones() {
  const zones = document.querySelectorAll('.reorder-zone.reorder-hover')
  zones.forEach(el => el.classList.remove('reorder-hover'))
}
</script>

<style scoped>
.component-box {
  position: relative;
  margin: 0px 0;
  border: 2px solid transparent;
  border-radius: 4px;
}
.component-box.selected { border-color: #1976d2; box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15); }
.component-controls { position: absolute; top: -8px; right: 16px; z-index: 10; display: flex; gap: 4px; background-color: #fff; border-radius: 10px; border-color: #1976d2; border: 1px solid; padding: 2px; }
.component-render { width: 100%; }
.edit-button, .delete-button { min-width: 20px; width: 20px; height: 20px; padding: 0; }

.drag-button { min-width: 20px; width: 20px; height: 20px; padding: 0; cursor: grab; }
.reorder-zone { height: 4px; transition: background-color .15s; }
.reorder-zone.before { margin-top: 2px; }
.reorder-zone.after { margin-bottom: 2px; }
.reorder-zone.reorder-hover { background-color: rgba(25, 118, 210, 0.25); }

/* Estilos para slots */
.slot-container {
  border: 2px dashed #e0e0e0 !important;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0;
  background-color: #fafafa;
  min-height: 40px;
  position: relative;
  transition: all 0.2s ease;
}

.slot-container:hover {
  border-color: #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.05);
}

.slot-label {
  position: absolute;
  top: -8px;
  left: 8px;
  background-color: #fff;
  padding: 2px 6px;
  font-size: 10px;
  color: #666;
  font-weight: 500;
  border-radius: 2px;
  border: 1px solid #e0e0e0;
}

/* Modo preview - esconder slots */
.preview-mode .slot-container {
  display: none;
}
</style>
