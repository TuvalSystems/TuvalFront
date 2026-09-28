
<script setup>
import { onMounted } from "vue";
import BaseTable from "@/components/BaseTable.vue";

//composables
import { useCarrierDriverTable } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverTable";

//modals

const {
  table,
  listPerpage,
  columns,
  fetchList,
  onSort,
  refresh,
  statusBooleanClass,
} = useCarrierDriverTable();

onMounted(() => {});
</script>

<template>
  <BasePageHeading title="Gestión de Choferes Transportitas">
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
          <span class="badge bg-body-secondary  text-muted  border" style="font-size:12px">
            #{{ row.id }}
          </span>
        </template>
         <template #cell-status="{ value }">
          <span :class="statusBooleanClass(value)" style="font-size:12px">
            {{ value ? 'Activo' : 'Inactivo' }}
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
      <!-- end table -->
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped>
</style>
