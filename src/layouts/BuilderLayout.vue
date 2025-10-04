<template>
  <q-layout view="hHh lpR fFf">
    <q-header :class="isDark ? 'bg-dark text-white' : 'bg-white text-dark'">
      <q-toolbar :class="isDark ? 'bg-dark text-white' : 'bg-white text-dark'">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Builder
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          dense
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          :label="isDark ? '' : ''"
          @click="toggleDark"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :class="isDark ? 'bg-dark text-white' : 'bg-grey-1'"
    >
      <ToolbarTabs 
        @component-selected="onComponentSelected"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
    
<script setup>
import { ref, provide } from 'vue'
import { Dark } from 'quasar'
import ToolbarTabs from 'components/ToolbarTabs.vue'

const leftDrawerOpen = ref(true)
const inspectorOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}


const isDark = ref(Dark.isActive)

function toggleDark() {
  Dark.set(!Dark.isActive)
  isDark.value = Dark.isActive
}

const componentSelected = ref(null)

function onComponentSelected(component) {
  componentSelected.value = component
  window.dispatchEvent(new CustomEvent('component-selected', { detail: component }))
}

provide('inspectorOpen', inspectorOpen)
provide('onComponentSelected', onComponentSelected)
</script>
    