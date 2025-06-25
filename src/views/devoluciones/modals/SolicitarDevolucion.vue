<template>
  <BaseBlock title="Solicitar Devolución" class="mb-0">
    <template v-if="verpedido" #options>
      <span v-if="(verpedido.despachado === 1)"
        class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1" title="Despachado">
        <i class="fa fa-truck-fast"></i> Despachado
      </span>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content tab-content fs-sm">
        <div v-if="devolucion_anterior" class="alert alert-danger">
          Esta factura ya tiene devoluciónes anterior, por lo que las cantidades se modificaron
        </div>
        <CabeceraPedido :verpedido="verpedido"></CabeceraPedido>

        <div v-if="detallepedido.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-sm-6">
            <div class="row">
              <label for="select-bodega-despacho" class="col-sm-4 col-form-label text-end">Motivo:</label>
              <div class="col-sm-8">
                <select class="form-select form-select-sm" id="select-bodega-despacho" name="select-bodega-despacho"
                  v-model="devolucion.motivo">
                  <option v-for="(bodega, index) in motivos_devolucion" :key="index" :value="bodega.motivo">
                    {{ bodega.motivo }}
                  </option>
                </select>
              </div>

            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <div class="alert alert-warning">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="devolucion-parcial" name="example-radios-default"
                  value="parcial" v-model="devolucion.tipo_devolucion"
                  style="width: 17px; height: 17px; margin: 2px 5px 8px;" />
                <label class="form-check-label" for="devolucion-parcial">Devolución Parcial</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="devolucion-total" name="example-radios-default"
                  value="total" v-model="devolucion.tipo_devolucion"
                  style="width: 17px; height: 17px; margin: 2px 5px 8px;" />
                <label class="form-check-label" for="devolucion-total">Devolución Total</label>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="alert alert-info">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="volver-a-facturar"
                  v-model="devolucion.volver_a_facturar" :disabled="despacho_parcial_item" />
                <label class="form-check-label" for="volver-a-facturar">Volver a facturar <span
                    class="text-muted text-sm" v-if="despacho_parcial_item">(No se puede volver a facturar hasta que se
                    despache todo el pedido)</span></label>
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-4" v-if="devolucion.volver_a_facturar">
          <div class="col-sm-12">
            <div class="alert alert-danger">
              <div class="row mb-2">
                <label for="select-cliente-refacturacion" class="col-sm-3 col-form-label text-left">Volver a facturar a
                  cliente:</label>
                <div class="col-sm-5">
                  <select class="form-select form-select-sm" id="select-cliente-refacturacion"
                    v-model="devolucion.cliente_volver_a_facturar_id" @change="changecliente()">
                    <option v-for="(cliente, index) in clientes_devolucion" :key="index" :value="cliente.id">
                      {{ cliente.CLI_RAZON_SOCIAL }}</option>
                  </select>
                </div>
              </div>
              <div class="row mb-2">
                <label for="select-sucursal-facturacion" class="col-sm-3 col-form-label text-left">Dirección de
                  facturación:</label>
                <div class="col-sm-5">
                  <select class="form-select form-select-sm" id="select-sucursal-facturacion"
                    name="select-sucursal-facturacion" v-model="devolucion.sucursal_facturacion_id">
                    <option v-for="(sucursalfac, index) in sucursales_facturacion" :key="index" :value="sucursalfac.id">
                      {{ sucursalfac.CLI_SUC_ID_DIRECCION }} - {{ sucursalfac.CLI_SUC_DIRECCION }}</option>
                  </select>
                </div>
              </div>
              <div class="row mb-2" v-if="verpedido.despacho === 'Despacho en ruta' && !verpedido.despachado">
                <label for="select-sucursal" class="col-sm-3 col-form-label text-left">Dirección de entrega:</label>
                <div class="col-sm-5">
                  <select class="form-select form-select-sm" id="select-sucursal-facturacion"
                    name="select-sucursal-facturacion" v-model="devolucion.sucursal_id">
                    <option v-for="(sucursalfac, index) in sucursales_facturacion" :key="index" :value="sucursalfac.id">
                      {{ sucursalfac.CLI_SUC_ID_DIRECCION }} - {{ sucursalfac.CLI_SUC_DIRECCION }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <label for="orden-de-compra" class="col-sm-3 col-form-label text-left fs-sm">Orden de compra:</label>
                <div class="col-sm-5">
                  <input v-model="verpedido.orden_de_compra" type="text" id="orden-de-compra"
                    class="form-control form-control-sm" placeholder="Orden de compra" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table v-if="detallepedido.data.length && !detallepedido.loading"
            class="table table-hover table-sm table-vcenter mt-4 fs-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>CTL</th>
                <th>UDM</th>
                <th class="text-end">Cantidad</th>
                <th class="text-end">Precio</th>

                <th class="text-end">Descuento</th>
                <th class="text-end">Total</th>
                <th class="text-end">Disponible</th>
                <th class="text-end"></th>
                <th class="text-end"></th>
                <th class="text-end">Devolver</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(articulo, index) in detallepedido.data" :key="index">
                <tr>
                  <td class="fs-sm">{{ index + 1 }}</td>
                  <td class="fs-sm">
                    {{ articulo.ART_CODIGO }}

                  </td>
                  <td class="fs-sm">
                    {{ articulo.ART_DESCRIPCION }}
                  </td>
                  <td class="fs-sm">
                    {{ articulo.ART_CODIGO_TRES_LETRAS }}
                  </td>
                  <td class="fs-sm">
                    {{ articulo.ART_PLAN_UMEDIDA }}
                  </td>
                  <td class="fs-sm text-end">
                    {{ articulo.ART_CANTIDAD }}
                  </td>

                  <td class="fs-sm text-end">
                    ${{ format4(parseFloat(articulo.ART_VALOR)) }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format4(parseFloat(articulo.ART_DESCUENTO)) }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat((articulo.ART_VALOR - articulo.ART_DESCUENTO) * articulo.ART_CANTIDAD)) }}
                  </td>

                  <td class="text-end">
                    {{ articulo.disponible }}
                  </td>
                  <td>
                    <span v-if="articulo.despacho"
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
                      title="Despachado">
                      <i class="fa fa-truck-fast"></i>
                    </span>
                  </td>
                  <td style="width: 31px" class="text-center">
                    <input v-if="articulo.disponible > 0" type="checkbox" class="form-check-input"
                      v-model="articulo.aplicar_todo" @change="aplicatodo(articulo)"
                      :disabled="devolucion.tipo_devolucion == 'total'" />
                  </td>
                  <td style="width: 80px">
                    <input v-if="articulo.disponible > 0" type="text" class="form-control text-end form-control-sm"
                      v-model="articulo.seleccionado" @change="aplicardevolucion(articulo)"
                      :disabled="devolucion.tipo_devolucion == 'total'" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">

    <div class="row">
      <label for="nota-interna" class="col-sm-2 col-form-label text-end">Observación:</label>
      <div class="col-sm-6">
        <input v-model="devolucion.observacion" type="text" id="orden-de-compra" class="form-control" />
      </div>
      <div class="col-sm-4 text-end">

        <button ref="botonEnviar" :disabled="!generar" type="button" class="btn btn-warning btn-sm mx-1"
          @click="enviarDevolucion(verpedido)">Solicitar Devolución</button>

        <button type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cerrar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from "vue";
import { useStore } from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import CabeceraPedido from "@/components/CabeceraPedido.vue";
import { formatPrice, format, format4 } from "@/functions";
const { verpedido } = defineProps({
  verpedido: Object,
})
const emit = defineEmits(["enviarDevolucion"]);

const store = useStore();
const detallepedido = computed(() => store.state.detallepedido_devolucion);
const generar = computed(() => store.state.generar);
const devolucion = ref(store.state.devolucion);
const motivos_devolucion = computed(() => store.state.motivos_devolucion);
const sucursales_facturacion = computed(() => store.state.sucursales_facturacion);
const botonEnviar = ref('botonEnviar');
const clientes_devolucion = computed(() => store.state.clientes_devolucion);
const devolucion_anterior = computed(() => store.state.devolucion_anterior);
const despacho_parcial = computed(() => store.state.despacho_parcial);
const despacho_parcial_item = computed(() => store.state.despacho_parcial_item);

function aplicatodo(articulo) {
  if (articulo.aplicar_todo == false) {
    articulo.seleccionado = "";
    checkgenerardevolucion();
    return;
  }
  articulo.seleccionado = articulo.disponible;
  checkgenerardevolucion();
}

function changecliente() {
  store.commit('setSucursalesFacturacion');
  devolucion.value.sucursal_facturacion_id = sucursales_facturacion.value[0].id;
  devolucion.value.sucursal_id = sucursales_facturacion.value[0].id;
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}
function aplicardevolucion(articulo) {

  if (!isInt(articulo.seleccionado) && articulo.ART_DECIMAL_CANTIDAD === 0) {
    swalError('Ingresar un número entero');
    articulo.seleccionado = 0;
    articulo.aplicar_todo = false;
    checkgenerardevolucion();
    return false;
  }

  if (isNaN(articulo.seleccionado)) {
    swalError("Ingresar un número");
    articulo.seleccionado = 0;
    articulo.aplicar_todo = false;
    checkgenerardevolucion();
    return false;
  }

  if (parseFloat(articulo.seleccionado) == 0) {
    articulo.aplicar_todo = false;
  } else if (parseFloat(articulo.seleccionado) <= parseFloat(articulo.disponible)) {
    articulo.aplicar_todo = true;
  } else if (parseFloat(articulo.seleccionado) > parseFloat(articulo.disponible)) {
    swalError("El número ingresado es mayor a la cantidad disponible");
    articulo.seleccionado = articulo.disponible;
    articulo.aplicar_todo = true;
  } else {
    articulo.aplicar_todo = true;
  }
  checkgenerardevolucion();
}

function checkgenerardevolucion() {
  let check = false;
  let total = true;

  detallepedido.value.data.map((articulo) => {
    if (articulo.seleccionado > 0) {
      check = true;
    }
    if ((parseFloat(articulo.seleccionado) < parseFloat(articulo.disponible)) || articulo.seleccionado === '') {
      total = false;
    }
  });
  if (check) {
    store.commit("setGenerar", true);
  } else {
    store.commit("setGenerar", false);
  }
  if (total) {
    devolucion.value.tipo_devolucion = 'total';
  }
}

function enviarDevolucion(verpedido) {
 
  botonEnviar.value.classList.add('hide');
  if (!devolucion.value.motivo) {
    swalError('Es necesario seleccionar un motivo');
    botonEnviar.value.classList.remove('hide');
    return;
  }

  if (devolucion.value.volver_a_facturar && !devolucion.value.sucursal_facturacion_id) {
    swalError('Es necesario seleccionar una dirección de facturación');
    botonEnviar.value.classList.remove('hide');
    return;
  }

  const data = reactive({
    devolucion: devolucion.value,
    pedido: verpedido,
    detallepedido: detallepedido.value.data,
  });

  store.dispatch('enviarDevolucion', data).then((res) => {
    if (res.success == true) {
      swalSuccess(res.message);
      botonEnviar.value.classList.remove('hide');
      emit('enviarDevolucion');
     
    }
  }).catch(err => {
    swalError(err.response.data.error)
    botonEnviar.value.classList.remove('hide');
    emit('enviarDevolucion');
  });
}



watch(
  () => devolucion.value.tipo_devolucion,
  () => {
    detallepedido.value.data.map(articulo => {
      if (devolucion.value.tipo_devolucion === 'total') {
        articulo.aplicar_todo = true;
      } else {
        articulo.aplicar_todo = false;
      }
      aplicatodo(articulo);
    })
  }
)
</script>
