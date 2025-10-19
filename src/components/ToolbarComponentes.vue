<template>
  <div class="column full-height">
    <div class="q-pa-sm">
      <q-input
        v-model="searchText"
        placeholder="Buscar componentes..."
        dense
        outlined
        clearable
        :dark="isDark"
        :color="isDark ? 'white' : 'primary'"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <q-separator />

    <q-scroll-area class="col">
      <div class="q-pa-xs">
        <div v-if="filteredComponents.length === 0" class="text-grey-6 q-pa-sm text-center">
          Nenhum componente encontrado.
        </div>
        <div v-else>
          <div 
            v-for="(category, index) in filteredCategories" 
            :key="category.name"
          >
            <div v-if="index > 0" class="q-my-xs">
              <q-separator />
            </div>
            
            <div class="text-caption text-grey-7 q-pa-xs text-weight-medium">
              {{ category.label }}
            </div>
            
            <div class="q-gutter-y-xs">
              <q-item 
                v-for="component in getComponentsByCategory(category.name)" 
                :key="component.name"
                clickable
                dense
                class="rounded-borders component-item"
                draggable="true"
                @click="selectComponent(component)"
                @dragstart="handleDragStart($event, component)"
              >
                <q-item-section avatar style="min-width: 0px;">
                  <q-icon :name="component.icon" size="16px" class="text-grey-6" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption text-weight-medium">{{ component.displayName }}</q-item-label>
                  <q-tooltip>{{ component.description }}</q-tooltip>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Dark } from 'quasar'
import { getAllComponentsWithMetadata } from './ComponentRegistry.js'

const emit = defineEmits(['component-selected'])

const searchText = ref('')
const isDark = ref(Dark.isActive)

const components = getAllComponentsWithMetadata()

const categories = [
  { name: 'form', label: 'Formulário' },
  { name: 'layout', label: 'Layout' },
  { name: 'media', label: 'Mídia' },
  { name: 'navigation', label: 'Navegação' },
  { name: 'data', label: 'Data' },
  { name: 'other', label: 'Outros' }
]

const filteredComponents = computed(() => {
  if (!searchText.value) return components
  const search = searchText.value.toLowerCase()
  return components.filter(component => 
    component.displayName.toLowerCase().includes(search) ||
    component.description.toLowerCase().includes(search) ||
    component.name.toLowerCase().includes(search)
  )
})

const filteredCategories = computed(() => {
  return categories.filter(category => getComponentsByCategory(category.name).length > 0)
})

function getComponentsByCategory(categoryName) {
  return filteredComponents.value.filter(component => component.category === categoryName)
}

function selectComponent(component) { emit('component-selected', component) }

function handleDragStart(event, component) {
  event.dataTransfer.setData('application/json', JSON.stringify(component))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.component-item { min-height: 28px; padding: 4px 6px; }
</style>
