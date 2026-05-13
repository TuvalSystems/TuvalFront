<script setup>
import { onMounted } from 'vue';
const emit = defineEmits(["closeModal", "refresh"]);
const props = defineProps({
  detailUser: {
    type: Object,
    required: true,
  },
  perfilesWeb: {
    type: Array,
    default: () => [],
  },
  perfilesApp: {
    type: Array,
    default: () => [],
  },
})

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
    <template #content>
      <div class="block-content tab-content fs-sm">
        <div class="content-fluid">
          <div class="row g-2 mb-2">
            <div class="col-12 col-lg-4">
              <div class="kv">
                <small class="text-label-muted">Nombre</small>
                <span>{{ detailUser.USERNAME }}</span>
              </div>
            </div>
              <div class="col-12 col-lg-4">
              <div class="kv">
                <small class="text-label-muted">userid</small>
                <span>{{ detailUser.USERID }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseBlock>

</template>
<style scoped>
.kv small {
  display: block;
  line-height: 2;
}

.kv .badge2 {
  white-space: normal;
  text-align: left;
  display: block;
  line-height: 1.4;
  font-weight: 10px;
}


.kv .fw-semibold {
  line-height: 1.1;
}

.text-label-muted {
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 700;
  /* fw-bold */
  font-size: 10px;
  line-height: 1.2;
}
</style>