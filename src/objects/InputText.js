import BaseObject from './BaseObject'

export default class InputText extends BaseObject {
  constructor() {
    super({
      name: 'InputText',
      category: 'form',
      displayName: 'Input Text',
      description: 'Campo de entrada de texto',
      icon: 'text_fields',
      props: {
        label: { type: String, default: 'Label', description: 'Rótulo do campo' },
        name: { type: String, default: 'Name', description: 'Nome do campo' },
        placeholder: { type: String, default: '', description: 'Texto de placeholder' },
        value: { type: String, default: '', description: 'Valor do campo' },
        required: { type: Boolean, default: false, description: 'Campo obrigatório', editor: 'boolean' },
        disabled: { type: Boolean, default: false, description: 'Campo desabilitado', editor: 'boolean' }, 
        mask: { type: String, default: '', description: 'Máscara de entrada (opcional)', visible: true },
        // rules: { type: Array, editor: 'array', default: () => [], description: 'Regras de validação', visible: true }
      },
      emits: {
        'update:modelValue': { description: 'Emitido quando o valor muda' },
        'focus': { description: 'Emitido quando o campo recebe foco' },
        'blur': { description: 'Emitido quando o campo perde foco' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    return {
      tag: 'q-input',
      props: {
        name: values.name,
        label: values.label,
        placeholder: values.placeholder,
        modelValue: values.value,
        required: values.required,
        disabled: values.disabled,
        outlined: true,
        dense: true,
        'onUpdate:modelValue': (v) => ctx.onUpdate('value', v)
      }
    }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
