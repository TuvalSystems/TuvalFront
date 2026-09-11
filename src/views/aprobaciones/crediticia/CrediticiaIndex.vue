<script setup>
import { onMounted, ref } from 'vue';
import { useCreditOrdersPendingTable } from '@/composables/aprobaciones/pedidos/useCreditOrdersPendingTable';
import BaseTable from "@/components/BaseTable.vue";
import { formatPriceJm } from '@/functions';
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import verDetallePedidoCrediticioModal from '@/views/aprobaciones/crediticia/modals/verDetallePedidoCrediticioModal.vue';
import verEstadoCuentaModal from '@/views/aprobaciones/crediticia/modals/verEstadoCuentaModal.vue';
import { useCreditOrdersActions } from '@/composables/aprobaciones/pedidos/useCreditOrdersActions';

import { swalWarning, swalError } from '@/functions/swal-alert';
const {
  table,
  listPerpage,
  columns,
  fetchList,
  onSort,
  refresh,
  statusBadgePendingApproval
} = useCreditOrdersPendingTable();

const {

  fetchCreditOrderDetail,

  fetchCustomerCreditStatus,


} = useCreditOrdersActions();


const modalOrderDetailRef = ref(null);
const modalOrderDetailObj = useBootstrapModal(modalOrderDetailRef);

const modalCustomerStatementRef = ref(null);
const modalCustomerStatementObj = useBootstrapModal(modalCustomerStatementRef);




// bloque de columnas cuando se seleccionan
const lockedIds = ref(new Set());

function lock(id) {
  const s = new Set(lockedIds.value);
  s.add(String(id));
  lockedIds.value = s;
}
function unlock(id) {
  const s = new Set(lockedIds.value);
  s.delete(String(id));
  lockedIds.value = s;
}


// bloque de desactivacion de modales
const modalLocks = ref(new Map());
const isModalLocked = (row) => {
  const id = typeof row === "object" ? row?.id : row;
  return modalLocks.value.get(String(id)) === true;

}

function lockModal(id) {
  const m = new Map(modalLocks.value);
  m.set(String(id), true);
  modalLocks.value = m;
}

function unlockModal(id) {
  const m = new Map(modalLocks.value);
  m.delete(String(id));
  modalLocks.value = m;
}

// function de modal
const canOpenStatementColumns = ["ruc", "razon_social"];

const handleClick = ({ row, col }) => {
  if (col.key === "pedido") {
    openModalOrderDetail(row.id);
  }
  if (canOpenStatementColumns.includes(col.key)) {
    openCustomerStatementModal(row.id);
  }
};

function isRowDisabled(row) {
  return row && lockedIds.value.has(String(row.id));

}


// proceso de modales


// modal de dtalle de pedido
const dataDetailModal = ref(null);
async function openModalOrderDetail(id) {
  lock(id);
  lockModal(id);
  const resp = await fetchCreditOrderDetail(id);
  if (!resp?.ok) {
    const msg = resp?.message || "No se pudo actualizar el acceso a la App móvil";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    unlock(id);
    unlockModal(id);
    return
  }
  dataDetailModal.value = resp.data;
  modalOrderDetailObj.show();
  unlock(id);
  unlockModal(id);
}
async function closeModalDetail() {
  modalOrderDetailObj.hide();
}



// modal de estado de cuenta 


const dataCustomerStatement = ref(null);
async function openCustomerStatementModal(id) {
  lock(id);
  lockModal(id);
  const resp = await fetchCustomerCreditStatus(id);
  if (!resp?.ok) {
    const msg = resp?.message || "No se pudo actualizar el acceso a la App móvil";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    unlock(id);
    unlockModal(id);
    return;
  }
  dataCustomerStatement.value = resp?.data;
  modalCustomerStatementObj.show();

  unlock(id);
  unlockModal(id);

}

async function closeModalCustomers() {
  modalCustomerStatementObj.hide();
}

onMounted(() => {
  fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Aprobaciones Crediticias">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Aprobaciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Crediticias</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <BaseBlock title="Aprobaciones Crediticias" content-full rounded>
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


        <!-- motivo -->
        <template #cell-motivo="{ value }">
          <span v-if="value"
            class="badge rounded-pill bg-danger bg-opacity-100 text-white border border-danger border-opacity-25 px-2 py-1 fw-semibold"
            :title="value">
            <i class="fa fa-triangle-exclamation me-1"></i>
            {{ value }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>
        <!-- formato de monto -->
        <template #cell-monto="{ value }">
          <span class="fw-bold"> ${{ formatPriceJm(value) }}</span>
        </template>
        <!-- pendiente aprobacion comercial -->
        <template #cell-pendiente_aprobacion_comercial="{ value }">
          <span :class="statusBadgePendingApproval(value)" style="font-size:12px">
            {{ value ? 'Si' : 'No' }}
          </span>
        </template>
        <!-- total -->
        <template #cell-total="{ value }">
          <span class="fw-bold">
            ${{ formatPriceJm(value) }}
          </span>
        </template>

        <!-- acciones -->
        <template #actions="{ row }">
          <button type="button" class="btn btn-sm btn-primary mx-1" title="Procesar" :disabled="isModalLocked(row)"
            @click.stop="openCustomerStatementModal(row.id)">
            <span v-if="isModalLocked(row)" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <i v-else class="fa fa-gear"></i>
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
    </BaseBlock>
  </div>

  <!-- modales -->

  <!-- modal de detalle pedido -->
  <div class="modal" id="modal-detalle-pedido" tabindex="-1" aria-labelledby="modal-detalle-pedido" aria-hidden="true"
    ref="modalOrderDetailRef">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <verDetallePedidoCrediticioModal v-if="dataDetailModal" :info="dataDetailModal" @closeModal="closeModalDetail"
          @refresh="refresh">
        </verDetallePedidoCrediticioModal>
      </div>
    </div>
  </div>

  <!-- modal de estado de cuenta cliente -->

  <div class="modal" id="modal-estado-cuenta" tabindex="-1" aria-labelledby="modal-estado-cuenta" aria-hidden="true"
    ref="modalCustomerStatementRef">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <verEstadoCuentaModal v-if="dataCustomerStatement" :info="dataCustomerStatement"
          @closeModal="closeModalCustomers" @refresh="refresh">
        </verEstadoCuentaModal>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
