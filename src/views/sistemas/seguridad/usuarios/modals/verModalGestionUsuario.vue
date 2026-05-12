<script setup>
import { onMounted } from 'vue';
const emit = defineEmits(["closeModal", "refresh"]);

onMounted(() => { });
</script>

<template>
  <BaseBlock title="Gestion de Usuario" transparent class="mb-0">
    <template #options>
      <div class="block-options-item">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" @click="cerrarModal">
          <i class="fa fa-fw fa-times"></i>
        </button>
      </div>
    </template>
  </BaseBlock>
</template>
