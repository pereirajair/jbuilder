<template>
  <div class="json-editor" :style="{ height }">
    <MonacoEditor
      v-if="visible"
      class="editor"
      :value="modelValue"
      :language="language"
      :theme="theme"
      :path="path"
      :options="editorOptions"
      @change="onChange"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
const MonacoEditor = defineAsyncComponent({
  loader: () => import('@guolao/vue-monaco-editor'),
  suspensible: false,
  timeout: 15000
})

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'json'
  },
  theme: {
    type: String,
    default: 'vs-dark'
  },
  height: {
    type: String,
    default: '100%'
  },
  path: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editorOptions = computed(() => ({
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 13,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 2,
}))

function onChange(value) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.editor {
  height: 100%;
  border-radius: 0px;
  overflow: hidden;
}
</style>
