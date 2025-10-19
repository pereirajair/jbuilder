import BaseObject from '../../components/BaseObject'

export default class CardObject extends BaseObject {
  constructor() {
    super({
      name: 'Card',
      category: 'layout',
      displayName: 'Card',
      description: 'Cartão para agrupar conteúdo',
      icon: 'credit_card',
      props: {
        title: { type: String, default: 'Título do Card', description: 'Título do cartão' },
        content: { type: String, default: 'Conteúdo do cartão', description: 'Conteúdo interno', editor: 'html' },
        flat: { type: Boolean, default: false, description: 'Card sem sombra', editor: 'boolean' },
        bordered: { type: Boolean, default: true, description: 'Card com borda', editor: 'boolean' },
        padding: { type: String, default: '16px', description: 'Espaçamento interno' }
      },
      emits: {
        click: { description: 'Emitido quando o card é clicado' }
      },
      slots: [
        {
          name: 'default',
          description: 'Conteúdo principal do card',
          accepts: ['*']
        }
      ]
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    const defaultSlot = (component.children || []).filter(child => child.slotName === 'default')

    return {
      tag: 'q-card',
      props: {
        flat: values.flat,
        bordered: values.bordered,
        style: { padding: values.padding },
        onClick: (e) => ctx.emit && ctx.emit('click', e)
      },
      children: [
        {
          tag: 'q-card-section',
          children: [
            // Área de drop para default (content)
            this.createSlotDropArea(ctx, component, 'default', 'Content')
          ]
        }
      ]
    }
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    const defaultSlot = (component.children || []).filter(child => child.slotName === 'default')
    return {
      tag: 'q-card',
      props: {
        flat: values.flat,
        bordered: values.bordered,
        style: { padding: values.padding },
        onClick: (e) => ctx.emit && ctx.emit('click', e)
      },
      children: [
        {
          tag: 'q-card-section',
          children: defaultSlot.length > 0 ? this.renderSlotChildren(defaultSlot, ctx) : [values.content]
        }
      ]
    }
  }
}
