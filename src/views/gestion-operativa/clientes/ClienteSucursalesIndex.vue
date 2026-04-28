<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { useClientBranchesOperationsTable } from '@/composables/gestion-operativa/clientes/useClientBranchesOperationsTable';
import { useClientBranchesProcessOperation } from '@/composables/gestion-operativa/clientes/useClientBranchesProcessOperation';
import BaseTable from "@/components/BaseTable.vue";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import verModalGestionSucursal from '@/views/gestion-operativa/clientes/modals/verModalGestionSucursal.vue';

const {
  table,
  columns,
  listPerpage,
  estadoClass,
  refresh,
  refreshTwo,
  onSort,
  fetchList
} = useClientBranchesOperationsTable();

const {
  loadingBranchDetail,
  branchDetail,
  fetchBranchDetail
} = useClientBranchesProcessOperation();


//modales 
const verModalGestionSucursalRef = ref(null);
const verModalGestionSucursalObj = useBootstrapModal(verModalGestionSucursalRef, {
  onHidden: () => {
    dataModal.value = null
  }
});


const handleClick = ({ row, col }) => {

};

function isRowDisabled(row) {
  console.log(row, 'row');

}


const modalLocks = ref(new Map());
const isModalLocked = (modalRow) => {
  const id = typeof modalRow === "object" ? modalRow?.id : modalRow;
  return modalLocks.value.get(String(id)) === true;
}

function lockModal(id) {
  const m = new Map(modalLocks.value)
  m.set(String(id), true)
  modalLocks.value = m;
}

function unLockedModal(id) {
  const m = new Map(modalLocks.value)
  m.delete(String(id))
  modalLocks.value = m
}

const dataModal = ref(null);
async function openModalGestionSucursal(row) {
  if (!row || row.id === null) return
  const id = row.id
  if (isModalLocked(id)) return
  dataModal.value = null;
  lockModal(id);
  const resp = await fetchBranchDetail(row.id);
  if (!resp?.ok) {
    unLockedModal(id);
    return swalError(resp?.message);
  }
  dataModal.value = resp.data;
  verModalGestionSucursalObj.show();
  await nextTick();
  unLockedModal(id);

}

async function closeModalGestionSucursal() {
  verModalGestionSucursalObj.hide();
  await nextTick();
  refreshTwo();
}

onMounted(async () => {
  fetchList();
});
</script>

<template>
  <!-- header -->
  <BasePageHeading title="Gestión de Direcciones">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Gestión Operativa</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Direcciones de Clientes</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- end header -->

  <!-- content -->
  <div class="content">
    <BaseBlock title="Gestión de Direcciones de Clientes" content-full rounded class="mb-4">
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
        <div class="col-12 col-lg-2">
          <small class="text-muted d-block mb-1 text-muted  text-uppercase fw-bold"
            style="font-size: 10px;">estado</small>
          <select class="form-control form-control-sm" name="estado" id="estado" v-model="table.filters.estado">
            <option class="text-muted d-block mb-1 text-muted  text-uppercase fw-bold" style="font-size: 10px;"
              value="">
              Todos</option>
            <option class="text-muted d-block mb-1 text-muted  text-uppercase fw-bold" style="font-size: 10px;"
              value='1'>
              Activo</option>
            <option class="text-muted d-block mb-1 text-muted  text-uppercase fw-bold" style="font-size: 10px;"
              value='0'>
              Inactivo</option>
          </select>
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
        @onPageChange="fetchList" @onClick="handleClick" @onKeyDown="handleClick" :is-row-disabled="isRowDisabled">
        <template #cell-estado="{ value, row }">
          <span :class="estadoClass(value)" style="font-size:12px">{{
            row.estado === 1 ? 'Activo' : 'Inactivo'
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

        <!-- slot de acciones -->
        <template #actions="{ row }">
          <button @click="openModalGestionSucursal(row)" type="button" class="btn btn-primary btn-sm mx-1"
            :disabled="isModalLocked(row)">
            <span v-if="isModalLocked(row)" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="fa-solid fa-magnifying-glass me-1"></i>
          </button>
        </template>
      </BaseTable>

    </BaseBlock>
  </div>


  <div class="modal" id="modal-gestion-sucursal" tabindex="-1" aria-labelledby="modal-gestion-sucursal"
    aria-hidden="true" ref="verModalGestionSucursalRef">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <verModalGestionSucursal v-if="dataModal" :data="dataModal" @closeModal="closeModalGestionSucursal">
        </verModalGestionSucursal>
      </div>
    </div>
  </div>

  <!-- end content -->
</template>
