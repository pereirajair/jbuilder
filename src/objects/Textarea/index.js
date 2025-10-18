import InputObject from '../Input'

export default class Textarea extends InputObject {
  constructor() {
    super()
    // Sobrescrever metadados
    this.name = 'Textarea'
    this.displayName = 'Textarea'
    this.description = 'Campo de texto multilinha'
    this.icon = 'notes'
    // Adicionar/ajustar props específicas
    this.props = {
      ...this.props,
      rows: { type: Number, default: 3, description: 'Número de linhas' }
    }
  }

  renderEdit(ctx) {
    const base = super.renderEdit(ctx)
    const values = ctx.component.values || {}
    if (base && base.props) {
      base.props.type = 'textarea'
      base.props.rows = values.rows
    }
    return base
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
