import BaseObject from './BaseObject'

export default class Form extends BaseObject {
  constructor() {
    super({
      name: 'Form',
      category: 'form',
      displayName: 'Form Container',
      description: 'Container form para agrupar elementos de formulário',
      icon: 'dynamic_form',
      props: {
        name: { type: String, default: '', description: 'Form name', editor: 'text' },
        dataset: { type: String, default: '', description: 'Vínculo ao Dataset', editor: 'link', linkType: 'Dataset', visibleIf: (values) => !(values && values.action) , exclusiveWith: ['action','method'] },
        // class: { type: String, default: '', description: 'Classes CSS customizadas' },
        action: { type: String, default: '', description: 'URL de ação do formulário', visibleIf: (values) => { console.log(values); return !(values && values.dataset) } },
        method: { type: String, default: 'POST', description: 'Método HTTP do formulário', editor: 'select', options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ], visibleIf: (values) => !(values && values.dataset) },
        novalidate: { type: Boolean, default: false, description: 'Desabilitar validação HTML5', editor: 'boolean' }
      },
      emits: {
        submit: { description: 'Emitido quando o formulário é submetido' },
        reset: { description: 'Emitido quando o formulário é resetado' },
        click: { description: 'Emitido quando o form é clicado' }
      },
      slots: [
        {
          name: 'default',
          description: 'Conteúdo principal do form',
          accepts: ['*'] // Aceita qualquer tipo de componente
        }
      ]
    })
  }

  renderPreview(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    
    // Filtrar children por slotName
    const defaultSlot = (component.children || []).filter(child => child.slotName === 'default')
    
    return {
      tag: 'form',
      props: {
        // class: values.class,
        action: values.action,
        name: values.name,
        id: values.name,
        method: (values.method || 'POST').toUpperCase(),
        novalidate: values.novalidate,
        onSubmit: (e) => {
          e.stopPropagation();

          console.log('onSubmit', e);
          // Resolver elemento <form> do q-form
          let formEl = e?.target || e?.currentTarget?.$el || e?.currentTarget
          if (formEl && formEl.tagName !== 'FORM' && formEl.closest) formEl = formEl.closest('form')
          if ((!formEl || formEl.tagName !== 'FORM') && values.name) {
            const byId = document.getElementById(values.name)
            if (byId && byId.tagName === 'FORM') formEl = byId
          }

          // Coletar dados de forma resiliente
          let data = {}
          try {
            if (formEl && formEl.tagName === 'FORM') {
              const fd = new FormData(formEl)
              for (const [k, v] of fd.entries()) {
                data[k] = data[k] === undefined ? v : (Array.isArray(data[k]) ? [...data[k], v] : [data[k], v])
              }
            }
          } catch (_) { /* noop */ }

          console.log(data);

          if (!values.action) {
            e && typeof e.preventDefault === 'function' && e.preventDefault()
            // Se houver Dataset vinculado, atualizar seu value com os dados do form

            console.log(data);
            
            try {
              if (values.dataset) {
                const root = (typeof window !== 'undefined' ? window.__jbuilderRootTree : null)
                const dsNode = (function find(node, id){ if(!node) return null; if(node.id===id) return node; const ch = node.children||[]; for(const c of ch){ const r = find(c,id); if(r) return r } return null })(root, values.dataset)
                if (dsNode) {
                  if (!dsNode.values) dsNode.values = {}
                  dsNode.values.value = data
                }
                // console.log('dsNode', { id: values.dataset, data: data });
                // ctx.emit('update-component-value', { id: values.dataset, data: data }); 
                // console.log(root);
              }
            } catch (_) { /* noop */ }
            // ctx.emit && ctx.emit('submit', { event: e, data })
          }
        },
        onReset: (e) => ctx.emit && ctx.emit('reset', e),
        // onClick: (e) => ctx.emit && ctx.emit('click', e)
      },
      children: defaultSlot.length > 0
        ? this.renderSlotChildren(defaultSlot, ctx)
        : [values.content]
    }
  }
  
  renderEdit(ctx) {
    const values = ctx.component.values
    const component = ctx.component
    return this.createSlotDropArea(ctx, component, 'default', 'Form Slot', { });
  } 
}
