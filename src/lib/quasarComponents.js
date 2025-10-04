// Registro global de componentes Quasar para renderização dinâmica
import { 
  QInput, 
  QBtn, 
  QSelect, 
  QCard, 
  QCardSection,
  QIcon 
} from 'quasar'

export const QuasarComponents = {
  'q-input': QInput,
  'q-btn': QBtn,
  'q-select': QSelect,
  'q-card': QCard,
  'q-card-section': QCardSection,
  'q-icon': QIcon
}

// Função para obter componente por nome
export function getQuasarComponent(name) {
  return QuasarComponents[name] || null
}

// Função para verificar se é um componente Quasar
export function isQuasarComponent(name) {
  return name in QuasarComponents
}
