<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { swalWarning, swalError } from "@/functions/swal-alert.js";

const { verpedido, tipo } = defineProps({
  verpedido: Object,
  tipo: String,
});

const {
  clients,
  errorSearchClient,
  dataSearch,
  loadingSearch,
  searchClients,

  //customer
  infoClient,
  loadingAvailableCredit,
  fetchAvailableCreditCustomer,

  //sucursales
  loadingSucursales,
  sucursales,
  fetchCustomerBranches,



  //validations
  getClientStatus,

} = useClientSearch();
const templateStore = useTemplateStore();
const router = useRouter();



//nuevas funciones 
const showResultClients = ref(false); // para loading de tablas
const showInfoClient = ref(false);  // para loading de informacion
const showInfoSucursales = ref(false); // para loading de informacion - sucursales
async function searchFilterClientes() {
  if (dataSearch.search == null || dataSearch.search.length < 4) {
    showInfoClient.value = false;
    showResultClients.value = false;
    errorSearchClient.value = true
    return false;
  }
  showInfoClient.value = false;
  showInfoSucursales.value = false;
  showResultClients.value = false;
  dataSearch.tipo ='proceso';

  const resp = await searchClients();
  if (!resp?.ok) {
    errorSearchClient.value = true
    showResultClients.value = false;
    showInfoClient.value = false;
    swalWarning(resp?.message);
    return;
  }
  errorSearchClient.value = false;
  showResultClients.value = true;
}

const payload = reactive({
  cliente_id: null,
  sucursal_id: null
});
async function selectClient(client) {
  payload.cliente_id = client.id;
  payload.sucursal_id = null;

  showResultClients.value = false;
  showInfoClient.value = true;
  showInfoSucursales.value = true;
  const [respCredit, respBranches] = await Promise.all([
    fetchAvailableCreditCustomer(client.CLI_RUC),
    fetchCustomerBranches(client.CLI_RUC, 'cotizacion')
  ]);

  if (respCredit?.ok && respBranches?.ok) {
    showResultClients.value = false; // Escondemos la lista de búsqueda
    showInfoClient.value = true;    // Mostramos info cliente
    showInfoSucursales.value = true; // Mostramos sucursales
  } else {
    swalError('Hubo un problema al cargar los datos del cliente.');
  }

}

const checkSelectClient = computed(() => payload.cliente_id != null && payload.sucursal_id != null);
async function copiarPedido(pedido, tipo) {
  templateStore.pageLoader({ mode: "on" });
  router.push({
    name: "ventas-crearcotizacion",
    query: {
      id: pedido.id,
      mode: 'copy',
      tipo: tipo,
      cliente_id: payload.cliente_id,
      sucursal: payload.sucursal_id
    }
  });
  templateStore.pageLoader({ mode: "off" });
}


</script>
<template>
  <BaseBlock title="Copiar pedido a cliente" class="mb-0 pb-4">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <div class="row g-2">
          <!-- busqueda del cliente -->
          <div class="col">
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''"
                placeholder="Buscar cliente..." autocomplete="off" @keyup.enter="searchFilterClientes"
                v-model="dataSearch.search" />
              <button class="btn btn-primary" type="button" @click="searchFilterClientes" :disabled="loadingSearch">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-if="loadingSearch" class="text-center py-4">
          <div class="spinner-border text-primary mt-4">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <!-- mostrar lista de los clientes -->
        <BaseBlock v-if="showResultClients && clients.length > 0 && !loadingSearch" class="mb-2">
          <div class="table-responsive">
            <table class="table table-hover table-sm ">
              <thead>
                <tr>
                  <th>Ruc</th>
                  <th>Razón Social</th>
                  <th>Contacto</th>
                  <th>Ciudad</th>
                  <th>Provincia</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(client, index) in clients" :key="index">
                  <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                    <span class="text-primary">{{ client.CLI_RUC }}</span>
                  </td>
                  <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                    <span class="text-primary">{{ client.CLI_RAZON_SOCIAL }}</span>
                  </td>
                  <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                  <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                  <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                  <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>
                  <td class="fs-sm">
                    <a :href="'mailto:' + client.CLI_CORREO_ELECT_SRI">{{ client.CLI_CORREO_ELECT_SRI }}
                      <span class="badge bg-danger text-white" v-if="!client.emails_validated"> correo no valido</span>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseBlock>


        <!-- detalle visual de informacion de cliente -->
        <!-- loading -->
        <div v-if="loadingAvailableCredit || loadingSucursales" class="text-center py-4">
          <div class="spinner-border text-success"></div>
          <p class="mt-2">Obteniendo detalles del cliente...</p>
        </div>
        <!-- info -->
        <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" class="mb-0">
          <div class="row g-1 mb-2">
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ruc</small>
                <div class="fw-semibold text-truncate">{{ infoClient.CLI_RUC }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Razón Social</small>
                <div class="fw-semibold text-truncate">{{ infoClient.CLI_RAZON_SOCIAL }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Descuento Comercial</small>
                <div class="fw-semibold ">{{ infoClient.CLI_DSTO_COMERCIAL }} %</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ciudad</small>
                <div class="fw-semibold ">{{ infoClient.CLI_CIUDAD }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Provincia</small>
                <div class="fw-semibold ">{{ infoClient.CLI_PROVINCIA }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Condición de Pago</small>
                <div class="fw-semibold ">{{ infoClient.CLI_CONDICION_PAGO }}</div>
                <span class="badge bg-info" v-if="infoClient.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                  infoClient.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Suspendido</small>
                <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                  :class="getClientStatus(infoClient.suspendido).class">
                  {{ getClientStatus(infoClient.suspendido).text }}
                </span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Asignado</small>
                <div class="fw-semibold ">${{
                  infoClient.cupo_asignado }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Disponible</small>
                <div class="fw-semibold " :class="parseFloat(infoClient.cupo_disponible) < 0 ? 'text-danger' : ''">
                  ${{
                    infoClient.cupo_disponible }}</div>
              </div>
            </div>
          </div>
        </BaseBlock>


        <!-- sucursales a seleccionar  -->
        <BaseBlock v-if="showInfoSucursales && sucursales.length > 0 && !loadingAvailableCredit" class="mt-4 mb-0">
          <h5 class="fw-bold mb-3 fs-sm text-uppercase text-muted">
            <i class="fa fa-building me-1"></i> Lista de sucursales activas
          </h5>
          <div class="row items-push">
            <div class="col-md-4" v-for="sucursal in sucursales" :key="sucursal.id">
              <div class="form-check form-block p-0">
                <input type="radio" class="form-check-input d-none" :id="`sucursal-${sucursal.id}`"
                  name="sucursal-selection" :value="sucursal.id" v-model="payload.sucursal_id" />

                <label class="form-check-label w-100 h-100 m-0 cursor-pointer shadow-sm border rounded-3 transition-all"
                  :for="`sucursal-${sucursal.id}`"
                  :class="payload.sucursal_id == sucursal.id ? 'border-primary bg-primary-lighter' : 'bg-body'">
                  <div class="p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge rounded-pill"
                        :class="payload.sucursal_id == sucursal.id ? 'bg-primary' : 'bg-dark'">
                        #{{ sucursal.CLI_SUC_ID_DIRECCION }}
                      </span>
                      <i class="fa fa-map-marker-alt"
                        :class="payload.sucursal_id == sucursal.id ? 'text-primary' : 'text-muted'"></i>
                    </div>

                    <p class="fw-bold mb-1 text-truncate" :title="sucursal.CLI_SUC_DIRECCION">
                      {{ sucursal.CLI_SUC_DIRECCION }}
                    </p>

                    <div class="fs-sm text-muted mb-3">
                      <i class="fa fa-city me-1"></i> {{ sucursal.CLI_SUC_CIUDAD }}, {{ sucursal.CLI_SUC_PROVINCIA }}
                    </div>
                    <hr class="my-2 opacity-25">
                    <div class="d-flex align-items-center">
                      <div class="flex-shrink-0">
                        <div class="bg-body-dark rounded-circle d-flex align-items-center justify-content-center"
                          style="width: 30px; height: 30px;">
                          <i class="fa fa-user fs-xs"></i>
                        </div>
                      </div>
                      <div class="flex-grow-1 ms-2">
                        <p class="fs-xs text-muted mb-0">{{ infoClient.gpvendedor.VEND_NOMBRES || '-' }} {{
                          infoClient.gpvendedor.VEND_APELLIDOS || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </BaseBlock>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cancelar</button>
    <button type="button" class="btn btn-success btn-sm mx-2" data-bs-dismiss="modal" :disabled="!checkSelectClient"
      @click="copiarPedido(verpedido, tipo)"> Copiar</button>
  </div>
</template>

<style scoped>
@media (min-width: 1200px) {
  .billing-sticky {
    position: sticky;
    top: .75rem;
  }
}

.kv small {
  display: block;
  line-height: 1;
}

.kv .badge2 {
  white-space: normal;
  /* CLAVE: Permite que el texto haga salto de línea */
  text-align: left;
  /* Alinea el texto a la izquierda para leer mejor párrafos */
  display: block;
  /* Hace que ocupe el ancho disponible de la columna */
  line-height: 1.4;
  /* Da un poco de aire entre las líneas de texto */
  font-weight: 10px;
  /* Opcional: quita la negrita si el texto es muy largo */
}


.kv .fw-semibold {
  line-height: 1.1;
}
</style>