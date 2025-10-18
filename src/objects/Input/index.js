import BaseObject from '../../components/BaseObject'

export default class InputObject extends BaseObject {
  constructor() {
    super({
      name: 'Input',
      category: 'form',
      displayName: 'Input',
      description: 'Campo de entrada de texto',
      icon: 'text_fields',
      props: {
        label: { type: String, default: 'Label', description: 'Rótulo do campo' },
        placeholder: { type: String, default: '', description: 'Texto de placeholder' },
        required: { type: Boolean, default: false, description: 'Campo obrigatório', editor: 'boolean' },
        disabled: { type: Boolean, default: false, description: 'Campo desabilitado', editor: 'boolean' }, 
        mask: { type: String, default: '', description: 'Máscara de entrada (opcional)', visible: true }
      },
      emits: {
        'focus': { description: 'Emitido quando o campo recebe foco' },
        'blur': { description: 'Emitido quando o campo perde foco' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    try {
      const datasetName = (values && typeof values.dataset === 'string') ? values.dataset.trim() : ''
      const inputName = (values && typeof values.name === 'string') ? values.name.trim() : ''
      const ds = BaseObject.getObjectByID(datasetName)
      var updateModelValue = (v) => { };
      if (datasetName && inputName) {
        updateModelValue = (v) => {
          ctx.onUpdate('value', v)
          // console.log('v', v);
          ds.values.value[values.name] = v
        }
      }
      return {
        tag: 'q-input',
        props: {
          name: values.name,
          label: values.label,
          placeholder: values.placeholder,
          value: values.value,
          modelValue: ds?.values?.value[values.name],
          required: values.required,
          disabled: values.disabled,
          outlined: true,
          dense: true,
          'onUpdate:modelValue': updateModelValue
        }
      }
    } catch (_) { /* noop */ }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
