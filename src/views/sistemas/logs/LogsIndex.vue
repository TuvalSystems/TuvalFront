<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useAdminLogTable } from "@/composables/sistemas/useAdminLogTable";
import { useAdminLogActions } from "@/composables/sistemas/useAdminLogActions";
import verModalDetalleLog from "@/views/sistemas/logs/modals/verModalDetalleLog.vue";
const {
  table,
  columns,
  // loadingRef,
  listPerpage,
  fetchList,
  refresh,
  onSort,
  estadoClass,
} = useAdminLogTable();

const {
  detailLog,
  loadingDetailLog,
  fetchDetailLogById,
  resetDetailLog,
} = useAdminLogActions();

const modalDetailRef = ref(null);
const detailError = ref("");
const selectedLogId = ref(null);
const modalDetailObj = useBootstrapModal(modalDetailRef, {
  onHidden: () => {
    resetDetailLog();
    detailError.value = "";
    selectedLogId.value = null;
  },
});

async function openModalDetail(row) {
  selectedLogId.value = row.id;
  detailError.value = "";
  resetDetailLog();
  await nextTick();
  modalDetailObj.show();

  const response = await fetchDetailLogById(row.id);
  if (!response?.ok && !response?.canceled) {
    detailError.value = response?.message || "No se pudo obtener el detalle del log.";
  }
}

function closeModalDetail() {
  modalDetailObj.hide();
}

const handleClick = ({ row }) => openModalDetail(row);

function isRowDisabled() {
  return false;
}

const flatPickrState = reactive({
  fecha_desde: {
    locale: Spanish,
  },
  fecha_hasta: {
    locale: Spanish,
  },
});

onMounted(() => {
  fetchList();
});
</script>

<template>
  <BasePageHeading title="Logs Sistemas">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Logs</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Log Sistemas" content-full rounded>
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

      <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
        <div class="col-12 col-lg-4">
          <small class="text-muted d-block mb-1">Fecha</small>
          <div class="d-flex align-items-center">
            <flat-pickr
              id="fecha_desde"
              class="form-control form-control-sm"
              v-model="table.filters.fecha_desde"
              :config="flatPickrState.fecha_desde"
            />
            <span class="text-muted">—</span>
            <flat-pickr
              id="fecha_hasta"
              class="form-control form-control-sm"
              v-model="table.filters.fecha_hasta"
              :config="flatPickrState.fecha_hasta"
            />
          </div>
        </div>
      </div>

      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.filters.perpage" class="form-select">
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
            class="form-control"
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
        @onSearch="table.filters.search"
        @onClick="handleClick"
        @onKeyDown="handleClick"
        :is-row-disabled="isRowDisabled"
      >
       <template #cell-id="{ row }">
          <span class="badge bg-body-secondary  text-muted  border" style="font-size:12px">
            #{{ row.id }}
          </span>
        </template>
        <template #cell-status="{ value, row }">
          <span :class="estadoClass(value)" style="font-size: 12px">{{
            row.status ?? "N/A"
          }}</span>
        </template>

        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-sm btn-alt-primary"
            :disabled="loadingDetailLog && selectedLogId === row.id"
            title="Ver detalle del log"
            aria-label="Ver detalle del log"
            @click="openModalDetail(row)"
          >
            <span
              v-if="loadingDetailLog && selectedLogId === row.id"
              class="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
            <i v-else class="fa fa-eye"></i>
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

  <div
    id="modal-detalle-log"
    ref="modalDetailRef"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="modal-detalle-log-title"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <verModalDetalleLog
          :detail-log="detailLog"
          :loading="loadingDetailLog"
          :error="detailError"
          @close-modal="closeModalDetail"
        />
      </div>
    </div>
  </div>
</template>
