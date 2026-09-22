
<script setup>
import { useProviderTable } from "@/composables/sistemas/mantenimientos/proveedores/useProviderTable";
import { useProviderActions } from "@/composables/sistemas/mantenimientos/proveedores/useProviderActions";
import { onMounted } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import {
  swalError,
  swalSuccess,
  swalWarning,
  toast,
} from "@/functions/swal-alert";
const {
  table,
  listPerpage,
  columns,
  fetchList,
  onSort,
  refresh,
  statusClass,
  statusBooleanClass,
} = useProviderTable();

const {
  loadingCarrierProvider,
  updateStatusCarrierProvider,
  loadingStatusProvider,
  updateStatusProvider,
} = useProviderActions();

const isEnabledValue = (value) => {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["1", "true", "activo", "si"].includes(normalizedValue);
};


async function openAlertChangeCarrier(row) {
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
        changeStatusCarrier(row);
      }
    });
}

async function changeStatusCarrier(row) {}

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
        changeStatus(row);
      }
    });
}

async function changeStatus(row) {}

onMounted(async () => {
  await fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Gestión de Proveedores">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Mantenimientos</li>
          <li class="breadcrumb-item" aria-current="page">Proveedores</li>
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
        <!-- id -->
        <template #cell-id="{ row }">
          <span
            class="badge bg-body-secondary text-muted border"
            style="font-size: 12px"
          >
            #{{ row.id }}
          </span>
        </template>

        <!-- es transportista -->
        <template #cell-es_transportista="{ row, value }">
          <span
            :class="statusBooleanClass(value)"
            style="font-size: 12px"
            @click="openAlertChangeCarrier(row)"
          >
            {{ isEnabledValue(value) ? "SI" : "NO" }}
          </span>
        </template>
        <!-- estado -->
        <template #cell-estado="{ row, value }">
          <span
            :class="statusClass(value)"
            style="font-size: 12px"
            @click="openAlertChangeStatus(row)"
          >
            {{ isEnabledValue(value) ? "Activo" : "Inactivo" }}
          </span>
        </template>
      </BaseTable>
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped>
</style>
