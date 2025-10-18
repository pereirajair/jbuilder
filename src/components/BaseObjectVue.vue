<template>
  <component
    :is="componentTag"
    v-bind="componentProps"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Renderizar children por slot -->
    <template v-for="(slotChildren, slotName) in childrenBySlot" :key="`slot-${slotName}`">
      <ComponentRenderer
        v-for="child in slotChildren"
        :key="child.id"
        :component="child"
        :edit-mode="editMode"
        :selected-component-id="selectedComponentId"
        @select-component="$emit('select-component', $event)"
        @open-inspector="$emit('open-inspector', $event)"
        @delete-component="$emit('delete-component', $event)"
        @update-component-value="$emit('update-component-value', $event)"
        @handle-drag-over="$emit('handle-drag-over', $event)"
        @handle-drop-on-component="$emit('handle-drop-on-component', $event)"
        @handle-drag-start="$emit('handle-drag-start', $event)"
        @handle-drag-end="$emit('handle-drag-end', $event)"
      />
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import ComponentRenderer from './ComponentRenderer.vue'
import { createObjectInstance } from '../objects'

const props = defineProps({
  component: { type: Object, required: true },
  editMode: { type: String, default: 'edit' },
  selectedComponentId: { type: String, default: null }
})

const emit = defineEmits([
  'select-component',
  'open-inspector',
  'delete-component',
  'update-component-value',
  'handle-drag-over',
  'handle-drop-on-component',
  'handle-drag-start',
  'handle-drag-end',
  'click',
  'mouseenter',
  'mouseleave'
])

// Obter instância do BaseObject
const objectInstance = computed(() => {
  return createObjectInstance(props.component.name)
})

// Renderizar usando o BaseObject
const renderData = computed(() => {
  if (!objectInstance.value) return null
  
  const ctx = {
    component: props.component,
    editMode: props.editMode,
    onUpdate: (key, value) => emit('update-component-value', props.component.id, { [key]: value }),
    emit: (event, data) => emit(event, data)
  }

  return props.editMode === 'preview' 
    ? objectInstance.value.renderPreview(ctx)
    : objectInstance.value.renderEdit(ctx)
})

// Componente a ser renderizado
const componentTag = computed(() => {
  if (!renderData.value) return 'div'
  
  // Se for um objeto com tag, usar a tag
  if (renderData.value.tag) {
    return renderData.value.tag
  }
  
  // Se for um componente Vue (string), usar diretamente
  if (typeof renderData.value === 'string') {
    return renderData.value
  }
  
  return 'div'
})

// Props do componente
const componentProps = computed(() => {
  if (!renderData.value) return {}
  
  // Se for um objeto com props, usar as props
  if (renderData.value.props) {
    return renderData.value.props
  }
  
  return {}
})

// Agrupar children por slotName
const childrenBySlot = computed(() => {
  const children = props.component.children || []
  const grouped = {}
  
  children.forEach(child => {
    const slotName = child.slotName || 'default'
    if (!grouped[slotName]) {
      grouped[slotName] = []
    }
    grouped[slotName].push(child)
  })
  
  return grouped
})

// Event handlers
function handleClick(event) {
  emit('click', event)
  emit('select-component', props.component.id)
}

function handleMouseEnter(event) {
  emit('mouseenter', event)
}

function handleMouseLeave(event) {
  emit('mouseleave', event)
}
</script>
