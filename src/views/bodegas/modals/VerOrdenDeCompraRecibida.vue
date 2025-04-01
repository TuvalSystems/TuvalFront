<template>
  <BaseBlock title="Orden de compra" class="mb-0">
    <template #options>
        <button
          type="button"
          class="btn-block-option"
          data-bs-dismiss="modal"
          aria-label="Close"
          >
          <i class="fa fa-fw fa-times"></i>
        </button>
      </template>
    <template #content>
      <div class="block-content fs-sm ">
        <div class="table-responsive">
          <table class="table table-striped table-sm table-vcenter">
            <tbody>
              <tr>
                  <th class="fs-sm">Documento</th>
                  <td class="fs-sm">{{verrecibodecompral.ORDEN_COMPRA_DOCUMENTO}}</td>
                  <th class="fs-sm">Pedido Origen</th>
                  <td class="fs-sm">{{verrecibodecompral.ORDEN_COMPRA_DOCU_ORIGEN}}</td>
                  <th class="fs-sm">Proveedor</th>
                  <td class="fs-sm">{{verrecibodecompral.PROV_RAZON_SOCIAL}}</td>
              </tr>
              <tr>
                  <th class="fs-sm">RUC Proveedor</th>
                  <td class="fs-sm">
                    {{verrecibodecompral.ORDEN_COMPRA_ID_PROVEEDOR}}
                  </td>
                  
                  <th class="fs-sm">Fecha de entrega</th>
                  <td class="fs-sm">
                    {{verrecibodecompral.ORDEN_COMPRA_FECHA_ENTREGA}}
                  </td>
                  <th class="fs-sm">Dirección</th>
                  <td class="fs-sm">{{verrecibodecompral.ORDEN_COMPRA_DIRECCION}}</td>
                  
              </tr>
            <tr>
              <th class="fs-sm">Vendedor</th>
              <td class="fs-sm">{{verrecibodecompral.vendedor}}</td>
              <th class="fs-sm">Usuario</th>
              <td class="fs-sm">{{verrecibodecompral.USERID}}</td>
              <td colspan="2"></td>
            </tr>
            </tbody>
          </table>
          <div v-if="detallerecibodecompral.data.length && !detallerecibodecompral.loading" class="col-sm-12 text-end">
            <button type="button" class="btn btn-sm btn-primary" @click="seleccionartodos()">
              <i class="fa fa-hand-pointer"></i> Seleccionar todos
            </button>
          </div>
          <div v-if="detallerecibodecompral.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>
          <table v-if="detallerecibodecompral.data.length && !detallerecibodecompral.loading" class="table table-hover table-sm table-vcenter mt-4 fs-sm">      
            <thead>
              <tr>
                <th>#</th>
                <th>Artículo</th>
                <th>Descripción</th>
                <th>UDM</th>
                <th class="text-end">Cantidad</th>
                <th class="text-end">Pendiente</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(articulo, index) in detallerecibodecompral.data" :key="index">
                <tr>
                  <td>{{index+1}}</td>
                  <td>
                    {{ articulo.ORDEN_COMPRA_DETALLE_ARTICULO }}
                    
                  </td>
                  <td>
                    {{ articulo.ORDEN_COMPRA_DETALLE_DESCRIPCION_ARTICULO }}
                    
                  </td>
                  <td>
                      {{ articulo.ORDEN_COMPRA_DETALLE_UMEDIDA }}
                  </td>
                  <td class="text-end">
                      {{ articulo.ORDEN_COMPRA_DETALLE_CANTIDAD }}
                  </td>
                  <td class="text-end">
                    {{ articulo.pendiente }}
                  </td>
                  <td style="width: 31px" class="text-center">
                    <input
                        v-if="articulo.pendiente > 0"
                        type="checkbox"
                        class="form-check-input"
                        v-model="articulo.aplicar_todo"
                        @change="aplicatodo(articulo)"
                    />
                  </td>
                  <td style="width: 80px">
                    <input
                        v-if="articulo.pendiente > 0"
                        type="text"
                        class="form-control text-end"
                        v-model="articulo.seleccionado"
                        @change="aplicartraslado(articulo)"
                    />
                  </td>
                </tr>
              </template>

            </tbody>
          </table>
        </div>
        
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button :disabled="deshabilitarImprimir" type="button" class="btn btn-warning btn-sm mx-1" @click="imprimirReciboCompraL(verrecibodecompral)"><i class="fa fa-print"></i> Orden de almacenamiento</button>
    <button type="button" class="btn btn-danger btn-sm mx-1" @click="confirmEliminar(verrecibodecompral)"><i class="fa fa-xmark"></i> Eliminar</button>
    <button :disabled="!generar" type="button" class="btn btn-success btn-sm mx-1" @click="recibirOrden(verrecibodecompral)"><i class="fa fa-check"></i> Recibir</button>
    <button type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal">
      Cerrar
    </button>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { formatPrice } from "@/functions";
import swalAlert, { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import {useTemplateStore} from "@/stores/template";

const { verrecibodecompral } = defineProps({
  verrecibodecompral: Object,
});

const store = useStore();
const templateStore = useTemplateStore();
const detallerecibodecompral = computed(() => store.state.detallerecibodecompral);
const generar = computed(() => store.state.generar);
const deshabilitarImprimir = ref(false);

let errorMsg = ref('');

const emit = defineEmits(["recibir"]);

function seleccionartodos() {
  detallerecibodecompral.value.data.map((recibo) => {
    recibo.seleccionado = recibo.pendiente;
    recibo.aplicar_todo = true;
  });
  checkgenerarguia();
}

function checkgenerarguia() {
  let check = false;
  detallerecibodecompral.value.data.map((recibo) => {
    if (recibo.seleccionado > 0) {
      check = true;
    }
  });
  if (check) {
    store.commit("setGenerar", true);
  } else {
    store.commit("setGenerar", false);
  }
}

function aplicatodo(recibo) {
  if (recibo.aplicar_todo === false) {
    recibo.seleccionado = "";
    checkgenerarguia();
    return;
  }
  recibo.seleccionado = recibo.pendiente;
  checkgenerarguia();
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function aplicartraslado(recibo) {

  if(!isInt(recibo.seleccionado)){
    recibo.seleccionado = 0;
    recibo.aplicar_todo = false;
    checkgenerarguia();
    swalError('Ingresar un número entero');
    return false;
  }

  if (isNaN(recibo.seleccionado)) {
    swalError("Ingresar un número");
    recibo.seleccionado = 0;
    recibo.aplicar_todo = false;
    checkgenerarguia();
    return false;
  }

  if (parseFloat(recibo.seleccionado) === 0) {
    recibo.aplicar_todo = false;
  } else if (parseFloat(recibo.seleccionado) < 0) {
    recibo.aplicar_todo = false;
    swalError("No se puede ingresar números negativos");
    recibo.seleccionado = null;
  } else if (parseFloat(recibo.seleccionado) <= parseFloat(recibo.pendiente)) {
    recibo.aplicar_todo = true;
  } else if (parseFloat(recibo.seleccionado) > parseFloat(recibo.pendiente)) {
    swalError("El número ingresado es mayor a la cantidad pendiente");
    recibo.seleccionado = recibo.pendiente;
    recibo.aplicar_todo = true;
  } else {
    recibo.aplicar_todo = true;
  }
  checkgenerarguia();
}

function recibirOrden(verrecibodecompral){
  templateStore.pageLoader({ mode: "on" });
  verrecibodecompral.detalle = detallerecibodecompral.value.data;
  store.dispatch('recibirOrdendecompraL', verrecibodecompral).then(() => {
    templateStore.pageLoader({ mode: "off" });
    emit('recibir');
  }).catch(err => {
    templateStore.pageLoader({ mode: "off" });
    swalWarning(err.response.data.error);
  });
}

function imprimirReciboCompraL(guia){
  deshabilitarImprimir.value = true;
  guia.detalle = detallerecibodecompral.value.data;
  store.dispatch('imprimirrecibol', guia)
      .then((response) => {
        if(response.status == 200){
          deshabilitarImprimir.value = false;
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'orden-almacenamiento-'+guia.ORDEN_COMPRA_DOCUMENTO+'.pdf');
          document.body.appendChild(link);
          link.click();
        }
      });
}

function confirmEliminar(verrecibodecompral) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar la orden de compra "+verrecibodecompral.ORDEN_COMPRA_DOCUMENTO +"",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarla",
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
        eliminarOrden(verrecibodecompral);
      }
    });
}

function eliminarOrden(verrecibodecompral){
  templateStore.pageLoader({ mode: "on" });
  store.dispatch('eliminarOrdendecompraL', verrecibodecompral).then(() => {
    templateStore.pageLoader({ mode: "off" });
    emit('recibir');
  }).catch(err => {
    templateStore.pageLoader({ mode: "off" });
    swalError(err.response.data.error);
  });
}

</script>