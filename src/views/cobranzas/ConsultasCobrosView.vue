<template>
  <!-- Hero -->
  <BasePageHeading title="Consulta de cobros">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Consultas de cobros</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <div class="mb-4">
      <FiltrarCliente
        title="Por cliente"
        :clients="clients"
        :loading="loadingSearch || loading"
        :error-search="errorSearchClient"
        :show-results="showCustomerResults"
        @search-term-change="updateCustomerSearchTerm"
        @search-customers="buscarclientes"
        @select-customer="selectcliente"
      >
        <template #filters>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="input-group input-group-sm">
              <label class="input-group-text" for="cobros-fecha-inicio">Fecha inicio</label>
              <flat-pickr
                id="cobros-fecha-inicio"
                name="fecha_inicio"
                class="form-control"
                placeholder="Y-m-d"
                v-model="set_fecha_inicio"
                :config="flatPickrState.fecha"
              />
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="input-group input-group-sm">
              <label class="input-group-text" for="cobros-fecha-fin">Fecha fin</label>
              <flat-pickr
                id="cobros-fecha-fin"
                name="fecha_fin"
                class="form-control"
                placeholder="Y-m-d"
                v-model="set_fecha_fin"
                :config="flatPickrState.fecha"
              />
            </div>
          </div>
        </template>
      </FiltrarCliente>
    </div>
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <BaseBlock v-if="currentCliente" title="Cobros cliente"
      :subtitle="currentCliente.CLI_RAZON_SOCIAL + ' - ' + currentCliente.CLI_RUC" class="pb-4">
      <div class="text-end mb-2">
        <button class="btn btn-sm btn-primary mx-1"  :disabled="loadingDownloadExcel" @click="printAccountStatementExcel()"><i
            class="fa fa-file-excel"></i> Estado de cuenta EXCEL</button>
        <button class="btn btn-sm btn-success mx-1" :disabled="loadingDownloadPdf" @click="printAccountStatementPdf()"><i class="fa fa-print"></i> Estado
          de cuenta PDF</button>
      </div>
      <div class="table-responsive fs-sm">
        <table v-if="cobros_cliente.length" class="table table-stripped table-bordered table-sm mt-4">
          <thead>
            <tr class="table-active">
              <th>Recibo</th>
              <th>Punto de Venta</th>
              <th>Usuario</th>
              <th class="text-end">Total</th>
              <th class="text-end">Aplicado</th>
              <th class="text-end">Saldo</th>
              <th>Fecha/hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cobro, index) in cobros_cliente" :key="index">
              <td>{{ cobro.numero_recibo }}</td>
              <td>{{ cobro.puntodeventa }}</td>
              <td>{{ cobro.usuario }}</td>
              <td class="text-end">${{ formatPriceJm(cobro.total_cobro) }}</td>
              <td class="text-end">${{ formatPriceJm(cobro.total_aplicado) }}</td>
              <td class="text-end">${{ formatPriceJm(cobro.saldo) }}</td>
              <td>{{ cobro.fecha }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseBlock>
    <BaseBlock v-if="currentCaja" :title="'Total de cobros de ' + currentCaja.CAJA_CODIGO" class="pb-4">
      <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent>
        <div class="col-auto">
          <div class="row">
            <label class="col-sm-4 col-form-label text-end" for="fecha">Fecha:</label>
            <div class="col-sm-8">
              <div class="input-group date" style="max-width: 180px;">
                <span class="input-group-text"><i class="far fa-calendar"></i></span>
                <flat-pickr id="fecha" name="fecha" class="form-control fs-sm" placeholder="Y-m-d" v-model="set_fecha"
                  :config="flatPickrState.fecha" />
              </div>
            </div>
          </div>
        </div>
        <div class="">
          <button type="button" v-on:click="generarcaja(set_fecha)" class="btn btn-success"><i
              class="fa fa-magnifying-glass"></i> Consultar</button>
        </div>
      </form>
      <div v-if="cobros_caja_usuario_loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <template v-if="cobros_caja_usuario && !cobros_caja_usuario_loading">
        <div class="text-end pt-3">
          <button class="btn btn-primary btn-sm mx-1" @click="imprimirCaja(set_fecha)"><i class="fa fa-print"></i>
            Imprimir consulta</button>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.aplicacion_saldos.length"
            class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="7">APLICACIÓN DE SALDOS (NOTAS DE CRÉDITO / ANTICIPOS)</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.aplicacion_saldos_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Cobro</th>
                <th>Tipo</th>
                <th class="text-end">Monto</th>
                <th class="text-end">APlicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(saldo, index) in cobros_caja_usuario.aplicacion_saldos" :key="index">
                <td>{{ saldo.numero_recibo }}</td>
                <td>{{ saldo.cobro }}</td>
                <td>{{ saldo.tipo }}</td>
                <td class="text-end">${{ formatPriceJm(saldo.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(saldo.aplicado) }}</td>
                <td>{{ saldo.CLI_RUC }}</td>
                <td>{{ saldo.CLI_RAZON_SOCIAL }}</td>
                <td>{{ saldo.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.depositos.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="8">Depósitos</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.depositos_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Comprobante</th>
                <th>Banco</th>
                <th>Fecha depósito</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deposito, index) in cobros_caja_usuario.depositos" :key="index">
                <td>{{ deposito.numero_recibo }}</td>
                <td>{{ deposito.comprobante }}</td>
                <td>{{ deposito.CB_DESCRIPCION }}</td>
                <td>{{ deposito.fecha_deposito }}</td>
                <td class="text-end">${{ formatPriceJm(deposito.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(deposito.aplicado) }}</td>
                <td>{{ deposito.CLI_RUC }}</td>
                <td>{{ deposito.CLI_RAZON_SOCIAL }}</td>
                <td>{{ deposito.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.cheques_aldia.length"
            class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="10">Cheques al día</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.cheques_aldia_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th># Cheque</th>
                <th># Cuenta</th>
                <th>Banco</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cheque, index) in cobros_caja_usuario.cheques_aldia" :key="index">
                <td>{{ cheque.numero_recibo }}</td>
                <td>{{ cheque.cheque }}</td>
                <td>{{ cheque.cuenta }}</td>
                <td>{{ cheque.CB_DESCRIPCION }}</td>
                <td>{{ cheque.fecha_emision }}</td>
                <td>{{ cheque.fecha_vencimiento }}</td>
                <td class="text-end">${{ formatPriceJm(cheque.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(cheque.aplicado) }}</td>
                <td>{{ cheque.CLI_RUC }}</td>
                <td>{{ cheque.CLI_RAZON_SOCIAL }}</td>
                <td>{{ cheque.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.cheques_posfechados.length"
            class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="10">Cheques Posfechados</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.cheques_posfechados_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th># Cheque</th>
                <th># Cuenta</th>
                <th>Banco</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cheque, index) in cobros_caja_usuario.cheques_posfechados" :key="index">
                <td>{{ cheque.numero_recibo }}</td>
                <td>{{ cheque.cheque }}</td>
                <td>{{ cheque.cuenta }}</td>
                <td>{{ cheque.CB_DESCRIPCION }}</td>
                <td>{{ cheque.fecha_emision }}</td>
                <td>{{ cheque.fecha_vencimiento }}</td>
                <td class="text-end">${{ formatPriceJm(cheque.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(cheque.aplicado) }}</td>
                <td>{{ cheque.CLI_RUC }}</td>
                <td>{{ cheque.CLI_RAZON_SOCIAL }}</td>
                <td>{{ cheque.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.efectivo.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="5">Efectivo</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.efectivo_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(efectivo, index) in cobros_caja_usuario.efectivo" :key="index">
                <td>{{ efectivo.numero_recibo }}</td>
                <td class="text-end">${{ formatPriceJm(efectivo.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(efectivo.aplicado) }}</td>
                <td>{{ efectivo.CLI_RUC }}</td>
                <td>{{ efectivo.CLI_RAZON_SOCIAL }}</td>
                <td>{{ efectivo.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.retenciones.length"
            class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="11">Retenciones</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.retenciones_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Factura</th>
                <th>Comprobante</th>
                <th>F. Emisión</th>
                <th>F. Vencimiento</th>
                <th>Ret. IVA</th>
                <th>Ret. Renta</th>
                <th>Ret. IVA Srv.</th>
                <th>Ret. Renta Srv.</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(retencion, index) in cobros_caja_usuario.retenciones" :key="index">
                <td>{{ retencion.numero_recibo }}</td>
                <td>{{ retencion.ret_factura }}</td>
                <td>{{ retencion.ret_comprobante }}</td>
                <td>{{ retencion.ret_fecha_emision }}</td>
                <td>{{ retencion.ret_fecha_vencimiento }}</td>
                <td>{{ retencion.ret_porcentaje_iva }}% ${{ formatPriceJm( retencion.ret_iva) }}</td>
                <td>{{ retencion.ret_porcentaje_renta }}% ${{ formatPriceJm(retencion.ret_renta) }}</td>
                <td>
                  <span v-if="retencion.ret_iva_srv > 0">
                    {{ retencion.ret_porcentaje_iva_srv }}% ${{ formatPriceJm(retencion.ret_iva_srv) }}
                  </span>
                </td>
                <td>
                  <span v-if="retencion.ret_renta_srv > 0">
                    {{ retencion.ret_porcentaje_renta_srv }}% ${{ formatPriceJm(retencion.ret_renta_srv) }}
                  </span>
                </td>
                <td>{{ retencion.CLI_RUC }}</td>
                <td>{{ retencion.CLI_RAZON_SOCIAL }}</td>
                <td>{{ retencion.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-responsive fs-sm">
          <table v-if="cobros_caja_usuario.tarjeta.length" class="table table-stripped table-bordered table-sm mt-4">
            <thead>
              <tr class="table-success">
                <th colspan="7">Tarjeta de crédito</th>
                <th class="text-end">Total: ${{ formatPriceJm(cobros_caja_usuario.tarjeta_total) }}</th>
              </tr>
              <tr class="table-active">
                <th>Recibo</th>
                <th>Comprobante</th>
                <th>Banco</th>
                <th class="text-end">Monto</th>
                <th class="text-end">Aplicado</th>
                <th>RUC</th>
                <th>Razón social</th>
                <th>Fecha/hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tarjeta, index) in cobros_caja_usuario.tarjeta" :key="index">
                <td>{{ tarjeta.numero_recibo }}</td>
                <td>{{ tarjeta.comprobante }}</td>
                <td>{{ tarjeta.banco }}</td>
                <td class="text-end">${{ formatPriceJm(tarjeta.monto) }}</td>
                <td class="text-end">${{ formatPriceJm(tarjeta.aplicado)}}</td>
                <td>{{ tarjeta.CLI_RUC }}</td>
                <td>{{ tarjeta.CLI_RAZON_SOCIAL }}</td>
                <td>{{ tarjeta.fecha }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";
import { useStore } from 'vuex'
import {  swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  fecha: {
    maxDate: Date.now(),
    monthSelectorType: "static",
    locale: Spanish,
  },
});
import { formatPriceJm } from "@/functions";
import { useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';

const {
    //download pdf 
    loadingDownloadPdf,
    printPdfStatusAccountClient,

    //download excel
    loadingDownloadExcel,
    printExcelStatusAccountClient

} = useInvoiceCollectionActions();

const store = useStore();
const {
  clients,
  loadingSearch,
  errorSearchClient,
  showCustomerResults,
  updateCustomerSearchTerm,
  searchCustomerFilters,
  cleanSearchClients,
} = useCustomerFilterSearch();
const cobros_cliente = ref([]);
const today = new Date();
const fecha = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
const set_fecha_inicio = ref(fecha);
const set_fecha_fin = ref(fecha);
const currentCliente = ref(null);
const loading = ref(false);
const cobros_caja_usuario_loading = ref(false);
const cobros_caja_usuario = ref(null);
const currentCaja = computed(() => store.state.currentCaja);
const set_fecha = ref(fecha);
const puntoVenta = computed(() => store.state.puntodeventaselect);

store.dispatch('estadoCaja').catch(err => {
  swalError(err.response.data.error)
});

function generarcaja(set_fecha) {
  cobros_caja_usuario_loading.value = true;
  const consulta = reactive({
    caja_usuario: currentCaja.value.CAJA_CODIGO,
    fecha: set_fecha,
  })
  store.dispatch('consultacierrecajausuario', consulta).then((res) => {
    cobros_caja_usuario.value = res.data
    cobros_caja_usuario_loading.value = false;
  });
}

function imprimirCaja(set_fecha) {
  store.dispatch('imprimir', '/cobranzas/imprimircierredecajausuario/' + set_fecha + '/' + currentCaja.value.CAJA_CODIGO)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'consulta-de-caja-' + currentCaja.value.CAJA_CODIGO + '-' + set_fecha + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function buscarclientes() {
  if (loading.value) return;
  currentCliente.value = null;
  cobros_cliente.value = [];
  await searchCustomerFilters();
}

async function selectcliente(cliente) {
  if (loading.value) return;
  loading.value = true;
  currentCliente.value = null;
  cobros_cliente.value = [];
  cleanSearchClients();
  const consulta = {
    cliente,
    fecha_inicio: set_fecha_inicio.value,
    fecha_fin: set_fecha_fin.value,
    puntoVenta: puntoVenta.value,
  };
  try {
    const res = await store.dispatch("consultacobroscliente", consulta);
    currentCliente.value = cliente;
    cobros_cliente.value = res.cobros;
  } catch (err) {
    swalError(err.response?.data?.error || err.message || "No se pudieron consultar los cobros del cliente.");
  } finally {
    loading.value = false;
  }
}

async function printAccountStatementExcel() {
    const resp = await printExcelStatusAccountClient(currentCliente.value.id);
    if (!resp?.ok) {
        const msg = resp?.message || "Opps! No se pudo generar el archivo Excel";
        (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return;
    }
    swalSuccess(resp?.message || 'Excel Generado exitosamente');
}

async function printAccountStatementPdf() {
    const resp = await printPdfStatusAccountClient(currentCliente.value.id);
    if (!resp?.ok) {
        const msg = resp?.message || "Opps! No se pudo generar el archivo Pdf";
        (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return;
    }
    swalSuccess(resp?.message || 'Pdf Generado exitosamente');

}

</script>