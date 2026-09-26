
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
  if (
    row?.id == null ||
    loadingCarrierProvider.value ||
    loadingStatusProvider.value
  )
    return;

  const isCarrier = isEnabledValue(row.es_transportista);
  const providerName = row.razon_social || row.ruc || `#${row.id}`;
  const result = await toast.fire({
    title: isCarrier
      ? "¿Quitar condición de transportista?"
      : "¿Marcar como transportista?",
    text: isCarrier
      ? `El proveedor «${providerName}» dejará de figurar como transportista.`
      : `El proveedor «${providerName}» figurará como transportista.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: isCarrier ? "btn btn-danger m-1" : "btn btn-success m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: isCarrier ? "Sí, quitar" : "Sí, marcar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) await changeStatusCarrier(row);
}

async function changeStatusCarrier(row) {
  if (loadingCarrierProvider.value || loadingStatusProvider.value) return;

  const isCarrier = isEnabledValue(row.es_transportista);
  const resp = await updateStatusCarrierProvider(row?.id);
  if (resp?.ok) {
    swalSuccess(
      isCarrier
        ? "Se quitó la condición de transportista al proveedor."
        : "El proveedor quedó marcado como transportista."
    );
    await fetchList(table.currentPage);
    return;
  }

  if (resp?.canceled || resp?.handled) return;
  const message =
    resp?.message ||
    (isCarrier
      ? "No se pudo quitar la condición de transportista."
      : "No se pudo marcar al proveedor como transportista.");
  (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}

async function openAlertChangeStatus(row) {
  if (
    row?.id == null ||
    loadingCarrierProvider.value ||
    loadingStatusProvider.value
  )
    return;

  const isActive = isEnabledValue(row.estado);
  const providerName = row.razon_social || row.ruc || `#${row.id}`;
  const result = await toast.fire({
    title: isActive ? "¿Inactivar proveedor?" : "¿Activar proveedor?",
    text: isActive
      ? `El proveedor «${providerName}» quedará inactivo.`
      : `El proveedor «${providerName}» quedará activo.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: isActive ? "btn btn-danger m-1" : "btn btn-success m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: isActive ? "Sí, inactivar" : "Sí, activar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) await changeStatus(row);
}

async function changeStatus(row) {
  if (loadingCarrierProvider.value || loadingStatusProvider.value) return;

  const isActive = isEnabledValue(row.estado);
  const resp = await updateStatusProvider(row?.id);
  if (resp?.ok) {
    swalSuccess(
      isActive ? "El proveedor quedó inactivo." : "El proveedor quedó activo."
    );
    await fetchList(table.currentPage);
    return;
  }

  if (resp?.canceled || resp?.handled) return;
  const message =
    resp?.message ||
    (isActive
      ? "No se pudo inactivar al proveedor."
      : "No se pudo activar al proveedor.");
  (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}

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
    <BaseBlock title="Lista de Proveedores" class="mb-2" rounded>
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
</template>

<style lang="css" scoped>
</style>
