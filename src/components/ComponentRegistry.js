// Registry unificado de todos os componentes da plataforma
// Combina funcionalidades do ComponentRegistry.js e ComponentLoader.js

// ===== IMPORTS =====

// Componentes Quasar
import { 
  QInput, 
  QBtn, 
  QSelect, 
  QCard, 
  QCardSection,
  QIcon,
  QImg,
  QSpinner,
  QForm,
  QField
} from 'quasar'

// Dados dos componentes (objects.json)
import objectsData from '../objects/objects.json'

// ===== CONFIGURAÇÃO =====

// Extrair dados do JSON
const DISCOVERED_COMPONENTS = objectsData.components
const COMPONENT_METADATA = objectsData.metadata

// Registry de componentes Quasar
const quasarComponents = {
  'q-input': QInput,
  'q-btn': QBtn,
  'q-select': QSelect,
  'q-card': QCard,
  'q-card-section': QCardSection,
  'q-icon': QIcon,
  'q-img': QImg,
  'q-spinner': QSpinner,
  'q-form': QForm,
  'q-field': QField
}

// Mapeamento dinâmico dos BaseObjects (será preenchido automaticamente)
const componentMap = new Map()

// Cache de componentes carregados
const loadedComponents = new Map()
const loadingPromises = new Map()

// ===== FUNÇÃO DE CARREGAMENTO DINÂMICO =====

// Função para carregar dinamicamente um BaseObject
async function loadBaseObject(componentName) {
  const normalizedName = componentName.toLowerCase()
  
  // Se já está no cache, retornar
  if (componentMap.has(normalizedName)) {
    return componentMap.get(normalizedName)
  }
  
  try {
    const metadata = COMPONENT_METADATA[normalizedName]
    if (!metadata) {
      throw new Error(`Componente ${componentName} não encontrado nos metadados`)
    }
    
    // Carregar dinamicamente o BaseObject
    const baseObjectPath = metadata.baseObject
    const baseObjectModule = await import(/* @vite-ignore */ `/${baseObjectPath}`)
    const BaseObjectClass = baseObjectModule.default
    
    // Armazenar no cache
    componentMap.set(normalizedName, BaseObjectClass)
    
    // console.log(`BaseObject carregado dinamicamente: ${componentName}`)
    return BaseObjectClass
  } catch (error) {
    console.error(`Erro ao carregar BaseObject ${componentName}:`, error)
    return null
  }
}

// ===== FUNÇÕES QUASAR =====

// Função para obter componente Quasar
export function getQuasarComponent(name) {
  return quasarComponents[name] || null
}

// Função para verificar se é um componente Quasar
export function isQuasarComponent(name) {
  return name in quasarComponents
}

// ===== FUNÇÕES CUSTOMIZADAS =====

// Função para carregar um componente customizado
export async function loadComponent(componentName) {
  const normalizedName = componentName.toLowerCase().replace(/[-]/g, '')

  if (loadedComponents.has(normalizedName)) {
    return loadedComponents.get(normalizedName)
  }

  if (loadingPromises.has(normalizedName)) {
    return await loadingPromises.get(normalizedName)
  }

  const loadPromise = (async () => {
    try {
      console.log('Carregando componente:', normalizedName);
      const metadata = COMPONENT_METADATA[normalizedName]
      if (!metadata) {
        throw new Error(`Componente ${componentName} não encontrado nos metadados`)
      }

      // Carregar BaseObject dinamicamente
      const BaseObjectClass = await loadBaseObject(componentName)
    //   console.log('BaseObjectClass:', BaseObjectClass);
      if (!BaseObjectClass) {
        throw new Error(`Componente ${componentName} não encontrado no mapeamento`)
      }

      let vueComponent = null;
      if (metadata.vueComponent) {
        try {
          const vueModule = await import(/* @vite-ignore */ `/${metadata.vueComponent}`)
          vueComponent = vueModule.default
        } catch (error) {
          console.warn(`Arquivo Vue não encontrado para ${componentName}:`, error.message)
        }
      }

      const componentData = {
        name: normalizedName,
        metadata,
        baseObject: BaseObjectClass,
        vueComponent,
        hasVueComponent: !!vueComponent
      }

    //   console.log('Componente carregado:', componentData);

      loadedComponents.set(normalizedName, componentData)
      return componentData
    } catch (error) {
      console.error(`Erro ao carregar componente ${componentName}:`, error)
      return null
    } finally {
      loadingPromises.delete(normalizedName)
    }
  })();

  loadingPromises.set(normalizedName, loadPromise);
  return await loadPromise;
}

// Função para obter um componente carregado
export function getLoadedComponent(componentName) {
  return loadedComponents.get(componentName.toLowerCase()) || null
}

// Função para obter BaseObject de um componente
export async function getBaseObject(componentName) {
  const normalizedName = componentName.toLowerCase()
  
  // Se já está carregado, retornar
  if (componentMap.has(normalizedName)) {
    return componentMap.get(normalizedName)
  }
  
  // Carregar dinamicamente
  return await loadBaseObject(componentName)
}

// Função para obter Vue component de um componente
export function getVueComponent(componentName) {
  const normalizedName = componentName.toLowerCase()
  const component = loadedComponents.get(normalizedName)
  return component ? component.vueComponent : null
}

// Função para verificar se um componente tem arquivo Vue
export function hasVueComponent(componentName) {
  const normalizedName = componentName.toLowerCase()
  const component = loadedComponents.get(normalizedName)
  return component ? component.hasVueComponent : false
}

// ===== FUNÇÕES UNIFICADAS =====

// Função para obter qualquer componente (Quasar ou customizado)
export function getComponent(name) {
  // Primeiro tentar componente Quasar
  const quasarComp = getQuasarComponent(name)
  if (quasarComp) return quasarComp
  
  // Depois tentar componente customizado
  const customComp = getVueComponent(name)
  if (customComp) return customComp
  
  return null
}

// Função para verificar se é um componente customizado
export function isCustomComponent(name) {
  // Normalizar removendo hífens e 'vue'
  const normalizedName = name.toLowerCase().replace(/[-]/g, '')
  console.log(`🔍 isCustomComponent(${name}) -> normalizedName: ${normalizedName}`)
  
  // Verificar se existe nos metadados
  const metadata = COMPONENT_METADATA[normalizedName]
  console.log(`🔍 metadata para ${normalizedName}:`, metadata)
  
  if (!metadata) {
    console.log(`❌ Metadados não encontrados para ${normalizedName}`)
    return false
  }
  
  // Se tem vueComponent definido, é customizado
  const hasVueComponent = !!metadata.vueComponent
  console.log(`🔍 ${normalizedName} tem vueComponent:`, hasVueComponent, metadata.vueComponent)
  return hasVueComponent
}

// Função para carregar componente customizado dinamicamente
export async function loadCustomComponent(name) {
  console.log(`🔄 loadCustomComponent(${name}) - iniciando carregamento`)
  const component = await loadComponent(name)
  console.log(`🔄 loadCustomComponent(${name}) - componente carregado:`, component)
  const vueComponent = component ? component.vueComponent : null
  console.log(`🔄 loadCustomComponent(${name}) - vueComponent:`, vueComponent)
  return vueComponent
}

// Função para obter componente customizado (usando cache)
export function getCustomComponent(name) {
  return getVueComponent(name)
}

// ===== FUNÇÕES DE METADADOS =====

// Função para obter todos os componentes com metadados
export function getAllComponentsWithMetadata() {
  return DISCOVERED_COMPONENTS.map(name => ({
    name,
    ...COMPONENT_METADATA[name]
  }))
}

// Função para obter componentes por categoria
export function getComponentsByCategory(category) {
  return getAllComponentsWithMetadata().filter(comp => comp.category === category)
}

// Função para obter informações de um componente específico
export function getComponentInfo(componentName) {
  return getAllComponentsWithMetadata().find(comp => comp.name === componentName)
}

// Função para obter todos os componentes descobertos com metadados
export function getAllDiscoveredComponentsWithMetadata() {
  return getAllComponentsWithMetadata()
}

// ===== FUNÇÕES DE CARREGAMENTO =====

// Função para carregar todos os componentes
export async function loadAllComponents() {
  console.log('Carregando todos os componentes descobertos...')
  
  const loadPromises = DISCOVERED_COMPONENTS.map(async name => {
    try {
      await loadComponent(name)
      console.log(`✅ Componente carregado: ${name}`)
    } catch (error) {
      console.error(`❌ Erro ao carregar ${name}:`, error)
    }
  })
  
  await Promise.all(loadPromises)
  
  console.log('🎉 Todos os componentes carregados:', Array.from(loadedComponents.keys()))
}

// ===== EXPORTS E REGISTRY GLOBAL =====

// Lista de componentes disponíveis
export const AVAILABLE_COMPONENTS = getAllComponentsWithMetadata().map(comp => comp.name)

// Registry global para debug
export const GlobalComponentRegistry = {
  quasar: quasarComponents,
  custom: componentMap,
  loaded: loadedComponents,
  available: AVAILABLE_COMPONENTS,
  discovered: getAllComponentsWithMetadata(),
  metadata: COMPONENT_METADATA
}

// Auto-carregar componentes na inicialização
loadAllComponents().catch(error => {
  console.error('Erro ao carregar componentes:', error)
})