<template>
  <BaseBlock title="Pedido por aprobar" class="mb-0">
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
                  <th class="fs-sm">Pedido</th>
                  <td class="fs-sm">{{verpedido.pedido}}</td>
                  <th class="fs-sm">RUC</th>
                  <td class="fs-sm">{{verpedido.CLI_RUC}}</td>
                  <th class="fs-sm">Razón Social</th>
                  <td class="fs-sm">{{verpedido.CLI_RAZON_SOCIAL}}</td>
              </tr>
              <tr>
                  <th class="fs-sm">P. de venta</th>
                  <td class="fs-sm">
                    {{verpedido.PTO_VTA_DESCRIPCION}}
                  </td>
                  
                  <th class="fs-sm">Cond. Pago</th>
                  <td class="fs-sm">{{ verpedido.COND_ID }}</td>
                  <th class="fs-sm">Usuario</th>
                  <td class="fs-sm">{{verpedido.USERID}}</td>
                  
              </tr>
              <tr>
                <th v-if="verpedido.nota_interna" class="fs-sm text-danger">Nota interna</th>
                <td v-if="verpedido.nota_interna" class="fs-sm text-danger" colspan="5">{{verpedido.nota_interna}}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="estadodecuenta.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
          </div>  
          <table v-if="estadodecuenta.data.cupoDisponible && !estadodecuenta.loading" class="table table-striped table-sm table-vcenter">
            <tbody>
              <tr>
                <th colspan="2" class="fs-sm text-end">Resumen del Pedido</th>
              </tr>
              
              <tr>
                <th class="fs-sm text-end">Subtotal</th>
                <th class="fs-sm text-end col-sm-1">${{ verpedido.subtotalmenosdescuento }}</th>
              </tr>
              <tr>
                <th class="fs-sm text-end">IVA</th>
                <th class="fs-sm text-end">${{ verpedido.iva }}</th>
              </tr>
              <tr>
                <th class="fs-sm text-end">Total</th>
                <th class="fs-sm text-end">
                  <a 
                    v-if="estadodecuenta.data && estadodecuenta.data.cupoDisponible.cupoDisponibleGp < verpedido.total" 
                    class="text-danger"
                    href="javascript:void(0);"
                    @click="swalInfo('El total del pedido supera el cupo disponible')"
                    >
                    ${{ verpedido.total }}
                  </a>
                  <span v-else>
                    ${{ verpedido.total }}
                  </span>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="estadodecuenta.data && !estadodecuenta.loading" class="row">
          <div v-if="estadodecuenta.data.cupoDisponible" class="col-sm-12">
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr class="table-success">
                    <th colspan="2">Cupo disponible</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cupo Asignado</td>
                    <td class="text-end">${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoAsignado)) }}</td>
                  </tr>
                  <tr>
                    <td>Cupo Disponible GP</td>
                    <td class="text-end">
                      <a 
                        v-if="estadodecuenta.data.cupoDisponible.cupoDisponibleGp < verpedido.total" 
                        class="text-danger"
                        href="javascript:void(0);"
                        @click="swalInfo('El total del pedido supera el cupo disponible')"
                        >
                        ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
                      </a>
                      <span v-else>
                        ${{ format(parseFloat(estadodecuenta.data.cupoDisponible.cupoDisponibleGp)) }}
                      </span>
                      
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="estadodecuenta.data.documentosVencidos" class="col-sm-12">
            <div class="table-responsive">
              <table class="table table-sm table-bordered table-striped fs-sm">
                <thead>
                  <tr class="table-success">
                    <th colspan="5">Documentos Vencidos</th>
                  </tr>
                  <tr>
                    <th>Factura</th>
                    <th class="text-end">Saldo pendiente</th>
                    <th class="text-end">Días vencidos</th>
                    <th class="text-end">Fecha emisión</th>
                    <th class="text-end">Fecha vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(documento, index) in estadodecuenta.data.documentosVencidos" :key="index">
                    <td>{{ documento.factura }}</td>
                    <td class="text-end">${{ format(parseFloat(documento.pendienteGpMc)) }}</td>
                    <td class="text-end">{{ documento.diasVencidos }}</td>
                    <td class="text-end">{{ documento.fEmision }}</td>
                    <td class="text-end">{{ documento.fVencimiento }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="estadodecuenta.data.documentosSinSoporte" class="col-sm-12">
            <div class="table-responsive">
              <table class="table table-sm table-bordered table-striped fs-sm">
                <thead>
                  <tr class="table-success">
                    <th colspan="4">Documentos sin soporte</th>
                  </tr>
                  <tr>
                    <th>Factura</th>
                    <th class="text-end">Saldo pendiente</th>
                    <th class="text-end">Fecha emisión</th>
                    <th class="text-end">Fecha vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(doc, index) in estadodecuenta.data.documentosSinSoporte" :key="index">
                    <td>{{ doc.factura }}</td>
                    <td class="text-end">${{ format(parseFloat(doc.saldoPendiente)) }}</td>
                    <td class="text-end">{{ doc.fEmision}}</td>
                    <td class="text-end">{{ doc.fVencimiento }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> 
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <div class="row">
      <label for="orden-de-compra" class="col-sm-2 col-form-label text-right">Mensaje:</label>
      <div class="col-sm-7">
        <input v-model="editable_aprobado_crediticio_mensaje" type="text"
          id="orden-de-compra" class="form-control" 
          placeholder="Motivo de rechazo"
          @change="guardarMensaje(verpedido)"
          />
      </div>
      <div class="col-sm-3 text-end">
        <button  type="button" class="btn btn-success btn-sm" @click="emit('aprobar')"><i class="fa fa-check"></i> Aprobar</button>
        <button  type="button" class="btn btn-danger btn-sm mx-2" @click="emit('rechazar')"><i class="fa fa-times"></i> Rechazar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { swalInfo } from "@/functions/swal-alert.js";
import {format} from "@/functions";

const props = defineProps({
  verpedido: Object,
  indexPedido: Number,
  tipo: String,
});

const store = useStore();
const estadodecuenta = computed(() => store.state.estadodecuenta);



function guardarMensaje(pedido){
  store.dispatch('guardarMensajePedido', pedido)
}




const emit = defineEmits(["update:verpedido", "aprobar", "rechazar"]);



onMounted(() => {
});
onBeforeUnmount(() => {
});
const editable_aprobado_crediticio_mensaje = computed({
  get: () => props.verpedido.aprobado_crediticio_mensaje,
  set: (value) => emit("update:verpedido", { aprobado_crediticio_mensaje: value }),
});
</script>
