<script setup>
import { Modal } from "bootstrap";
import { onMounted, ref, computed, watch } from "vue";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useCheckClientSegment } from "@/composables/venta/cotizaciones/useCheckClientSegment";
import actualizarSegmentoClienteComponent from "@/views/ventas/modals/actualizarSegmentoClienteModal.vue";

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
  fetchCustomerBranches

} = useClientSearch();
const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();

// variables para mostrar las busquedas
const showResultClients = ref(false);
const showInfoClient = ref(false);
let debounceId;

async function searchFilterClientes() {

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
  }
  errorSearchClient.value = false;
}

const datosCliente = ref(null);
const verModalActualizarSegmento = ref(null)
let verModalActualizarSegmentoObj = null
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
    form.value.direccion_facturacion_id = sucursales.value[0].id
  }
}


// funciones de validaciones check etc
const getClientStatus = (isSuspended) => {
  const status = Number(isSuspended);
  if (status === 0) {
    return {
      text: 'NO',
      class: 'bg-success-light text-success'
    }
  } else {
    return {
      text: 'SI',
      class: 'bg-danger-light text-danger'
    }
  }
}

//validador para verificar si la sucursal tiene coordenadas
const hasCoordinates = computed(() => {
  const direccionSeleccionada = sucursales.value.find(sucursal => sucursal.id === form.value.direccion_facturacion_id);
  return direccionSeleccionada && direccionSeleccionada.coordenadas !== null && direccionSeleccionada.coordenadas !== '';
});


function InitialModal() {
  if (verModalActualizarSegmento.value) {
    verModalActualizarSegmentoObj = Modal.getOrCreateInstance(verModalActualizarSegmento.value, { backdrop: true })
  }
}

const form = ref({
  tipo_entrega: 'retiro',
  bodega: null,
  fecha_entrega: '',
  cliente: null,
  sucursal: null,
  segmento: null,
  cliente: null,
  direccion_facturacion_id: null,
  direccion_entrega_id: null,
});


//watch para que al poner 4 letras se haga la busqueda automaticamente
watch(
  () => dataSearch.search,
  (newValue) => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      if (newValue.length > 4) {
        searchFilterClientes();
      }
    }, 300);
  }
)


onMounted(async () => {
  InitialModal();
});
</script>
<template>
  <div class="content">
    <BaseBlock title="Crear Cotización" content-full rounded>
      <div class="row row-cols-lg-auto g-3 align-items-center">
        <div class="col-12">
          <label class="visually-hidden" for="buscar-cliente">Buscar cliente...</label>
          <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''" id="buscar-cliente"
            name="buscar-cliente" placeholder="Buscar cliente..." @keyup.enter="searchFilterClientes"
            v-model="dataSearch.search" />
        </div>

        <div class="col-12">
          <button type="button" @click="searchFilterClientes" class="btn btn-primary" :disabled="loadingSearch">
            Buscar
          </button>

          <router-link :to="{ name: 'ventas-crearcliente' }">
            <button type="button" class="mx-4 btn btn-success float-end" :disabled="loadingSearch">
              Crear cliente
            </button>
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
      <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" class="mb-2">
        <div class="content-fluid">
          <div class="row g-3 mb-2">
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
                <select class="form-select " v-model="form.bodega">
                  <option value="CALIFORNIA">AGENCIA CALIFORNIA</option>
                  <option value="CALIFORNIA">AGENCIA INMACONSA</option>
                </select>
              </div>
            </div>

            <div class="col-12 col-lg-8">
              <div class="kv space-y-2">
                <small class="text-muted">Dirección de Facturación</small>
                <div class="input-group">
                  <select class="form-select" v-model="form.direccion_facturacion_id">
                    <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                      {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }}
                    </option>
                  </select>
                  <button class="btn btn-outline-secondary" type="button"
                    :title="hasCoordinates ? 'Ver ubicación en mapa' : 'Dirección sin coordenadas'"
                    :class="{ 'opacity-50': !hasCoordinates }">
                    <img v-if="hasCoordinates" src="/assets/images/earth.png" alt="Tiene coordenadas" class="img-fluid"
                      style="max-width: 25px;">
                    <img v-else src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                      style="max-width: 25px;">
                  </button>
                  <button class="btn btn-primary" type="button" @click="abrirModal">
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Modalidad de Entrega</small>
                <div class="btn-group " role="group">
                  <input type="radio" class="btn-check" name="tipoEntrega" id="retiro" value="retiro"
                    v-model="form.tipo_entrega" autocomplete="off">
                  <label class="btn btn-outline-primary" for="retiro">
                    <i class="fa fa-box me-2"></i>Retiro en Bodega
                  </label>

                  <input type="radio" class="btn-check" name="tipoEntrega" id="despacho" value="despacho"
                    v-model="form.tipo_entrega" autocomplete="off">
                  <label class="btn btn-outline-primary" for="despacho">
                    <i class="fa fa-truck me-2"></i>Despacho en Ruta
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </BaseBlock>
      <!-- <BaseBlock title="Logística y Despacho" content-full rounded>
        <div class="row g-3 align-items-end">
          <div class="col-12 mb-2">
            <label class="form-label d-block text-muted fs-sm mb-2">Modalidad de entrega</label>
            <div class="btn-group w-100 w-md-50" role="group">
              <input type="radio" class="btn-check" name="tipoEntrega" id="retiro" value="retiro"
                v-model="form.tipo_entrega" autocomplete="off">
              <label class="btn btn-outline-secondary" for="retiro">
                <i class="fa fa-box me-2"></i>Retiro en Bodega
              </label>

              <input type="radio" class="btn-check" name="tipoEntrega" id="despacho" value="despacho"
                v-model="form.tipo_entrega" autocomplete="off">
              <label class="btn btn-outline-secondary" for="despacho">
                <i class="fa fa-truck me-2"></i>Despacho en Ruta
              </label>
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted fs-sm">Bodega de Origen</label>
            <select class="form-select bg-dark text-light border-secondary" v-model="form.bodega">
              <option value="CALIFORNIA">AGENCIA CALIFORNIA</option>
            </select>
          </div>

          <div class="col-md-3" v-if="form.tipo_entrega === 'despacho'">
            <label class="form-label text-muted fs-sm">Fecha Entrega</label>
            <input type="date" class="form-control bg-dark text-light border-secondary" v-model="form.fecha_entrega">
          </div>

          <div :class="form.tipo_entrega === 'despacho' ? 'col-md-5' : 'col-md-8'">
            <label class="form-label text-muted fs-sm">
              {{ form.tipo_entrega === 'despacho' ? 'Dirección Destino' : 'Dirección Facturación' }}
            </label>

            <div class="input-group">
              <select class="form-select bg-dark text-light border-secondary" v-model="form.direccion_id">
                <option value="1">PRINCIPAL - Km. 5 1/2 Via Daule</option>
              </select>

              <button class="btn btn-secondary" type="button" title="Ver mapa">
                <i class="fa fa-map-marker-alt text-danger"></i>
              </button>
              <button class="btn btn-secondary" type="button" @click="abrirModal">
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>

        </div>
      </BaseBlock> -->

    </BaseBlock>
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
  font-weight: 12px;
  /* Opcional: quita la negrita si el texto es muy largo */
}


.kv .fw-semibold {
  line-height: 1.2;
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
</style>