<template>
  <!-- Hero -->
  <BasePageHeading title="Cierre de caja">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cierre de caja</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <BaseBlock v-if="currentCaja" title="Caja: " :subtitle="currentCaja.CAJA_DESCRIPCION" class="pb-4">
      <div class="row">
        <div class="col-sm-6">
          <p>Estado: <span
              :class="currentCaja.estado == 'abierto' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'"
              class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill">{{ currentCaja.estado }}</span> </p>
        </div>
        <div class="col-sm-6 text-end">
          <template v-if="currentCaja.estado == 'abierto'">
            <button class="btn btn-warning btn-sm" @click="confirmCerrarCaja()"> <i class="fa fa-cash-register"></i>
              Cerrar Caja</button>
          </template>
          <template v-if="currentCaja.estado == 'sin cierre'">
            <button class="btn btn-warning btn-sm" @click="confirmCerrarCaja()"> <i class="fa fa-cash-register"></i>
              Cerrar Caja anterior</button>
          </template>
        </div>
      </div>
    </BaseBlock>
    <!-- Full Table -->
    <BaseBlock :title="'Resumen y descargas: ' + cajausuario" class="pb-4">
      <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent="onSubmit">
        <div class="col-12">
          <div class="row">
            <label class="col-sm-4 col-form-label text-end" for="fecha">Fecha:</label>
            <div class="col-sm-8">
              <div class="input-group date" style="max-width: 180px;">
                <span class="input-group-text"><i class="far fa-calendar"></i></span>
                <flat-pickr id="fecha" name="fecha" class="form-control fs-sm" placeholder="Y-m-d" v-model="set_fecha"
                  :config="flatPickrState.fecha" @change="resumencaja(set_fecha)" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <button type="button" v-on:click="descargarcierredecaja(set_fecha)" class="btn btn-primary">Descargar</button>
        </div>

      </form>
      <div v-if="resumen_caja" class="row">
        <div class="col-sm-6 offset-3">
          <h4 class="mt-4">Resumen</h4>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Forma de pago</th>
                <th class="text-end">Valor cobrado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Retenciones IVA</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.retenciones.ret_iva) }}</td>
              </tr>
              <tr>
                <td>Retenciones Renta</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.retenciones.ret_renta) }}</td>
              </tr>
              <tr>
                <td>Efectivo</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.efectivo) }}</td>
              </tr>
              <tr>
                <td>Cheques al día</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.cheques) }}</td>
              </tr>
              <tr>
                <td>Cheques posfechados</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.cheques_p) }}</td>
              </tr>
              <tr>
                <td>Depósitos/Transferencias</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.depositos) }}</td>
              </tr>
              <tr>
                <td>Tarjetas</td>
                <td class="text-end">${{ formatPriceJm(resumen_caja.tarjetas) }}</td>
              </tr>
              <tr>
                <th>Total</th>
                <th class="text-end">${{ formatPriceJm(resumen_caja.total) }}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>




    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore } from 'vuex'
import { swalError, toast } from "@/functions/swal-alert.js";
import FlatPickr from "vue-flatpickr-component";
import { formatPriceJm } from "@/functions";

const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  fecha: {
    maxDate: Date.now(),
  },
});


const store = useStore();

const today = new Date();
const fecha = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
const cajausuario = ref('');
const resumen_caja = computed(() => store.state.resumen_caja);
const currentCaja = computed(() => store.state.currentCaja);
let errorMsg = ref('');
const set_fecha = ref(fecha);

store.dispatch('estadoCaja').catch(err => {
  swalError(err.response.data.error)
});


store.dispatch('consultacajausuario').then((res) => {
  cajausuario.value = res.cajausuario;
  resumencaja(set_fecha.value);
})
  .catch(err => {
    swalError(err.response.data.error)
  });

function descargarcierredecaja(set_fecha) {
  store.dispatch('estadoCajafecha', set_fecha).then((res) => {
    if (res.caja.estado == 'cerrado') {
      store.dispatch('imprimir', '/cobranzas/imprimircierredecaja/' + set_fecha + '/' + cajausuario.value)
        .then((response) => {
          if (response.status == 200) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cierre-de-caja-' + cajausuario.value + '.pdf');
            document.body.appendChild(link);
            link.click();
          }
        });
    } else {
      swalError('La caja se encuentra abierta');
    }
  }).catch(err => {
    swalError(err.response.data.error);
  });
}

function resumencaja(set_fecha) {
  store.dispatch('resumencaja', '/cobranzas/resumencaja/' + set_fecha + '/' + cajausuario.value)
}

function confirmCerrarCaja() {
  toast.fire({
    title: "Estás seguro?",
    text: "De cerrar la caja: " + currentCaja.value.CAJA_DESCRIPCION,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, cerrarla!",
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
        cerrarCaja();
      }
    });
}

function cerrarCaja() {
  store.dispatch('cerrarCaja').then((res) => {
    store.dispatch('estadoCaja').then(() => {
      descargarcierredecaja(res.fecha)
    })
  })
    .catch(err => {
      errorMsg.value = err.response.data.error
    });
}


</script>
