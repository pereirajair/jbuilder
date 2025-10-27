import BaseObject from '../../components/BaseObject'

export default class JTableObject extends BaseObject {
  constructor() {
    super({
      name: 'JTable',
      category: 'layout',
      displayName: 'JTable',
      description: 'Container table para agrupar colunas e linhas',
      icon: 'view_agenda',
      props: {
        cols: { type: Number, default: 2, description: 'Número de colunas', editor: 'number', min: 1, max: 10 },
        rows: { type: Number, default: 1, description: 'Número de linhas', editor: 'number', min: 1, max: 10 },
        content: { type: String, default: '', description: 'Conteúdo interno do div', editor: 'html' },
        class: { type: String, default: '', description: 'Classes CSS customizadas' },
        style: { type: String, default: '', description: 'Estilos CSS inline', editor: 'css' },
        backgroundColor: { type: String, default: '', description: 'Cor de fundo', editor: 'color' },
        padding: { type: String, default: '0px', description: 'Espaçamento interno' },
        margin: { type: String, default: '0px', description: 'Espaçamento interno' }
      },
      emits: {

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
    return {
      tag: 'j-table',
      props: {
        component: ctx.component,
        editMode: ctx.editMode,
        selectedComponentId: ctx.selectedComponentId
      }
    }
  }

  renderEdit(ctx) {
    return this.renderPreview(ctx)
  } 
}
