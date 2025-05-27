<template>
  <div class="cold-md-0 py-2 text-end">
    <button @click="refreshData" class="btn btn-outline-success" aria-placeholder="Actualizar">
      <i class="fa fa-refresh"></i>
    </button>
  </div>
  <div class="d-flex justify-content-between mb-3">
    <div class="col-md-4 py-2">
      <select v-model="table.perPage" class="form-select w-25">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
    <div class="col-md-4 py-2">
      <input v-model="table.searchTerm" placeholder="Buscar..." class="form-control w-60" />
    </div>
  </div>
  <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.perPage"
    :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
    :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchItems"
    @onSearch="table.searchTerm" @onClick="handleClick">
    <template #actions="{ row }">
      <button type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirGuia(row)">
        <i class="fa fa-print"></i> Imprimir
      </button>
    </template>
  </BaseTable>
</template>

<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, watch } from "vue";
import { useReposicionesEnviadasPagination } from "../../../composables/bodegas/consultas/useReposicionesEnviadasPagiancion";
import { useStore } from "vuex";

const store = useStore();
const puntoVentaId = store.state.puntodeventaselect;

const { table, fetchItems, refresh } = useReposicionesEnviadasPagination(puntoVentaId);

// 🧠 Watch para filtros y orden
watch(
  () => [table.searchTerm, table.perPage, table.sortField, table.sortOrder],
  () => {
    fetchItems(1);
  },
  { deep: true }
);




const refreshData = () => {

  refresh();
};
// Inicialización
onMounted(async () => {
  if (!table.items.length) {
    fetchItems();
  }
});

// Columnas de la tabla
const columns = [
  {
    label: "#Guia",
    key: "GUI_REM_GUIA_REMISION",
    sortable: true,
    clickable: false, render: (value) => value,
  },
  { label: "#Destino", key: "bodega_destino", sortable: true, clickable: false },
  { label: "#Documento", key: "pedido", sortable: true, clickable: false },
  {
    label: "#Cliente",
    key: "GUI_REM_RAZON_SOCIAL_DESTINATARIO",
    sortable: true, clickable: false
  },
  { label: "Dirección", key: "GUI_REM_DIRECCION_DESTINATARIO", sortable: true, clickable: false },
  { label: "Fecha/Hora", key: "GUI_REM_FECHA_INICIO", sortable: true, clickable: false },
  {
    label: "Transportista",
    key: "GUI_REM_RAZON_SOCIAL_TRANSPORTISTA",
    sortable: true, clickable: false
  },
  { label: "Vehiculo", key: "GUI_REM_PLACA", sortable: true, clickable: false },
  // { label: "Acciones", key: "actions" },
];

// Función para el sort
const onSort = ({ field, order }) => {
  table.sortField = field;
  table.sortOrder = order;
  //  fetchItems(1);
};

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
  // console.log(row, col, "test si esta llegado sino la falla");

  if (col.key === "GUI_REM_GUIA_REMISION") {
    functionTest(row.GUI_REM_GUIA_REMISION);
  }
};

const functionTest = (guideId) => {
  console.log(`🖨️ Imprimiendo Guia: ${guideId}`);
  // Aquí puedes llamar al método de impresión real
};
</script>
