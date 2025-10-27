<template>
    <div 
      class="jtable-container"
      :style="containerStyle"
    >
        <table class="jtable" :style="tableStyle">
          <tbody>
            <tr v-for="(row, rowIndex) in tableRows" :key="`row-${rowIndex}`">
              <td 
                v-for="(col, colIndex) in tableCols" 
                :key="`cell-${rowIndex}-${colIndex}`"
                class="jtable-cell"
                :style="cellStyle"
              >
                <SlotRenderer 
                  :slot-name="`r${rowIndex + 1}c${colIndex + 1}`"
                  :component="props.component"
                  :edit-mode="props.editMode"
                  :selected-component-id="props.selectedComponentId"
                  @select-component="$emit('select-component', $event)"
                  @open-inspector="$emit('open-inspector', $event)"
                  @delete-component="$emit('delete-component', $event)"
                  @update-component-value="$emit('update-component-value', $event)"
                  @handle-drag-over="$emit('handle-drag-over', $event)"
                  @handle-drag-start="$emit('handle-drag-start', $event)"
                  @handle-drag-end="$emit('handle-drag-end', $event)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Controles de edição -->
        <div v-if="props.editMode === 'edit'" class="table-controls">
          <div class="control-buttons">
            <button @click="addRow" class="control-btn" title="Adicionar linha">+ Linha</button>
            <button @click="removeRow" class="control-btn" title="Remover linha">- Linha</button>
            <button @click="addCol" class="control-btn" title="Adicionar coluna">+ Coluna</button>
            <button @click="removeCol" class="control-btn" title="Remover coluna">- Coluna</button>
          </div>
        </div>
    </div>
</template>
<script setup>
import { computed, nextTick } from 'vue'
import ComponentRenderer from '../../components/ComponentRenderer.vue'
import SlotRenderer from '../../components/SlotRenderer.vue'

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
  'handle-drag-start',
  'handle-drag-end'
])

// Computed para gerar arrays de linhas e colunas
const tableRows = computed(() => {
  const rows = props.component.values?.rows || 2
  return Array.from({ length: rows }, (_, i) => i)
})

const tableCols = computed(() => {
  const cols = props.component.values?.cols || 3
  return Array.from({ length: cols }, (_, i) => i)
})

// Computeds para estilos baseados nas props
const containerStyle = computed(() => {
  const values = props.component.values || {}
  return {
    padding: values.padding || '8px',
    margin: values.margin || '8px',
    backgroundColor: values.backgroundColor || 'transparent',
    position: 'relative'
  }
})

const tableStyle = computed(() => {
  const values = props.component.values || {}
  return {
    width: '100%',
    borderCollapse: 'collapse',
    border: 'none',
    ...(values.style ? { style: values.style } : {})
  }
})

const cellStyle = computed(() => {
  const values = props.component.values || {}
  return {
    padding: values.padding || '8px',
    minWidth: '100px',
    minHeight: '50px',
    border: 'none',
    verticalAlign: 'top'
  }
})

// Funções para controlar linhas e colunas
async function addRow() {
  const currentRows = props.component.values?.rows || 2
  const newRows = Math.min(currentRows + 1, 10)
  console.log('🔄 JTable.addRow() - currentRows:', currentRows, 'newRows:', newRows)
  
  // Atualizar o componente diretamente para forçar reatividade
  if (props.component.values) {
    props.component.values.rows = newRows
  } else {
    props.component.values = { rows: newRows, cols: props.component.values?.cols || 3 }
  }
  
  // Emitir evento para sincronizar com o Designer
  emit('update-component-value', props.component.id, { 
    values: { ...props.component.values }
  })
  
  // Forçar reatividade no próximo tick
  await nextTick()
}

async function removeRow() {
  const currentRows = props.component.values?.rows || 2
  const newRows = Math.max(currentRows - 1, 1)
  console.log('🔄 JTable.removeRow() - currentRows:', currentRows, 'newRows:', newRows)
  
  // Atualizar o componente diretamente para forçar reatividade
  if (props.component.values) {
    props.component.values.rows = newRows
  } else {
    props.component.values = { rows: newRows, cols: props.component.values?.cols || 3 }
  }
  
  // Emitir evento para sincronizar com o Designer
  emit('update-component-value', props.component.id, { 
    values: { ...props.component.values }
  })
  
  // Forçar reatividade no próximo tick
  await nextTick()
}

async function addCol() {
  const currentCols = props.component.values?.cols || 3
  const newCols = Math.min(currentCols + 1, 10)
  console.log('🔄 JTable.addCol() - currentCols:', currentCols, 'newCols:', newCols)
  
  // Atualizar o componente diretamente para forçar reatividade
  if (props.component.values) {
    props.component.values.cols = newCols
  } else {
    props.component.values = { rows: props.component.values?.rows || 2, cols: newCols }
  }
  
  // Emitir evento para sincronizar com o Designer
  emit('update-component-value', props.component.id, { 
    values: { ...props.component.values }
  })
  
  // Forçar reatividade no próximo tick
  await nextTick()
}

async function removeCol() {
  const currentCols = props.component.values?.cols || 3
  const newCols = Math.max(currentCols - 1, 1)
  console.log('🔄 JTable.removeCol() - currentCols:', currentCols, 'newCols:', newCols)
  
  // Atualizar o componente diretamente para forçar reatividade
  if (props.component.values) {
    props.component.values.cols = newCols
  } else {
    props.component.values = { rows: props.component.values?.rows || 2, cols: newCols }
  }
  
  // Emitir evento para sincronizar com o Designer
  emit('update-component-value', props.component.id, { 
    values: { ...props.component.values }
  })
  
  // Forçar reatividade no próximo tick
  await nextTick()
}

</script>

<style scoped>
.jtable-container {
  /* Estilos aplicados via computed - containerStyle */
  display: block;
}

.jtable {
  border: none !important;
  border-collapse: collapse;
}

.jtable-cell {
  border: none !important;
  vertical-align: top;
}

.table-controls {
  position: absolute;
  bottom: -30px;
  right: 0;
  z-index: 10;
}

.control-buttons {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-btn {
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e0e0e0;
  border-color: #999;
}

.control-btn:active {
  background: #d0d0d0;
}
</style>
