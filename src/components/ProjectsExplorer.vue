<template>
  <div class="q-pa-sm">
    <q-input v-model="filter" dense outlined clearable placeholder="Filtrar...">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-separator class="q-my-xs" />

    <q-scroll-area style="height: calc(100vh - 160px)">
      <q-list dense bordered separator>
        <template v-for="project in projects" :key="project.name">
          <q-expansion-item :label="project.name" icon="folder" expand-separator dense default-opened class="exp-item">
            <template v-for="folder in project.folders" :key="folder.name">
              <q-expansion-item :label="folder.name" icon="folder_open" dense expand-separator default-opened class="exp-item">
                <q-item v-for="file in folder.files" :key="file.name" clickable @click="loadIntoDesigner(project.name, folder.name, file.name)" class="file-item">
                  <q-item-section avatar>
                    <q-icon name="description" size="14px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="file-label">{{ file.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat dense round size="xs" icon="play_arrow" @click.stop="openPreview(project.name, folder.name, file.name)" />
                  </q-item-section>
                </q-item>
              </q-expansion-item>
            </template>
          </q-expansion-item>
        </template>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const filter = ref('')

const modules = import.meta.glob('../../projects/**/*.json', { as: 'url' })

const files = Object.keys(modules).map((path) => {
  const parts = path.split('/projects/')[1].split('/')
  const project = parts[0]
  const folder = parts[1] || ''
  const name = (parts[2] || parts[1] || '').replace('.json','')
  return { path, project, folder, name }
})

const projects = computed(() => {
  const f = filter.value.toLowerCase()
  const map = {}
  files.forEach((file) => {
    if (f && !file.name.toLowerCase().includes(f) && !file.project.toLowerCase().includes(f)) return
    if (!map[file.project]) map[file.project] = { name: file.project, folders: {} }
    const folderName = file.folder || 'root'
    if (!map[file.project].folders[folderName]) map[file.project].folders[folderName] = { name: folderName, files: [] }
    map[file.project].folders[folderName].files.push({ name: file.name })
  })
  return Object.values(map).map((proj) => ({ name: proj.name, folders: Object.values(proj.folders) }))
})

async function loadIntoDesigner(project, folder, filename) {
  try {
    const url = `/projects/${project}/${folder}/${filename}.json`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Falha ao carregar JSON')
    const json = await res.json()
    window.dispatchEvent(new CustomEvent('load-designer-json', { detail: { data: json, meta: { project, folder, filename } } }))
  } catch (e) {
    console.error(e)
  }
}

function openPreview(project, folder, filename) {
  if (folder === 'views' || folder === 'root') {
    router.push(`/project/${project}/${filename}`)
  }
}
</script>

<style scoped>
.file-item { min-height: 22px; padding: 2px 4px; }
.file-label { font-size: 12px; line-height: 16px; }
.exp-item :deep(.q-item) { min-height: 26px; padding: 2px 6px; }
.exp-item :deep(.q-item__label) { font-size: 12px; }
</style>
