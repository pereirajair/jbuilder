import BaseObject from './BaseObject'

export default class Button extends BaseObject {
  constructor() {
    super({
      name: 'Button',
      category: 'form',
      displayName: 'Botão',
      description: 'Botão clicável',
      icon: 'smart_button',
      props: {
        label: { type: String, default: 'Clique aqui', description: 'Texto do botão' },
        color: { type: String, default: 'primary', description: 'Cor do botão', editor: 'select', options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Positive', value: 'positive' },
          { label: 'Negative', value: 'negative' },
          { label: 'Warning', value: 'warning' }
        ] },
        size: { type: String, default: 'md', description: 'Tamanho do botão', editor: 'radio', options: [
          { label: 'XS', value: 'xs' },
          { label: 'SM', value: 'sm' },
          { label: 'MD', value: 'md' },
          { label: 'LG', value: 'lg' }
        ] },
        type: { type: String, default: 'button', description: 'Tipo do Botão', editor: 'select', options: [
          { label: 'Button', value: 'button' },
          { label: 'Submit', value: 'submit' },
        ]},
        rounded: { type: Boolean, default: false, description: 'Bordas redondas', editor: 'boolean' },
        disabled: { type: Boolean, default: false, description: 'Botão desabilitado', editor: 'boolean' },
        icon: { type: String, default: '', description: 'Ícone do botão' }
      },
      emits: {
        click: { description: 'Emitido quando o botão é clicado', editor: 'javascript' },
        focus: { description: 'Emitido quando o botão recebe foco', editor: 'javascript' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    return {
      tag: 'q-btn',
      props: {
        label: values.label,
        color: values.color,
        size: values.size,
        disabled: values.disabled,
        icon: values.icon,
        rounded: values.rounded,
        type: values.type,
        // onClick: (e) => {
        //   // Emitir para o sistema
        //   ctx.emit && ctx.emit('click', e)
        //   // Executar handler custom do usuário (modo edição pode testar)
        //   this.executeEventHandler(ctx, 'click', e)
        // },
        onFocus: (e) => ctx.emit && ctx.emit('focus', e)
      }
    }
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    return {
      tag: 'q-btn',
      props: {
        label: values.label,
        color: values.color,
        size: values.size,
        disabled: values.disabled,
        rounded: values.rounded,
        icon: values.icon,
        type: values.type,
        onClick: (e) => {
          // Primeiro, emitir evento padrão
          ctx.emit && ctx.emit('click', e)
          // Depois, tentar executar JS do usuário salvo em values.click
          this.executeEventHandler(ctx, 'click', e)
          // Forçar submit no formulário ancestral (suporta múltiplos forms na tela)
          try {
            // const formEl = e?.currentTarget?.closest && e.currentTarget.closest('form')
            // if (formEl) {
            //   if (typeof formEl.requestSubmit === 'function') formEl.requestSubmit()
            //   else if (typeof formEl.dispatchEvent === 'function') {
            //     const evt = new Event('submit', { bubbles: true, cancelable: true })
            //     formEl.dispatchEvent(evt)
            //   }
            //   return
            // }
            // const root = (typeof window !== 'undefined' ? window.__jbuilderRootTree : null)
            // const btnId = ctx.component.id
            // const findParentForm = (node, targetId, ancestry=[]) => {
            //   if (!node) return null
            //   if (node.id === targetId) {
            //     for (let i = ancestry.length - 1; i >= 0; i--) {
            //       if (ancestry[i].name === 'Form') return ancestry[i]
            //     }
            //     return null
            //   }
            //   const children = Array.isArray(node.children) ? node.children : []
            //   for (const child of children) {
            //     const found = findParentForm(child, targetId, ancestry.concat(node))
            //     if (found) return found
            //   }
            //   return null
            // }
            // const formNode = findParentForm(root, btnId)
            
            // if (formNode && formNode.values && formNode.values.name) {
            //   const formById = document.getElementById(formNode.values.name)
            //   if (formById) {
            //     console.log('formNode', formById);
            //     if (typeof formById.requestSubmit === 'function') formById.requestSubmit()
            //     else if (typeof formById.dispatchEvent === 'function') {
            //       const evt = new Event('submit', { bubbles: true, cancelable: true })
            //       formById.dispatchEvent(evt)
            //     }
            //   }
            // }
          } catch (err) { /* noop */ }
        },
        onFocus: (e) => ctx.emit && ctx.emit('focus', e)
      }
    }
  }

  executeEventHandler(ctx, eventName, event) {
    try {
      const handlerCode = ctx?.component?.values?.[eventName]
      if (!handlerCode || typeof handlerCode !== 'string') return
      let fn
      const trimmed = handlerCode.trim()
      console.log('trimmed', trimmed);
      if (trimmed.startsWith('function') || trimmed.startsWith('(') || trimmed.includes('=>')) {
        // Tenta interpretar como função completa
        fn = eval(`(${trimmed})`)
      } else {
        // Interpreta como corpo de função
        fn = new Function('event', 'ctx', trimmed)
      }
      if (typeof fn === 'function') {
        // Disponibiliza um contexto mínimo
        const safeCtx = { component: ctx.component, emit: ctx.emit, values: ctx.component.values }
        fn(event, safeCtx)
      }
    } catch (err) {
      console.error('Erro ao executar handler de evento', eventName, err)
    }
  }
}
