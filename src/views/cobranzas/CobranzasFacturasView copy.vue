<template>
  <!-- Hero -->
  <BasePageHeading
    title="Cobro facturas"
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
    <!-- Full Table -->
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
        <div class="spinner-border text-primary mt-4" ><span class="visually-hidden">Loading...</span></div>
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
        <div class="spinner-border text-primary mt-4" ><span class="visually-hidden">Loading...</span></div>
      </div>

      <BaseBlock  v-if="currentClienteCobro && !verclientes && !cargaCliente" class="mt-4 mb-0">
        <template #content>
          <div class="block-content">
            <section class="cobro-client-header">
              <div class="d-flex flex-column flex-xl-row justify-content-between gap-3">
                <div class="d-flex align-items-start gap-3">
                  <div class="client-avatar">
                    <i class="fa fa-building"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h2 class="h4 mb-0 text-break">{{ currentClienteCobro.CLI_RAZON_SOCIAL }}</h2>
                      <span
                        class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="currentClienteCobro.suspendido == 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'"
                      >
                        {{ currentClienteCobro.suspendido == 1 ? 'Suspendido' : 'Activo' }}
                      </span>
                    </div>
                    <div class="client-meta text-muted fs-sm">
                      <span><i class="fa fa-id-card me-1"></i>{{ currentClienteCobro.CLI_RUC }}</span>
                      <span><i class="fa fa-location-dot me-1"></i>{{ currentClienteCobro.CLI_CIUDAD }} / {{ currentClienteCobro.CLI_PROVINCIA }}</span>
                      <span><i class="fa fa-file-signature me-1"></i>{{ currentClienteCobro.CLI_CONDICION_PAGO }}</span>
                    </div>
                  </div>
                </div>
                <div class="client-actions d-flex flex-wrap gap-2 justify-content-xl-end">
                  <button class="btn btn-sm btn-alt-primary" @click="imprimirEstadodeCuentaExcel()">
                    <i class="fa fa-file-excel me-1"></i> Excel
                  </button>
                  <button class="btn btn-sm btn-alt-success" @click="imprimirEstadodeCuenta()">
                    <i class="fa fa-print me-1"></i> PDF
                  </button>
                  <button class="btn btn-sm btn-alt-warning" @click="selectcliente(currentClienteCobro)">
                    <i class="fa fa-refresh me-1"></i> Actualizar
                  </button>
                </div>
              </div>

              <div class="row g-3 mt-3">
                <div class="col-md-4">
                  <div class="cobro-metric">
                    <span class="metric-label">Cupo disponible</span>
                    <strong
                      class="metric-value"
                      :class="parseFloat(currentClienteCobro.cupo_disponible) < 0 ? 'text-danger' : 'text-success'"
                    >
                      ${{ currentClienteCobro.cupo_disponible }}
                    </strong>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="cobro-metric">
                    <span class="metric-label">Cupo asignado</span>
                    <strong class="metric-value">${{ currentClienteCobro.cupo_asignado }}</strong>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="cobro-metric">
                    <span class="metric-label">Descuento comercial</span>
                    <strong class="metric-value">{{ currentClienteCobro.CLI_DSTO_COMERCIAL }}%</strong>
                    <span class="metric-note" v-if="currentClienteCobro.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">
                      {{ currentClienteCobro.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} dias de gracia
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section class="payment-workspace mt-4">
              <div class="row g-0">
                <div class="col-xl-3">
                  <nav class="payment-nav" aria-label="Metodos de cobro">
                    <div class="payment-nav-label">Metodos de cobro</div>
                    <button
                      v-for="method in paymentMethods"
                      :key="method.id"
                      type="button"
                      class="payment-nav-item"
                      :class="{ active: activePaymentMethod === method.id }"
                      :aria-pressed="activePaymentMethod === method.id"
                      @click="activePaymentMethod = method.id"
                    >
                      <span class="payment-nav-icon" :class="'payment-nav-icon-' + method.tone">
                        <i :class="method.icon"></i>
                      </span>
                      <span class="payment-nav-text">
                        <strong>{{ method.title }}</strong>
                        <small>{{ method.description }}</small>
                      </span>
                      <i class="fa fa-angle-right payment-nav-arrow"></i>
                    </button>
                  </nav>
                </div>
                <div class="col-xl-9">
                  <div class="payment-panel">
                    <header class="payment-panel-header">
                      <div>
                        <span class="text-muted fs-xs text-uppercase fw-semibold">Gestion de cobro</span>
                        <h3 class="payment-panel-title">{{ activePayment.title }}</h3>
                      </div>
                      <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-primary-light text-primary">
                        {{ activePayment.description }}
                      </span>
                    </header>
                    <div class="payment-panel-body">
                      <div v-show="activePaymentMethod === 'retenciones'" class="payment-pane">
                        <IngresoRetenciones></IngresoRetenciones>
                      </div>
                      <div v-show="activePaymentMethod === 'efectivo'" class="payment-pane">
                        <IngresoEfectivo></IngresoEfectivo>
                      </div>
                      <div v-show="activePaymentMethod === 'depositos'" class="payment-pane">
                        <DepositosTransferencias></DepositosTransferencias>
                      </div>
                      <div v-show="activePaymentMethod === 'cheques'" class="payment-pane">
                        <Cheques></Cheques>
                      </div>
                      <div v-show="activePaymentMethod === 'tarjeta'" class="payment-pane">
                        <Tarjeta></Tarjeta>
                      </div>
                      <div v-show="activePaymentMethod === 'saldos'" class="payment-pane">
                        <AplicarSaldos></AplicarSaldos>
                      </div>
                      <div v-show="activePaymentMethod === 'resumen'" class="payment-pane">
                        <Resumen></Resumen>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="registered-payments mt-4">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                <div>
                  <h3 class="h5 mb-1">Cobros registrados</h3>
                  <p class="text-muted fs-sm mb-0">Movimientos asociados al cliente seleccionado.</p>
                </div>
              </div>
              <CobrosRegistrados></CobrosRegistrados>
            </section>
          </div>

        </template>
      </BaseBlock>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore} from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import IngresoRetenciones from "../cobranzas/IngresoRetenciones.vue";
import IngresoEfectivo from "../cobranzas/IngresoEfectivo.vue";
import DepositosTransferencias from "../cobranzas/DepositosTransferencias.vue";
import Cheques from "../cobranzas/Cheques.vue";
import Tarjeta from "../cobranzas/Tarjeta.vue";
import AplicarSaldos from "../cobranzas/AplicarSaldos.vue";
import Resumen from "../cobranzas/Resumen.vue";
import CobrosRegistrados from "../cobranzas/CobrosRegistrados.vue";


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
const activePaymentMethod = ref("retenciones");
const paymentMethods = [
  {
    id: "retenciones",
    title: "Retenciones",
    description: "Comprobantes SRI",
    icon: "fa fa-receipt",
    tone: "info",
  },
  {
    id: "efectivo",
    title: "Efectivo",
    description: "Pago inmediato",
    icon: "fa fa-money-bill-wave",
    tone: "success",
  },
  {
    id: "depositos",
    title: "Depositos",
    description: "Transferencias bancarias",
    icon: "fa fa-building-columns",
    tone: "primary",
  },
  {
    id: "cheques",
    title: "Cheques",
    description: "Cheque al dia o fecha",
    icon: "fa fa-money-check-dollar",
    tone: "warning",
  },
  {
    id: "tarjeta",
    title: "Tarjeta",
    description: "Credito o debito",
    icon: "fa fa-credit-card",
    tone: "purple",
  },
  {
    id: "saldos",
    title: "Aplicar saldos",
    description: "Cruce de valores",
    icon: "fa fa-scale-balanced",
    tone: "secondary",
  },
  {
    id: "resumen",
    title: "Resumen",
    description: "Validar cobro",
    icon: "fa fa-list-check",
    tone: "danger",
  },
];
const activePayment = computed(() => {
  return paymentMethods.find((method) => method.id === activePaymentMethod.value) || paymentMethods[0];
});

let errorbuscarcliente = ref(false);

store.dispatch('estadoCaja').then((res) => {
  if(!res.success){
    swalError(res.message)
  }
}).catch(err => {
  swalError(err.response.data.error)
});

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
  store.commit('resetRegistroCopia');
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

</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.cobro-client-header {
  padding: 1.25rem;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  background: #ffffff;
}

.client-avatar {
  display: grid;
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 8px;
  color: #2563eb;
  background: #eef4ff;
}

.client-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.client-meta span {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.client-actions .btn {
  min-height: 2.125rem;
}

.cobro-metric {
  display: flex;
  min-height: 5.5rem;
  flex-direction: column;
  justify-content: center;
  padding: 0.875rem 1rem;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  background: #f8fafc;
}

.metric-label {
  margin-bottom: 0.25rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.metric-value {
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.metric-note {
  margin-top: 0.25rem;
  color: #64748b;
  font-size: 0.78rem;
}

.payment-workspace {
  overflow: hidden;
  border: 1px solid #dfe6f0;
  border-radius: 8px;
  background: #ffffff;
}

.payment-nav {
  height: 100%;
  padding: 0.75rem;
  border-right: 1px solid #dfe6f0;
  background: #f8fafc;
}

.payment-nav-label {
  padding: 0.35rem 0.5rem 0.65rem;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.payment-nav-item {
  display: flex;
  width: 100%;
  min-height: 4.25rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #334155;
  background: transparent;
  text-align: left;
  transition: background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.payment-nav-item + .payment-nav-item {
  margin-top: 0.25rem;
}

.payment-nav-item:hover,
.payment-nav-item.active {
  border-color: #d6deea;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.payment-nav-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 8px;
}

.payment-nav-icon-info {
  color: #0369a1;
  background: #e0f2fe;
}

.payment-nav-icon-success {
  color: #047857;
  background: #dcfce7;
}

.payment-nav-icon-primary {
  color: #2563eb;
  background: #dbeafe;
}

.payment-nav-icon-warning {
  color: #b45309;
  background: #fef3c7;
}

.payment-nav-icon-purple {
  color: #7c3aed;
  background: #ede9fe;
}

.payment-nav-icon-secondary {
  color: #475569;
  background: #e2e8f0;
}

.payment-nav-icon-danger {
  color: #b91c1c;
  background: #fee2e2;
}

.payment-nav-text {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.payment-nav-text strong,
.payment-nav-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-nav-text small {
  color: #64748b;
  font-size: 0.75rem;
}

.payment-nav-arrow {
  margin-left: auto;
  color: #94a3b8;
}

.payment-panel {
  min-height: 34rem;
  background: #ffffff;
}

.payment-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dfe6f0;
}

.payment-panel-title {
  margin: 0.1rem 0 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 800;
}

.payment-panel-body {
  padding: 1.25rem;
}

.payment-pane :deep(.block:last-child) {
  margin-bottom: 0;
}

.registered-payments {
  padding-top: 1.25rem;
  border-top: 1px solid #e5eaf2;
}

@media (max-width: 1199.98px) {
  .payment-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-right: 0;
    border-bottom: 1px solid #dfe6f0;
  }

  .payment-nav-label {
    grid-column: 1 / -1;
  }

  .payment-nav-item + .payment-nav-item {
    margin-top: 0;
  }

  .payment-nav-arrow {
    display: none;
  }

  .payment-panel {
    min-height: auto;
  }
}

@media (max-width: 575.98px) {
  .cobro-client-header,
  .payment-panel-body {
    padding: 1rem;
  }

  .client-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .client-actions {
    width: 100%;
  }

  .client-actions .btn {
    flex: 1 1 auto;
  }

  .payment-nav {
    grid-template-columns: 1fr;
  }

  .payment-panel-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
