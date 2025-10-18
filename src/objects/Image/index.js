import BaseObject from '../../components/BaseObject'

export default class Image extends BaseObject {
  constructor() {
    super({
      name: 'Image',
      category: 'media',
      displayName: 'Imagem',
      description: 'Componente de imagem',
      icon: 'image',
      props: {
        src: { type: String, default: 'https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg', description: 'URL da imagem' },
        alt: { type: String, default: 'Imagem', description: 'Texto alternativo' },
        width: { type: String, default: '300px', description: 'Largura da imagem' },
        height: { type: String, default: '200px', description: 'Altura da imagem' },
        fit: { type: String, default: 'cover', description: 'Como a imagem se ajusta (cover, contain, fill)' }
      },
      emits: {
        load: { description: 'Emitido quando a imagem carrega' },
        error: { description: 'Emitido quando há erro no carregamento' },
        click: { description: 'Emitido quando a imagem é clicada' }
      }
    })
  }

  renderEdit(ctx) {
    const values = ctx.component.values
    return {
      tag: 'img',
      props: {
        src: values.src,
        alt: values.alt,
        width: values.width,
        height: values.height,
        style: { objectFit: values.fit, cursor: 'pointer' },
        onLoad: (e) => ctx.emit && ctx.emit('load', e),
        onError: (e) => ctx.emit && ctx.emit('error', e),
        onClick: (e) => ctx.emit && ctx.emit('click', e)
      }
    }
  }

  renderPreview(ctx) {
    return this.renderEdit(ctx)
  }
}
