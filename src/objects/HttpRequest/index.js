import BaseObject from '../../components/BaseObject'

export default class HttpRequest extends BaseObject {
  constructor() {
    super({
      name: 'HttpRequest',
      category: 'data',
      displayName: 'HTTP Request',
      description: 'Executa requisições HTTP e preenche um Dataset (invisível no preview)',
      icon: 'cloud_download',
      props: {
        name: { type: String, default: 'HttpRequest', description: 'Nome do HttpRequest', editor: 'text' },
        method: { type: String, default: 'GET', description: 'Método HTTP', editor: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
        url: { type: String, default: '', description: 'URL da requisição', editor: 'text' },
        params: { type: Object, default: () => ({}), description: 'Parâmetros (query/body)', editor: 'object' },
        headers: { type: Object, default: () => ({}), description: 'Cabeçalhos HTTP', editor: 'object' },
        auto: { type: Boolean, default: false, description: 'Executar automaticamente no preview', editor: 'boolean' },
        targetDataset: { type: String, default: '', description: 'Dataset alvo', editor: 'link', linkType: 'Dataset' }
      },
      emits: {
        success: { description: 'Emitido quando a requisição conclui com sucesso', visible: false },
        error: { description: 'Emitido quando a requisição falha', visible: false }
      },
      slots: []
    })
  }

  // Não renderiza nada no preview
  renderPreview(ctx) {
    const values = ctx.component.values || {}
    if (values.auto) {
      this.execute(ctx).catch(() => {})
    }
    return null
  }

  // No editor: marcador simples
  renderEdit(ctx) {
    const values = ctx.component.values || {}
    return {
      tag: 'div',
      props: {
        style: {
          border: '1px dashed #1976d2',
          backgroundColor: 'rgba(25,118,210,0.06)',
          color: '#0d47a1',
          padding: '8px',
          margin: '4px 0',
          borderRadius: '4px',
          fontSize: '12px'
        }
      },
      children: [
        { tag: 'div', props: { style: { fontWeight: '600' } }, children: `HTTP ${values.method || 'GET'} → ${values.url || ''}` },
        { tag: 'div', children: `target: ${values.targetDataset || '(none)'}` }
      ]
    }
  }

  async execute(ctx) {
    const values = ctx.component.values || {}
    const method = (values.method || 'GET').toUpperCase()
    const url = String(values.url || '')
    const params = values.params || {}
    const headers = values.headers || {}
    if (!url) return

    try {
      if (values.targetDataset) {
        window.dispatchEvent(new CustomEvent(`loading-start-${values.targetDataset}`))
      }
      let response
      const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } }
      if (method === 'GET') {
        const query = new URLSearchParams(params).toString()
        const fullUrl = query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url
        response = await fetch(fullUrl, { method: 'GET', headers: opts.headers })
      } else {
        opts.body = JSON.stringify(params)
        response = await fetch(url, opts)
      }
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      this.applyToDataset(values.targetDataset, data)
      ctx.emit && ctx.emit('success', data)
    } catch (err) {
      console.error('HttpRequest.execute error:', err)
      ctx.emit && ctx.emit('error', err)
    } finally {
      if (values.targetDataset) {
        window.dispatchEvent(new CustomEvent(`loading-end-${values.targetDataset}`))
      }
    }
  }

  applyToDataset(datasetId, data) {
    if (!datasetId) return
    try {
      const root = (typeof window !== 'undefined' ? window.__jbuilderRootTree : null)
      const dsNode = (function find(node, id){ if(!node) return null; if(node.id===id) return node; const ch = node.children||[]; for(const c of ch){ const r = find(c,id); if(r) return r } return null })(root, datasetId)
      if (dsNode) {
        if (!dsNode.values) dsNode.values = {}
        console.log('applyToDataset', datasetId, data);
        dsNode.values.value = data
        // dsNode.values.value.data = data.items
      }
    } catch (e) { /* noop */ }
  }

  isNonVisual() { return true }
}


