<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { useDespachoPedidosPagination } from "../../../composables/bodegas/consultas/useDespachoPedidosPagination";
import { onMounted, watch, computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import FiltrarClienteConsulta from "../modals/FiltrarClienteConsulta.vue";
import { Modal } from "bootstrap";

const store = useStore();
const puntoVentaId = store.state.puntodeventaselect; // Pasar dinámicamente este valor
const { table, fetchItems, refresh, onSort, limpiarFecha } =
  useDespachoPedidosPagination(puntoVentaId);
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
    label: "#Guia",
    key: "GUI_REM_GUIA_REMISION",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "8.600rem",
  },
  {
    label: "#Pedido",
    key: "pedido",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "2rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "#Factura",
    key: "GUI_REM_NUME_DOCU_SUSTENTO",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "8.600rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "#Orden",
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
];

// column base de ejemplooooooo
// const columns = [
//   {
//     label: "#Guia",
//     key: "GUI_REM_GUIA_REMISION",
//     sortable: true,
//     clickable: false,
//     width: "8.460rem",
//     thClass: ["text-center", "text-uppercase"],
//     tdClass: (row) => ["text-center", row.estado === "pendiente" ? "text-warning fw-bold" : null],
//   },
//   { label: "#Pedido", key: "pedido", sortable: true, clickable: false, width: "3rem",
//     thClass: "text-center", tdClass: "text-center" },
//   { label: "#Factura", key: "GUI_REM_NUME_DOCU_SUSTENTO", sortable: true, clickable: false },
//   { label: "#Orden", key: "orden", sortable: true, clickable: true, tdClass: "text-primary" },
//   { label: "Cliente", key: "GUI_REM_RAZON_SOCIAL_DESTINATARIO", sortable: true, clickable: false,
//     tdClass: "text-truncate" },
//   { label: "Dirección", key: "GUI_REM_DIRECCION_DESTINATARIO", sortable: true, clickable: false,
//     tdClass: "text-truncate" },
//   { label: "Fecha/Hora", key: "GUI_REM_FECHA_INICIO", sortable: true, clickable: false,
//     thClass: "text-center", tdClass: "text-center" },
//   { label: "Transportista", key: "GUI_REM_RAZON_SOCIAL_TRANSPORTISTA", sortable: true, clickable: false },
//   { label: "Vehiculo", key: "GUI_REM_PLACA", sortable: true, clickable: false, width: "4rem",
//     tdClass: "text-uppercase text-center" },
// ];

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
  // console.log(row, col, "test si esta llegado sino la falla");

  if (col.key === "orden") {
    imprimirOrdendespacho(row.orden_id);
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
  cliente.value = clienteRuc;
}

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
  <div class="block-content">
    <BaseBlock title="Despachos Pedidos" rounded themed>
      <template #options>
        <div class="space-x-1">
          <div class="block-options-item">
            <div class="row g-2 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm"
                  >Cliente</label
                >
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  title="Refrescar tabla"
                  @click="levantarFiltrocliente()"
                  class="btn btn-info btn-sm mx-1"
                >
                  <i class="fa fa-user"></i> Cliente
                </button>
              </div>
            </div>
          </div>

          <div class="block-options-item">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm"
                  >Desde</label
                >
              </div>
              <div class="col-auto">
                <flat-pickr
                  style="width: 120px"
                  id="fecha_desde"
                  class="form-control form-control-sm"
                  v-model="table.fecha_desde"
                  :config="flatPickrState.fecha_desde"
                />
              </div>
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm"
                  >hasta</label
                >
              </div>
              <div class="col-auto">
                <flat-pickr
                  style="width: 120px"
                  id="fecha_hasta"
                  class="form-control form-control-sm"
                  v-model="table.fecha_hasta"
                  :config="flatPickrState.fecha_hasta"
                />
              </div>
              <div class="col-auto">
                <button class="btn btn-sm btn-primary" @click="limpiarFecha()">
                  <i class="fa fa-eraser"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="block-options-item">
            <button
              class="btn btn-outline-success btn-sm"
              @click="refresh"
              :disabled="table.loading"
              title="Refrescar"
              aria-label="Refrescar"
            >
              <i v-if="!table.loading" class="fa fa-refresh"></i>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </div>
      </template>

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
          <input
            v-model="table.searchTerm"
            placeholder="Buscar..."
            class="form-control"
          />
        </div>
      </div>
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading"
        :perPage="table.perPage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.sortField"
        :sortOrder="table.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchItems"
        @onSearch="table.searchTerm"
        @onClick="handleClick"
      >
        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm mx-2"
            @click="imprimirGuia(row)"
          >
            <i class="fa fa-print"></i> Imprimir
          </button>
        </template>
      </BaseTable>
    </BaseBlock>
  </div>
  <!-- Modal para filtro de cliente -->
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
        <FiltrarClienteConsulta
          @filtrarClienteConsulta="filtrarClienteConsulta"
        ></FiltrarClienteConsulta>
      </div>
    </div>
  </div>
</template>
