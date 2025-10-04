<template>
  <div class="column full-height">
    <q-tabs v-model="tab" dense align="left" class="text-primary">
      <q-tab name="components" icon="widgets" label="Componentes" />
      <q-tab name="projects" icon="folder" label="Projetos" />
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated class="col">
      <q-tab-panel name="components" class="q-pa-none full-height">
        <ToolbarComponentes @component-selected="$emit('component-selected', $event)" />
      </q-tab-panel>
      <q-tab-panel name="projects" class="q-pa-none full-height">
        <ProjectsExplorer />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProjectsExplorer from './ProjectsExplorer.vue'
import ToolbarComponentes from './ToolbarComponentes.vue'

const tab = ref('components')

// Declarar eventos emitidos
defineEmits(['component-selected'])
</script>

<style scoped>
.full-height { height: 100%; }
</style>

