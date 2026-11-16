<script setup>
import { computed, watch, ref, nextTick, onUnmounted } from "vue";
import { useClientRegisteredCollectionsTable } from "@/composables/cobranzas/cobros-facturas/useClientRegisteredCollectionsTable";

import BaseTable from "@/components/BaseTable.vue";
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
import {
  swalError,
  swalInfo,
  swalSuccess,
  swalWarning,
} from "@/functions/swal-alert";
import { useRefreshCollectionOnEvent } from "@/composables/cobranzas/cobros-facturas/useRefreshCollectionOnEvent";

const props = defineProps({
  collectionDraft: {
    type: Object,
    required: true,
  },
});

const { table, columns, listPerpage, statusClass, fetchList, onSort, refresh } =
  useClientRegisteredCollectionsTable();
const {
  //imprimir el pdf del cobro
  printPdfCollection,
} = useInvoiceCollectionActions();
const clientId = computed(() => props.collectionDraft?.cliente_id ?? null);
const totalRows = computed(() => table.totalItems || table.items.length);
const depositPendingApprovalMessage =
  "Existen depósitos pendientes de aprobación";

watch(
  clientId,
  async (newClientId, previousClientId) => {
    if (!newClientId) {
      table.items = [];
      table.totalItems = 0;
      table.totalPage = 0;
      table.filters.cliente_id = null;
      return;
    }

    if (newClientId !== previousClientId) {
      table.currentPage = 1;
      table.filters.search = "";
    }

    table.filters.cliente_id = newClientId;
    await fetchList(table.currentPage);
  },
  { immediate: true }
);

async function refreshList() {
  if (!clientId.value) {
    return;
  }

  table.filters.cliente_id = clientId.value;
  await refresh();
}

function getEventClientId(event) {
  return event?.cliente_id ?? event?.clienteId ?? event?.cliente?.id ?? null;
}

function shouldRefreshCollectionList(event) {
  const eventClientId = getEventClientId(event);

  if (!eventClientId) {
    return true;
  }

  return String(eventClientId) === String(clientId.value);
}

const stopRefreshCollectionOnEvent = useRefreshCollectionOnEvent({
  refreshFn: refreshList,
  shouldRefresh: shouldRefreshCollectionList,
});

onUnmounted(() => {
  stopRefreshCollectionOnEvent?.();
});

function clearSearch() {
  table.filters.search = "";
  fetchList(1);
}

function getReceiptNumber(row) {
  return row?.numero_recibo ?? "-";
}

function getCollectionDate(row) {
  return row?.fecha ?? "-";
}

function getStatusLabel(status) {
  const normalized = String(status ?? "").toLowerCase();

  if (normalized === "pendiente") {
    return "Pendiente";
  }

  if (normalized === "enviado") {
    return "Procesado";
  }

  if (normalized === "iniciado") {
    return "Pendiente";
  }

  if (normalized === "no_enviado") {
    return "No enviado";
  }
  if (normalized === "rechazado") {
    return "Rechazado";
  }

  return status || "N/A";
}

function isPendingRegistrationStatus(status) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  return normalized === "pendiente" || normalized === "iniciado";
}

function getPendingRegistrationAlert(row) {
  if (!isPendingRegistrationStatus(row?.estado)) {
    return "";
  }

  return String(row?.alerta ?? "").trim();
}

function getCollectionStatusAlert(row) {
  const pendingRegistrationAlert = getPendingRegistrationAlert(row);

  if (pendingRegistrationAlert) {
    return pendingRegistrationAlert;
  }

  return row?.deposito_pendiente ? depositPendingApprovalMessage : "";
}

function hasCollectionStatusAlert(row) {
  return Boolean(getCollectionStatusAlert(row));
}

defineExpose({
  refresh: refreshList,
});

const handleClick = () => {};

function isRowDisabled() {
  // return lockedIds.value.has(row.id);
}

const lockIdPdf = ref(new Map());
function islockedPdf(row) {
  const id = typeof row === "object" ? row?.id : row;
  return lockIdPdf.value.get(String(id)) === true;
}
function lockPdf(id) {
  const m = new Map(lockIdPdf.value);
  m.set(String(id), true);
  lockIdPdf.value = m;
}
function unLockedPdf(id) {
  const m = new Map(lockIdPdf.value);
  m.delete(String(id));
  lockIdPdf.value = m;
}

async function printCollectionPdf(row) {
  const id = row.id;
  if (islockedPdf(id)) return;
  lockPdf(id);
  const resp = await printPdfCollection(row.id);
  if (!resp?.ok) {
    unLockedPdf(id);
    const msg = resp?.message || "Opps! No se pudo generar el archivo Pdf";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  unLockedPdf(id);
  await nextTick();
  swalSuccess(resp?.message || "Pdf Generado exitosamente");
}

async function showAlertPendingApproved(row) {
  const pendingRegistrationAlert = getPendingRegistrationAlert(row);

  if (pendingRegistrationAlert) {
    swalWarning(pendingRegistrationAlert);
    return;
  }

  if (row.deposito_pendiente) {
    swalInfo(depositPendingApprovalMessage);
    return;
  }
}
const SHOW_STATUS = ["enviado"];
const isShowPrintReport = (row) => {
  return SHOW_STATUS.includes(row.estado);
};
</script>

<template>
  <BaseBlock
    v-if="clientId"
    class="registered-collections mt-3"
    title="Cobros registrados"
    rounded
    fx-shadow
  >
    <template #options>
      <div class="block-options-item">
        <button
          class="btn btn-outline-primary btn-sm"
          type="button"
          :disabled="table.loading"
          title="Refrescar"
          aria-label="Refrescar"
          @click="refreshList"
        >
          <i v-if="!table.loading" class="fa fa-refresh"></i>
          <span v-else class="spinner-border spinner-border-sm"></span>
        </button>
      </div>
    </template>

    <div class="registered-toolbar">
      <div class="registered-total">
        <span>Nro. Cobros</span>
        <strong>{{ totalRows }}</strong>
      </div>

      <div class="registered-filters">
        <div class="registered-page-size">
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

        <div class="registered-search">
          <i class="fa fa-search"></i>
          <input
            v-model.trim="table.filters.search"
            type="search"
            class="form-control form-control-sm"
            placeholder="Buscar recibo..."
          />
          <button
            v-if="table.filters.search"
            type="button"
            class="btn btn-sm btn-alt-secondary"
            title="Limpiar busqueda"
            @click="clearSearch"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>

        <select
          v-model="table.filters.sortOrder"
          class="form-select form-select-sm registered-sort"
        >
          <option value="desc">Mas recientes</option>
          <option value="asc">Mas antiguos</option>
        </select>
      </div>
    </div>

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
      @onClick="handleClick"
      @onKeyDown="handleClick"
      :is-row-disabled="isRowDisabled"
    >
      <template #cell-numero_recibo="{ row }">
        <span class="registered-receipt">
          <i class="fa fa-receipt"></i>
          {{ getReceiptNumber(row) }}
        </span>
      </template>

      <template #cell-fecha="{ row }">
        <span class="registered-date">
          <i class="far fa-calendar"></i>
          {{ getCollectionDate(row) }}
        </span>
      </template>

      <template #cell-estado="{ row, value }">
        <span
          :class="[
            statusClass(value),
            { 'registered-status-clickable': hasCollectionStatusAlert(row) },
          ]"
          style="font-size: 11px"
          :title="getCollectionStatusAlert(row) || getStatusLabel(value)"
          @click="showAlertPendingApproved(row)"
        >
          {{ getStatusLabel(value) }}
          <i
            v-if="hasCollectionStatusAlert(row)"
            class="fa fa-triangle-exclamation ms-1 registered-status-alert-icon"
            aria-hidden="true"
          ></i>
        </span>
      </template>

      <!-- slot de acciones -->
      <template #actions="{ row }">
        <button
          v-show="isShowPrintReport(row)"
          type="button"
          class="btn btn-sm btn-outline-danger registered-pdf-btn"
          title="Descargar cobro PDF"
          :disabled="islockedPdf(row)"
          @click="printCollectionPdf(row)"
        >
          <span class="client-action-icon">
            <span
              v-if="islockedPdf(row)"
              class="spinner-border spinner-border-sm"
            ></span>
            <i v-else class="fa fa-file-pdf"></i>
          </span>
        </button>
      </template>

      <template #empty>
        <div class="registered-empty">
          <i class="fa fa-receipt"></i>
          <span>No se encontraron cobros registrados para este cliente.</span>
        </div>
      </template>
    </BaseTable>
  </BaseBlock>
</template>

<style lang="css" scoped>
.registered-collections {
  margin-bottom: 0.85rem;
}

.registered-toolbar,
.registered-filters,
.registered-receipt,
.registered-date {
  display: flex;
  align-items: center;
}

.registered-toolbar {
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.registered-total {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 96px;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  background: var(--bs-body-bg);
}

.registered-total span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
}

.registered-total strong {
  font-size: 0.92rem;
}

.registered-filters {
  justify-content: flex-end;
  flex: 1 1 auto;
  gap: 0.5rem;
}

.registered-page-size {
  width: 86px;
  flex: 0 0 86px;
}

.registered-search {
  position: relative;
  flex: 1 1 260px;
  max-width: 360px;
}

.registered-search > i {
  position: absolute;
  top: 50%;
  left: 0.58rem;
  z-index: 2;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  transform: translateY(-50%);
}

.registered-search .form-control {
  padding-left: 1.8rem;
  padding-right: 2.4rem;
}

.registered-search .btn {
  position: absolute;
  top: 50%;
  right: 0.18rem;
  transform: translateY(-50%);
}

.registered-sort {
  width: 138px;
  flex: 0 0 138px;
}

.registered-empty {
  display: grid;
  place-items: center;
  gap: 0.45rem;
  min-height: 96px;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  text-align: center;
}

.registered-empty i {
  font-size: 1.35rem;
}

.registered-receipt,
.registered-date {
  gap: 0.35rem;
}

.registered-receipt {
  font-weight: 800;
}

.registered-date {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
}

.registered-status-clickable {
  cursor: pointer;
}

.registered-status-alert-icon {
  font-size: 0.68rem;
}

.registered-pdf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
}

@media (max-width: 767.98px) {
  .registered-toolbar,
  .registered-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .registered-page-size,
  .registered-sort,
  .registered-search {
    width: 100%;
    max-width: none;
    flex-basis: auto;
  }
}
</style>
