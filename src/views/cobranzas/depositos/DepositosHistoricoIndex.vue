<script setup>
import { onMounted } from 'vue';
import { useHistoricalDepositsTable } from '@/composables/cobranzas/depositos-historicos/useHistoricalDepositsTable';
import BaseTable from '@/components/BaseTable.vue';

const {
  table,
  listPerpage,
  columns,
  loadingRef,
  fetchList,
  onSort,
  refresh,
  statusClass
} = useHistoricalDepositsTable();
onMounted(() => {
  fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Depositós Históricos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Depositós Históricos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <BaseBlock title="Depositós Históricos" content-full rounded>
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading" title="Refrescar">
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>

      <!-- paginacion y busqueda -->
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.filters.perpage" class="form-select form-select-sm">
            <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <input v-model="table.filters.search" placeholder="Buscar..." class="form-control form-control-sm" />
        </div>
      </div>

      <!-- table -->
      <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.filters.perpage"
        :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
        :sortField="table.filters.sortField" :sortOrder="table.filters.sortOrder" @onSort="onSort"
        @onPageChange="fetchList" @onClick="handleClick" @onKeyDown="handleClick" :is-row-disabled="isRowDisabled">
      </BaseTable>

    </BaseBlock>
  </div>
</template>

<style lang="css" scoped></style>
