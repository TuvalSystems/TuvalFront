<template>
  <BaseBlock title="Generar guía de remisión" class="mb-0" v-if="verpedido.pedido">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter">
        <tbody>
          <tr>
            <th class="fs-sm">#Orden</th>
            <td class="fs-sm">{{ verpedido.orden }}</td>
            <th class="fs-sm">Despacho</th>
            <td class="fs-sm">{{ verpedido.despacho }}</td>
            <td colspan="2"></td>
          </tr>
          <tr v-if="verpedido.pedido.factura !== ''">
            <th class="fs-sm">Factura</th>
            <td class="fs-sm">{{ verpedido.pedido.factura }}</td>
            <th v-if="verpedido.pedido.cotizacion" class="fs-sm">Cotización Origen</th>
            <td v-if="verpedido.pedido.cotizacion" class="fs-sm" colspan="3">
              {{ verpedido.pedido.cotizacion }}
            </td>
            <td v-if="!verpedido.pedido.cotizacion" class="fs-sm" colspan="4"></td>
          </tr>
          <tr>
            <th class="fs-sm">Pedido</th>
            <td class="fs-sm">{{ verpedido.pedido.pedido }}</td>
            <th class="fs-sm">RUC</th>
            <td class="fs-sm">{{ verpedido.pedido.CLI_RUC }}</td>
            <th class="fs-sm">Razón Social</th>
            <td class="fs-sm">{{ verpedido.pedido.CLI_RAZON_SOCIAL }}</td>
          </tr>
          <tr>
            <th class="fs-sm">P. de venta</th>
            <td class="fs-sm">
              {{ verpedido.pedido.PTO_VTA_DESCRIPCION }}
            </td>

            <th class="fs-sm">Cond. Pago</th>
            <td class="fs-sm">
              {{ verpedido.pedido.COND_ID }}
            </td>
            <th class="fs-sm">Usuario</th>
            <td class="fs-sm">{{ verpedido.pedido.USERID }}</td>
          </tr>
          <tr>
            <th class="fs-sm">Bodega</th>
            <td class="fs-sm">
              {{ verpedido.pedido.BOD_BODEGA }}
            </td>
            <th class="fs-sm">% Descuento</th>
            <td class="fs-sm">
              {{ verpedido.pedido.porcentage_descuento }}
            </td>

            <th class="fs-sm">Fecha/hora</th>
            <td class="fs-sm">
              {{ verpedido.pedido.created_at }}
            </td>
          </tr>
        </tbody>
      </table>
      <table class="table table-sm table-vcenter fs-sm">
        <tbody>
          <tr>
            <td class="text-end">{{ verpedido.pedido.despacho }} Transporte:</td>
            <td>
              <select class="form-select" id="example-select-floating" name="example-select-floating"
                aria-label="Estado" v-model="verpedido.pedido.despacho">
                <option value="Retiro en bodega">Externo</option>
                <option value="Despacho en ruta">Local</option>
              </select>
            </td>
          </tr>
          <tr v-if="verpedido.pedido.despacho === 'Despacho en ruta'">
            <td class="text-end">Vehículo:</td>
            <td>
              <select class="form-select" id="example-select-floating" name="example-select-floating"
                aria-label="Estado" v-model="vehiculo.vehiculo_id" @change="changeVehiculo()">
                <option v-for="(vehiculo, index) in vehiculos" :key="index" :value="vehiculo.id">
                  {{ vehiculo.nombre }} - {{ vehiculo.placa }}
                </option>
              </select>
            </td>
            <td class="text-end">Transportista:</td>
            <td>
              <select class="form-select" id="example-select-floating" name="example-select-floating"
                aria-label="Estado" v-model="transportista.transportista_id">
                <option v-for="(transportista, index) in transportistas" :key="index" :value="transportista.id">
                  {{ transportista.nombre }} - {{ transportista.identificacion }}
                </option>
              </select>
            </td>
          </tr>
          <template v-if="verpedido.pedido.despacho === 'Retiro en bodega'">
            <tr>
              <td class="text-end">Nombre Transportista:</td>
              <td>
                <input type="text" class="form-control" id="nombre" v-model="transportista.nombre" />
              </td>
              <td class="text-end">Tipo identificacion:</td>
              <td>
                <select class="form-select" v-model="transportista.tipo_identificacion" id="tipo_identificacion">
                  <option value="04">RUC</option>
                  <option value="05">Cédula</option>
                  <option value="06">Pasaporte</option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="text-end"># Identificacion:</td>
              <td>
                <input type="text" class="form-control" id="identificacion" v-model="transportista.identificacion" />
              </td>
              <td class="text-end">Placa de vehículo:</td>
              <td>
                <input type="text" class="form-control" id="placa" v-model="vehiculo.placa" />
              </td>
            </tr>
          </template>
          <tr>
            <td class="text-end">Fecha / Hora salida:</td>
            <td>
              <flat-pickr id="example-flatpickr-datetime24" class="form-control" v-model="flatPickrState.horaInicio"
                :config="flatPickrState.configDateTime24" />
            </td>
            <td class="text-end">Fecha / Hora llegada:</td>
            <td>
              <flat-pickr id="example-flatpickr-datetime24" class="form-control" v-model="flatPickrState.horaFin"
                :config="flatPickrState.configDateTime24" />
            </td>
          </tr>
          <tr>
            <td class="text-end">Observación:</td>
            <td colspan="3">
              <textarea class="form-control" id="telefono" v-model="observacion"></textarea>
            </td>
          </tr>
          <tr>
            <td class="text-end">Ruta:</td>
            <td colspan="3">
              <input type="text" class="form-control" id="ruta" placeholder="Ej: Guayaquil – Ambato"
                v-model="vehiculo.ruta" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-sm-12 text-end">
      <button type="button" class="btn btn-sm btn-primary" @click="seleccionartodos()">
        <i class="fa fa-hand-pointer"></i> Seleccionar todos
      </button>
    </div>
    <div class="table-responsive">
      <table v-if="detalle_orden_despacho.length" class="table table-striped table-sm table-vcenter">
        <thead>
          <tr>
            <th>CTL</th>
            <th>Descripción</th>
            <th>UDM</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Reservado</th>
            <th class="text-end">Trasladado</th>
            <th class="text-end">Pendiente</th>
            <th colspan="2"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(articulo, index) in detalle_orden_despacho" :key="index">
            <tr :class="(articulo.reservado > 0 && articulo.reservado === articulo.ART_CANTIDAD
              ? 'table-success'
              : '') ||
              (articulo.reservado > 0 && articulo.pendiente === 0
                ? 'table-success'
                : '') ||
              (articulo.reservado > 0 && articulo.pendiente > 0 ? 'table-warning' : '')
              ">
              <td class="fs-sm">
                {{ articulo.ART_CODIGO_TRES_LETRAS }}
              </td>
              <td class="fs-sm">
                {{ articulo.ART_DESCRIPCION }}
              </td>
              <td class="fs-sm">
                {{ articulo.ART_PLAN_UMEDIDA }}
              </td>
              <td class="fs-sm text-end">
                {{ articulo.ART_CANTIDAD }}
              </td>
              <td class="text-end">
                {{ articulo.reservado }}
              </td>
              <td class="text-end">
                {{ articulo.trasladado }}
              </td>
              <td class="text-end">
                {{ articulo.pendiente }}
              </td>
              <td style="width: 31px" class="text-center">
                <input v-if="articulo.pendiente > 0" type="checkbox" class="form-check-input"
                  v-model="articulo.aplicar_todo" @change="aplicatodo(articulo)" />
              </td>
              <td style="width: 80px">
                <input v-if="articulo.pendiente > 0" type="text" class="form-control text-end"
                  v-model="articulo.seleccionado" @change="aplicartraslado(articulo)" />
              </td>
            </tr>
          </template>
          <tr>
            <th colspan="9">&nbsp;</th>
          </tr>
          <tr>
            <th colspan="8" class="fs-sm text-end">Peso total del despacho</th>
            <th class="fs-sm text-end">{{ formatPrice(pesototal) }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button :disabled="disabledGenerarGuia" type="button" class="btn btn-sm btn-success mx-2"
      @click="generarGuia(verpedido)">
      <i class="fa fa-file-lines"></i> Generar
    </button>
    <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal">
      Cerrar
    </button>
  </div>
</template>
<script setup>
import { computed, ref, reactive } from "vue";
import { useStore } from "vuex";
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import flatPickr from 'vue-flatpickr-component';

import { formatPrice } from "../../../functions";


function addMinutes(numOfMinutes, date = new Date()) {
  date.setMinutes(date.getMinutes() + numOfMinutes);

  return date;
}
function addDays(days, date = new Date()) {
  date.setDate(date.getDate() + days);
  return date;
}

const store = useStore();
const templateStore = useTemplateStore();
const detalle_orden_despacho = computed(() => store.state.detalle_orden_despacho);
const transportistas = computed(() => store.state.transportistas);
const vehiculos = computed(() => store.state.vehiculos);
const transportista = computed(() => store.state.transportista);
const vehiculo = computed(() => store.state.vehiculo);
const flatPickrState = computed(() => store.state.flatPickrState);
const observacion = ref("");
const generar = computed(() => store.state.generar);
const pesototal = ref(0);

const { verpedido } = defineProps({
  verpedido: Object,
});

const emit = defineEmits(["generarGuia", "cerrarGuia"]);

function changeVehiculo() {
  if (vehiculos.value.find((item) => item.id === vehiculo.value.vehiculo_id).transportista_id) {
    const id = vehiculos.value.find((item) => item.id === vehiculo.value.vehiculo_id).transportista_id;
    transportista.value.transportista_id = transportistas.value.find((item) => item.id === id).id;
  }
}

function aplicatodo(traslado) {
  if (traslado.aplicar_todo === false) {
    traslado.seleccionado = "";
    checkgenerarguia();
    return;
  }
  traslado.seleccionado = traslado.pendiente;
  checkgenerarguia();
}

function seleccionartodos() {
  detalle_orden_despacho.value.map((traslado) => {
    traslado.seleccionado = traslado.pendiente;
    traslado.aplicar_todo = true;
  });
  checkgenerarguia();
}

function checkgenerarguia() {
  let check = false;
  pesototal.value = 0;
  detalle_orden_despacho.value.map((traslado) => {
    if (traslado.seleccionado > 0) {
      check = true;
      pesototal.value += traslado.seleccionado * traslado.ART_PESO;
    }
  });
  if (check) {
    store.commit("setGenerar", true);
  } else {
    store.commit("setGenerar", false);
  }
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function aplicartraslado(traslado) {

  if (!isInt(traslado.seleccionado) && traslado.ART_DECIMAL_CANTIDAD === 0) {
    swalError('Ingresar un número entero');
    traslado.seleccionado = 0;
    traslado.aplicar_todo = false;
    checkgenerarguia();
    return false;
  }

  if (isNaN(traslado.seleccionado)) {
    swalError("Ingresar un número");
    traslado.seleccionado = 0;
    traslado.aplicar_todo = false;
    checkgenerarguia();
    return false;
  }

  if (parseFloat(traslado.seleccionado) === 0) {
    traslado.aplicar_todo = false;
  } else if (parseFloat(traslado.seleccionado) < 0) {
    traslado.aplicar_todo = false;
    swalError("No se puede ingresar números negativos");
    traslado.seleccionado = null;
  } else if (parseFloat(traslado.seleccionado) <= parseFloat(traslado.pendiente)) {
    traslado.aplicar_todo = true;
  } else if (parseFloat(traslado.seleccionado) > parseFloat(traslado.pendiente)) {
    swalError("El número ingresado es mayor a la cantidad pendiente");
    traslado.seleccionado = traslado.pendiente;
    traslado.aplicar_todo = true;
  } else {
    traslado.aplicar_todo = true;
  }
  checkgenerarguia();
}

let disabledGenerarGuia = ref(false);
async function generarGuia(verpedido) {
  let itemsDespacho = detalle_orden_despacho.value.filter((item) => item.seleccionado > 0);
  if (itemsDespacho.length === 0) {
   return  swalError('Seleccionar al menos un item para generar la guia');
  }
  // evita doble click
  if (disabledGenerarGuia.value) return;

  // 1. Validaciones
  const esRetiro = verpedido.pedido.despacho === "Retiro en bodega";

  if (esRetiro) {
    if (
      !transportista.value.nombre ||
      !transportista.value.identificacion ||
      !transportista.value.tipo_identificacion ||
      !vehiculo.value.placa
    ) {
      swalError("Llenar datos de transporte externo");
      return;
    }
  } else {
    if (!transportista.value.transportista_id) {
      swalError("Seleccionar transportista");
      return;
    }
  }

  // 2. Armar transportista / vehículo
  let trans, vehi;
  if (esRetiro) {
    trans = transportista.value;
    vehi = vehiculo.value;
  } else {
    trans = transportistas.value.find(
      (item) => item.id === transportista.value.transportista_id
    );
    vehi = vehiculos.value.find(
      (item) => item.id === vehiculo.value.vehiculo_id
    );
  }

  // 3. bloquear UI
  disabledGenerarGuia.value = true;
  templateStore.pageLoader({ mode: "on" });

  // 4. payload (objeto plano, no reactive)
  const data = {
    pedido: verpedido,
    transportista: trans,
    vehiculo: vehi,
    fecha_inicio: flatPickrState.value.horaInicio,
    fecha_fin: flatPickrState.value.horaFin,
    items: itemsDespacho,
    observacion: observacion.value,
    // si el vehículo no tiene ruta, que no reviente:
    ruta: vehiculo.value?.ruta ?? null,
  };

  try {
    await store.dispatch("generarGuiaVenta", data);
    emit("generarGuia");
  } catch (err) {
    console.log(err, "error");
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Error al generar la guía";
    swalError(msg);
  } finally {
    templateStore.pageLoader({ mode: "off" });
    disabledGenerarGuia.value = false;
  }
}

</script>
