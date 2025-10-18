import BaseObject from '../../components/BaseObject'
import MeuComponenteExemploVue from './MeuComponenteExemploVue.vue'

export default class MeuComponenteExemplo extends BaseObject {
  constructor() {
    super({
      name: 'MeuComponenteExemplo',
      category: 'layout',
      displayName: 'Meu Componente Exemplo',
      description: 'Um componente de exemplo para demonstrar o sistema de descoberta automática',
      icon: 'extension',
      props: {
        title: { type: String, default: 'Meu Componente Exemplo', description: 'Título do componente' },
        color: { type: String, default: '#FF9800', description: 'Cor do componente', editor: 'color' },
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
      tag: 'meu-componente-exemplo-vue', // Tag que termina com 'vue'
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
