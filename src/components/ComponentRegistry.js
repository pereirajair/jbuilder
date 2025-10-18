// Registry global de todos os componentes da plataforma
import { 
  QInput, 
  QBtn, 
  QSelect, 
  QCard, 
  QCardSection,
  QIcon
} from 'quasar'
import JTable from '../objects/JTable/JTable.vue'
import { DISCOVERED_COMPONENTS, getAllDiscoveredComponents } from './ComponentDiscovery.js'

// Registry de componentes Quasar
const quasarComponents = {
  'q-input': QInput,
  'q-btn': QBtn,
  'q-select': QSelect,
  'q-card': QCard,
  'q-card-section': QCardSection,
  'q-icon': QIcon,
  'j-table': JTable,
}

// Registry de componentes Vue customizados com cache
const customComponents = new Map()
const loadingPromises = new Map()

// Lista de componentes disponíveis (descoberta automática)
export const AVAILABLE_COMPONENTS = DISCOVERED_COMPONENTS

// Função para obter componente Quasar
export function getQuasarComponent(name) {
  return quasarComponents[name] || null
}

// Função para verificar se é um componente Quasar
export function isQuasarComponent(name) {
  return name in quasarComponents
}

// Função para registrar componente customizado
export function registerCustomComponent(name, component) {
  customComponents.set(name, component)
}

// Função para obter componente customizado (com cache)
export function getCustomComponent(name) {
  return customComponents.get(name) || null
}

// Função para carregar componente customizado dinamicamente
export async function loadCustomComponent(name) {
  // Se já está carregado, retornar imediatamente
  if (customComponents.has(name)) {
    return customComponents.get(name)
  }

  // Se já está carregando, aguardar a promise existente
  if (loadingPromises.has(name)) {
    return await loadingPromises.get(name)
  }

  // Criar promise de carregamento
  const loadPromise = (async () => {
    try {
      console.log(`Carregando componente customizado: ${name}`)
      
      // Carregar o componente Vue dinamicamente
      const componentPath = `../objects/${name}/${name}.vue`
      const component = await import(/* @vite-ignore */ componentPath)
      
      const vueComponent = component.default
      console.log(`Componente ${name} carregado com sucesso:`, vueComponent)
      
      // Registrar no cache
      customComponents.set(name, vueComponent)
      
      return vueComponent
    } catch (error) {
      console.warn(`Erro ao carregar componente ${name}:`, error)
      return null
    } finally {
      // Remover da lista de carregamento
      loadingPromises.delete(name)
    }
  })()

  // Armazenar promise de carregamento
  loadingPromises.set(name, loadPromise)
  
  return await loadPromise
}

// Função para carregar todos os componentes disponíveis
export async function loadAllCustomComponents() {
  console.log('Iniciando carregamento automático de componentes customizados...')
  console.log('Componentes disponíveis:', AVAILABLE_COMPONENTS)
  
  const loadPromises = AVAILABLE_COMPONENTS.map(name => loadCustomComponent(name))
  
  try {
    await Promise.all(loadPromises)
    console.log('Todos os componentes customizados carregados:', Array.from(customComponents.keys()))
  } catch (error) {
    console.error('Erro ao carregar componentes customizados:', error)
  }
}

// Função para obter qualquer componente (Quasar ou customizado)
export function getComponent(name) {
  // Primeiro tentar componente Quasar
  const quasarComp = getQuasarComponent(name)
  if (quasarComp) return quasarComp
  
  // Depois tentar componente customizado
  const customComp = getCustomComponent(name)
  if (customComp) return customComp
  
  return null
}

// Função para verificar se é um componente customizado
export function isCustomComponent(name) {
  return name.endsWith('vue') || customComponents.has(name.replace('vue', ''))
}

// Auto-carregar componentes na inicialização
// loadAllCustomComponents()

// Função para obter todos os componentes descobertos com metadados
export function getAllDiscoveredComponentsWithMetadata() {
  return getAllDiscoveredComponents()
}

// Função para obter componentes por categoria
export function getComponentsByCategory(category) {
  return getAllDiscoveredComponents().filter(comp => comp.category === category)
}

// Função para obter informações de um componente específico
export function getComponentInfo(componentName) {
  return getAllDiscoveredComponents().find(comp => comp.name === componentName)
}

// Exportar registry global para debug
export const GlobalComponentRegistry = {
  quasar: quasarComponents,
  custom: customComponents,
  available: AVAILABLE_COMPONENTS,
  discovered: getAllDiscoveredComponents()
}
