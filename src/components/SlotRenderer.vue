<template>
  <div 
    v-if="props.editMode === 'edit'"
    class="slot-drop-area"
    :style="slotStyle"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="slot-label">
      {{ slotName }}
    </div>
    <div v-if="slotChildren.length === 0" class="slot-placeholder">
        {{ editMode }}
    </div>
    <ComponentRenderer
      v-for="child in slotChildren"
      :key="child.id"
      :component="child"
      :edit-mode="props.editMode"
      :selected-component-id="props.selectedComponentId"
      @select-component="selectComponent"
      @open-inspector="openInspector"
      @delete-component="deleteComponent"
      @update-component-value="updateComponentValue"
      @handle-drag-over="handleDragOver"
      @handle-drag-start="handleDragStart"
      @handle-drag-end="handleDragEnd"
    />
  </div>
  <div v-else class="slot-content">
    <ComponentRenderer
      v-for="child in slotChildren"
      :key="child.id"
      :component="child"
      :edit-mode="props.editMode"
      :selected-component-id="props.selectedComponentId"
      @select-component="selectComponent"
      @open-inspector="openInspector"
      @delete-component="deleteComponent"
      @update-component-value="updateComponentValue"
      @handle-drag-over="handleDragOver"
      @handle-drag-start="handleDragStart"
      @handle-drag-end="handleDragEnd"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ComponentRenderer from './ComponentRenderer.vue'

const props = defineProps({
  slotName: { type: String, required: true },
  editMode: { type: String, default: 'edit' },
  component: { type: Object, required: true },
  selectedComponentId: { type: String, default: null }
})

// Obter props do componente pai
// const editMode = computed(() => props.component.editMode || 'edit')

// Filtrar children por slotName
const slotChildren = computed(() => {
  return (props.component.children || []).filter(child => child.slotName === props.slotName)
})

// Estilo do slot no modo de edição
const slotStyle = computed(() => ({
  border: '2px dashed #e0e0e0',
  borderRadius: '4px',
  padding: '8px',
  margin: '4px 0',
  backgroundColor: '#fafafa',
  minHeight: '40px',
  position: 'relative'
}))

function handleDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
  
  // Adicionar classe visual para indicar que pode soltar
  e.currentTarget.classList.add('drag-over')
  
  // Emitir evento de drag over
  emit('handle-drag-over', {
    event: e,
    targetComponent: props.component,
    slotName: props.slotName
  })
}

function handleDragLeave(e) {
  e.preventDefault()
  e.stopPropagation()
  
  // Remover classe visual
  e.currentTarget.classList.remove('drag-over')
}

const emit = defineEmits([
  'select-component',
  'open-inspector', 
  'delete-component',
  'update-component-value',
  'handle-drag-over',
  'handle-drag-start',
  'handle-drag-end'
])

// Função para selecionar componente
function selectComponent(componentId) {
  emit('select-component', componentId)
}

// Função para abrir inspector
function openInspector(component) {
  emit('open-inspector', component)
}

// Função para deletar componente
function deleteComponent(componentId) {
  // Remover do children do componente pai
  if (props.component.children) {
    const index = props.component.children.findIndex(child => child.id === componentId)
    if (index !== -1) {
      props.component.children.splice(index, 1)
      emit('update-component-value', props.component.id, { children: props.component.children })
    }
  }
  emit('delete-component', componentId)
}

// Função para atualizar valor de componente
function updateComponentValue(componentId, updates) {
  // Encontrar e atualizar o componente nos children
  if (props.component.children) {
    const child = props.component.children.find(c => c.id === componentId)
    if (child) {
      Object.assign(child, updates)
      emit('update-component-value', props.component.id, { children: props.component.children })
    }
  }
  emit('update-component-value', componentId, updates)
}


// Função para lidar com drag start
function handleDragStart(event) {
  emit('handle-drag-start', event)
}

// Função para lidar com drag end
function handleDragEnd(event) {
  emit('handle-drag-end', event)
}

// Função para adicionar componente ao slot
async function addComponentToSlot(componentTemplate) {
  try {
    // Importar a função de criação de instância
    const { createObjectInstance } = await import('../objects/index.js')
    
    // Criar instância do componente
    const instance = await createObjectInstance(componentTemplate.name)
    if (!instance) {
      console.error('Erro ao criar instância do componente:', componentTemplate.name)
      return
    }

    console.log('instance.props', instance.props);
    console.log('instance.getDefaultValues()', instance.getDefaultValues());

    // Criar objeto do componente com slotName
    const newComponent = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: componentTemplate.name,
      displayName: instance.displayName || componentTemplate.name,
      category: instance.category || 'custom',
      icon: instance.icon || 'extension',
      description: instance.description || '',
      values: instance.getDefaultValues ? instance.getDefaultValues() : {},
      props: { ...(instance.props || {}) },
      emits: Array.isArray(instance.emits) ? [...instance.emits] : [],
      slots: Array.isArray(instance.slots) ? [...instance.slots] : [],
      children: [],
      slotName: props.slotName, // Definir o slotName aqui
      editMode: props.editMode,
      selectedComponentId: props.selectedComponentId
    }

    // Adicionar ao children do componente pai
    if (!props.component.children) {
      props.component.children = []
    }
    props.component.children.push(newComponent)

    // Emitir evento de atualização
    emit('update-component-value', props.component.id, { children: props.component.children })
    
    console.log(`✅ Componente ${componentTemplate.name} adicionado ao slot ${props.slotName}`)
  } catch (error) {
    console.error('Erro ao adicionar componente ao slot:', error)
  }
}

function handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  
  // Remover classe visual
  e.currentTarget.classList.remove('drag-over')
  
  // Processar drop do componente
  const data = e.dataTransfer.getData('application/json')
  if (data) {
    try {
      const componentTemplate = JSON.parse(data)
      addComponentToSlot(componentTemplate)
    } catch (error) {
      console.error('Erro ao processar drop no slot:', error)
    }
  }
}
</script>

<style scoped>
.slot-drop-area {
  position: relative;
  transition: all 0.2s ease;
}

.slot-drop-area.drag-over {
  border-color: #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.1) !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
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

.slot-placeholder {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}

.slot-content {
  /* Estilo para modo de renderização - sem estilos especiais necessários */
  display: contents;
}
</style>
