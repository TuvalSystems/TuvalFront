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
    <template #content>
      <div class="block-content tab-content fs-sm">
        <div class="content-fluid">
          <div class="row g-2 mb-2">
            <div class="col-12 col-lg-4">
              <div class="kv">
                <small class="text-muted">Nombre</small>
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
  line-height: 1;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
}

.kv .badge2 {
  white-space: normal;
  text-align: left;
  display: block;
  line-height: 1.4;
  font-weight: 12px;

}


.kv .fw-semibold {
  line-height: 1.2;
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .35rem;
  }
}


/* columnas numéricas alineadas */
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 14px;
}
</style>