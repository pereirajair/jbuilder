<template>
    <div style="border: 2px solid red; padding: 10px; margin: 5px;">
        {{ props.component.values.name }}
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john.doe@example.com</td>
              <td>1234567890</td>
            </tr>
          </tbody>
        </table>
        <div v-if="props.component.children && props.component.children.length > 0">
            <ComponentRenderer
                v-for="child in props.component.children"
                :key="child.id"
                :component="child"
                :edit-mode="props.editMode"
                :selected-component-id="props.selectedComponentId"
                @select-component="$emit('select-component', $event)"
                @open-inspector="$emit('open-inspector', $event)"
                @delete-component="$emit('delete-component', $event)"
                @update-component-value="$emit('update-component-value', $event)"
                @handle-drag-over="$emit('handle-drag-over', $event)"
                @handle-drop-on-component="$emit('handle-drop-on-component', $event)"
                @handle-drag-start="$emit('handle-drag-start', $event)"
                @handle-drag-end="$emit('handle-drag-end', $event)"
            />
        </div>
    </div>
</template>
<script setup>
import ComponentRenderer from '../../components/ComponentRenderer.vue'

const props = defineProps({
  component: { type: Object, required: true },
  editMode: { type: String, default: 'edit' },
  selectedComponentId: { type: String, default: null }
})

// defineEmits([
//   'select-component',
//   'open-inspector',
//   'delete-component',
//   'update-component-value',
//   'handle-drag-over',
//   'handle-drop-on-component',
//   'handle-drag-start',
//   'handle-drag-end'
// ])

</script>
