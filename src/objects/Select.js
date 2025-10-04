import BaseObject from './BaseObject'

export default class Select extends BaseObject {
  constructor() {
    super({
      name: 'Select',
      category: 'form',
      displayName: 'Select',
      description: 'Campo de seleção',
      icon: 'arrow_drop_down',
      props: {
        label: { type: String, default: 'Selecione uma opção', description: 'Rótulo do campo' },
        dataset: { type: String, default: '', description: 'Vínculo ao Dataset', editor: 'link', linkType: 'Dataset' },
        options: { type: String, default: '{{data}}', description: 'Lista de opções' },
        value: { type: String, default: '', description: 'Valor selecionado' },
        required: { type: Boolean, default: false, description: 'Campo obrigatório' },
        disabled: { type: Boolean, default: false, description: 'Campo desabilitado' }
      },
      emits: {
        'update:modelValue': { description: 'Emitido quando o valor muda' },
        change: { description: 'Emitido quando a seleção muda' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    // Se houver dataset vinculado e disponível globalmente, tentar popular options
    const datasetId = values.dataset
    let options = values.options
    try {
      const root = (typeof window !== 'undefined' ? window.__jbuilderRootTree : null)
      const dsNode = datasetId ? (function find(node, id){ if(!node) return null; if(node.id===id) return node; const ch = node.children||[]; for(const c of ch){ const r = find(c,id); if(r) return r } return null })(root, datasetId) : null
      if (dsNode && dsNode.values) {
        const source = dsNode.values.value
        // Se options for binding string {{path}}, resolver contra o valor do dataset
        const maybeBinding = values.optionsBinding || (Array.isArray(values.options) ? null : values.options)
        const resolved = this.resolveBinding(maybeBinding, source)
        const arr = Array.isArray(resolved) ? resolved : (Array.isArray(source?.items) ? source.items : [])
        options = arr.map(it => ({ label: it.name ?? String(it.id), value: it.id }))
      }
    } catch (e) { /* noop */ }
    return {
      tag: 'q-select',
      props: {
        label: values.label,
        options,
        modelValue: values.value,
        required: values.required,
        disabled: values.disabled,
        outlined: true,
        dense: true,
        emitValue: true,
        mapOptions: true,
        'onUpdate:modelValue': (v) => ctx.onUpdate('value', v),
        onChange: (e) => ctx.emit && ctx.emit('change', e)
      }
    }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
