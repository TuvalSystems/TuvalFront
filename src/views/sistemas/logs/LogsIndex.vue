<script setup>
import { onMounted, reactive } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useAdminLogTable } from "@/composables/sistemas/useAdminLogTable";

const { table,
  columns,
  loadingRef,
  listPerpage,
  fetchList,
  refresh,
  onSort,
estadoClass } = useAdminLogTable();


const handleClick = ({ row, col }) => {

};

function isRowDisabled(row) {
  console.log(row, 'row');
  
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
          <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading" title="Refrescar"
            aria-label="Refrescar">
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>

      <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
        <div class="col-12 col-lg-4">
          <small class="text-muted d-block mb-1">Fecha</small>
          <div class="d-flex align-items-center">
            <flat-pickr id="fecha_desde" class="form-control form-control-sm" v-model="table.filters.fecha_desde"
              :config="flatPickrState.fecha_desde" />
            <span class="text-muted">—</span>
            <flat-pickr id="fecha_hasta" class="form-control form-control-sm" v-model="table.filters.fecha_hasta"
              :config="flatPickrState.fecha_hasta" />
          </div>
        </div>
      </div>

      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.filters.perpage" class="form-select">
            <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <input v-model="table.filters.search" placeholder="Buscar..." class="form-control" />
        </div>
      </div>

      <!-- table -->
      <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.filters.perpage"
        :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
        :sortField="table.filters.sortField" :sortOrder="table.filters.sortOrder" @onSort="onSort"
        @onPageChange="fetchList" @onSearch="table.filters.search" @onClick="handleClick"
        :is-row-disabled="isRowDisabled">

        <template #cell-status="{ value, row }">
          <span :class="estadoClass(value)" style="font-size:12px">{{
            row.status ?? "N/A"
          }}</span>
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
</template>
