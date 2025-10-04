export default class BaseObject {
  constructor(definition) {
    this.name = definition.name
    this.category = definition.category
    this.displayName = definition.displayName
    this.description = definition.description
    this.icon = definition.icon
    this.props = definition.props || {}
    this.emits = definition.emits || {}
    this.slots = definition.slots || []
  }

  getDefaultValues() {
    const values = {}
    Object.keys(this.props || {}).forEach((key) => {
      const prop = this.props[key]
      values[key] = typeof prop.default === 'function' ? prop.default() : prop.default
    })
    return values
  }

  // Hooks opcionais
  getEditClasses() { return [] }
  getPreviewClasses() { return [] }
  getStyles() { return {} }

  // Métodos para slots
  hasSlots() {
    return this.slots && this.slots.length > 0
  }

  getSlotNames() {
    return this.slots.map(slot => slot.name)
  }

  getSlotDefinition(slotName) {
    return this.slots.find(slot => slot.name === slotName)
  }

  // Métodos de renderização a serem sobrescritos nos objetos concretos
  renderEdit(ctx) {
    return this.renderPreview(ctx)
  }

  renderPreview(/* ctx */) {
    return null
  }

  // Identificação de componentes não-visuais (override nos filhos)
  isNonVisual() {
    return false
  }

  // ==== Helpers reutilizáveis para componentes com slots ====
  renderSlotChildren(slotChildren, ctx) {
    return (slotChildren || []).map(child => ({
      tag: 'ComponentRenderer',
      props: {
        component: child,
        editMode: ctx.editMode,
        selectedComponentId: ctx.selectedComponentId
      }
    }))
  }

  createSlotDropArea(ctx, component, slotName, label = 'Slot', styleOverrides = {}) {
    const baseStyle = {
      border: '2px dashed #e0e0e0',
      borderRadius: '4px',
      padding: '8px',
      margin: '4px 0',
      backgroundColor: '#fafafa',
      minHeight: '40px',
      position: 'relative'
    }
    const style = { ...baseStyle, ...styleOverrides }

    // Coleção de filhos do slot
    const slotChildren = (component.children || []).filter(child => child.slotName === slotName)

    return {
      tag: 'div',
      props: {
        class: 'slot-drop-area',
        style,
        onDragover: (e) => this.handleSlotDragOver(e, slotName),
        onDrop: (e) => this.handleSlotDrop(e, slotName, component, ctx)
      },
      children: [
        {
          tag: 'div',
          props: {
            class: 'slot-label',
            style: {
              position: 'absolute',
              top: '-8px',
              left: '8px',
              backgroundColor: '#fff',
              padding: '2px 6px',
              fontSize: '10px',
              color: '#666',
              fontWeight: '500',
              borderRadius: '2px',
              border: '1px solid #e0e0e0'
            },
            innerHTML: label
          },
        },
        ...(slotChildren && slotChildren.length > 0
          ? this.renderSlotChildren(slotChildren, ctx)
          : [])
      ]
    }
  }

  handleSlotDragOver(event, /* slotName */) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    event.currentTarget.style.borderColor = '#1976d2'
    event.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
  }

  handleSlotDrop(event, slotName, component, /* ctx */) {
    event.preventDefault()
    event.stopPropagation()

    event.currentTarget.style.borderColor = '#e0e0e0'
    event.currentTarget.style.backgroundColor = '#fafafa'

    try {
      const componentData = JSON.parse(event.dataTransfer.getData('application/json'))
      if (componentData.type === 'existing-component') {
        window.dispatchEvent(new CustomEvent('move-component-to-slot', {
          detail: { component: componentData.component, parentId: component.id, slotName }
        }))
      } else if (componentData && componentData.name) {
        window.dispatchEvent(new CustomEvent('add-component-to-slot', {
          detail: { componentTemplate: componentData, parentId: component.id, slotName }
        }))
      }
    } catch (error) {
      console.error('Erro ao processar drop no slot:', error)
    }
  }

  // ==== Helpers de binding ====
  // Resolve strings no formato "{{path.to.key}}" contra um objeto de escopo (scopeValue)
  // Suporta chaves aninhadas; se não casar com o padrão, retorna o argumento original
  resolveBinding(bindingCandidate, scopeValue) {
    if (typeof bindingCandidate !== 'string') return bindingCandidate
    const match = bindingCandidate.match(/^\s*\{\{\s*([^}]+)\s*\}\}\s*$/)
    if (!match) return bindingCandidate
    const path = match[1].trim()
    if (!path) return undefined
    const segments = path.split('.')
    let current = scopeValue
    for (const seg of segments) {
      if (current == null) return undefined
      current = current[seg]
    }
    return current
  }
}


