
<script setup>
import { nextTick, onMounted, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import ChoferTransportistaModal from "@/views/sistemas/mantenimientos/chofer-transportista/modals/verModalChoferTransportista.vue";

//composables
import { useCarrierDriverTable } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverTable";
import { useDispatchTypeActions } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeActions";
import { useCarrierDriverActions } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverActions";

import {
  swalError,
  swalSuccess,
  swalWarning,
  toast,
} from "@/functions/swal-alert";

// Modal de creación y edición. El formulario se incorporará en este espacio.
const carrierDriverModal = ref(null);
const selectedCarrierDriver = ref(null);
const typeOpenModal = ref("create");
async function openCreateModal() {
  selectedCarrierDriver.value = null;
  typeOpenModal.value = "create";
  await nextTick();
  await carrierDriverModal.value?.show();
}

async function openEditModal(row) {
  selectedCarrierDriver.value = row;
  typeOpenModal.value = "edit";
  await nextTick();
  await carrierDriverModal.value?.show();
}

function clearModalData() {
  selectedCarrierDriver.value = null;
  typeOpenModal.value = "create";
}

async function handleSaved() {
  await fetchList(table.currentPage);
}

async function openAlertChangeStatus(row) {
  const isActive = Number(row.estado) === 1;
  const confirmText = isActive ? "Sí, desactivar" : "Sí, activar";
  const confirmClass = isActive ? "btn btn-danger m-1" : "btn btn-success m-1";
  const dispatchType = row.nombre ? `«${row.nombre}»` : "este chofer";
  const message = isActive
    ? `El chofer ${dispatchType} dejará de estar disponible para seleccionar en las cotizaciones.`
    : `El chofer ${dispatchType} volverá a estar disponible para seleccionar en las cotizaciones.`;
  toast
    .fire({
      title: isActive ? "¿Desactivar el Chofer?" : "¿Activar el Chofer?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: confirmClass,
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.isConfirmed || result.value) {
        changeStatusCarrierDriver(row);
      }
    });
}

async function changeStatusCarrierDriver(row) {
  const resp = await updatedStatusCarrierDriver(row.id);
  if (!resp?.ok) {
    const msg =
      resp?.message ||
      "No se pudo obtener el detalle del chofer transportista.";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return false;
  }
  refresh();
  swalSuccess(resp?.message);
  return;
}

const {
  table,
  listPerpage,
  columns,
  fetchList,
  onSort,
  refresh,
  statusBooleanClass,
} = useCarrierDriverTable();

const { loadingPointSales, listPointSales, fetchListPointSales } =
  useDispatchTypeActions();

const { updatedStatusCarrierDriver } = useCarrierDriverActions({});

onMounted(async () => {
  await fetchList(1);
  await fetchListPointSales();
});
</script>

<template>
  <BasePageHeading title="Gestión de Choferes Transportistas">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Mantenimientos</li>
          <li class="breadcrumb-item" aria-current="page">
            Chofer Transportista
          </li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <!-- contenido -->
  <div class="content">
    <BaseBlock title="Lista de Choferes Transportistas" class="mb-2" rounded>
      <!-- boton de refrescar -->
      <template #options>
        <div class="block-options-item d-flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="openCreateModal"
          >
            <i class="fa fa-plus me-1"></i>
            Nuevo chofer
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="refresh"
            :disabled="table.loading"
            title="Refrescar"
            aria-label="Refrescar"
          >
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>
      <!-- boton de refrescar -->
      <!-- paginacion y busqueda -->
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select
            v-model="table.filters.perpage"
            class="form-select form-select-sm"
          >
            <option
              v-for="item in listPerpage"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <input
            v-model="table.filters.search"
            placeholder="Buscar..."
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <!-- paginacion y busqueda -->

      <!-- table -->
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading"
        :perPage="table.filters.perpage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.filters.sortField"
        :sortOrder="table.filters.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchList"
        @onSearch="table.searchTerm"
      >
        <template #cell-id="{ row }">
          <span
            class="badge bg-body-secondary text-muted border"
            style="font-size: 12px"
          >
            #{{ row.id }}
          </span>
        </template>
        <template #cell-ruc_proveedor="{ row }">
          <div class="d-flex flex-column lh-sm">
            <span class="fw-semibold text-body">
              {{ row.razon_social_proveedor || "Sin razón social" }}
            </span>
            <small class="text-muted mt-1">
              RUC: {{ row.ruc_proveedor || "N/A" }}
            </small>
          </div>
        </template>
        <template #cell-estado="{ row, value }">
          <span
            :class="statusBooleanClass(value)"
            style="font-size: 12px"
            @click="openAlertChangeStatus(row)"
          >
            {{ value ? "Activo" : "Inactivo" }}
          </span>
        </template>

        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-sm btn-alt-secondary"
            title="Editar chofer transportista"
            aria-label="Editar chofer transportista"
            @click="openEditModal(row)"
          >
            <i class="fa fa-pencil-alt"></i>
          </button>
        </template>
        <!-- Slot de vacío -->
        <template #empty>
          <div class="text-center py-5">
            <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">
              No se encontraron registros para mostrar
            </p>
          </div>
        </template>
      </BaseTable>
      <!-- end table -->
    </BaseBlock>
  </div>

  <ChoferTransportistaModal
    ref="carrierDriverModal"
    :carrier-driver="selectedCarrierDriver"
    :type-modal="typeOpenModal"
    :loading-point-sales="loadingPointSales"
    :point-sales="listPointSales"
    @hidden="clearModalData"
    @saved="handleSaved"
  />
</template>

<style lang="css" scoped>
</style>
