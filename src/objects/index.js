import Input from './Input'
import Div from './Div'
import View from './View'
import Button from './Button'
import Select from './Select'
import Textarea from './Textarea'
import Card from './Card'
import Image from './Image'
import Spacer from './Spacer'
import Form from './Form'
import Dataset from './Dataset'
import HttpRequest from './HttpRequest'
import Spinner from './Spinner'

// Registro de classes (construtores)
export const ObjectRegistry = {
  Input,
  Div,
  View,
  Button,
  Select,
  Textarea,
  Card,
  Image,
  Spacer,
  Form,
  Dataset
  , HttpRequest
  , Spinner
}

// Fábrica para instanciar por nome
export function createObjectInstance(name) {
  const ClassRef = ObjectRegistry[name]
  if (!ClassRef) return null
  return new ClassRef()
}

// Lista de metadados (instâncias protótipo) para toolbar
export function getAllObjectDefinitions() {
  return Object.keys(ObjectRegistry).map((key) => new ObjectRegistry[key]())
}

export default ObjectRegistry

// Expor registry globalmente para consumidores dinâmicos (ex.: ObjectInspector)
try {
  const w = typeof window !== 'undefined' ? window : globalThis
  w.__jbuilderObjectRegistry = ObjectRegistry
} catch (e) { /* noop */ }


