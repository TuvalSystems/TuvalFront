<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref } from "vue";
import { useReposicionesRecibidasPagination } from "../../../composables/bodegas/consultas/useReposicionesRecibidasPagination";
import { useStore } from "vuex";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import FiltrarClienteConsulta from "../modals/FiltrarClienteConsulta.vue";
import { Modal } from "bootstrap";
import { usePtoVtaStore } from "../../../stores/bodegas/utils/useListPuntoVentaStore";
const store = useStore();
const ptoVta = usePtoVtaStore();
const puntoVentaId = store.state.puntodeventaselect;
const { table, fetchItems, refresh, onSort, limpiarFecha } =
  useReposicionesRecibidasPagination(puntoVentaId);
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
    width: "8.75rem",
  },
  {
    label: "#Origen",
    key: "bodega_origen",
    sortable: true,
    clickable: false,
    render: (value) => value,
    width: "3.125rem",
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "#Documento",
    key: "pedido",
    sortable: true,
    clickable: false,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "#Cliente",
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
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
];

// Función para acciones
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

//funcion de prueba para ver que si funciona la ejecucion de funciones
const handleClick = ({ row, col }) => {
  if (col.key === "GUI_REM_GUIA_REMISION") {
    functionTest(row.GUI_REM_GUIA_REMISION);
  }
};

const functionTest = (guideId) => {
  console.log(`🖨️ Imprimiendo Guia: ${guideId}`);
  // Aquí puedes llamar al método de impresión real
};

// funcion para modal de filtro de cliente
let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;
function levantarFiltrocliente() {
  filtrarClienteModalObj.show();
}
function filtrarClienteConsulta(cliente) {
  filtrarClienteModalObj.hide();
  table.cliente = cliente;
}

// Inicialización
onMounted(async () => {
  ptoVta.fetchAll();
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
  if (!table.items.length && !table.loading) {
    fetchItems(1);
  }
});
</script>


<template>
  <div class="block-content">
    <BaseBlock title="Reposiciones Recibidas" rounded themed>
      <template #options>
        <div class="space-x-1">
          <div class="block-options-item">
            <div class="row g-2 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm"
                  >Bodega</label
                >
              </div>
              <div class="col-auto">
                <select
                  v-if="!ptoVta.loading"
                  v-model="table.ptovta"
                  class="form-select fs-sm mx-0"
                >
                  <option
                    v-for="p in ptoVta.list"
                    :key="p.PTO_VTA_BOD_PUNTO_VENTA"
                    :value="p.PTO_VTA_BOD_PUNTO_VENTA"
                  >
                    {{ p.PTO_VTA_BOD_BODEGA }}
                  </option>
                </select>
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
