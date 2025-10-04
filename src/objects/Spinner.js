import BaseObject from './BaseObject'

export default class Spinner extends BaseObject {
  constructor() {
    super({
      name: 'Spinner',
      category: 'layout',
      displayName: 'Spinner',
      description: 'Overlay com loading controlado por eventos',
      icon: 'progress_activity',
      props: {
        httpRequest: { type: String, default: '', description: 'HttpRequest observado', editor: 'link', linkType: 'HttpRequest' },
        text: { type: String, default: 'Carregando...', description: 'Texto exibido', editor: 'text' },
        color: { type: String, default: 'primary', description: 'Cor do spinner', editor: 'text' }
      },
      emits: {},
      slots: [
        { name: 'default', description: 'Conteúdo sobreposto pelo spinner', accepts: ['*'] }
      ]
    })
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }

  renderEdit(ctx,isEditor = true) {
    const values = ctx.component.values || {}
    const dsId = values.dataset
    const styleEditor = { border: '1px dashed #9c27b0', backgroundColor: 'rgba(156,39,176,0.06)', color: '#6a1b9a', padding: '8px', margin: '4px 0', borderRadius: '4px', fontSize: '12px' }
    // if (isEditor) {
        
    // }

    const slotChildren = (ctx.component.children || []).filter(c => c.slotName === 'default')
    return {
      tag: 'div',
      props: {
        style: { position: 'relative', minHeight: '40px' }
      },
      children: [
        // Conteúdo
        ...(slotChildren && slotChildren.length > 0 ? this.renderSlotChildren(slotChildren, ctx) : []),
        // Overlay do spinner
        {
          tag: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: '0',
              display: 'block',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)',
              zIndex: 5
            },
            id: `spinner-overlay-${ctx.component.id}`
          },
          children: [
            { tag: 'q-circular-progress', props: { indeterminate: true, size: '32px', color: values.color } },
            { tag: 'div', props: { style: { marginLeft: '8px', color: '#555', fontSize: '12px' } }, children: values.text }
          ]
        }
      ],
      mounted: () => {
        if (!dsId) return
        const overlay = document.getElementById(`spinner-overlay-${ctx.component.id}`)
        const onStart = () => { if (overlay) { overlay.style.display = 'flex' } }
        const onEnd = () => { if (overlay) { overlay.style.display = 'none' } }
        window.addEventListener(`loading-start-${dsId}`, onStart)
        window.addEventListener(`loading-end-${dsId}`, onEnd)
      }
    }
  }
}


