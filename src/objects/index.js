// Sistema centralizado - agora usa ComponentRegistry.js
import { getBaseObject, getAllComponentsWithMetadata } from '../components/ComponentRegistry.js'

// Fábrica para instanciar por nome (usando ComponentRegistry)
export async function createObjectInstance(name) {
  const BaseObjectClass = await getBaseObject(name)
  if (!BaseObjectClass) return null
  return new BaseObjectClass()
}

// Lista de metadados (instâncias protótipo) para toolbar
export async function getAllObjectDefinitions() {
  const components = getAllComponentsWithMetadata()
  const definitions = []
  
  for (const comp of components) {
    try {
      const BaseObjectClass = await getBaseObject(comp.name)
      if (!BaseObjectClass) {
        console.warn(`BaseObject não encontrado para: ${comp.name}`)
        continue
      }
      
      const instance = new BaseObjectClass()
      definitions.push({
        name: instance.name,
        displayName: instance.displayName,
        category: instance.category,
        description: instance.description,
        icon: instance.icon,
        props: instance.props || {},
        emits: instance.emits || {}
      })
    } catch (error) {
      console.error(`Erro ao criar instância de ${comp.name}:`, error)
    }
  }
  
  return definitions
}

// Expor registry globalmente para consumidores dinâmicos (ex.: ObjectInspector)
try {
  const w = typeof window !== 'undefined' ? window : globalThis
  w.__jbuilderObjectRegistry = { createObjectInstance, getAllObjectDefinitions }
} catch (e) { /* noop */ }