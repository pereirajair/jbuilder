// Sistema de descoberta automática de componentes
// Gerado automaticamente em: 2025-10-18T14:56:47.726Z
// Para regenerar: npm run discover-components

// Lista de componentes descobertos automaticamente
export const DISCOVERED_COMPONENTS = [
  "button",
  "card",
  "dataset",
  "div",
  "form",
  "httprequest",
  "image",
  "input",
  "jtable",
  "meucomponenteexemplo",
  "meunovocomponente",
  "select",
  "spacer",
  "spinner",
  "textarea",
  "view"
]

// Metadados dos componentes descobertos
export const COMPONENT_METADATA = {
  "button": {
    "name": "button",
    "displayName": "Button",
    "category": "form",
    "icon": "smart_button",
    "description": "Button clicável",
    "path": "src/objects/Button/",
    "baseObject": "src/objects/Button/index.js",
    "vueComponent": false
  },
  "card": {
    "name": "card",
    "displayName": "Card",
    "category": "layout",
    "icon": "credit_card",
    "description": "Cartão para agrupar conteúdo",
    "path": "src/objects/Card/",
    "baseObject": "src/objects/Card/index.js",
    "vueComponent": false
  },
  "dataset": {
    "name": "dataset",
    "displayName": "Dataset",
    "category": "data",
    "icon": "dataset",
    "description": "Fonte de dados para a View (invisível no preview)",
    "path": "src/objects/Dataset/",
    "baseObject": "src/objects/Dataset/index.js",
    "vueComponent": false
  },
  "div": {
    "name": "div",
    "displayName": "Div Container",
    "category": "layout",
    "icon": "view_agenda",
    "description": "Container div para agrupar elementos",
    "path": "src/objects/Div/",
    "baseObject": "src/objects/Div/index.js",
    "vueComponent": false
  },
  "form": {
    "name": "form",
    "displayName": "Form Container",
    "category": "form",
    "icon": "dynamic_form",
    "description": "Container form para agrupar elementos de formulário",
    "path": "src/objects/Form/",
    "baseObject": "src/objects/Form/index.js",
    "vueComponent": false
  },
  "httprequest": {
    "name": "httprequest",
    "displayName": "HTTP Request",
    "category": "data",
    "icon": "cloud_download",
    "description": "Executa requisições HTTP e preenche um Dataset (invisível no preview)",
    "path": "src/objects/HttpRequest/",
    "baseObject": "src/objects/HttpRequest/index.js",
    "vueComponent": false
  },
  "image": {
    "name": "image",
    "displayName": "Imagem",
    "category": "media",
    "icon": "image",
    "description": "Componente de imagem",
    "path": "src/objects/Image/",
    "baseObject": "src/objects/Image/index.js",
    "vueComponent": false
  },
  "input": {
    "name": "input",
    "displayName": "Input",
    "category": "form",
    "icon": "text_fields",
    "description": "Campo de entrada de texto",
    "path": "src/objects/Input/",
    "baseObject": "src/objects/Input/index.js",
    "vueComponent": false
  },
  "jtable": {
    "name": "jtable",
    "displayName": "JTable Container",
    "category": "layout",
    "icon": "view_agenda",
    "description": "Container table para agrupar colunas e linhas",
    "path": "src/objects/JTable/",
    "baseObject": "src/objects/JTable/index.js",
    "vueComponent": "src/objects/JTable/jtable.vue"
  },
  "meucomponenteexemplo": {
    "name": "meucomponenteexemplo",
    "displayName": "Meu Componente Exemplo",
    "category": "layout",
    "icon": "extension",
    "description": "Um componente de exemplo para demonstrar o sistema de descoberta automática",
    "path": "src/objects/MeuComponenteExemplo/",
    "baseObject": "src/objects/MeuComponenteExemplo/index.js",
    "vueComponent": false
  },
  "meunovocomponente": {
    "name": "meunovocomponente",
    "displayName": "Meu Novo Componente",
    "category": "layout",
    "icon": "extension",
    "description": "Um componente de exemplo para demonstrar o sistema dinâmico",
    "path": "src/objects/MeuNovoComponente/",
    "baseObject": "src/objects/MeuNovoComponente/index.js",
    "vueComponent": false
  },
  "select": {
    "name": "select",
    "displayName": "Select",
    "category": "form",
    "icon": "arrow_drop_down",
    "description": "Campo de seleção",
    "path": "src/objects/Select/",
    "baseObject": "src/objects/Select/index.js",
    "vueComponent": false
  },
  "spacer": {
    "name": "spacer",
    "displayName": "Espaçador",
    "category": "layout",
    "icon": "space_bar",
    "description": "Espaçamento entre elementos",
    "path": "src/objects/Spacer/",
    "baseObject": "src/objects/Spacer/index.js",
    "vueComponent": false
  },
  "spinner": {
    "name": "spinner",
    "displayName": "Spinner",
    "category": "layout",
    "icon": "progress_activity",
    "description": "Overlay com loading controlado por eventos",
    "path": "src/objects/Spinner/",
    "baseObject": "src/objects/Spinner/index.js",
    "vueComponent": false
  },
  "textarea": {
    "name": "textarea",
    "displayName": "textarea",
    "category": "layout",
    "icon": "extension",
    "description": "Número de linhas",
    "path": "src/objects/Textarea/",
    "baseObject": "src/objects/Textarea/index.js",
    "vueComponent": false
  },
  "view": {
    "name": "view",
    "displayName": "View Container",
    "category": "layout",
    "icon": "view_module",
    "description": "Container principal para renderizar componentes",
    "path": "src/objects/View/",
    "baseObject": "src/objects/View/index.js",
    "vueComponent": false
  }
}

// Função para obter metadados de um componente
export function getComponentMetadata(componentName) {
  return COMPONENT_METADATA[componentName] || null
}

// Função para listar todos os componentes descobertos
export function getAllDiscoveredComponents() {
  return DISCOVERED_COMPONENTS.map(name => ({
    name,
    ...getComponentMetadata(name)
  }))
}

// Função para verificar se um componente existe
export function isComponentDiscovered(componentName) {
  return DISCOVERED_COMPONENTS.includes(componentName)
}

// Função para obter componentes por categoria
export function getComponentsByCategory(category) {
  return getAllDiscoveredComponents().filter(comp => comp.category === category)
}
