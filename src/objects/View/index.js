import BaseObject from '../../components/BaseObject'

export default class View extends BaseObject {
  constructor() {
    super({
      name: 'View',
      category: 'layout',
      displayName: 'View Container',
      description: 'Container principal para renderizar componentes',
      icon: 'view_module',
      props: {
        name: { type: String, default: 'new_view', description: 'Nome da view' },
        children: { type: Array, editor: 'array', default: () => [], description: 'Componentes filhos', visible: false },
        backgroundColor: { type: String, default: '#ffffff', description: 'Cor de fundo da view', editor: 'color' },
        padding: { type: String, default: '0px', description: 'Espaçamento interno', editor: 'text' },
        styles: { type: Object, editor: 'css', default: () => ({ }), description: 'Estilos CSS adicionais (objeto CSS-in-JS)', visible: true }
      },
      emits: {
        'component-added': { description: 'Emitido quando um componente é adicionado', visible: false },
        'component-removed': { description: 'Emitido quando um componente é removido', visible: false },
        'component-selected': { description: 'Emitido quando um componente é selecionado', visible: false }
      },
      slots: [
        {
          name: 'default',
          description: 'Conteúdo principal da view',
          accepts: ['*'] // Aceita qualquer tipo de componente
        }
      ]
    })
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    
    // Filtrar children por slotName
    const contentSlot = (component.children || []).filter(child => child.slotName === 'default')

    return { 
      tag: 'div', 
      props: { class: 'view-content', style: { minHeight: '100%' } },
      children: (contentSlot && contentSlot.length > 0)
        ? this.renderSlotChildren(contentSlot, ctx)
        : []
    };
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    const component = ctx.component

    return this.createSlotDropArea(ctx, component, 'default', 'View Slot', {
      margin: '0px 0'
    });

  }
}
