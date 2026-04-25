<script setup>
import { onMounted, computed } from 'vue';
import { useClientBranchesProcessOperation } from '@/composables/gestion-operativa/clientes/useClientBranchesProcessOperation';
import {
  swalError, swalWarning, swalSuccess
} from "@/functions/swal-alert.js";
const {
  loadingUpdateStatusBranch,
  updateStatusBranch
} = useClientBranchesProcessOperation();
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['closeModal']);


const sucursal = computed(() => props.data.sucursal)
const hasOrders = computed(() => props.data.process_orders);
const hasQuotes = computed(() => props.data.process_quotes);


const isRestricted = computed(() => {
  return sucursal.value.estado === 1 && (hasOrders.value || hasQuotes.value);
});

// El botón se deshabilita si está restringido o si está cargando
const isButtonDisabled = computed(() => {
  return isRestricted.value || loadingUpdateStatusBranch.value;
});

async function updateStatus() {
  let newStatus = sucursal.value.estado === 0 ? 1 : 0;
  let newId = sucursal.value.id;
  const resp = await updateStatusBranch(newId, newStatus);
  if (!resp?.ok) {
    if (resp?.status >= 400 && resp?.status < 499) {
      swalWarning(resp?.message);
    } else {
      swalError(resp?.message);
    }
  }
  if (resp?.ok) {
    swalSuccess(resp?.message);
    emit('closeModal');

  }

}
onMounted(() => { });
</script>

<template>
  <BaseBlock title="Gestión de Sucursal" class="mb-4">

    <div v-if="hasOrders || hasQuotes"
      class="alert alert-info d-flex align-items-center mx-0 mt-0 mb-2 border-0 shadow-sm" role="alert">
      <i class="fa fa-fw fa-info-circle me-3 fs-4"></i>
      <div>
        <div class="fw-bold">Sucursal en uso</div>
        <small>
          Esta sucursal tiene
          <span v-if="hasOrders" class="badge bg-danger-light text-primary-dark">Pedidos</span>
          <span v-if="hasOrders && hasQuotes"> y </span>
          <span v-if="hasQuotes" class="badge bg-danger-light text-primary-dark">Cotizaciones</span>
          en proceso. No puede ser inactivada actualmente.
        </small>
      </div>
    </div>

    <div class="row g-1 mb-2">
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Ruc</small>
          <span>{{ sucursal.CLI_SUC_RUC }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Razón Social</small>
          <span>{{ sucursal.CLI_SUC_DESCRIPCION }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Id Dirección</small>
          <span>{{ sucursal.CLI_SUC_ID_DIRECCION }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Dirección</small>
          <span>{{ sucursal.CLI_SUC_DIRECCION }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Contacto</small>
          <span>{{ sucursal.CLI_SUC_CONTACTO }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Referencia</small>
          <span>{{ sucursal.CLI_SUC_REFERENCIA }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Territorio</small>
          <span>{{ sucursal.CLI_SUC_TERRITORIO }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Ciudad</small>
          <span>{{ sucursal.CLI_SUC_CIUDAD }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Provincia</small>
          <span>{{ sucursal.CLI_SUC_PROVINCIA }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Teléfono</small>
          <span>{{ sucursal.CLI_SUC_TELEFONO }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Correo</small>
          <span>{{ sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI }}</span>
        </div>
      </div>
      <div class="col-6 col-lg-4">
        <div class="kv">
          <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;"> Estado</small>
          <span :class="sucursal.estado === 0 ? 'bg-danger-light text-danger' : 'bg-success-light text-success'"
            class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"> {{ sucursal.estado === 0 ?
              'Inactivo' : 'Activo' }}</span>
        </div>
      </div>
    </div>
    <div class="block-content block-content-full text-end bg-body">
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">Cerrar</button>
          <button 
          type="button" 
          class="btn btn-sm"
          :class="sucursal.estado === 0 ? 'btn-success' : 'btn-danger'"
          :disabled="isButtonDisabled" 
          @click="updateStatus"
        >
          <i v-if="loadingUpdateStatusBranch" class="fa fa-spinner fa-spin me-1"></i>
          <i v-else :class="sucursal.estado === 0 ? 'fa fa-check-circle me-1' : 'fa fa-times-circle me-1'"></i>
          {{ sucursal.estado === 0 ? 'Activar Sucursal' : 'Desactivar Sucursal' }}
        </button>
      </div>
    </div>
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
</style>
