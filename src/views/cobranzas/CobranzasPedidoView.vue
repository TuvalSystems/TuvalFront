<template>
  <!-- Hero -->
  <BasePageHeading
    title="Cobro a pedido"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cobro Facturas</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">
    <BaseBlock v-if="currentCaja" title="Caja: " :subtitle="currentCaja.CAJA_DESCRIPCION" class="pb-4">
      <div class="row">
        <div class="col-sm-6">
          <p>Estado: <span :class="currentCaja.estado == 'abierto' ? 'bg-success-light text-success':'bg-danger-light text-danger'" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill">{{ currentCaja.estado }}</span> </p>
          <template v-if="currentCaja.estado == 'sin cierre'">
            <p class="alert alert-warning"><i class="fa fa-triangle-exclamation"></i> La caja no se cerró en la última fecha registrada</p>
            <router-link :to="{ name:'cobranzas-cierredecaja'}">
              Ir a cerrar la caja
            </router-link>
          </template>
          
        </div>
        <div class="col-sm-6 text-end">
          <template v-if="currentCaja.estado == 'cerrado'">
            <button class="btn btn-success btn-sm" @click="confirmAbrirCaja()"> <i class="fa fa-cash-register"></i> Abrir Caja</button>
          </template>
        </div>
      </div>
    </BaseBlock>
    <BaseBlock v-if="currentCaja && currentCaja.estado == 'abierto'" title="Pedidos" content-full>
      <template #options>

        <div class="space-x-1">
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="levantarFiltrocliente()" class="btn btn-info btn-sm mx-1"><i class="fa fa-user"></i> Cliente</button>
            <code class="text-muted" v-if="filtrar_cliente"> {{filtrar_cliente.CLI_RUC}}</code>
          </div>
          <div class="block-options-item">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm">Desde</label>
              </div>
              <div class="col-auto">
                <flat-pickr
                    style="width:120px;"
                    id="fecha_desde"
                    class="form-control form-control-sm"
                    v-model="fecha_desde"
                    :config="flatPickrState.fecha_desde"
                    @change="refrescarFecha()"
                />
              </div>
              <div class="col-auto">
                <label for="fecha_hasta" class="col-form-label fs-sm">Hasta</label>
              </div>
              <div class="col-auto">
                <flat-pickr
                    style="width:120px;"
                    id="fecha_hasta"
                    class="form-control form-control-sm"
                    v-model="fecha_hasta"
                    :config="flatPickrState.fecha_hasta"
                    @change="refrescarFecha()"
                />
              </div>
              <div class="col-auto">
                <button class="btn btn-sm btn-primary" @click="limpiarFecha()"><i class="fa fa-eraser"></i> Limpiar filtros</button>
              </div>
            </div>
          </div>
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="refreshllenarpedidos()" class="btn btn-success btn-sm"><i class="si si-refresh"></i></button>
          </div>
          <div class="dropdown d-inline-block">
            <button
                type="button"
                class="btn btn-sm btn-alt-secondary"
                id="dropdown-recent-orders-filters"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
              <i class="fa fa-fw fa-flask"></i>
              Estado
              <i class="fa fa-angle-down ms-1"></i>
            </button>
            <div
                class="dropdown-menu dropdown-menu-md dropdown-menu-end fs-sm"
                aria-labelledby="dropdown-recent-orders-filters"
            >
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('todos');"
                  href="javascript:void(0)"
              >
                Todos
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('espera');"
                  href="javascript:void(0)"
              >
                Espera
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('eliminado');"
                  href="javascript:void(0)"
              >
                Eliminados
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('facturado');"
                  href="javascript:void(0)"
              >
                Facturados
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('traslado');"
                  href="javascript:void(0)"
              >
                Traslado
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('orden_de_compra');"
                  href="javascript:void(0)"
              >
                Orden de Compra
              </a>
              <a
                  class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                  @click="llenarpedidos('rechazado');"
                  href="javascript:void(0)"
              >
                Rechazados
              </a>
            </div>
          </div>
        </div>
      </template>
      <Dataset
          v-slot="{ ds }"
          :ds-data="pedidos.data"
          :ds-sortby="sortBy"
          :ds-search-in="['pedido', 'cotizacion', 'factura',  'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at', 'cotizacion']"
      >
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLength" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <div v-if="pedidos.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>
        <div class="row" v-if="verpedidos && pedidos.data.length && !pedidos.loading">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-sm table-hover table-vcenter mb-0">
                <thead>
                <tr>
                  <th
                      v-for="(th, index) in cols"
                      :key="th.field"
                      :class="['sort', th.sort]"
                      @click="onSort($event, index)"
                      class="nowrap"
                  >
                    {{ th.name }} <i class="gg-select float-end"></i>
                  </th>
                  <th></th>
                  <th></th>
                </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr>
                      <td class="fs-sm">
                        {{ row.pedido }}
                      </td>
                      <td class="fs-sm">
                        {{  row.cotizacion }}
                      </td>
                      <td class="fs-sm">
                        {{  row.factura }}
                      </td>
                      <td class="fs-sm">
                        {{  row.CLI_RAZON_SOCIAL }}
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RUC }}
                      </td>
                      <td class="fs-sm">
                        {{ row.USERID }}
                      </td>
                      <td class="fs-sm">
                        {{ row.COND_ID }}
                      </td>
                      <td class="fs-sm">
                        {{ row.created_at }}
                      </td>
                      <td class="fs-sm text-end">
                        {{ formatPriceJm(row.total) }}
                      </td>
                      <td class="fs-sm">
                        <a
                            v-if="row.estado === 'espera'"
                            href="javascript:void(0)"
                            class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning"
                            @click="motivoEspera(row)"
                        >
                          {{ row.estado }}
                        </a>

                        <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill "
                              @click="
                        row.estado === 'rechazado' && row.aprobado_comercial_mensaje ? swalWarning(row.aprobado_comercial_mensaje) : '' ||
                        row.estado === 'rechazado' && row.aprobado_crediticio_mensaje ? swalWarning(row.aprobado_crediticio_mensaje) : ''"
                              :class="
                          row.estado === 'facturado' ? 'bg-success-light text-success': '' ||
                          row.estado === 'orden_de_compra' ? 'bg-info-light text-info': '' ||
                          row.estado === 'traslado' ? 'bg-danger-light text-danger': '' ||
                          row.estado === 'rechazado' && !row.aprobado_crediticio_mensaje ? 'bg-danger-light text-danger': '' ||
                          row.estado === 'rechazado' && row.aprobado_crediticio_mensaje ? 'pointer bg-danger-light text-danger':''
                          "
                        >
                        {{ row.estado }}</span>
                      </td>
                      <td class="nowrap">
                        <span v-if="row.estado === 'rechazado'" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger" >
                          <i class="fa fa-circle-xmark"></i>
                        </span>
                        <span v-else
                              class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill "
                              :class="row.imprimir === 'yes' ? 'bg-success-light text-success':'bg-warning-light text-warning'"
                              :title="row.imprimir === 'yes' ? 'Pedido aprobado':'Por aprobar'">
                          <i :class="row.imprimir === 'yes' ? 'fa fa-circle-check':'fa fa-circle-xmark'"></i>
                        </span>
                        <span v-if="(row.despachado === 1)" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1" title="Despachado">
                          <i class="fa fa-truck-fast"></i>
                        </span>
                      </td>
                      <td class="fs-sm text-end nowrap">
                        <button type="button" class="btn btn-primary btn-sm mx-1" @click="imprimirpedido(row)">
                          <i class="fa fa-file-invoice-dollar"></i> Cobrar
                        </button>

                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-3 fs-sm" />
        </div>
      </Dataset>
    </BaseBlock>
    <BaseBlock v-if="currentCaja && currentCaja.estado == 'abierto'" title="Cliente" class="pb-4">
      <form
          class="row row-cols-lg-auto g-3 align-items-center"
          @submit.prevent="onSubmit"
          >
          <div class="col-12">
              <label class="visually-hidden" for="buscar-cliente"
                  >Buscar cliente...</label
              >
              <input
                  type="text"
                  class="form-control"
                  :class="errorbuscarcliente ? 'is-invalid':''"
                  id="buscar-cliente"
                  name="buscar-cliente"
                  placeholder="Buscar cliente..."
                  @keyup.enter="buscarclientes"
                  v-model="buscarcliente.busqueda"
              />
          </div>
          <div>
              <button type="button" v-on:click="buscarclientes" class="btn btn-primary">Buscar</button>
          </div>
          
      </form>
      
      <div v-if="clientes.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
      <BaseBlock v-if="verclientes && clientes.data.length && !clientes.loading" class="mb-0">
        <div class="table-responsive">
          <table class="table table-hover table-sm table-vcenter">
            <thead>
            <tr>
              <th>RUC</th>
              <th>Razón Social</th>
              <th>Contacto</th>
              <th>Ciudad</th>
              <th>Provincia</th>
              <th>Teléfono</th>
              <th>Correo</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(cliente, index) in clientes.data" :key="index">
                <td class="">
                    <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{ cliente.CLI_RUC }} </a>
                </td>
                <td class="fs-sm">
                    <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{  cliente.CLI_RAZON_SOCIAL }} </a>
                </td>
                <td class="fs-sm">
                    {{ cliente.CLI_CONTACTO }}
                </td>
                <td class="fs-sm">
                    {{ cliente.CLI_CIUDAD }}
                </td>
                <td class="fs-sm">
                    {{ cliente.CLI_PROVINCIA }}
                </td>
                <td class="fs-sm">
                    {{ cliente.CLI_TELEFONO_1 }}
                </td>
                <td class="fs-sm">
                    <a :href="'mailto:' + cliente.CLI_CORREO_ELECT_SRI">{{cliente.CLI_CORREO_ELECT_SRI}}</a>
                </td>
                
            </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>

      <div v-if="cargaCliente" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>

      <BaseBlock  v-if="currentClienteCobro && !verclientes && !cargaCliente" class="mt-4 mb-0">
        <template #content>
          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <tbody>
                <tr>
                    <th class="fs-sm">RUC</th>
                    <td class="fs-sm">{{currentClienteCobro.CLI_RUC}}</td>
                    <th class="fs-sm">Razón Social</th>
                    <td class="fs-sm">{{currentClienteCobro.CLI_RAZON_SOCIAL}}</td>
                    <th class="fs-sm">Descuento Comercial</th>
                    <td class="fs-sm">{{currentClienteCobro.CLI_DSTO_COMERCIAL}}%</td>
                    
                </tr>
                <tr>
                    <th class="fs-sm">Ciudad</th>
                    <td class="fs-sm">{{currentClienteCobro.CLI_CIUDAD}}</td>
                
                    <th class="fs-sm">Provincia</th>
                    <td class="fs-sm">{{currentClienteCobro.CLI_PROVINCIA}}</td>
                
                    <th class="fs-sm">Condición de pago</th>
                    <td class="fs-sm" >
                      {{currentClienteCobro.CLI_CONDICION_PAGO}}
                      <span class="badge bg-info" v-if="currentClienteCobro.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{ currentClienteCobro.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
                    </td>
                </tr>
                <tr>
                
                    <th class="fs-sm">Suspendido</th>
                    <td class="fs-sm">
                      <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="currentClienteCobro.suspendido == 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'"
                        >{{currentClienteCobro.suspendido == 1 ? 'Si':'No'}}</span>
                      
                    </td>
                    <th class="fs-sm">Cupo Asignado</th>
                    <td class="fs-sm" >${{currentClienteCobro.cupo_asignado}}</td>
                    <th class="fs-sm">Cupo Disponible</th>
                    <td class="fs-sm" :class="parseFloat(currentClienteCobro.cupo_disponible) < 0 ? 'text-danger':''">${{currentClienteCobro.cupo_disponible}}</td>
                </tr>
                
              </tbody>
            </table>
          </div>
          <div class="text-end mb-2">
            <button class="btn btn-sm btn-primary mx-1" @click="imprimirEstadodeCuentaExcel()"><i class="fa fa-file-excel"></i> Estado de cuenta EXCEL</button>
            <button class="btn btn-sm btn-success mx-1" @click="imprimirEstadodeCuenta()"><i class="fa fa-print"></i> Estado de cuenta PDF</button>
            <button class="btn btn-sm btn-warning mx-1" @click="selectcliente(currentClienteCobro)"><i class="fa fa-refresh"></i> Actualizar</button>
          </div>
          <div class="accordion" id="tiposdepago">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingRetenciones">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRetenciones" aria-expanded="false" aria-controls="collapseRetenciones">
                  Ingreso de retenciones
                </button>
              </h2>
              <div id="collapseRetenciones" class="accordion-collapse collapse" aria-labelledby="headingRetenciones" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <IngresoRetenciones></IngresoRetenciones>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingEfectivo">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEfectivo" aria-expanded="false" aria-controls="collapseEfectivo">
                  Ingreso de efectivo
                </button>
              </h2>
              <div id="collapseEfectivo" class="accordion-collapse collapse" aria-labelledby="headingEfectivo" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <IngresoEfectivo></IngresoEfectivo>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingDepositos">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDepositos" aria-expanded="false" aria-controls="collapseDepositos">
                   Ingreso de Depósitos o Transferencias
                </button>
              </h2>
              <div id="collapseDepositos" class="accordion-collapse collapse" aria-labelledby="headingDepositos" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <DepositosTransferencias></DepositosTransferencias>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingCheques">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCheques" aria-expanded="false" aria-controls="collapseCheques">
                   Ingreso de Cheques
                </button>
              </h2>
              <div id="collapseCheques" class="accordion-collapse collapse" aria-labelledby="headingCheques" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <Cheques></Cheques>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTarjeta">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTarjeta" aria-expanded="false" aria-controls="collapseTarjeta">
                   Tarjeta de crédito
                </button>
              </h2>
              <div id="collapseTarjeta" class="accordion-collapse collapse" aria-labelledby="headingTarjeta" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <Tarjeta></Tarjeta>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingAplicar">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAplicar" aria-expanded="false" aria-controls="collapseAplicar">
                   Aplicar Saldos
                </button>
              </h2>
              <div id="collapseAplicar" class="accordion-collapse collapse" aria-labelledby="headingAplicar" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <AplicarSaldos></AplicarSaldos>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingResumen">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseResumen" aria-expanded="false" aria-controls="collapseResumen">
                  <b>Resumen</b>
                </button>
              </h2>
              <div id="collapseResumen" class="accordion-collapse collapse" aria-labelledby="headingResumen" data-bs-parent="#tiposdepago">
                <div class="accordion-body">
                  <Resumen></Resumen>
                </div>
              </div>
            </div>
          </div>
          <CobrosRegistrados></CobrosRegistrados>
        </template>
      </BaseBlock>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <div
      class="modal"
      id="modal-filtrar-cliente"
      tabindex="-1"
      role="dialog"
      aria-labelledby="modal-filtrar-cliente"
      aria-hidden="true"
      ref="filtrarClienteModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FiltrarCliente
            @filtrarCliente="filtrarCliente()"
        ></FiltrarCliente>
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import {ref, reactive, computed, onMounted, watch} from "vue";
import { useStore} from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { formatPrice, formatPriceJm } from "@/functions";
import IngresoRetenciones from "../cobranzas/IngresoRetenciones.vue";
import IngresoEfectivo from "../cobranzas/IngresoEfectivo.vue";
import DepositosTransferencias from "../cobranzas/DepositosTransferencias.vue";
import FiltrarCliente from "../ventas/modals/FiltrarCliente.vue";
import Cheques from "../cobranzas/Cheques.vue";
import Tarjeta from "../cobranzas/Tarjeta.vue";
import AplicarSaldos from "../cobranzas/AplicarSaldos.vue";
import Resumen from "../cobranzas/Resumen.vue";
import CobrosRegistrados from "../cobranzas/CobrosRegistrados.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import {Modal} from "bootstrap";

const flatPickrState = reactive({
  fecha_desde: {
    maxDate: Date.now(),
    locale: Spanish,
  },
  fecha_hasta: {
    maxDate: Date.now(),
    locale: Spanish,
  },
});
const store = useStore();
const templateStore = useTemplateStore();
const buscarcliente = reactive({
  busqueda: null,
  tipo: 'cobranza'
});
let errorMsg = ref('');
const verclientes = ref(false);
const cargaCliente = ref(false);
const clientes = computed(() => store.state.clientes);
const currentClienteCobro = computed(() => store.state.currentClienteCobro);
const currentCaja = computed(() => store.state.currentCaja);
const filtrar_cliente = computed(() => store.state.filtrar_cliente);
const fecha_desde = ref(null);
const fecha_hasta = ref(null);
const estado_filtro = ref(null);
const pedidos = computed(() => store.state.pedidos);
const verpedidos = ref(false);

let filtrarClienteModal= ref(null);
let filtrarClienteModalObj = null;

const cols = reactive([
  {
    name: "Pedido",
    field: "pedido",
    sort: "",
  },
  {
    name: "Cot.",
    field: "cotizacion",
    sort: "",
  },
  {
    name: "Factura",
    field: "factura",
    sort: "",
  },
  {
    name: "Cliente",
    field: "CLI_RAZON_SOCIAL",
    sort: "",
  },
  {
    name: "RUC",
    field: "CLI_RUC",
    sort: "",
  },
  {
    name: "Usr.",
    field: "USERID",
    sort: "",
  },
  {
    name: "Cond.",
    field: "COND_ID",
    sort: "",
  },
  {
    name: "Fecha",
    field: "created_at",
    sort: "",
  },
  {
    name: "Total",
    field: "total",
    sort: "",
  },
  {
    name: "Estado",
    field: "estado",
    sort: "",
  },
]);
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

// On sort th click
function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }
  if (!sortEl.sort) {
    toset = "asc";
  }
  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }
  if (sortEl.sort === "asc") {
    toset = "desc";
  }
  sortEl.sort = toset;
}


let errorbuscarcliente = ref(false);

store.dispatch('estadoCaja').then((res) => {
  if(!res.success){
    swalError(res.message)
  }
}).catch(err => {
  swalError(err.response.data.error)
});

llenarpedidos('todos');

function levantarFiltrocliente(){
  store.commit('resetClientes');
  filtrarClienteModalObj.show();
}

function filtrarCliente(){
  filtrarClienteModalObj.hide();
  llenarpedidos(estado_filtro.value);
}
async function llenarpedidos(estado){
  estado_filtro.value = estado;
  const consulta = reactive({
    puntodeventa_id: store.state.puntodeventaselect,
    estado: estado,
    fecha_desde: fecha_desde.value,
    fecha_hasta: fecha_hasta.value,
    cliente: filtrar_cliente.value,
  })
  store.dispatch('llenarpedidos', consulta).then(() => {
    verpedidos.value = true;
  }).catch(err => {
    verpedidos.value = false;
    swalError(err.response.data.error);
  });
}
async function buscarclientes(ev){
  if(buscarcliente.busqueda.length < 3){
    errorbuscarcliente.value = true;
    return;
  }
  
  errorbuscarcliente.value = false;
  verclientes.value = true;
  ev.preventDefault();
  store.dispatch('buscarclientes', buscarcliente)
  .catch(err => {
      verclientes.value = false;
      errorMsg.value = err.response.data.error
  });
}

function selectcliente(cliente){
  verclientes.value = false;
  cargaCliente.value = true;
  store.dispatch('cupoDisponible', cliente.CLI_RUC).then( (cupo) => {
    store.dispatch('estadodecuenta', cliente).then((res) => {
      cargaCliente.value = false;
      store.dispatch('cobrosRegistrados', cliente).then( () => {
        store.commit('enceraRetencion');
        store.commit('enceraCobranzas');
        cliente.suspendido = cupo.suspendido;
        cliente.cupo_disponible = cupo.cupo_disponible;
        cliente.cupo_asignado = cupo.cupo_asignado;
        store.commit('setCurrentclienteCobro', cliente);
      });



    })
        .catch(err => {
          errorMsg.value = err.response.data.error
        });
  });
}

function imprimirEstadodeCuenta(){
  store.dispatch('imprimir', '/cobranzas/estadodecuentaclientetuval/'+currentClienteCobro.value.CLI_RUC)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'estadodecuenta-'+currentClienteCobro.value.CLI_RUC+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}

function imprimirEstadodeCuentaExcel(){
  store.dispatch('imprimir', '/cobranzas/estadodecuentaclientetuvalexcel/'+currentClienteCobro.value.CLI_RUC)
      .then((response) => {
        if(response.status == 200){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'estadodecuenta-'+currentClienteCobro.value.CLI_RUC+'.xlsx');
          document.body.appendChild(link);
          link.click();
        }
      });
}

function abrirCaja(){
  store.dispatch('abrirCaja').then(() => {
    store.dispatch('estadoCaja');
  })
  .catch(err => {
      errorMsg.value = err.response.data.error
  });
}

function confirmAbrirCaja(index, retencion){
  toast.fire({
      title: "Estás seguro?",
      text: "De abrir la caja: "+currentCaja.value.CAJA_DESCRIPCION,
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, abrirla!",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        abrirCaja();
      }
    });
}

onMounted(() => {

  // verpedidoModalObj = new Modal(verpedidoModal.value);
  // levantarClienteModalObj = new Modal(levantarClienteModal.value);
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);


});
watch(
    () => verpedidos.value,
    () => {
      document.querySelectorAll("#datasetLength label").forEach((el) => {
        el.remove();
      });

      // Replace select classes
      let selectLength = document.querySelector("#datasetLength select");

      selectLength.classList = "";
      selectLength.classList.add("form-select");
      selectLength.style.width = "80px";
    }
)
</script>