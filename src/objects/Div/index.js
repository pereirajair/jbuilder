import BaseObject from '../../components/BaseObject'

export default class DivObject extends BaseObject {
  constructor() {
    super({
      name: 'Div',
      category: 'layout',
      displayName: 'Div',
      description: 'Container div para agrupar elementos',
      icon: 'view_agenda',
      props: {
        content: { type: String, default: '', description: 'Conteúdo interno do div', editor: 'html' },
        class: { type: String, default: '', description: 'Classes CSS customizadas' },
        style: { type: String, default: '', description: 'Estilos CSS inline', editor: 'css' },
        backgroundColor: { type: String, default: '', description: 'Cor de fundo', editor: 'color' },
        padding: { type: String, default: '8px', description: 'Espaçamento interno' },
        margin: { type: String, default: '0px', description: 'Espaçamento interno' }
      },
      emits: {
        click: { description: 'Emitido quando o div é clicado' },
        mouseenter: { description: 'Emitido quando o mouse entra no div' },
        mouseleave: { description: 'Emitido quando o mouse sai do div' }
      },
      slots: [
        {
          name: 'default',
          description: 'Conteúdo principal do div',
          accepts: ['*'] // Aceita qualquer tipo de componente
        }
      ]
    })
  }

  buildStyle(values) {
    let styles = values.style || ''
    if (values.backgroundColor) styles += ` background-color: ${values.backgroundColor};`
    if (values.padding) styles += ` padding: ${values.padding};`
    if (values.margin) styles += ` margin: ${values.margin};`
    return styles
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    
    // Filtrar children por slotName
    const defaultSlot = (component.children || []).filter(child => child.slotName === 'default')
    
    return {
      tag: 'div',
      props: {
        class: values.class,
        style: this.buildStyle(values),
        onClick: (e) => ctx.emit && ctx.emit('click', e),
        onMouseenter: (e) => ctx.emit && ctx.emit('mouseenter', e),
        onMouseleave: (e) => ctx.emit && ctx.emit('mouseleave', e)
      },
      children: defaultSlot.length > 0
        ? this.renderSlotChildren(defaultSlot, ctx)
        : [values.content]
    }
  }
  
  // usa helper de BaseObject

  renderEdit(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    return this.createSlotDropArea(ctx, component, 'default', 'Div Slot', { });
  } 
}
