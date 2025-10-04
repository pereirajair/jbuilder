# Context - Projeto JProject

## Visão Geral
Este é um gerador de formulários/páginas HTML, construído com Vue 3, Quasar Framework e Express. O projeto permite criar interfaces visuais através de drag-and-drop, com um sistema de componentes reutilizáveis e um inspetor de objetos para edição de propriedades.

## Arquitetura do Sistema

### Frontend (Vue 3 + Quasar)
- **Framework**: Vue 3 com Composition API
- **UI Framework**: Quasar Framework
- **Build Tool**: Vite
- **Editor**: Monaco Editor para visualização JSON

### Backend (Express)
- **API**: Express.js com CORS
- **Endpoints**: 
  - `GET /api/read/:project/:view` - Ler arquivo JSON
  - `POST /api/save/:project/:view` - Salvar arquivo JSON
- **Porta**: 3001 (configurável via .env)

## Componentes Principais

### 1. Object Inspector (`src/components/ObjectInspector.vue`)
**Funcionalidade**: Inspeciona e edita propriedades de componentes Vue
- **Abas**: Properties e Events
- **Layout**: Drawer fixo à direita (280px)
- **Edição**: Inputs dinâmicos baseados no tipo (text, boolean, JSON)
- **Recursos**:
  - Edição em tempo real de propriedades
  - Conversão automática de tipos
  - Botão "Excluir componente" no final
  - Reatividade bidirecional com o editor

### 2. Designer (`src/pages/Designer.vue`)
**Funcionalidade**: Editor visual principal com drag-and-drop
- **Tabs**: Editor, Preview, JSON
- **Modos**: Edição e Preview
- **Recursos**:
  - Canvas com View raiz (não deletável)
  - Drag-and-drop de componentes
  - Seleção e edição de componentes
  - Salvar/carregar JSON
  - Botão "Nova View"
  - Suporte a tecla Delete para exclusão
  - Altura dinâmica (descontando header)

### 3. Component Renderer (`src/components/ComponentRenderer.vue`)
**Funcionalidade**: Renderiza componentes dinamicamente
- **Renderização**: Baseada em metadados de objetos
- **Suporte a Slots**: Renderização visual de slots com bordas dashed
- **Eventos**: Drag-and-drop, seleção, edição
- **Hierarquia**: Suporte a componentes aninhados
- **Slots**: Renderização de componentes dentro de slots

### 4. Toolbar de Componentes (`src/components/ToolbarComponentes.vue`)
**Funcionalidade**: Lista componentes disponíveis para drag-and-drop
- **Categorização**: Por pastas (objects/form, objects/layout)
- **Busca**: Campo de pesquisa
- **Drag**: Componentes arrastáveis para o designer
- **Layout**: Lista compacta com tooltips

### 5. Toolbar Tabs (`src/components/ToolbarTabs.vue`)
**Funcionalidade**: Container com abas para Projetos e Componentes
- **Aba Projetos**: File explorer para projetos
- **Aba Componentes**: Toolbar de componentes
- **Eventos**: Propagação de eventos de seleção

### 6. Projects Explorer (`src/components/ProjectsExplorer.vue`)
**Funcionalidade**: Navegador de arquivos de projetos
- **Estrutura**: Lista hierárquica de projetos/views
- **Ações**: 
  - Clique em .json: Carrega no designer
  - Botão play: Navega para visualização
- **Layout**: Expandido por padrão, itens compactos

## Sistema de Objetos

### BaseObject (`src/objects/BaseObject.js`)
**Classe base** para todos os componentes
- **Propriedades**: name, category, displayName, description, icon, props, emits, slots
- **Métodos**:
  - `getDefaultValues()`: Valores padrão das propriedades
  - `hasSlots()`: Verifica se tem slots
  - `getSlotNames()`: Lista nomes dos slots
  - `getSlotDefinition()`: Definição de um slot específico
- **Renderização**: Métodos abstratos `renderEdit()` e `renderPreview()`

### Componentes Disponíveis

#### Layout Components
- **View**: Container raiz (não deletável)
  - Slots: `content`
  - Props: name, route, backgroundColor, padding
- **Div**: Container genérico
  - Slots: `default`
  - Props: content, class, style, backgroundColor, padding
- **Card**: Cartão com cabeçalho e conteúdo
  - Slots: `header`, `content`
  - Props: title, content, flat, bordered, padding

#### Form Components
- **InputText**: Campo de texto
  - Props: label, placeholder, value, required, disabled
- **Button**: Botão
  - Props: label, color, size, disabled, icon
- **Select**: Lista de seleção
  - Props: label, options, value, required, disabled
- **Textarea**: Área de texto
  - Props: label, placeholder, value, required, disabled

#### Other Components
- **Image**: Imagem
  - Props: src, alt, width, height
- **Spacer**: Espaçador
  - Props: height, width

## Sistema de Slots

### Definição de Slots
```javascript
slots: [
  {
    name: 'default',
    description: 'Conteúdo principal',
    accepts: ['*'] // Aceita qualquer tipo
  }
]
```

### Renderização Visual
- **Modo Edição**: Slots aparecem com bordas dashed cinza
- **Padding**: 8px apenas no modo edição
- **Labels**: Nome do slot posicionado no topo
- **Hover**: Destaque azul quando hover
- **Preview**: Slots ficam invisíveis

### Drag-and-Drop em Slots
- **Detecção**: Slots detectam drag-over e drop
- **Visual**: Feedback visual durante drag
- **Estrutura**: Componentes são organizados em slots
- **Auto-detecção**: Componentes com 1 slot usam sempre 'default'

## Sistema de IDs

### UUID Implementation
- **Biblioteca**: `uuid` (v4)
- **Geração**: IDs únicos para cada componente
- **Persistência**: IDs mantidos entre sessões
- **Estrutura**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## Estrutura de Dados

### Componente JSON
```json
{
  "id": "uuid",
  "name": "ComponentName",
  "displayName": "Display Name",
  "category": "form|layout",
  "icon": "icon_name",
  "props": { /* definições de propriedades */ },
  "emits": { /* definições de eventos */ },
  "values": { /* valores atuais */ },
  "children": [
    {
      "slotName": "default",
      "type": "slot",
      "children": [/* componentes dentro do slot */]
    }
  ]
}
```

### Slots Data Structure
```json
{
  "slotName": "default",
  "type": "slot",
  "children": [component1, component2]
}
```

## Funcionalidades Implementadas

### ✅ Drag-and-Drop
- Arrastar componentes da toolbar para o designer
- Mover componentes existentes entre containers
- Drop em slots específicos
- Feedback visual durante drag

### ✅ Sistema de Slots
- Definição de slots em componentes
- Renderização visual de slots
- Drag-and-drop para slots
- Suporte a múltiplos slots por componente

### ✅ Object Inspector
- Edição de propriedades em tempo real
- Separação de Properties e Events
- Conversão automática de tipos
- Reatividade bidirecional

### ✅ File Management
- Carregar arquivos JSON existentes
- Salvar alterações no servidor
- Criar novas views
- Navegador de projetos

### ✅ Visual Modes
- Modo Edição: Controles visuais, slots, drag-and-drop
- Modo Preview: Renderização limpa sem controles
- JSON View: Visualização/edição do JSON

### ✅ Dark Mode
- Toggle no header principal
- Aplicado a todos os componentes
- Persistência da preferência

## Configuração do Projeto

### Dependências Principais
```json
{
  "vue": "^3.0.0",
  "quasar": "^2.0.0",
  "uuid": "^9.0.0",
  "@guolao/vue-monaco-editor": "^1.0.0",
  "express": "^4.0.0",
  "cors": "^2.8.5",
  "body-parser": "^1.20.0",
  "concurrently": "^8.0.0"
}
```

### Scripts
```json
{
  "dev": "concurrently \"node server.js\" \"quasar dev\"",
  "build": "quasar build",
  "serve": "quasar serve"
}
```

### Environment Variables
```env
API_URL=http://localhost:3001
```

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ObjectInspector.vue
│   ├── ComponentRenderer.vue
│   ├── ToolbarComponentes.vue
│   ├── ToolbarTabs.vue
│   ├── ProjectsExplorer.vue
│   └── JsonEditor.vue
├── objects/
│   ├── BaseObject.js
│   ├── index.js
│   ├── View.js
│   ├── Div.js
│   ├── Card.js
│   ├── InputText.js
│   ├── Button.js
│   ├── Select.js
│   ├── Textarea.js
│   ├── Image.js
│   └── Spacer.js
├── pages/
│   ├── Designer.vue
│   └── VisualizerPage.vue
├── layouts/
│   ├── BuilderLayout.vue
│   └── MainLayout.vue
└── router/
    ├── index.js
    └── routes.js
```

## Rotas

### Designer
- `/builder` - Editor principal (BuilderLayout)

### Visualização
- `/project/:project/:view` - Visualizar view salva (MainLayout)

## Problemas Resolvidos

### ✅ Reatividade do Object Inspector
- **Problema**: Valores não atualizavam no editor
- **Solução**: Proxy objects que apontam diretamente para `component.values`

### ✅ Renderização de Slots
- **Problema**: "Componente não encontrado" em slots
- **Solução**: Sistema de renderização hierárquica com `allChildren`

### ✅ Estrutura JSON
- **Problema**: Parser não interpretava slots corretamente
- **Solução**: Filtragem inteligente de children diretos vs. slots

### ✅ UUID Implementation
- **Problema**: IDs sequenciais causavam conflitos
- **Solução**: UUID v4 para IDs únicos

## Próximas Funcionalidades (Sugestões)

### 🔄 Melhorias Futuras
- [ ] Validação de propriedades em tempo real
- [ ] Sistema de templates/componentes customizados
- [ ] Exportação para HTML/CSS
- [ ] Sistema de temas
- [ ] Undo/Redo
- [ ] Copy/Paste de componentes
- [ ] Sistema de plugins
- [ ] Colaboração em tempo real

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor + frontend
npm run build        # Build para produção
npm run serve        # Serve build local
```

### Estrutura
```bash
# Criar novo componente
touch src/objects/NewComponent.js

# Adicionar ao registry
# Editar src/objects/index.js
```

---

**Última Atualização**: Dezembro 2024
**Versão**: 1.0.0
**Status**: Funcional - Sistema completo de drag-and-drop com slots