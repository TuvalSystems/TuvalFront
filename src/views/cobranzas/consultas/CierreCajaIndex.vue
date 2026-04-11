<script setup>
import { onMounted, reactive } from 'vue';
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { useCashClosureLookup } from "@/composables/cobranzas/consultas/useCashClosureLookup";
import { swalWarning, swalError } from "@/functions/swal-alert";
import { formatPrice } from "@/functions";

//importacion de componentes 
import CashClosureSaldos from '@/views/cobranzas/consultas/components/CashClosureSaldos.vue';
import CashClosureDepositos from '@/views/cobranzas/consultas/components/CashClosureDepositos.vue';
import CashClosureCheques from '@/views/cobranzas/consultas/components/CashClosureCheques.vue';
import CashClosureEfectivo from '@/views/cobranzas/consultas/components/CashClosureEfectivo.vue';
import CashClosureTarjeta from '@/views/cobranzas/consultas/components/CashClosureTarjeta.vue';
import CashClosureRetenciones from '@/views/cobranzas/consultas/components/CashClosureRetenciones.vue';

const flatPickrState = reactive({
  fecha: {
    maxDate: Date.now(),
    locale: Spanish,
    monthSelectorType: "static"
  },
});

const {
  //filters
  filters,
  //punto de venta
  loadingListPv,
  listPv,
  fetchListPvByUser,
  //cajas
  loadingListBox,
  listBox,
  fetchListBoxByUser,
  //consulta
  validateFilters,
  loadingCashClosure,
  fetchCashClosure,
  cashClosure,
  clearCashClosure,

  //pdf
  printPdfConsultByUser,
  printPdfCashClosure
} = useCashClosureLookup();




async function selectPuntodeventa(event) {
  filters.caja_id = null;
  listBox.value = [];
  const res = await fetchListBoxByUser(event.target.value);
  if (!res?.ok) {
    if (res.status >= 400 || res.status <= 499) {
      swalWarning(res.message);
      return;
    }
    if (res.status >= 500) {
      swalError(res.message);
    }
  }
}

async function consultarFiltros() {
  const isValid = await validateFilters();
  if (!isValid) return;
  await clearCashClosure();
  const resp = await fetchCashClosure();
  if (!resp?.ok) {
    if (resp.status >= 400 || resp.status <= 499) {
      swalWarning(resp.message);
      return;
    }
    if (resp.status >= 500) {
      swalError(resp.message);
      return;
    }
  }
}


async function printBoxByUser(){
 const resp = await printPdfConsultByUser();
 if(!resp?.ok){
  if (resp.status >= 400 || resp.status <= 499) {
    swalWarning(resp.message);
    return;
  }
  if (resp.status >= 500) {
    swalError(resp.message);
    return;
  }
 }

}

async function downloadCashClosure(){
const resp = await printPdfCashClosure();
 if(!resp?.ok){
  if (resp.status >= 400 || resp.status <= 499) {
    swalWarning(resp.message);
    return;
  }
  if (resp.status >= 500) {
    swalError(resp.message);
    return;
  }
 }
}

onMounted(() => {
  fetchListPvByUser();
});
</script>

<template>
  <BasePageHeading title="Consulta cierre de caja">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Consultas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cierre de caja</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <BaseBlock class="mb-4" content-full>
      <div class="block-content py-2 px-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-body-light border-0">
                <i class="fa fa-store text-primary"></i>
              </span>
              <div class="form-floating flex-grow-1">
                <select class="form-select border-0 fs-sm" id="pv-select" v-model="filters.pv_id"
                  @change="selectPuntodeventa($event)">
                  <option value="" disabled selected>Seleccionar...</option>
                  <option v-for="(pv, index) in listPv" :key="index" :value="pv.id">
                    {{ pv.PTO_VTA_DESCRIPCION }}
                  </option>
                </select>
                <label for="pv-select" class="text-muted fw-semibold">Punto de Venta</label>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-body-light border-0">
                <i class="fa fa-cash-register text-primary"></i>
              </span>
              <div class="form-floating flex-grow-1">
                <select class="form-select border-0 fs-sm" id="box-select" v-model="filters.caja_id"
                  :disabled="loadingListBox">
                  <option value="" disabled selected>Seleccionar...</option>
                  <option v-for="(caja, index) in listBox" :key="index" :value="caja.id">
                    {{ caja.caja_codigo }} - {{ caja.userName }}
                  </option>
                </select>
                <label for="box-select" class="text-muted fw-semibold">Caja / Usuario</label>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-body-light border-0">
                <i class="far fa-calendar-alt text-primary"></i>
              </span>
              <div class="form-floating flex-grow-1">
                <flat-pickr id="fecha-select" class="form-control border-0 fs-sm bg-transparent" v-model="filters.fecha"
                  :config="flatPickrState.fecha" />
                <label for="fecha-select" class="text-muted fw-semibold">Fecha</label>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-primary w-100 py-3" :disabled="!filters.caja_id"
              @click="consultarFiltros()">
              <i class="fa fa-search me-1"></i> Consultar
            </button>
          </div>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock v-if="loadingCashClosure" class="text-center py-5">
      <div class="spinner-border text-primary">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="fs-sm fw-medium text-muted mt-2">Procesando información del cierre...</p>
    </BaseBlock>
    <div v-else-if="cashClosure" class="animated fadeIn">
      <BaseBlock content-full>
        <div class="block-content block-content-full border-bottom bg-body-light py-0">
          <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center">

            <span class="fs-sm fw-semibold text-muted mb-2 mb-sm-0 text-center text-sm-start">
              <i class="fa fa-file-invoice-dollar me-0"></i> Detalle de la Consulta
            </span>

            <div class="d-flex flex-column flex-sm-row gap-2 gap-sm-1">
              <button class="btn btn-sm btn-outline-primary w-100 w-sm-auto" type="button" @click="printBoxByUser">
                <i class="fa fa-print opacity-100 me-1"></i> Imprimir Consulta
              </button>
              <button class="btn btn-sm btn-outline-warning w-100 w-sm-auto" type="button" @click="downloadCashClosure">
                <i class="fa fa-check-circle opacity-100 me-1"></i> Imprimir Cierre
              </button>
            </div>

          </div>
        </div>

        <!-- aplicacion de saldos -->
        <div v-if="cashClosure.aplicacion_saldos.length" class="mt-2">
          <CashClosureSaldos :data="cashClosure.aplicacion_saldos" :total="cashClosure.aplicacion_saldos_total" />
        </div>
        <div v-if="cashClosure.depositos.length" class="mt-2">
          <CashClosureDepositos :data="cashClosure.depositos" :total="cashClosure.depositos_total" />
        </div>
        <div v-if="cashClosure.cheques_aldia.length" class="mt-2">
          <CashClosureCheques :data="cashClosure.cheques_aldia" :total="cashClosure.cheques_aldia_total" :type="1" />
        </div>
         <div v-if="cashClosure.cheques_posfechados.length" class="mt-2">
          <CashClosureCheques :data="cashClosure.cheques_posfechados" :total="cashClosure.cheques_posfechados_total" :type="2" />
        </div>
         <div v-if="cashClosure.efectivo.length" class="mt-2">
          <CashClosureEfectivo :data="cashClosure.efectivo" :total="cashClosure.efectivo_total" />
        </div>
          <div v-if="cashClosure.retenciones.length" class="mt-2">
          <CashClosureRetenciones :data="cashClosure.retenciones" :total="cashClosure.retenciones_total" />
        </div>

        <div v-if="cashClosure.tarjeta.length" class="mt-2">
          <CashClosureTarjeta :data="cashClosure.tarjeta" :total="cashClosure.tarjeta_total" />
        </div>


      </BaseBlock>
    </div>
    <!-- carga de informacion de datos -->
    <BaseBlock v-else class="text-center py-5 border-dashed">
      <i class="fa fa-search fa-2x text-muted mb-2"></i>
      <p class="text-muted mb-0">Seleccione los filtros para consultar el cierre.</p>
    </BaseBlock>
  </div>

</template>

<style scoped>
/* Reducción de altura para floating labels en OneUI */
:deep(.form-floating)>.form-control,
:deep(.form-floating)>.form-select {
  height: calc(2.875rem + 2px) !important;
  padding-top: 1.4rem;
  padding-bottom: 0.4rem;
}

:deep(.form-floating)>label {
  padding: 0.85rem 0.75rem;
  font-size: 0.875rem;
}

/* Unificación visual del input group */
.input-group {
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
}
</style>
