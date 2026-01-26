<template>
  <BaseBlock title="Copiar pedido a cliente" class="mb-0 pb-4">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent="onSubmit">
          <div class="col-12">
            <label class="visually-hidden" for="buscar-cliente">Buscar cliente...</label>
            <input type="text" class="form-control" :class="errorbuscarcliente ? 'is-invalid' : ''" id="buscar-cliente"
              name="buscar-cliente" placeholder="Buscar cliente..." @keyup.enter="buscarclientes"
              v-model="buscarcliente.busqueda" />
          </div>
          <div>
            <button type="button" v-on:click="buscarclientes" class="btn btn-primary">Buscar</button>
          </div>
        </form>
        <div v-if="clientes.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
          </div>
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
                    <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{ cliente.CLI_RAZON_SOCIAL }} </a>
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
                    <a :href="'mailto:' + cliente.CLI_CORREO_ELECT_SRI">{{ cliente.CLI_CORREO_ELECT_SRI }}</a>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </BaseBlock>
        <BaseBlock v-if="currentCliente && !verclientes" class="mt-4 mb-0">
          <template #content>
            <div class="table-responsive">
              <table class="table table-striped table-sm table-vcenter">
                <tbody>
                  <tr>
                    <th class="fs-sm">RUC</th>
                    <td class="fs-sm">{{ currentCliente.CLI_RUC }}</td>
                    <th class="fs-sm">Razón Social</th>
                    <td class="fs-sm">{{ currentCliente.CLI_RAZON_SOCIAL }}</td>
                    <th class="fs-sm">Descuento Comercial</th>
                    <td class="fs-sm">{{ currentCliente.CLI_DSTO_COMERCIAL }}%</td>

                  </tr>
                  <tr>
                    <th class="fs-sm">Ciudad</th>
                    <td class="fs-sm">{{ currentCliente.CLI_CIUDAD }}</td>

                    <th class="fs-sm">Provincia</th>
                    <td class="fs-sm">{{ currentCliente.CLI_PROVINCIA }}</td>

                    <th class="fs-sm">Condición de pago</th>
                    <td class="fs-sm">
                      {{ condiciondepago_print }}
                      <span class="badge bg-info" v-if="currentCliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                        currentCliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
                    </td>
                  </tr>
                  <tr>

                    <th class="fs-sm">Suspendido</th>
                    <td class="fs-sm">
                      <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="currentCliente.suspendido == 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">{{
                          currentCliente.suspendido
                            == 1 ? 'Si' : 'No' }}</span>

                    </td>
                    <th class="fs-sm">Cupo Asignado</th>
                    <td class="fs-sm">${{ currentCliente.cupo_asignado }}</td>
                    <th class="fs-sm">Cupo Disponible</th>
                    <td class="fs-sm" :class="parseFloat(currentCliente.cupo_disponible) < 0 ? 'text-danger' : ''">
                      ${{ currentCliente.cupo_disponible }}</td>
                  </tr>

                </tbody>
              </table>
            </div>
            <div class="row items-push">
              <div class="col-md-4" v-for="(sucursal, index) in currentCliente.sucursales" :key="index">
                <div class="form-check form-block">
                  <input type="radio" class="form-check-input" :id="`sucursal-${sucursal.id}`"
                    name="example-radio-block" @click="selectsucursal(sucursal.id)"
                    :selected="sucursal.id == currentSucursal" />
                  <label class="form-check-label" :for="`sucursal-${sucursal.id}`"
                    :id="`label-sucursal-${sucursal.id}`">
                    <span class="d-block fw-normal text-center my-3 mb-0">
                      <span class="fs-6 fw-semibold">{{ sucursal.CLI_SUC_ID_DIRECCION }}</span>
                      <span class="d-block mb-2">{{ sucursal.CLI_SUC_DIRECCION }}</span>

                      <span class="d-block fs-6 fw-light py-3 m-3 bg-body-light rounded">{{ sucursal.CLI_SUC_PROVINCIA
                      }}
                        <small> {{ sucursal.CLI_SUC_CIUDAD }}</small></span>
                      <small class="fs-sm mb-0 text-muted">{{ sucursal.VEND_NOMBRES }} {{ sucursal.VEND_APELLIDOS
                      }}</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </BaseBlock>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cancelar</button>
    <button type="button" class="btn btn-success btn-sm mx-2" data-bs-dismiss="modal"
      :disabled="!currentSucursal ? true : false" @click="copiarPedido(verpedido, tipo)"> Copiar</button>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore } from 'vuex'
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
const { copyRawQuoteOrOrder } = useProcessCreateQuote();
const { verpedido, tipo } = defineProps({
  verpedido: Object,
  tipo: String,
});

const store = useStore();
const templateStore = useTemplateStore();
const router = useRouter();
const detallepedido = computed(() => store.state.detallepedido);
const currentSucursal = ref(store.state.currentSucursal);
const verclientes = ref(false);
const clientes = computed(() => store.state.clientes);
const condiciondepago_id = ref(store.state.condiciondepago_id);
const condiciondepago_print = ref(store.state.condiciondepago_print);
const bodegas = computed(() => store.state.bodegas);
const currentCliente = computed(() => store.state.currentCliente);

const factura_siguiente_mes = ref(store.state.factura_siguiente_mes);
const alerta_facturar = ref(store.state.alerta_facturar);
const factura_a_demanda = ref(store.state.factura_a_demanda);
const pregunta_facturar = ref(store.state.pregunta_facturar);
const factura_posterior_despacho = ref(store.state.factura_posterior_despacho);

const today = new Date();
let errorbuscarcliente = ref(false);
const buscarcliente = reactive({
  busqueda: null,
});
let errorMsg = ref('');

async function buscarclientes(ev) {
  if (buscarcliente.busqueda.length < 3) {
    errorbuscarcliente.value = true;
    return;
  }

  errorbuscarcliente.value = false;
  store.commit('nullCurrentcliente');
  currentSucursal.value = null;
  verclientes.value = true;
  ev.preventDefault();
  store.dispatch('buscarclientes', buscarcliente)
    .catch(err => {
      verclientes.value = false;
      errorMsg.value = err.response.data.error
    });
}

function selectcliente(cliente) {
  store.commit('resetCotizacion');
  verclientes.value = false;

  currentSucursal.value = null;
  store.commit('setCurrentcliente', cliente);

  condiciondepago_id.value = currentCliente.value.CLI_CONDICION_PAGO;
  condiciondepago_print.value = currentCliente.value.CLI_CONDICION_PAGO;
  sessionStorage.setItem('CONDICIONDEPAGOPRINT', currentCliente.value.CLI_CONDICION_PAGO)
  if (currentCliente.value.suspendido == 1)
    condiciondepago_id.value = 'CONTADO';

  store.commit('setNuevadireccion');
  alerta_facturar.value = '';

  factura_siguiente_mes.value = 0;
  factura_a_demanda.value = 0;
  pregunta_facturar.value = 0;
  factura_posterior_despacho.value = 0;
  if (currentCliente.value.CLI_FACTURA_POSTERIOR_AL_DESPACHO === 'SI') {
    if (currentCliente.value.CLI_DIA_MAXIMO_MES_FACTURACION === 1) {
      factura_posterior_despacho.value = 1;
      factura_a_demanda.value = 1;
      alerta_facturar.value = 'Factura a demanda posterior al despacho';
    } else if (today.getDate() <= currentCliente.value.CLI_DIA_MAXIMO_MES_FACTURACION) {
      factura_posterior_despacho.value = 1;
    } else {
      factura_posterior_despacho.value = 1;
      pregunta_facturar.value = 1;
      factura_siguiente_mes.value = 1;
    }
  }
  sessionStorage.setItem('factura_posterior_despacho', factura_posterior_despacho.value);
  sessionStorage.setItem('factura_a_demanda', factura_a_demanda.value);
  sessionStorage.setItem('factura_siguiente_mes', factura_siguiente_mes.value);
  sessionStorage.setItem('alerta_facturar', alerta_facturar.value);
  sessionStorage.setItem('pregunta_facturar', pregunta_facturar.value);

  currentSucursal.value = cliente.sucursales[0].id;
  sessionStorage.setItem('CURRENTSUCURSAL', currentSucursal.value)

  setTimeout(() => {
    const elem = document.getElementById('label-sucursal-' + currentSucursal.value);
    if (elem)
      elem.click();
  }, "100")
}

function selectsucursal(sucursal) {
  sessionStorage.setItem('CURRENTSUCURSAL', sucursal)
  currentSucursal.value = sucursal;
}

async function copiarPedido(pedido, tipo) {
  templateStore.pageLoader({ mode: "on" });
  const resp = await copyRawQuoteOrOrder(pedido.id, tipo, currentCliente.value.id, currentSucursal.value);
  if (resp?.ok) {
    templateStore.pageLoader({ mode: "off" });
    router.push({
      name: "ventas-crearcotizacion",
    });
  } else {
    templateStore.pageLoader({ mode: "off" });
    swalError(resp.error);
  }
}

onMounted(() => {
});
onBeforeUnmount(() => {
});
</script>