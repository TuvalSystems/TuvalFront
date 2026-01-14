<script setup>
import { onMounted, ref, computed, watch, reactive, nextTick } from "vue";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { useCheckClientSegment } from "@/composables/venta/cotizaciones/useCheckClientSegment";
import actualizarSegmentoClienteComponent from "@/views/ventas/modals/actualizarSegmentoClienteModal.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';

// imports modales
import verModalCrearNuevaDireccion from "@/views/ventas/modals/verModalCrearNuevaDireccion.vue";
import verModalBuscarArticulos from "@/views/ventas/modals/verModalBuscarArticulos.vue";
const {
  clients,
  errorSearchClient,
  dataSearch,
  loadingSearch,
  searchClients,

  //customer
  infoClient,
  infoSegmento,
  loadingAvailableCredit,
  fetchAvailableCreditCustomer,

  //sucursales
  loadingSucursales,
  sucursales,
  fetchCustomerBranches,

  //bodegas por punto de venta
  loadingWarehouseByUser,
  warehouseByUser,
  fetchWarehouseByPtoVtaUser,

  //validations
  getClientStatus,

} = useClientSearch();
const { form, clearForm } = useProcessCreateQuote();
const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();
const flatPickrState = reactive({
  minDate: Date.now(),
  monthSelectorType: "static",
  locale: Spanish,
});


//variables de modales 
const verModalActualizarSegmento = ref(null)
const verModalCrearDireccionModal = ref(null)
const verSearchItemModal = ref(null);

const verModalActualizarSegmentoObj = useBootstrapModal(verModalActualizarSegmento)
const verModalCrearDireccionModalObj = useBootstrapModal(verModalCrearDireccionModal)
const verSearchItemModalObj = useBootstrapModal(verSearchItemModal)


// variables para mostrar las busquedas
const showResultClients = ref(false);
const showInfoClient = ref(false);

async function searchFilterClientes() {
  clearForm();//limpia el formulario 
  showResultClients.value = true;
  showInfoClient.value = false;
  if (dataSearch.search == null || dataSearch.search.length >= 0 && dataSearch.search.length < 4) {
    showResultClients.value = false;
    showInfoClient.value = false;
    errorSearchClient.value = true
    return false;
  }
  const resp = await searchClients();

  if (!resp?.ok) {
    errorSearchClient.value = true
    showResultClients.value = false;
    showInfoClient.value = false;

    swalError(resp?.message);
    return;
  }
  errorSearchClient.value = false;
}

const datosCliente = ref(null);
async function selectClient(client) {
  if (loadingCheck.value) return;
  const respSeg = await fetchCheckSegmentoClient(client.CLI_RUC);

  if (respSeg?.ok === false) {
    datosCliente.value = client;
    verModalActualizarSegmentoObj.show();
  }
  if (respSeg?.ok === true) {
    showResultClients.value = false;
    await processSelectClient(client);
  }

}



async function processSelectClient(client) {

  if (verModalActualizarSegmentoObj) {
    verModalActualizarSegmentoObj.hide();
  }
  datosCliente.value = null;
  showResultClients.value = false;

  const [respCredit, respBranches] = await Promise.all([
    fetchAvailableCreditCustomer(client.CLI_RUC), // Corregido 'Available'
    fetchCustomerBranches(client.CLI_RUC)
  ]);

  if (!respCredit?.ok) {
    swalError(respCredit?.message || 'Error consultando crédito');
    return; // Opcional: ¿Quieres detener todo si falla el crédito?
  }

  // Validamos Sucursales
  if (!respBranches?.ok) {
    swalError(respBranches?.message || 'Error consultando sucursales');
    return;
  }
  showInfoClient.value = true;

  //asignacion de sucursal 
  if (sucursales.value.length > 0) {
    if (!form.value.direccion_facturacion_id) {
      form.value.direccion_facturacion_id = sucursales.value[0].id
    }
  }

  if (warehouseByUser.value.length > 0) {
    if (!form.value.bodega_facturacion) {
      form.value.bodega_facturacion = warehouseByUser.value[0].relacion_bodega.BOD_BODEGA
    }
  }

}


const checkCoords = (idSucursal) => {
  if (!idSucursal) return false;
  const sucursal = sucursales.value.find(s => s.id === idSucursal);
  // Aquí podrías agregar validaciones extra si las coordenadas vienen como JSON o string raro
  return sucursal && sucursal.coordenadas;
};

// Tus computadas quedan más limpias
const hasCoordinates = computed(() => checkCoords(form.value.direccion_facturacion_id));
const hasCoordinates2 = computed(() => checkCoords(form.value.direccion_entrega_id));

const hasDispatch = computed(() => {
  const warehouse = warehouseByUser.value.find(w => w.relacion_bodega.BOD_BODEGA === form.value.bodega_facturacion);
  return !!warehouse?.relacion_bodega.PERMITE_DESPACHO;
});


// proceso de crear direccion nueva para un cliente 
let dataClient = ref({});
async function openModalCreateAddress() {
  dataClient.value = infoClient.value;
  await nextTick();
  verModalCrearDireccionModalObj.show()

}

async function closeModalCreateAddress(client) {
  verModalCrearDireccionModalObj.hide();
  if (client && client.CLI_RUC) {
    await fetchCustomerBranches(client.CLI_RUC);
  }
  dataClient.value = {};

}

watch(
  () => infoClient.value,
  (newValue) => {
    if (newValue) {
      form.value.cliente = newValue
    }
  }
)





/** apertura de modal de consulta de items */
const dataSearchItem = ref({});
const openModalSearchItem = () => {
  dataSearchItem.value = form.value;
  verSearchItemModalObj.show();
}

const closeModalSearchItem = () => {
  dataSearchItem.value = {};
  verSearchItemModalObj.hide();
}




onMounted(async () => {
  await fetchWarehouseByPtoVtaUser();

  //logica para recuperar datos en memoria
  if (form.value.cliente && form.value.cliente.CLI_RUC) {
    loadingSearch.value = true;
    loadingAvailableCredit.value = false;
    infoClient.value = form.value.cliente;
    showInfoClient.value = true;
    showResultClients.value = false;
    await nextTick();
    try {
     
      await Promise.all([
        fetchAvailableCreditCustomer(form.value.cliente.CLI_RUC),
        fetchCustomerBranches(form.value.cliente.CLI_RUC)
      ]);
    } catch (e) {
      console.error("Error cargando datos del cliente recuperado", e);
    } finally {
      loadingSearch.value = false;
      showInfoClient.value = true;
      loadingAvailableCredit.value = false;

    }
  }

});

</script>
<template>
  <div class="content">
    <BaseBlock title="Cliente" content-full rounded>
      <div class="row g-2">
        <div class="col">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''"
              placeholder="Buscar cliente..." autocomplete="no" @keyup.enter="searchFilterClientes"
              v-model="dataSearch.search" />
            <button class="btn btn-primary" type="button" @click="searchFilterClientes" :disabled="loadingSearch">
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
        <div class="col-auto">
          <router-link :to="{ name: 'ventas-crearcliente' }" class="btn btn-success btn-sm"
            :class="{ 'disabled': loadingSearch }">
            <i class="fa fa-plus me-1"></i> Crear
          </router-link>
        </div>
      </div>

      <!-- loading de carga de clientes -->
      <div v-if="loadingSearch" class="text-center py-4">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- mensaje de visualizacion en caso de que no haya clientes -->
      <div v-if="clients.length === 0 && !loadingSearch && showResultClients" class="text-center py-4">
        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">
          No se encontraron registros para mostrar
        </p>
      </div>

      <!-- table de clientes  -->
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
                <td class="fs-sm" @click="selectClient(client)">
                  <span class="text-primary">{{ client.CLI_RUC }}</span>
                </td>
                <td class="fs-sm" @click="selectClient(client)">
                  <span class="text-primary">{{ client.CLI_RAZON_SOCIAL }}</span>
                </td>
                <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>
                <td class="fs-sm">
                  <a :href="'mailto:' + client.CLI_CORREO_ELECT_SRI">{{ client.CLI_CORREO_ELECT_SRI }}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>


      <!-- detalle visual de informacion de cliente -->
      <div v-if="loadingAvailableCredit" class="text-center py-4">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" class="mb-0">
        <div class="content-fluid">
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
                  infoClient.CLI_DIA_GRACIA_CHEQUE_A_FECHA }}</span>
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
                <div class="fw-semibold " :class="parseFloat(infoClient.cupo_disponible) < 0 ? 'text-danger' : ''">${{
                  infoClient.cupo_disponible }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ infoSegmento.segmento }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ infoSegmento.subsegmento }}</div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Bodegas</small>
                <select class="form-select form-select-sm" v-model="form.bodega_facturacion">
                  <option v-for="(bod, index) in warehouseByUser" :key="index" :value="bod.relacion_bodega.BOD_BODEGA">
                    {{ bod.relacion_bodega.BOD_BODEGA }}
                  </option>
                </select>
              </div>
            </div>

            <div class="col-12 col-lg-8">
              <div class="kv space-y-2">
                <small class="text-muted">Dirección de Facturación</small>
                <div class="input-group input-group-sm">
                  <select class="form-select" v-model="form.direccion_facturacion_id">
                    <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                      {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }}
                    </option>
                  </select>
                  <button class="btn btn-outline-secondary" type="button"
                    :title="hasCoordinates ? 'Ver ubicación en mapa' : 'Dirección sin coordenadas'"
                    :class="{ 'opacity-50': !hasCoordinates }">
                    <img v-if="hasCoordinates" src="/assets/images/earth.png" alt="Tiene coordenadas" class="img-fluid"
                      style="max-width: 18px;">
                    <img v-else src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                      style="max-width: 18px;">
                  </button>
                  <button class="btn btn-primary" type="button" @click="openModalCreateAddress">
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Modalidad de Entrega</small>
                <div class="btn-group btn-group-sm" role="group">
                  <input type="radio" class="btn-check" name="tipoEntrega" id="retiro" value="retiro"
                    v-model="form.tipo_entrega" autocomplete="off">
                  <label class="btn btn-outline-primary" for="retiro">
                    <i class="fa fa-box me-2"></i>Retiro en Bodega
                  </label>

                  <input v-if="hasDispatch" type="radio" class="btn-check" name="tipoEntrega" id="despacho"
                    value="despacho" v-model="form.tipo_entrega" autocomplete="off">
                  <label v-if="hasDispatch" class="btn btn-outline-primary" for="despacho">
                    <i class="fa fa-truck me-2"></i>Despacho en Ruta
                  </label>
                </div>
              </div>
            </div>
            <div v-show="form.tipo_entrega === 'retiro'"></div>
            <div v-show="form.tipo_entrega === 'despacho'" class="row g-1 mb-2">
              <div class="col-12 col-lg-6">
                <div class="kv space-y-2">
                  <small class="text-muted">Dirección de Entrega</small>
                  <div class="input-group input-group-sm">
                    <select class="form-select form-select-sm" v-model="form.direccion_entrega_id">
                      <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                        {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }}
                      </option>
                    </select>
                    <button class="btn btn-outline-secondary btn-sm" type="button"
                      :title="hasCoordinates2 ? 'Ver ubicación en mapa' : 'Dirección sin coordenadas'"
                      :class="{ 'opacity-50': !hasCoordinates2 }">
                      <img v-if="hasCoordinates2" src="/assets/images/earth.png" alt="Tiene coordenadas"
                        class="img-fluid" style="max-width: 18px;">
                      <img v-else src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                        style="max-width: 18px;">
                    </button>

                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="kv space-y-2">
                  <small class="text-muted">Fecha de Entrega</small>
                  <flat-pickr id="fecha_entrega" class="form-control form-control-sm" v-model="form.fecha_entrega"
                    :config="flatPickrState" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </BaseBlock>
    </BaseBlock>
    <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" title="Cotización">
      <div class="d-flex align-items-center mb-4">
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-primary" @click="openModalSearchItem"><i
              class="fa fa-search me-1"></i> Buscar
            Articulo</button>
          <button type="button" class="btn btn-outline-success"> <i class="fa fa-rotate me-1"></i>Stock</button>
        </div>
      </div>
    </BaseBlock>
    <!-- {{ form }} -->

  </div>


  <!-- seccion de modales -->

  <!-- modal para actualizacion de segmento -->
  <div class="modal" id="modal-segmento" tabindex="-1" role="dialog" aria-labelledby="modal-segmento" aria-hidden="true"
    ref="verModalActualizarSegmento">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <actualizarSegmentoClienteComponent v-if="datosCliente" :cliente="datosCliente" @updated="processSelectClient">
        </actualizarSegmentoClienteComponent>
      </div>
    </div>
  </div>

  <!-- modal para la creacion de una nueva direccion -->
  <div class="modal" id="modal-crear-direccion" tabindex="-1" role="dialog" aria-labelledby="modal-crear-direccion"
    aria-hidden="true" ref="verModalCrearDireccionModal">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <verModalCrearNuevaDireccion v-if="dataClient" :cliente="dataClient" @closeModal="closeModalCreateAddress">
        </verModalCrearNuevaDireccion>
      </div>
    </div>
  </div>

  <!-- modal de busqueda de articulos -->
  <div class="modal" id="modal-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-cliente" aria-hidden="true"
    ref="verSearchItemModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalBuscarArticulos v-if="dataSearchItem" :form="dataSearchItem" @closeModal="closeModalSearchItem"></verModalBuscarArticulos>
      </div>
    </div>
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

.form-control-sm.flatpickr-input {
  height: calc(1.5em + 0.5rem + 2px);
  /* Altura estándar de sm en BS5 */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
}
</style>