import BaseObject from '../../components/BaseObject'

export default class Dataset extends BaseObject {
  constructor() {
    super({
      name: 'Dataset',
      category: 'data',
      displayName: 'Dataset',
      description: 'Fonte de dados para a View (invisível no preview)',
      icon: 'dataset',
      props: {
        name: { type: String, default: 'dataset1', description: 'Nome do dataset', editor: 'text' },
        value: { type: Object, default: {
          data: [ ]
        }, description: 'Dados (JSON)', editor: 'object' }
      },
      emits: {
        change: { description: 'Emitido quando o dataset é atualizado', visible: false }
      },
      slots: []
    })
  }
  // No preview: exibir JSON quando em modo debug
  renderPreview(ctx) {
    try {
      const w = typeof window !== 'undefined' ? window : globalThis
      const debug = !!w.__jbuilderDebug
      if (!debug) return null
      const values = ctx.component.values || {}
      const val = values.value
      return {
        tag: 'div',
        props: {
          style: {
            border: '1px dashed #9c27b0',
            backgroundColor: 'rgba(156,39,176,0.04)',
            color: '#6a1b9a',
            padding: '8px',
            margin: '4px 0',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          },
          innerHTML: values.name + ': ' + JSON.stringify(val, null, 2),
        },
      }
    } catch (_) {
      return null
    }
  }

  // No editor: renderiza um marcador visível com informações e sem children
  renderEdit(ctx) {
    const values = ctx.component.values || {}
    return {
      tag: 'div',
      props: {
        style: {
          border: '1px dashed #9c27b0',
          backgroundColor: 'rgba(156,39,176,0.06)',
          color: '#6a1b9a',
          padding: '8px',
          margin: '4px 0',
          borderRadius: '4px',
          fontSize: '12px'
        }
      },
      children: [
        { tag: 'div', props: { style: { fontWeight: '600' } }, children: `Dataset: ${values.name || 'dataset'}` },
        // { tag: 'div', children: `data: ${(values.value && values.value.data && values.value.data.length) || 0}` }
      ]
    }
  }

  isNonVisual() { return true }
}


