<template>
    <div style="border: 2px solid red; padding: 10px; margin: 5px;">
        <h3>TESTE JTABLE - {{ component.values?.title || 'Sem título' }}</h3>
        <p>Componente JTable funcionando!</p>
        {{ component.props }}
        <div v-if="component.children && component.children.length > 0">
            <h4>Children:</h4>
            <ComponentRenderer
                v-for="child in component.children"
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
        </div>
    </div>
</template>
<script setup>
import ComponentRenderer from '../../components/ComponentRenderer.vue'
import JTableObject from './index'  
import { ref } from 'vue'

defineProps({
  component: { type: Object, required: true },
  editMode: { type: String, default: 'edit' },
  selectedComponentId: { type: String, default: null }
})

defineEmits([
  'select-component',
  'open-inspector',
  'delete-component',
  'update-component-value',
  'handle-drag-over',
  'handle-drop-on-component',
  'handle-drag-start',
  'handle-drag-end'
])

const jtable = ref(new JTableObject());

</script>
