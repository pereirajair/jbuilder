import BaseObject from './BaseObject'

export default class Textarea extends BaseObject {
  constructor() {
    super({
      name: 'Textarea',
      category: 'form',
      displayName: 'Textarea',
      description: 'Campo de texto multilinha',
      icon: 'text_fields',
      props: {
        label: { type: String, default: 'Texto', description: 'Rótulo do campo' },
        placeholder: { type: String, default: 'Digite seu texto aqui...', description: 'Texto de placeholder' },
        value: { type: String, default: '', description: 'Valor do campo' },
        rows: { type: Number, default: 3, description: 'Número de linhas' },
        required: { type: Boolean, default: false, description: 'Campo obrigatório', editor: 'boolean' },
        disabled: { type: Boolean, default: false, description: 'Campo desabilitado', editor: 'boolean' }
      },
      emits: {
        'update:modelValue': { description: 'Emitido quando o valor muda', editor: 'javascript' },
        focus: { description: 'Emitido quando o campo recebe foco', editor: 'javascript' },
        blur: { description: 'Emitido quando o campo perde foco', editor: 'javascript' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    return {
      tag: 'q-input',
      props: {
        label: values.label,
        placeholder: values.placeholder,
        modelValue: values.value,
        rows: values.rows,
        required: values.required,
        disabled: values.disabled,
        outlined: true,
        dense: true,
        type: 'textarea',
        'onUpdate:modelValue': (v) => ctx.onUpdate('value', v),
        onFocus: (e) => ctx.emit && ctx.emit('focus', e),
        onBlur: (e) => ctx.emit && ctx.emit('blur', e)
      }
    }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
