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