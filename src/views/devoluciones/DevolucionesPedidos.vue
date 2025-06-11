<template>
  <!-- Hero -->
  <BasePageHeading
    title="Devolución de pedidos"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Devoluciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Devolución pedidos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

   <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Cliente" class="pb-4">
      <form
          class="row row-cols-lg-auto g-3 align-items-center"
          @submit.prevent=""
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
      <BaseBlock v-if="verclientes && (!clientes.loading && clientes.data.length)" class="mb-0">
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
      <BaseBlock  v-if="currentClienteDevolucion && !verclientes" class="mt-4 mb-0">
        <template #content>
          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <tbody>
                <tr>
                    <th class="fs-sm">RUC</th>
                    <td class="fs-sm">{{currentClienteDevolucion.CLI_RUC}}</td>
                    <th class="fs-sm">Razón Social</th>
                    <td class="fs-sm">{{currentClienteDevolucion.CLI_RAZON_SOCIAL}}</td>
                    <th class="fs-sm">Descuento Comercial</th>
                    <td class="fs-sm">{{currentClienteDevolucion.CLI_DSTO_COMERCIAL}}%</td>
                    
                </tr>
                <tr>
                    <th class="fs-sm">Ciudad</th>
                    <td class="fs-sm">{{currentClienteDevolucion.CLI_CIUDAD}}</td>
                
                    <th class="fs-sm">Provincia</th>
                    <td class="fs-sm">{{currentClienteDevolucion.CLI_PROVINCIA}}</td>
                
                    <th class="fs-sm">Condición de pago</th>
                    <td class="fs-sm" >
                      {{currentClienteDevolucion.CLI_CONDICION_PAGO}}
                      <span class="badge bg-info" v-if="currentClienteDevolucion.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{ currentClienteDevolucion.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
                    </td>
                </tr>
                <tr>
                
                    <th class="fs-sm">Suspendido</th>
                    <td class="fs-sm">
                      <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="currentClienteDevolucion.suspendido == 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'"
                        >{{currentClienteDevolucion.suspendido == 1 ? 'Si':'No'}}</span>
                      
                    </td>
                    <th class="fs-sm">Cupo Asignado</th>
                    <td class="fs-sm" >${{currentClienteDevolucion.cupo_asignado}}</td>
                    <th class="fs-sm">Cupo Disponible</th>
                    <td class="fs-sm" :class="parseFloat(currentClienteDevolucion.cupo_disponible) < 0 ? 'text-danger':''">${{currentClienteDevolucion.cupo_disponible}}</td>
                </tr>
                
              </tbody>
            </table>
          </div>
          <div class="text-end mb-2">
            <button class="btn btn-sm btn-primary mx-1" @click="imprimirEstadodeCuentaExcel()"><i class="fa fa-file-excel"></i> Estado de cuenta EXCEL</button>
            <button class="btn btn-sm btn-success mx-1" @click="imprimirEstadodeCuenta()"><i class="fa fa-print"></i> Estado de cuenta PDF</button>
            <button class="btn btn-sm btn-warning mx-1" @click="actualizar()"><i class="si si-refresh"></i> Actualizar</button>
          </div>
        </template>
      </BaseBlock>

    </BaseBlock>
    <BaseBlock v-if="currentClienteDevolucion && !verclientes" class="row g-0">
      <template #content>
        <ul
          class="nav nav-tabs nav-tabs-block flex-md-column col-md-2"
          role="tablist"
          >
          <li class="nav-item d-md-flex flex-md-column">
            <button
                class="nav-link text-md-start active"
                id="btabs-vertical-facturas-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-vertical-facturas"
                role="tab"
                aria-controls="btabs-vertical-facturas"
                aria-selected="false"
            >
              <i
                  class="fa fa-fw fa-user-circle opacity-50 me-1 d-none d-sm-inline-block"
              ></i>
              Facturas
            </button>
          </li>
          <li class="nav-item d-md-flex flex-md-column">
            <button
                class="nav-link text-md-start"
                id="btabs-vertical-devoluciones-tab"
                data-bs-toggle="tab"
                data-bs-target="#btabs-vertical-devoluciones"
                role="tab"
                aria-controls="btabs-vertical-devoluciones"
                aria-selected="false"
            >
              <i
                  class="fa fa-fw fa-cog opacity-50 me-1 d-none d-sm-inline-block"
              ></i>
              Devoluciones
            </button>
          </li>
        </ul>
        <div class="tab-content col-md-10">
          <div
            class="block-content tab-pane active"
            id="btabs-vertical-facturas"
            role="tabpanel"
            aria-labelledby="btabs-vertical-home-tab"
            >
            <Pedidos @recargarCliente="selectcliente(currentClienteDevolucion)"></Pedidos>
          </div>

          <div
            class="block-content tab-pane"
            id="btabs-vertical-devoluciones"
            role="tabpanel"
            aria-labelledby="btabs-vertical-devoluciones-tab"
            >
            <Devoluciones></Devoluciones>
          </div>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore} from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";
import SolicitarDevolucion from "./modals/SolicitarDevolucion.vue"
import VerPedidoModal from "../ventas/modals/VerPedidoModal.vue";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import Pedidos from "./tabs/Pedidos.vue"
import Devoluciones from "./tabs/Devoluciones.vue"

const store = useStore();
const templateStore = useTemplateStore();
const buscarcliente = reactive({
  busqueda: null,
  tipo: 'cobranza'
});

const verclientes = ref(false);
const clientes = computed(() => store.state.clientes);
const currentClienteDevolucion = computed(() => store.state.currentClienteDevolucion);



let errorbuscarcliente = ref(false);

const verpedidos = ref(false);



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
      swalError(err.response.data.error);
  });
}

if(!verpedidos.value && currentClienteDevolucion.value){
  actualizar();
  //selectcliente(currentClienteDevolucion.value);
}

function selectcliente(cliente){
  verclientes.value = false;
  store.dispatch('cupoDisponible', cliente.CLI_RUC).then( (cupo) => {
    store.dispatch('estadodecuenta', cliente).then((res) => {
      cliente.suspendido = cupo.suspendido;
      cliente.cupo_disponible = cupo.cupo_disponible;
      cliente.cupo_asignado = cupo.cupo_asignado;
      store.commit('setCurrentclienteDevolucion', cliente);
      actualizar();
    })
        .catch(err => {
          swalError(err.response.data.error);
        });
  });

}

function actualizar(){
  store.commit('setPedidosLoading', true);
  store.commit('setDevolucionesLoading', true);
  // store.dispatch('procesardevoluciones').then( () => {
    store.dispatch('pedidoscliente', currentClienteDevolucion.value.id).then( () => {
      verpedidos.value = true;

      // Remove labels from
      document.querySelectorAll("#datasetLength label").forEach((el) => {
        el.remove();
      });

      // Replace select classes
      let selectLength = document.querySelector("#datasetLength select");

      selectLength.classList = "";
      selectLength.classList.add("form-select");
      selectLength.style.width = "80px";

      document.querySelectorAll("#datasetDevolucionesLength label").forEach((el) => {
        el.remove();
      // });

      // Replace select classes
      let selectDevolucionesLength = document.querySelector("#datasetDevolucionesLength select");

      selectDevolucionesLength.classList = "";
      selectDevolucionesLength.classList.add("form-select");
      selectDevolucionesLength.style.width = "80px";

    }).catch(err => {
      verpedidos.value = false;
      swalError(err.response.data.error);
    });
  })

}

function imprimirEstadodeCuenta(){
  store.dispatch('imprimir', '/cobranzas/estadodecuentaclientetuval/'+currentClienteDevolucion.value.CLI_RUC)
  .then((response) => {
    if(response.status == 200){
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'estadodecuenta-'+currentClienteDevolucion.value.CLI_RUC+'.pdf');
      document.body.appendChild(link);
      link.click();
    }
  });
}

function imprimirEstadodeCuentaExcel(){
  store.dispatch('imprimir', '/cobranzas/estadodecuentaclientetuvalexcel/'+currentClienteDevolucion.value.CLI_RUC)
      .then((response) => {
        if(response.status == 200){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'estadodecuenta-'+currentClienteDevolucion.value.CLI_RUC+'.xlsx');
          document.body.appendChild(link);
          link.click();
        }
      });
}
</script>