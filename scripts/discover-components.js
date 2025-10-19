#!/usr/bin/env node

/**
 * Script para descobrir automaticamente componentes na estrutura de pastas
 * Este script escaneia src/objects/ e gera o arquivo ComponentDiscovery.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OBJECTS_DIR = path.join(__dirname, '../src/objects')
const OUTPUT_FILE = path.join(__dirname, '../src/objects/objects.json')

function discoverComponents() {
  console.log('🔍 Escaneando componentes em:', OBJECTS_DIR)
  
  if (!fs.existsSync(OBJECTS_DIR)) {
    console.log('❌ Diretório src/objects não encontrado')
    return { components: [], metadata: {} }
  }
  
  const components = []
  const metadata = {}
  
  // Ler todos os diretórios em src/objects
  const entries = fs.readdirSync(OBJECTS_DIR, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const componentName = entry.name.toLowerCase()
      const componentPath = path.join(OBJECTS_DIR, entry.name)
      
      // Verificar se tem index.js e {name}Vue.vue
      const indexFile = path.join(componentPath, 'index.js')
      const vueFile = path.join(componentPath, `${entry.name}.vue`)
      
      

      if (fs.existsSync(indexFile)) {
        console.log(`✅ Componente encontrado: ${componentName}`)
        
        components.push(componentName)

        let _vueComponent = `src/objects/${entry.name}/${entry.name}.vue`
        if (!fs.existsSync(vueFile)) {
            _vueComponent = false;
        }
        
        // Tentar extrair metadados do index.js
        try {
          const indexContent = fs.readFileSync(indexFile, 'utf8')
          
          // Extrair informações básicas (parsing simples)
          const displayNameMatch = indexContent.match(/displayName:\s*['"`]([^'"`]+)['"`]/)
          const categoryMatch = indexContent.match(/category:\s*['"`]([^'"`]+)['"`]/)
          const iconMatch = indexContent.match(/icon:\s*['"`]([^'"`]+)['"`]/)
          const descriptionMatch = indexContent.match(/description:\s*['"`]([^'"`]+)['"`]/)
          
          metadata[componentName] = {
            name: componentName,
            displayName: displayNameMatch ? displayNameMatch[1] : componentName,
            category: categoryMatch ? categoryMatch[1] : 'layout',
            icon: iconMatch ? iconMatch[1] : 'extension',
            description: descriptionMatch ? descriptionMatch[1] : `Componente ${componentName}`,
            path: `src/objects/${entry.name}/`,
            baseObject: `src/objects/${entry.name}/index.js`,
            vueComponent: _vueComponent
          }
        } catch (error) {
          console.warn(`⚠️  Erro ao extrair metadados de ${componentName}:`, error.message)
          // Metadados padrão
          metadata[componentName] = {
            name: componentName,
            displayName: componentName,
            category: 'layout',
            icon: 'extension',
            description: `Componente ${componentName}`,
            path: `src/objects/${entry.name}/`,
            baseObject: `src/objects/${entry.name}/index.js`,
            vueComponent: _vueComponent
          }
        }
      } else {
        console.log(`⚠️  Componente incompleto: ${componentName} (faltando index.js ou Vue component)`)
      }
    }
  }
  
  return { components, metadata }
}

function generateDiscoveryFile(components, metadata) {
  const timestamp = new Date().toISOString()
  
  const jsonData = {
    _meta: {
      generated: timestamp,
      version: "1.0.0",
      description: "Sistema de descoberta automática de componentes"
    },
    components: components,
    metadata: metadata
  }
  
  const content = JSON.stringify(jsonData, null, 2)
  
  fs.writeFileSync(OUTPUT_FILE, content)
  console.log(`📝 Arquivo gerado: ${OUTPUT_FILE}`)
}

function main() {
  console.log('🚀 Iniciando descoberta de componentes...')
  
  const { components, metadata } = discoverComponents()
  
  if (components.length === 0) {
    console.log('❌ Nenhum componente encontrado')
    return
  }
  
  console.log(`✅ ${components.length} componentes descobertos:`, components)
  
  generateDiscoveryFile(components, metadata)
  
  console.log('🎉 Descoberta de componentes concluída!')
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { discoverComponents, generateDiscoveryFile }
