<template>
  <div>
    <div class="col-md-0 py-2 text-end">
      <button @click="refreshData" class="btn btn-outline-success" aria-placeholder="Actualizar">
        <i class="fa fa-refresh"></i>
      </button>
    </div>
    <div class="d-flex justify-content-between mb-3">
      <div class="col-md-4 py-2">
        <select v-model="perPage" class="form-select w-25">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div class="col-md-4 py-2">
        <input v-model="searchTerm" placeholder="Buscar..." class="form-control w-60" />
      </div>

    </div>


    <div class="row">
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="table table-sm table-hover table-vcenter mb-0">
            <thead>
              <tr >
                <th @click="sortBy('GUI_REM_GUIA_REMISION')" class="text-left text-nowrap" style="font-size: 12px">#Guia
                  <i :class="getSortIcon('GUI_REM_GUIA_REMISION')" class="ms-1"></i>
                </th>
                <th @click="sortBy('pedido')" class="text-left text-nowrap" style="font-size: 12px">#Pedido
                  <i :class="getSortIcon('pedido')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_NUME_DOCU_SUSTENTO')" class="text-left text-nowrap" style="font-size: 12px">#Factura
                  <i :class="getSortIcon('GUI_REM_NUME_DOCU_SUSTENTO')" class="ms-1"></i>
                </th>
                <th @click="sortBy('orden')" class="text-left text-nowrap" style="font-size: 12px">#Orden
                  <i :class="getSortIcon('orden')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_RAZON_SOCIAL_DESTINATARIO')" class="text-left text-nowrap" style="font-size: 12px">Cliente
                  <i :class="getSortIcon('GUI_REM_RAZON_SOCIAL_DESTINATARIO')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_DIRECCION_DESTINATARIO')" class="text-left text-nowrap" style="font-size: 12px">Dirección
                  <i :class="getSortIcon('GUI_REM_DIRECCION_DESTINATARIO')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_FECHA_INICIO')" class="text-left text-nowrap" style="font-size: 12px">Fecha/Hora
                  <i :class="getSortIcon('GUI_REM_FECHA_INICIO')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_RAZON_SOCIAL_TRANSPORTISTA')" class="text-left text-nowrap" style="font-size: 12px">Transportista
                  <i :class="getSortIcon('GUI_REM_RAZON_SOCIAL_TRANSPORTISTA')" class="ms-1"></i>
                </th>
                <th @click="sortBy('GUI_REM_PLACA')" class="text-left text-nowrap" style="font-size: 12px">Vehiculo
                  <i :class="getSortIcon('GUI_REM_PLACA')" class="ms-1"></i>
                </th>
                <th  class="text-center text-nowrap" style="font-size: 12px">Acciones</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="10" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <!-- Transition Group -->
            <transition-group name="fade" tag="tbody" class="fs-sm" v-else>
              <tr v-for="(row, index) in items" :key="index">

                <td class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_GUIA_REMISION || 'No Data' }}</td>
                <td class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.pedido }}</td>
                <td class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row?.GUI_REM_NUME_DOCU_SUSTENTO }}</td>
                <td class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">
                  <a href="javascript:void(0)" @click="imprimirOrdendespacho(row.orden_id)">
                    {{ row.orden }}
                  </a>
                </td>
                <td  class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_RAZON_SOCIAL_DESTINATARIO }}</td>
                <td  class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_DIRECCION_DESTINATARIO }}</td>
                <td  class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_FECHA_INICIO }}</td>
                <td  class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                <td  class="text-left" style="font-size: 12px;  overflow: hidden; text-overflow: ellipsis;">{{ row.GUI_REM_PLACA }}</td>
                <td class="text-center text-nowrap" style="width: 150px;">
                  <button type="button" class="btn btn-outline-primary btn-sm"  @click="imprimirGuia(row)">
                    <i class="fa fa-print"></i> Imprimir
                  </button>
                </td>
              </tr>
            </transition-group>
          </table>
        </div>
      </div>


      <!-- new -->
      <div>
        <!-- Paginación mejorada -->
        <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
          <div>
            <p class="mb-0 text-white  " style="font-size: 12px;">
              Mostrando {{ (currentPage - 1) * perPage + 1 }} a
              {{ Math.min(currentPage * perPage, totalItems) }} de
              {{ totalItems }} registros
            </p>
          </div>
          <nav>
            <ul class="pagination  pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="javascript:void(0)" @click="fetchItems(1)">
                  <i class="fa fa-angle-double-left"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="javascript:void(0)" @click="fetchItems(currentPage - 1)">
                  <i class="fa fa-angle-left"></i></a>
              </li>

              <!-- Páginas numeradas -->
              <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <a class="page-link" href="javascript:void(0)" @click="fetchItems(page)">{{ page }}</a>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPage }">
                <a class="page-link" href="javascript:void(0)" @click="fetchItems(currentPage + 1)">
                  <i class="fa fa-angle-right"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPage }">
                <a class="page-link" href="javascript:void(0)" @click="fetchItems(totalPage)">
                  <i class="fa fa-angle-double-right"></i>
                </a>
              </li>
            </ul>
          </nav>

        </div>
      </div>
      <!-- end new -->
    </div>
  </div>
</template>

<script setup>
import { usePagination } from '../../../composables/bodegas/consultas/usePagination';
import { onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex'

const store = useStore();
const puntoVentaId = store.state.puntodeventaselect; // Pasar dinámicamente este valor

const {
  items,
  loading,
  currentPage,
  totalPage,
  totalItems,
  fetchItems,
  searchTerm,
  perPage,
  initialize,
  sortField,
  sortOrder
} = usePagination();

onMounted(() => {
  initialize('/despachos/guiasdespachadas/', puntoVentaId); // Llamada inicial para cargar datos

});

// Ordenamiento
const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
  fetchItems(1);
};

// funcion para determinar el icono de orden
const getSortIcon = (field) => {
  if (sortField.value == field) {
    return sortOrder.value === "asc" ? "fa fa-caret-up" : "fa fa-caret-down";
  }
  return "";
};


// 🔄 Función para refrescar datos
const refreshData = () => {
  console.log("🔄 Refrescando datos...");
  fetchItems(currentPage.value);
};

// Calcular las páginas visibles (máximo 5)
const pages = computed(() => {
  const range = [];
  const maxVisiblePages = 5;

  // Ajuste del inicio y el fin
  let start = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPage.value, start + maxVisiblePages - 1);

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});


// 👀 Verificar reactividad en tiempo real
watch(items, (newVal) => {
  console.log("📌 Items recibidos en el template:", newVal);
});

// Funciones de impresión


async function imprimirGuia(guia) {
  store
    .dispatch("imprimir", "/bodegas/guiasderemision/imprimirguia/" + guia.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "guia-" + guia.GUI_REM_GUIA_REMISION + ".pdf");
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirOrdendespacho(id) {
  store.dispatch('imprimir', '/despachos/imprimirordendespacho/' + id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'orden-despacho-' + id + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.overlay-loading {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

/* icono de ordenamiento */
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: #0d6efd;
}

.bi {
  font-size: 12px;
}
</style>
