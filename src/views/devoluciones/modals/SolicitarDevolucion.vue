<template>
      <div class="block-content tab-content fs-sm">
        <div v-if="devolucion_anterior" class="alert alert-danger">
          Esta factura ya tiene devoluciónes anterior, por lo que las cantidades se modificaron
        </div>
        <CabeceraPedido :verpedido="pedidoLocal"></CabeceraPedido>

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
              <div class="row mb-2" v-if="pedidoLocal.despacho === 'Despacho en ruta' && !pedidoLocal.despachado">
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
                  <div class="input-group">

                    <input v-model="pedidoLocal.orden_de_compra" type="text" id="orden-de-compra"  :maxlength="max_length_orden_compra"
                      class="form-control form-control-sm" placeholder="Orden de compra" />
                    <span v-if="pedidoLocal.orden_de_compra" class="input-group-text input-group-text-alt">{{ max_length_orden_compra
                      -
                      pedidoLocal.orden_de_compra.length
                      }}</span>
                  </div>
                </div>
              </div>
              <div class="row">
                <label for="orden-de-compra" class="col-sm-3 col-form-label text-left fs-sm">Nota Cliente:</label>
                <div class="col-sm-5">
                  <div class="input-group">

                    <textarea id="nota-cliente" class="form-control" rows="4" :maxlength="max_length_nota"
                      v-model.trim="pedidoLocal.nota_cliente"></textarea>
                    <span v-if="pedidoLocal.nota_cliente" class="input-group-text input-group-text-alt">{{ max_length_nota
                      -
                      pedidoLocal.nota_cliente.length
                      }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table v-if="detallepedido.data.length"
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

  <div class="block-content block-content-full bg-body">

    <div class="row">
      <label for="nota-interna" class="col-sm-2 col-form-label text-end">Observación:</label>
      <div class="col-sm-6">
        <input v-model="devolucion.observacion" type="text" id="orden-de-compra" class="form-control" />
      </div>
      <div class="col-sm-4 text-end">

        <button  :disabled="!generar || enviando" type="button" class="btn btn-warning btn-sm mx-1"
          @click="enviarDevolucion(pedidoLocal)">{{ enviando ? "Enviando..." : "Solicitar Devolución" }}</button>

        <button type="button" class="btn btn-primary btn-sm mx-1" :disabled="enviando" @click="emit('cerrar')"> Cerrar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useSendDevolution } from "@/composables/devoluciones/useSendDevolution";
import { swalSuccess, swalError, swalWarning } from "@/functions/swal-alert.js";
import CabeceraPedido from "@/components/CabeceraPedido.vue";
import { format, format4 } from "@/functions";
const props = defineProps({
  verpedido: { type: Object, required: true },
  info: { type: Object, required: true },
});
const emit = defineEmits(["enviarDevolucion", "cerrar", "enviando"]);
const { loading: enviando, sendDevolution } = useSendDevolution();
const pedidoLocal = ref({ ...props.verpedido });
const detallepedido = computed(() => ({ data: props.info.detalle ?? [] }));
const generar = ref(false);
watch(enviando, value => emit('enviando', value), { flush: 'sync' });
const devolucion = ref({
  volver_a_facturar: false,
  motivo: null,
  cliente_volver_a_facturar_id: props.verpedido.cliente_id,
  sucursal_facturacion_id: props.verpedido.sucursal_facturacion_id,
  sucursal_id: props.verpedido.sucursal_id,
  tipo_devolucion: "parcial",
  observacion: null,
});
const motivos_devolucion = computed(() => props.info.motivos ?? []);
const clientes_devolucion = computed(() => props.info.clientes ?? []);
const sucursales_facturacion = computed(() => clientes_devolucion.value.find(
  cliente => cliente.id === devolucion.value.cliente_volver_a_facturar_id
)?.sucursales ?? []);
const devolucion_anterior = computed(() => props.info.devolucion_anterior);
const despacho_parcial_item = computed(() => !!props.info.items_devueltos);
const max_length_nota = ref(300);
const max_length_orden_compra = ref(20);
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
  devolucion.value.sucursal_facturacion_id = sucursales_facturacion.value[0]?.id ?? null;
  devolucion.value.sucursal_id = sucursales_facturacion.value[0]?.id ?? null;
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
  let total = detallepedido.value.data.length > 0;

  detallepedido.value.data.map((articulo) => {
    if (articulo.seleccionado > 0) {
      check = true;
    }
    if ((parseFloat(articulo.seleccionado) < parseFloat(articulo.disponible)) || articulo.seleccionado === '') {
      total = false;
    }
  });
  generar.value = check;
  if (total) {
    devolucion.value.tipo_devolucion = 'total';
  }
}

async function enviarDevolucion(verpedido) {
  if (enviando.value) return;
  if (!devolucion.value.motivo) {
    swalWarning('Es necesario seleccionar un motivo');
    return;
  }
  if (devolucion.value.volver_a_facturar && !devolucion.value.sucursal_facturacion_id) {
    swalWarning('Es necesario seleccionar una dirección de facturación');
    return;
  }

  const result = await sendDevolution({
    devolucion: devolucion.value,
    pedido: verpedido,
    detallepedido: detallepedido.value.data,
  });
  if (!result.ok) {
    if (!result.handled && !result.canceled) {
      const message = result.message || 'No se pudo solicitar la devolución';
      (result.status >= 500 ? swalError : swalWarning)(message);
    }
    return;
  }

  await nextTick();
  emit('enviarDevolucion');
  swalSuccess(result.message || 'La devolución ha sido solicitada.');
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
