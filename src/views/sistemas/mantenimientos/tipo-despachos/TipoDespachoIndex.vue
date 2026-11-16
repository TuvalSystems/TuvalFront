
<script setup>
import { nextTick, onMounted, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";

// composables
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useDispatchTypeTable } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeTable";
import { useDispatchTypeActions } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeActions";

import verModalGestionTipoDespachos from "@/views/sistemas/mantenimientos/tipo-despachos/modals/verModalGestionTipoDespachos.vue";
import {
  swalError,
  swalSuccess,
  swalWarning,
  toast,
} from "@/functions/swal-alert";

const {
  table,
  columns,
  listPerpage,
  fetchList,
  refresh,
  onSort,
  booleanBadgeClass,
} = useDispatchTypeTable();
const {
  updateStatusDispatchType,
  loadingDetail,
  detail,
  getDetailDispatchType,
  loadingPointSales,
  listPointSales,
  fetchListPointSales,
} = useDispatchTypeActions();
const modalRef = ref(null);
const modalFormRef = ref(null);
const modal = useBootstrapModal(modalRef, {
  backdrop: "static",
  keyboard: false,
});
const typeOption = ref("crear");
const loadingDetailId = ref(null);

async function loadPointSales() {
  if (listPointSales.value.length) return true;
  const response = await fetchListPointSales();
  if (response?.ok) return true;
  const message =
    response?.message || "No se pudieron cargar los puntos de venta.";
  (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
  return false;
}

async function openCreateModal() {
  if (loadingDetail.value || loadingPointSales.value) return;
  if (!(await loadPointSales())) return;
  typeOption.value = "crear";
  detail.value = null;
  await nextTick();
  modalFormRef.value?.resetForm();
  modal.show();
}

async function openUpdateModal(row) {
  if (loadingDetail.value || loadingPointSales.value || row?.id == null) return;
  loadingDetailId.value = row.id;
  try {
    const response = await getDetailDispatchType(row.id);
    if (!response?.ok) {
      const message =
        response?.message ||
        "No se pudo obtener el detalle del tipo de despacho.";
      (response?.status ?? 0) >= 500
        ? swalError(message)
        : swalWarning(message);
      return;
    }
    if (!(await loadPointSales())) return;
    if (!detail.value) {
      swalWarning("No se encontró el detalle del tipo de despacho.");
      return;
    }
    typeOption.value = "actualizar";
    await nextTick();
    modal.show();
  } finally {
    loadingDetailId.value = null;
  }
}

function handleSaved() {
  modal.hide();
  fetchList(1);
}

async function openAlertChangeStatus(row) {
  const isActive = Number(row.estado) === 1;
  const confirmText = isActive ? "Sí, desactivar" : "Sí, activar";
  const confirmClass = isActive ? "btn btn-danger m-1" : "btn btn-success m-1";
  const dispatchType = row.descripcion
    ? `«${row.descripcion}»`
    : "este tipo de despacho";
  const message = isActive
    ? `El tipo de despacho ${dispatchType} dejará de estar disponible para seleccionar en las cotizaciones.`
    : `El tipo de despacho ${dispatchType} volverá a estar disponible para seleccionar en las cotizaciones.`;
  toast
    .fire({
      title: isActive
        ? "¿Desactivar tipo de despacho?"
        : "¿Activar tipo de despacho?",
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
        changeStatusDispatchType(row);
      }
    });
}

async function changeStatusDispatchType(row) {
  const isActive = Number(row.estado) === 1;
  const resp = await updateStatusDispatchType(row?.id);
  if (resp?.ok) {
    swalSuccess(
      `El tipo de despacho se ${
        isActive ? "desactivó" : "activó"
      } correctamente.`
    );
    await refresh();
    return;
  }

  const message =
    resp?.message ||
    `No se pudo ${isActive ? "desactivar" : "activar"} el tipo de despacho.`;
  (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}

onMounted(async () => {
  await fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Gestión de Tipo Despachos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Mantenimientos</li>
          <li class="breadcrumb-item" aria-current="page">Tipo despachos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <!-- contenido -->
  <div class="content">
    <BaseBlock title="Lista de Tipo despachos" content-full rounded>
      <template #options>
        <div class="block-options-item">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="loadingDetail || loadingPointSales"
            @click="openCreateModal"
          >
            <i class="fa fa-plus me-1"></i> Crear registro
          </button>
        </div>
        <div class="block-options-item">
          <button
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

      <!-- table -->
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading" :error="table.error" retryable
        @onRetry="fetchList(table.currentPage)"
        :perPage="table.filters.perpage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.filters.sortField"
        :sortOrder="table.filters.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchList"
      >
        <template #cell-id="{ row }">
          <span
            class="badge bg-body-secondary text-muted border"
            style="font-size: 12px"
          >
            #{{ row.id }}
          </span>
        </template>
        <template #cell-estado="{ row, value }">
          <span
            :class="booleanBadgeClass(value)"
            style="font-size: 12px"
            @click="openAlertChangeStatus(row)"
          >
            {{ value ? "Activo" : "Inactivo" }}
          </span>
        </template>

        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="loadingDetail || loadingPointSales"
            @click="openUpdateModal(row)"
          >
            <i
              :class="
                (loadingDetail || loadingPointSales) &&
                loadingDetailId === row.id
                  ? 'fa fa-spinner fa-spin'
                  : 'fa fa-pencil'
              "
              aria-hidden="true"
            ></i>
            <span class="visually-hidden">Editar tipo de despacho</span>
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
    </BaseBlock>
  </div>

  <div
    ref="modalRef"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="dispatch-type-modal-title"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <verModalGestionTipoDespachos
          ref="modalFormRef"
          :type-option="typeOption"
          :detail="detail"
          :point-sales="listPointSales"
          @closeModal="modal.hide()"
          @saved="handleSaved"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
</style>
