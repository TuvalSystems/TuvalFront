
<script setup>
import { onMounted } from "vue";
import BaseTable from "@/components/BaseTable.vue";

//composable
import { useArticuleTable } from "@/composables/sistemas/mantenimientos/articulos/useArticleTable";
import { useArticleActions } from "@/composables/sistemas/mantenimientos/articulos/useArticleActions";
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
} = useArticuleTable();

const { loadingUpdateLogisticService, updateStatusLogisticService } =
  useArticleActions();

const isEnabledValue = (value) => {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["1", "true", "activo", "si"].includes(normalizedValue);
};

async function openAlertChangeServiceLogistic(row) {
  const isService = isEnabledValue(row.es_servicio_logistico);
  const articleName = row.codigo;
  const result = await toast.fire({
    title: isService
      ? "¿Quitar condición de Servicio Logístico?"
      : "¿Marcar como servicio logístico?",
    text: isService
      ? `El artículo «${articleName}» dejará de figurar como servicio logístico.`
      : `El artículo «${articleName}» figurará como servicio logístico y no podrá utilizarse en cotizaciones ni pedidos.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: isService ? "btn btn-danger m-1" : "btn btn-success m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: isService ? "Sí, quitar" : "Sí, marcar",
    cancelButtonText: "Cancelar",
  });
  if (result.isConfirmed) await changeStatusServiceLogistic(row);
}

async function changeStatusServiceLogistic(row) {
  if (loadingUpdateLogisticService.value) return;
  const isService = isEnabledValue(row.es_servicio_logistico);
  const articleName = row.codigo;
  const resp = await updateStatusLogisticService(row?.id);
  if (resp?.ok) {
    swalSuccess(
      isService
        ? `Se quitó la condición de servicio logístico del artículo «${articleName}».`
        : `El artículo «${articleName}» se marcó como servicio logístico. No podrá utilizarse en cotizaciones ni pedidos.`
    );
    await fetchList(table.currentPage);
    return;
  }

  if (resp?.canceled || resp?.handled) return;
  const message =
    resp?.message ||
    (isService
      ? `No se pudo quitar la condición de servicio logístico del artículo «${articleName}». Inténtalo nuevamente.`
      : `No se pudo marcar el artículo «${articleName}» como servicio logístico. Inténtalo nuevamente.`);
  (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}

onMounted(async () => {
  await fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Gestión de Artículos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Mantenimientos</li>
          <li class="breadcrumb-item" aria-current="page">Artículos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <!-- contenido -->
  <div class="content">
    <BaseBlock title="Lista de Artículos" class="mb-2" rounded>
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
        <template #cell-es_servicio_logistico="{ row, value }">
          <span
            :class="statusBooleanClass(value)"
            style="font-size: 12px"
            @click="openAlertChangeServiceLogistic(row)"
          >
            {{ isEnabledValue(value) ? "SI" : "NO" }}
          </span>
        </template>
        <!-- estado -->
        <template #cell-estado="{ value }">
          <span :class="statusClass(value)" style="font-size: 12px">
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
