<template>
  <!-- <q-drawer
    v-model="drawerOpen"
    side="right"
    :width="280"
    :breakpoint="0"
    overlay
    bordered
    class="bg-grey-1"
  > -->
    <div class="column full-height">
      <div>
        <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary">
          <q-tab name="props" label="Props" />
          <q-tab v-if="hasEvents" name="events" label="Events" />
        </q-tabs>
      </div>

      <q-separator />

      <q-scroll-area class="col">
        <div>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="props" class="q-pa-none">
              <div v-if="propsRows.length === 0" class="text-grey-6 q-pa-sm">Sem propriedades.</div>
              <div v-else class="q-gutter-y-xs">
                <div v-for="row in propsRows" :key="row.name" class="row q-col-gutter-xs items-start q-pa-xs" @keydown.backspace.stop>
                  <div class="col-4 text-caption text-grey-7">
                    <div class="ellipsis" :title="row.meta?.description || row.name">{{ row.meta?.label || row.name }}</div>
                    <div v-if="row.meta?.hint" class="text-grey-6 text-italic" style="font-size:10px;">{{ row.meta.hint }}</div>
                  </div>
                  <div class="col-8" v-if="row.visible">
                    <!-- {{  resolveEditor(row)  }} -->
                       <!-- {{ row.visible }} -->
                    <!-- Boolean -->
                    <q-checkbox
                      v-if="resolveEditor(row) === 'boolean'"
                      v-model="row.value"
                      :dense="true"
                      class="full-width"
                      @update:model-value="updatePropValue(row.name, $event)"
                    />

                    <!-- Select -->
                    <q-select
                      v-else-if="resolveEditor(row) === 'select'"
                      v-model="row.value"
                      :options="normalizeOptions(row.meta?.options)"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      :dense="true"
                      outlined
                      @update:model-value="updatePropValue(row.name, $event)"
                    />

                    <!-- Link to component by type: editor = 'link', linkType = 'Dataset' (or any object name) -->
                    <q-select
                      v-else-if="resolveEditor(row) === 'link' && row.meta?.linkType"
                      v-model="row.value"
                      :options="findComponentsByType(row.meta.linkType).map(c => ({ label: c.values?.name || c.name, value: c.id }))"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      :dense="true"
                      outlined
                      @update:model-value="updatePropValue(row.name, $event)"
                    />

                    <!-- Radio -->
                    <q-option-group
                      v-else-if="resolveEditor(row) === 'radio'"
                      v-model="row.value"
                      type="radio"
                      :options="normalizeOptions(row.meta?.options)"
                      @update:model-value="updatePropValue(row.name, $event)"
                    />

                    <!-- Color with picker button -->
                    <div v-else-if="resolveEditor(row) === 'color'" class="row items-center no-wrap">
                      <div class="col">
                        <q-input
                          v-model="row.value"
                          :dense="true"
                          outlined
                          class="full-width"
                          @update:model-value="updatePropValue(row.name, $event)"
                        >
                          <template #append>
                            <q-btn dense round flat icon="palette">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-color v-model="row.value" format="hex" @update:model-value="val => updatePropValue(row.name, val)" />
                              </q-popup-proxy>
                            </q-btn>
                          </template>
                        </q-input>
                      </div>
                      <div class="q-ml-xs" style="width:20px;height:20px;border:1px solid #e0e0e0;border-radius:2px;" :style="{ backgroundColor: row.value }"></div>
                    </div>

                    <!-- Number -->
                    <q-input
                      v-else-if="resolveEditor(row) === 'number'"
                      v-model.number="row.value"
                      type="number"
                      :dense="true"
                      outlined
                      class="full-width"
                      @update:model-value="updatePropValue(row.name, $event)"
                    />

                    <!-- Textarea -->
                    <q-input
                      v-else-if="resolveEditor(row) === 'textarea'"
                      v-model="row.value"
                      type="textarea"
                      :autogrow="true"
                      :dense="true"
                      outlined
                      class="full-width"
                      @update:model-value="updatePropValue(row.name, $event)"
                    >
                      <template #append>
                        <q-btn dense round flat icon="more_horiz" @click="openDialogForRow(row)" />
                      </template>
                    </q-input>

                    <!-- Object/Array (JSON) - usar diálogo para edição pesada -->
                    <q-input
                      v-else-if="resolveEditor(row) === 'object' || resolveEditor(row) === 'array'"
                      :model-value="stringifySafe(row.value)"
                      readonly
                      dense
                      outlined
                      class="full-width"
                    >
                      <template #append>
                        <q-btn dense round flat icon="more_horiz" @click="openDialogForRow(row)" />
                      </template>
                    </q-input>

                    <!-- Javascript -->
                    <q-input
                      v-else-if="resolveEditor(row) === 'javascript'"
                      :model-value="ensureString(row.value)"
                      readonly
                      dense
                      outlined
                      class="full-width"
                    >
                      <template #append>
                        <q-btn dense round flat icon="more_horiz" @click="openDialogForRow(row)" />
                      </template>
                    </q-input>

                    <!-- CSS -->
                    <q-input
                      v-else-if="resolveEditor(row) === 'css'"
                      :model-value="ensureString(row.value)"
                      readonly
                      dense
                      outlined
                      class="full-width"
                    >
                      <template #append>
                        <q-btn dense round flat icon="more_horiz" @click="openDialogForRow(row)" />
                      </template>
                    </q-input>

                    <!-- Default text -->
                    <q-input
                      v-else
                      v-model="row.value"
                      :type="getInputType(row.value)"
                      :dense="true"
                      outlined
                      class="full-width"
                      @update:model-value="updatePropValue(row.name, $event)"
                    >
                      <template v-if="row.meta?.dialog === true || row.meta?.editor === 'javascript' || row.meta?.editor === 'css'" #append>
                        <q-btn dense round flat icon="more_horiz" @click="openDialogForRow(row)" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel v-if="hasEvents" name="events" class="q-pa-none">
              <div v-if="eventRows.length === 0" class="text-grey-6 q-pa-sm">Sem eventos.</div>
              <div v-else class="q-gutter-y-xs">
                <div v-for="row in eventRows" :key="row.name" class="row q-col-gutter-xs items-center q-pa-xs" @keydown.backspace.stop>
                  <div v-if="row.visible !== false">    
                    <div class="col-4 text-caption text-grey-7">{{ row.name }}</div>
                      <div class="col-8 row items-center no-wrap">
                        <div class="col text-caption text-grey-6 ellipsis" :title="previewEvent(row.value)">{{ previewEvent(row.value) }}</div>
                        <q-btn class="q-ml-sm" dense flat icon="code" @click="openDialogForEvent(row)" />
                      </div>
                    </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-scroll-area>

    <!-- Dialog para edições grandes -->
    <q-dialog v-model="dialog.open" @hide="resetDialog">
      <q-card style="min-width: 70vw; min-height: 60vh;">
        <q-bar class="bg-grey-10">
          <div class="text-subtitle2 text-white">{{ dialog.title }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-none">
          <Suspense>
            <template #default>
              <JsonEditor 
                v-if="dialog.open"
                :key="dialogKey" 
                :visible="dialog.visible"
                :model-value="dialog.content" 
                :language="dialog.language" 
                :path="`inspector:${dialog.language}:${dialogKey}`"
                theme="vs-dark" 
                height="60vh" 
                @update:model-value="onDialogContent" 
              />
            </template>
            <template #fallback>
              <div class="q-pa-md text-grey">Carregando editor...</div>
            </template>
          </Suspense>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Salvar" @click="saveDialog()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
  <!-- </q-drawer> -->
</template>

<script setup>
import { computed, ref, watch, Suspense } from 'vue'
import JsonEditor from './JsonEditor.vue'

const propsDef = defineProps({
  target: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue','open-code-editor'])

const drawerOpen = computed({
  get: () => propsDef.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const tab = ref('props')
const dialog = ref({ open: false, title: '', language: 'json', content: '', row: null, isEvent: false, visible: false })
const dialogKey = ref(0)

const propsRows = computed(() => {
  if (!propsDef.target) return []

  // Sempre re-hidratar metadados a partir da classe do objeto para garantir funções (visibleIf)
  let definitionProps = propsDef.target.props || {}
  try {
    const objName = propsDef.target?.name
    if (objName) {
      // acessar registry já importado em runtime via window (cache pelo bundler)
      const w = typeof window !== 'undefined' ? window : globalThis
      const registry = w.__jbuilderObjectRegistry
      if (registry && registry[objName]) {
        const instance = new registry[objName]()
        if (instance && instance.props) definitionProps = instance.props
      }
    }
  } catch (e) { /* noop */ }
  const values = propsDef.target.values || {}
  // Forçar dependência reativa profunda
  const __reactiveKey = JSON.stringify(values)
  // console.log('__reactiveKey', __reactiveKey);

  return Object.keys(definitionProps)
    .map((key) => {
      const meta = normalizePropMeta(definitionProps[key])
      const computedVisible = isPropVisible(meta, values)
      return {
        name: key,
        value: values?.[key] ?? (typeof meta.default === 'function' ? meta.default() : meta.default),
        originalValue: values?.[key] ?? meta.default,
        visible: computedVisible,
        meta
      }
    })
    .filter(row => row.visible)
    .map(row => ({ ...row }))
})

const eventRows = computed(() => {
  if (!propsDef.target) return []
  const source = propsDef.target.emits || {}
  return Object.keys(source).map((key) => ({ 
    name: key, 
    value: propsDef.target.values?.[key] ?? source[key]?.default ?? null,
    originalValue: propsDef.target.values?.[key] ?? source[key]?.default ?? null,
    visible: source[key]?.visible,
  }))
})

const hasEvents = computed(() => eventRows.value.length > 0)

watch(() => propsDef.target, () => {
  tab.value = 'props'
})

watch(hasEvents, (v) => {
  if (!v && tab.value === 'events') tab.value = 'props'
})

function normalizePropMeta(propDef) {
  const meta = propDef || {}
  // type pode vir como construtor (String) ou string ('string') ou nossos editores
  let inferredType = typeof meta.type === 'function' ? inferTypeFromCtor(meta.type) : (typeof meta.type === 'string' ? meta.type.toLowerCase() : undefined)
  // fallback: inferir pelo default quando possível
  if (!inferredType && Object.prototype.hasOwnProperty.call(meta, 'default')) {
    try {
      const sample = typeof meta.default === 'function' ? meta.default() : meta.default
      const t = typeof sample
      if (Array.isArray(sample)) inferredType = 'array'
      else if (sample !== null && t === 'object') inferredType = 'object'
      else if (t === 'boolean' || t === 'number' || t === 'string') inferredType = t
    } catch (e) { /* ignore */ }
  }
  const editorKey = (meta.editorType || meta.editor || inferredType || 'text')
  const editor = typeof editorKey === 'string' ? editorKey.toLowerCase() : editorKey
  return {
    ...meta,
    type: inferredType,
    editor,
    visible: meta.visible !== false,
    options: meta.options || undefined
  }
}

function isPropVisible(meta, values) {
  console.log('isPropVisible', meta, values);
  if (meta.visible === false) return false
  if (typeof meta.visibleIf === 'function') {
    try { return !!meta.visibleIf(values) } catch (_) { return true }
  }
  return true
}

function inferTypeFromCtor(ctor) {
  switch (ctor) {
    case String: return 'string'
    case Number: return 'number'
    case Boolean: return 'boolean'
    case Array: return 'array'
    case Object: return 'object'
    default: return 'string'
  }
}

function resolveEditor(row) {
  const editor = row.meta?.editor
  if (editor === 'radio' || editor === 'select' || editor === 'textarea' || editor === 'javascript' || editor === 'css' || editor === 'color' || editor === 'link') return editor
  if (editor === 'array' || editor === 'object' || editor === 'boolean') return editor
  if (row.meta?.type === 'number') return 'number'
  // if (row.meta?.type === 'boolean') return 'boolean'
  return 'text'
}

function normalizeOptions(options) {
  if (!options) return []
  return options.map(opt => {
    if (typeof opt === 'object' && opt && 'label' in opt && 'value' in opt) return opt
    return { label: String(opt), value: opt }
  })
}

// Busca de componentes pelo tipo, percorrendo a árvore da View raiz
function findComponentsByType(typeName) {
  console.log('findComponentsByType', typeName);
  const root = (typeof window !== 'undefined' ? window.__jbuilderRootTree : null)
  const results = []
  if (!root) return results
  const walk = (node) => {
    if (!node) return
    if (node.name === typeName) results.push(node)
    const children = Array.isArray(node.children) ? node.children : []
    for (const child of children) walk(child)
  }
  walk(root)
  console.warn('findComponentsByType', typeName, results);
  return results
}

function getInputType(value) {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string' && value.includes('@')) return 'email'
  return 'text'
}

function stringifySafe(val) {
  try { return typeof val === 'string' ? val : JSON.stringify(val ?? {}, null, 2) } catch (e) { return 'null' }
}

function ensureString(val) {
  return typeof val === 'string' ? val : String(val ?? '')
}

function updatePropValue(propName, newValue) {
  if (!propsDef.target) return

  const propMeta = normalizePropMeta(propsDef.target.props?.[propName] || {})
  let convertedValue = newValue

  // Conversões por editor/tipo
  switch (propMeta.editor) {
    case 'number':
      convertedValue = typeof newValue === 'number' ? newValue : parseFloat(newValue)
      if (Number.isNaN(convertedValue)) convertedValue = 0
      break
    case 'boolean':
      convertedValue = Boolean(newValue)
      break
    case 'select':
    case 'radio':
      convertedValue = newValue
      break
    case 'color':
      convertedValue = String(newValue || '')
      break
    case 'array':
    case 'object':
      try {
        // Se veio string do editor, fazer parse
        convertedValue = typeof newValue === 'string' ? JSON.parse(newValue || 'null') : newValue
      } catch (e) {
        // mantém string bruta para não perder dados do usuário
        convertedValue = newValue
      }
      break
    case 'javascript':
    case 'css':
      convertedValue = ensureString(newValue)
      break
    default:
      // fallback por type
      if (propMeta.type === 'number') {
        convertedValue = typeof newValue === 'number' ? newValue : parseFloat(newValue)
        if (Number.isNaN(convertedValue)) convertedValue = 0
      } else if (propMeta.type === 'boolean') {
        convertedValue = Boolean(newValue)
      } else {
        convertedValue = newValue
      }
  }

  // Garantir estrutura de values
  if (!propsDef.target.values) propsDef.target.values = {}
  propsDef.target.values[propName] = convertedValue

  // Exclusividades: se este campo define exclusiveWith e ficou "preenchido",
  // limpar os campos exclusivos
  try {
    const propMeta = propsDef?.target?.props?.[propName]
    const exclusiveWith = propMeta && Array.isArray(propMeta.exclusiveWith) ? propMeta.exclusiveWith : []
    const isFilled = convertedValue !== undefined && convertedValue !== null && String(convertedValue).length > 0
    if (isFilled && exclusiveWith.length > 0) {
      exclusiveWith.forEach((other) => {
        if (propsDef.target.values && Object.prototype.hasOwnProperty.call(propsDef.target.values, other)) {
          propsDef.target.values[other] = ''
        }
      })
    }
  } catch (_) { /* noop */ }
}

function updateEventValue(eventName, newValue) {
  if (!propsDef.target) return
  let convertedValue = ensureString(newValue)
  if (!propsDef.target.values) propsDef.target.values = {}
  propsDef.target.values[eventName] = convertedValue
}

function openDialogForRow(row) {
  // Delegar para o Designer abrir a aba CODE
  emit('open-code-editor', {
    componentId: propsDef.target?.id,
    propName: row.name,
    language: pickLanguageForEditor(resolveEditor(row)),
    content: resolveDialogContent(row),
    title: row.meta?.label || row.name
  })
}

function openDialogForEvent(row) {
  emit('open-code-editor', {
    componentId: propsDef.target?.id,
    propName: row.name,
    language: 'javascript',
    content: ensureString(row.value || ''),
    title: `Evento: ${row.name}`
  })
}

function pickLanguageForEditor(editor) {
  if (editor === 'javascript') return 'javascript'
  if (editor === 'css') return 'css'
  if (editor === 'object' || editor === 'array' || editor === 'textarea') return 'json'
  return 'plaintext'
}

function resolveDialogContent(row) {
  const editor = resolveEditor(row)
  if (editor === 'object' || editor === 'array') return stringifySafe(row.value)
  return ensureString(row.value)
}

function onDialogContent(val) {
  dialog.value.content = val
}

function saveDialog() {
  const d = dialog.value
  if (!d.row) { dialog.value.open = false; return }
  if (d.isEvent) {
    updateEventValue(d.row.name, d.content)
  } else {
    updatePropValue(d.row.name, d.content)
  }
  dialog.value.open = false
}

function previewEvent(val) {
  const text = ensureString(val || '')
  const oneLine = text.replace(/\n/g, ' ').trim()
  return oneLine.length > 40 ? oneLine.slice(0, 40) + '…' : oneLine
}

function resetDialog() {
  // Aguarda o próximo tick para liberar o Monaco e GC
  setTimeout(() => {
    dialogKey.value++
    dialog.value = { open: false, title: '', language: 'json', content: '', row: null, isEvent: false, visible: false }
  }, 0)
}
</script>

<style scoped>
.q-input {
  font-size: 12px;
}

.q-input :deep(.q-field__control) {
  min-height: 28px;
  height: 28px;
}

.q-input :deep(.q-field__native) {
  padding: 4px 8px;
  font-size: 12px;
}

.q-checkbox {
  font-size: 12px;
}

.q-checkbox :deep(.q-checkbox__bg) {
  width: 16px;
  height: 16px;
}
</style>


