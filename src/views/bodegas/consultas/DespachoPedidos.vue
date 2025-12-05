<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { useDespachoPedidosPagination } from "@/composables/bodegas/consultas/useDespachoPedidosPagination";
import { onMounted, watch, computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import FiltrarClienteConsulta from "@/views/bodegas/modals/FiltrarClienteConsulta.vue";
import { Modal } from "bootstrap";
import { useDetalleDespachoPedidos } from "@/composables/bodegas/consultas/detallesconsulta/useDetalleDespachoPedidos";
import { swalError } from "@/functions/swal-alert.js";
import { formatPrice } from "@/functions";
const store = useStore();
const puntoVentaId = store.state.puntodeventaselect; // Pasar dinámicamente este valor
const { table, fetchItems, refresh, onSort, limpiarFecha } =
  useDespachoPedidosPagination(puntoVentaId);
const { fetchDetailGuides } = useDetalleDespachoPedidos();
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

// Columnas de la tabla  
const columns = [
  {
    label: "Guia",
    key: "GUI_REM_GUIA_REMISION",
    sortable: true,
    clickable: true,
    render: (value) => value,
    width: "8.600rem",
  },
  {
    label: "Pedido",
    key: "pedido",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "2rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Factura",
    key: "GUI_REM_NUME_DOCU_SUSTENTO",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "8.600rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
    // tdClass: (row) => ["text-center", row.pedido === "PED00289838" ? "text-warning fw-bold" : null],
  },

  {
    label: "Despacho",
    key: "pedido_despacho",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "6rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Orden",
    key: "orden",
    sortable: true,
    clickable: true,
  },
  {
    label: "Cliente",
    key: "GUI_REM_RAZON_SOCIAL_DESTINATARIO",
    sortable: true,
    clickable: false,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Dirección",
    key: "GUI_REM_DIRECCION_DESTINATARIO",
    sortable: true,
    clickable: false,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Fecha/Hora",
    key: "GUI_REM_FECHA_INICIO",
    sortable: true,
    clickable: false,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Transportista",
    key: "GUI_REM_RAZON_SOCIAL_TRANSPORTISTA",
    sortable: true,
    clickable: false,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Vehiculo",
    key: "GUI_REM_PLACA",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "4rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "generado por",
    key: "USERID",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "1.600rem",
    thClass: "d-none d-md-table-cell text-center",
    tdClass: "d-none d-md-table-cell text-center",
    // tdClass: (row) => ["text-center", row.pedido === "PED00289838" ? "text-warning fw-bold" : null],
  },
];


// Funciones de impresión
async function imprimirGuia(guia) {
  store
    .dispatch("imprimir", "/bodegas/guiasderemision/imprimirguia/" + guia.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "guia-" + guia.GUI_REM_GUIA_REMISION + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirOrdendespacho(id) {
  store
    .dispatch("imprimir", "/despachos/imprimirordendespacho/" + id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "orden-despacho-" + id + ".pdf");
        document.body.appendChild(link);
        link.click();
      }
    });
}

//funcion de prueba para ver que si funciona la ejecucion de funciones
const handleClick = ({ row, col }) => {

  if (col.key === "orden") {
    imprimirOrdendespacho(row.orden_id);
  }
  if (col.key === "GUI_REM_GUIA_REMISION") {
    resetConsult();
    buscarDetalleGuia(row);
  }
};



// funcion para modal de filtro de cliente
let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;
function levantarFiltrocliente() {
  filtrarClienteModalObj.show();
}
function filtrarClienteConsulta(clienteRuc) {
  filtrarClienteModalObj.hide();
  table.cliente = clienteRuc;
}



// function para la visualizacion del detalle 

const loadindDetalleGuia = ref(null);
const showTable = ref(true);
const showDetalleGuia = ref(false);
const guiaSeleccionada = ref(null)   // cabecera
const detalleItems = ref([]);

async function buscarDetalleGuia(guia) {
  try {
    guiaSeleccionada.value = guia
    showTable.value = true
    showDetalleGuia.value = false
    loadindDetalleGuia.value.statusLoading();
    const result = await fetchDetailGuides(guia.id);


    if (result) {
      showTable.value = false
      showDetalleGuia.value = true
      detalleItems.value = result
      loadindDetalleGuia.value.statusNormal();
    }
  } catch (error) {

    showTable.value = true
    showDetalleGuia.value = false
    swalError(error);
  }

}


const optionShowTable = () => {
  showTable.value = !showTable.value
}

const optionShowDetalleGuia = () => {

  showDetalleGuia.value = !showDetalleGuia.value
  if (showDetalleGuia.value === true) {
    loadindDetalleGuia.value.statusLoading();
    setTimeout(() => {
      loadindDetalleGuia.value.statusNormal();
    }, 2000);
  }

};

function resetConsult() {
  guiaSeleccionada.value = null;
  detalleItems.value = [];
  showTable.value = true;
  showDetalleGuia.value = false;
  loadindDetalleGuia.value.statusNormal();
};

onMounted(() => {
  // initialize('/despachos/guiasdespachadas/', puntoVentaId); // Llamada inicial para cargar datos
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
  if (!table.items.length && !table.loading) {
    fetchItems(1);
  }
});

//pruebas


</script>

<template>
  <div class="block-content block-content-full">
    <BaseBlock title="Despachos Pedidos" rounded>
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading" title="Refrescar"
            aria-label="Refrescar">
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
        <div class="block-options-item">
          <button type="button" class="btn-block-option" @click="optionShowTable">
            <i :class="['fa', showTable ? 'fa-angle-up' : 'fa-angle-down', 'opacity-100']"></i>
          </button>
        </div>
      </template>

      <div v-show="showTable">
        <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
          <!-- fecha -->
          <div class="col-12 col-lg-4">
            <small class="text-muted d-block mb-1">Fecha</small>
            <div class="d-flex align-items-center">
              <flat-pickr id="fecha_desde" class="form-control form-control-sm" v-model="table.fecha_desde"
                :config="flatPickrState.fecha_desde" />
              <span class="text-muted">—</span>
              <flat-pickr id="fecha_hasta" class="form-control form-control-sm" v-model="table.fecha_hasta"
                :config="flatPickrState.fecha_hasta" />
            </div>
          </div>
          <!-- cliente -->
          <div class="col-12 col-sm-6 col-lg-2">
            <small class="text-muted d-block mb-1">Cliente</small>
            <button type="button" title="Seleccionar cliente" @click="levantarFiltrocliente()"
              class="btn btn-outline-info btn-sm w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2">
              <i class="fa fa-user"></i>
              <span>Cliente</span>
            </button>
          </div>
        </div>
        <div class="row justify-content-between align-items-center mb-3">
          <div class="col-md-1">
            <select v-model="table.perPage" class="form-select">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="col-md-4">
            <input v-model="table.searchTerm" placeholder="Buscar..." class="form-control" />
          </div>
        </div>
        <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.perPage"
          :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
          :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchItems"
          @onSearch="table.searchTerm" @onClick="handleClick">
          <template #actions="{ row }">
            <button type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirGuia(row)">
              <i class="fa fa-print"></i>
            </button>
          </template>
          <!-- Slot de vacío -->
          <template #empty>
            <div class="text-center py-5">
              <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
              <p class="text-muted mb-0">No se encontraron registros para mostrar</p>
            </div>
          </template>
        </BaseTable>
      </div>
    </BaseBlock>

    <!-- seccion del informacion  de la guia -->
    <BaseBlock rounded title="Información de Guia" ref="loadindDetalleGuia"  class="mb-3">
      <template #options>
        <div class="block-options-item">
          <button type="button" class="btn-block-option" @click="optionShowDetalleGuia">
            <i :class="['fa', showDetalleGuia ? 'fa-angle-up' : 'fa-angle-down', 'opacity-100']"></i>
          </button>
        </div>
      </template>

      <div class="content" v-if="guiaSeleccionada && showDetalleGuia">
        <!-- cabecera del detalle de la Guia -->
        <div class="table-responsive">
          <table class="table table-hover table-sm table-vcenter">
            <tbody>
              <tr>
                <th class="text-uppercase fs-sm text-muted">Guia</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_GUIA_REMISION }}</td>
                <th class="text-uppercase fs-sm text-muted">Pedido</th>
                <td class="fs-sm">{{ guiaSeleccionada.pedido }}</td>
              </tr>
              <tr>
                <th class="text-uppercase fs-sm text-muted">Orden</th>
                <td class="fs-sm">{{ guiaSeleccionada.orden }}</td>
                <th class="text-uppercase fs-sm text-muted">factura</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_NUME_DOCU_SUSTENTO || 'N/A' }}</td>
              </tr>
              <tr>
                <th class="text-uppercase fs-sm text-muted">cliente</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_RAZON_SOCIAL_DESTINATARIO }}</td>
                <th class="text-uppercase fs-sm text-muted">Ruc</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_IDENTIFICACION_DESTINATARIO || 'N/A' }}</td>
                <th class="text-uppercase fs-sm text-muted">Dirección</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_DIRECCION_DESTINATARIO || 'N/A' }}</td>
              </tr>
              <tr>
                <th class="text-uppercase fs-sm text-muted">Transporte</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                <th class="text-uppercase fs-sm text-muted">Placa</th>
                <td class="fs-sm">{{ guiaSeleccionada.GUI_REM_PLACA || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row">
          <div class="col-md-6" v-if="detalleItems.transferencias.length > 0">
            <table>
              <tbody>
                <th class="fs-sm text-uppercase text-muted">PEDIDO(S) : <span
                    v-for="(item) in detalleItems.transferencias" :key="item">{{ item }},</span></th>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p class="fs-sm">Pedido: {{ guiaSeleccionada.pedido }}</p>
          </div>
        </div>
        <!-- detalle de la guia -->
        <div style="text-align: right;">
          <p class="fs-sm text-muted text-uppercase">Peso total: {{ formatPrice(detalleItems.peso_total, 2) }} Kg</p>
        </div>
        <div class="card-body p-4">

          <div class="table-responsive">
            <table class="table table-striped table-sm table-vcenter">
              <thead>
                <tr>
                  <th class="fs-sm text-uppercase text-muted text-center">codigo</th>
                  <th class="fs-sm text-uppercase text-muted text-center">cod. let. itm</th>
                  <th class="fs-sm text-uppercase text-muted text-end">Cantidad</th>
                  <th class="fs-sm text-uppercase text-muted text-end">unidad</th>
                  <th class="fs-sm text-uppercase text-muted text-center">descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(articulo, index) in detalleItems.detalle" :key="index">
                  <td class="fs-sm text-center">
                    {{ articulo.GUI_REM_CODI_INTERNO }}
                  </td>
                  <td class="fs-sm text-center">
                    {{ articulo.GUI_REM_CODI_ADICIONAL }}
                  </td>
                  <td class="fs-sm text-end">
                    {{ articulo.GUI_REM_CANTIDAD }}
                  </td>
                  <td class="fs-sm text-end">
                    {{ articulo.GUI_REM_UNIDAD_MEDIDA }}
                  </td>
                  <td class="fs-sm text-center">
                    {{ articulo.GUI_REM_DESCRIPCION }}
                    <span v-if="articulo.CHECK_ALTERNATIVO == 1" class="text-danger">(Alternativa)</span>
                    <span v-else></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="text-align: right;">
          <button type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirGuia(guiaSeleccionada)">
            <i class="fa fa-print"></i>
          </button>
        </div>
      </div>
    </BaseBlock>

  </div>
  <!-- Modal para filtro de cliente -->
  <div class="modal" id="modal-filtrar-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-filtrar-cliente"
    aria-hidden="true" ref="filtrarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FiltrarClienteConsulta @filtrarClienteConsulta="filtrarClienteConsulta"></FiltrarClienteConsulta>
      </div>
    </div>
  </div>
</template>
