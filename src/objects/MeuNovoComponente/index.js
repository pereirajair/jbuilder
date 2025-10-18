import BaseObject from '../../components/BaseObject'
import MeuNovoComponenteVue from './MeuNovoComponenteVue.vue'

export default class MeuNovoComponente extends BaseObject {
  constructor() {
    super({
      name: 'MeuNovoComponente',
      category: 'layout',
      displayName: 'Meu Novo Componente',
      description: 'Um componente de exemplo para demonstrar o sistema dinâmico',
      icon: 'extension',
      props: {
        title: { type: String, default: 'Meu Novo Componente', description: 'Título do componente' },
        color: { type: String, default: '#4CAF50', description: 'Cor do componente', editor: 'color' },
        size: { type: String, default: 'medium', description: 'Tamanho do componente', editor: 'select', options: ['small', 'medium', 'large'] }
      },
      emits: {
        click: { description: 'Emitido quando o componente é clicado' }
      }
    })
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    return {
      tag: 'meunovocomponentevue', // Tag que termina com 'vue'
      props: {
        component: ctx.component,
        editMode: ctx.editMode,
        selectedComponentId: ctx.selectedComponentId,
        title: values.title,
        color: values.color,
        size: values.size,
        onClick: (e) => ctx.emit && ctx.emit('click', e)
      }
    }
  }

  renderEdit(ctx) {
    return this.renderPreview(ctx)
  }
}
