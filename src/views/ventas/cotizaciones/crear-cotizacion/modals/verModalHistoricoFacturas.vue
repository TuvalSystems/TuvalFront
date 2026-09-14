<script setup>
import { computed, watch } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import { formatJm } from "@/functions";
import { useHistoryInvoicesTable } from "@/composables/venta/cotizaciones/crearCotizacion/useHistoryInvoicesTable";

const props = defineProps({
  clienteId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["closeModal"]);

const { table, listPerpage, columns, fetchList, onSort, refresh } =
  useHistoryInvoicesTable();

const clientId = computed(() => props.clienteId ?? null);

watch(
  clientId,
  async (newClientId, previousClientId) => {
    if (!newClientId) {
      table.cliente_id = null;
      table.items = [];
      table.totalItems = 0;
      table.totalPage = 0;
      return;
    }

    if (newClientId !== previousClientId) {
      table.currentPage = 1;
      table.filters.search = "";
    }

    table.cliente_id = newClientId;
    await fetchList(1, newClientId);
  },
  { immediate: true }
);

async function refreshList() {
  if (!clientId.value) return;
  table.cliente_id = clientId.value;
  await refresh();
}

async function fetchPage(page = 1) {
  if (!clientId.value) return;
  table.cliente_id = clientId.value;
  await fetchList(page, clientId.value);
}

function clearSearch() {
  table.filters.search = "";
  fetchPage(1);
}

function formatNumber(value) {
  return formatJm(value) ?? "-";
}
</script>

<template>
  <BaseBlock title="Historial de facturas" class="mb-0" transparent>
    <template #options>
      <button
        type="button"
        class="btn-block-option"
        aria-label="Refrescar"
        title="Refrescar"
        :disabled="table.loading || !clientId"
        @click="refreshList"
      >
        <i v-if="!table.loading" class="fa fa-refresh"></i>
        <span v-else class="spinner-border spinner-border-sm"></span>
      </button>
      <button
        type="button"
        class="btn-block-option"
        aria-label="Close"
        @click="emit('closeModal')"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <div class="block-content block-content-full">
      <div class="row justify-content-between align-items-center g-2 mb-3">
        <div class="col-6 col-md-2">
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

        <div class="col-12 col-md-5">
          <div class="input-group input-group-sm">
            <span class="input-group-text">
              <i class="fa fa-search"></i>
            </span>
            <input
              v-model.trim="table.filters.search"
              type="search"
              class="form-control"
              placeholder="Buscar factura, item o descripcion..."
            />
            <button
              v-if="table.filters.search"
              type="button"
              class="btn btn-alt-secondary"
              title="Limpiar busqueda"
              @click="clearSearch"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
      </div>

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
        @onPageChange="fetchPage"
      >
        <template #cell-factura="{ value }">
          <span class="fw-semibold">{{ value || "-" }}</span>
        </template>

        <template #cell-cantidad="{ value }">
          <span class="text-nowrap">{{ formatNumber(value) }}</span>
        </template>
         <template #cell-precio="{ value }">
          <span class="text-nowrap">$ {{ formatNumber(value) }}</span>
        </template>
        <template #cell-descuento="{ value }">
          <span class="text-nowrap">{{ formatNumber(value) }}</span>
        </template>

        <template #cell-subtotal="{ value }">
          <span class="fw-semibold text-nowrap">$ {{ formatNumber(value) }}</span>
        </template>

        <template #empty>
          <div class="text-center py-5">
            <i class="fa fa-file-invoice fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">
              No se encontraron facturas historicas para este cliente.
            </p>
          </div>
        </template>
      </BaseTable>
    </div>
  </BaseBlock>
</template>
