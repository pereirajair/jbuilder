import BaseObject from './BaseObject'

export default class Spacer extends BaseObject {
  constructor() {
    super({
      name: 'Spacer',
      category: 'layout',
      displayName: 'Espaçador',
      description: 'Espaçamento entre elementos',
      icon: 'space_bar',
      props: {
        size: { type: String, default: '16px', description: 'Tamanho do espaçamento' },
        direction: { type: String, default: 'vertical', description: 'Direção do espaçamento (vertical, horizontal)' },
        color: { type: String, default: 'transparent', description: 'Cor de fundo (opcional para debug)' }
      },
      emits: {}
    })
  }

  getSpacerStyle(values) {
    const isVertical = values.direction === 'vertical'
    return {
      width: isVertical ? '100%' : values.size,
      height: isVertical ? values.size : '100%',
      backgroundColor: values.color,
      display: 'block'
    }
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    return {
      tag: 'div',
      props: {
        style: this.getSpacerStyle(values),
        class: 'spacer-component'
      }
    }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
