<template>
  <!-- Hero -->
  <BasePageHeading title="Aprobación Depósitos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Aprobación Depósitos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Depósitos">
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="loading" title="Refrescar"
            aria-label="Refrescar">
            <i v-if="!loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="mt-2 text-muted">
          Cargando depósitos por aprobar...
        </div>
      </div>

      <table v-else class="table table-hover table-vcenter">
        <thead>
          <tr>
            <th>Agencia</th>
            <th>RCB</th>
            <th>Cliente</th>
            <th>Ruc</th>
            <th>Banco</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Comprobante</th>
            <th class="text-end">Monto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(deposito, index) in depositos_por_aprobar" :key="index">
            <td class="fs-sm">
              {{ deposito.agencia }}
            </td>
            <td class="fs-sm">
              {{ deposito.numero_recibo }}
            </td>
            <td class="fs-sm">
              {{ deposito.CLI_RAZON_SOCIAL }}
            </td>
            <td class="fs-sm">
              {{ deposito.CLI_RUC }}
            </td>
            <td class="fs-sm">
              {{ deposito.CB_DESCRIPCION }}
            </td>
            <td class="fs-sm">
              {{ deposito.fecha }}
            </td>
            <td class="fs-sm">
              <span v-if="deposito.tipo === 'DP'"
                class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success nowrap">
                <i class="fa fa-file-invoice-dollar"></i>
                Depósito</span>
              <span v-if="deposito.tipo === 'DA'"
                class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning nowrap">
                <i class="fa fa-file-invoice-dollar"></i>
                Depósito Anterior</span>
              <span v-if="deposito.tipo === 'TR'"
                class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info nowrap">
                <i class="fa fa-money-bill-transfer"></i>
                Transferencia</span>
            </td>
            <td class="fs-sm">
              {{ deposito.comprobante }}
            </td>
            <td class="text-end fs-sm">
              ${{ formatPriceJm(parseFloat(deposito.monto)) }}
            </td>
            <td class="fs-sm text-end nowrap space-x-1">
                <button type="button" class="btn btn-sm btn-success" @click="confirmAprobar(deposito)">
                  <i class="fa fa-check"></i> 
                </button>
                <button type="button" class="btn btn-sm btn-danger" @click="confirmRechazar(deposito)">
                  <i class="fa fa-xmark"></i> 
                </button>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
  <div class="modal" id="modal-rechazar" tabindex="-1" role="dialog" aria-labelledby="modal-rechazar" aria-hidden="true"
    ref="rechazarModal">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <div v-if="currentDeposito" class="block-rounded block-transparent block mb-0">
          <div class="block-header block-header-default">
            <h3 class="block-title"> Rechazar depósito {{ currentDeposito.comprobante }}</h3>
            <div class="block-options space-x-1">
              <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
              </button>
            </div>
          </div>
          <div class="block-content fs-sm">
            <div class="mb-4">
              <label class="form-label" for="example-textarea-input">Motivo de rechazo</label>
              <textarea v-model="motivo" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="block-content block-content-full text-end bg-body">
            <button type="button" class="btn btn-sm btn-alt-secondary mx-2" data-bs-dismiss="modal"> Cancelar </button>
            <button type="button" class="btn btn-sm btn-danger mx-2" @click="rechazarDeposito(currentDeposito)"> <i
                class="fa fa-xmark"></i> Rechazar </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
import { formatPriceJm } from "@/functions";

const depositos_por_aprobar = computed(() => store.state.depositos_por_aprobar);
const store = useStore();
const currentDeposito = ref(null);
const motivo = ref(null);

let rechazarModal = ref(null);
let rechazarModalObj = null;

store.dispatch('depositosPorAprobar');

function confirmAprobar(deposito) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De aprobar el depósito " + deposito.comprobante + "",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, aprobarlo",
      cancelButtonText: "Cancelar",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        aprobarDeposito(deposito.id);
      }
    });
}

function confirmRechazar(deposito) {
  currentDeposito.value = deposito;
  rechazarModalObj.show();
}

async function aprobarDeposito(deposito) {
  const data = reactive({
    id: deposito
  });
  store.dispatch('aprobarDepositos', data)
    .then((result) => {
      store.dispatch('depositosPorAprobar');
    });
}

async function rechazarDeposito(deposito) {
  const data = reactive({
    id: deposito.id,
    motivo: motivo.value
  });
  store.dispatch('rechazarDepositos', data)
    .then((result) => {
      rechazarModalObj.hide();
      store.dispatch('depositosPorAprobar');
    });
}

const loading = ref(false);
async function refresh() {
  try {
    loading.value = true;
    await store.dispatch('depositosPorAprobar');
  } catch (error) {
    console.error('Error al refrescar depósitos por aprobar:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  rechazarModalObj = new Modal(rechazarModal.value);

});

</script>