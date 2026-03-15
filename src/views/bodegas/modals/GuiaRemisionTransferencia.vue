<script setup>
import { computed, ref, reactive } from "vue";
import { useStore } from 'vuex'
import Swal from "sweetalert2";
import flatPickr from 'vue-flatpickr-component';
import { useTemplateStore } from "@/stores/template";
import { formatPrice } from "@/functions";
import { swalSuccess, swalError, swalWarning } from "@/functions/swal-alert";
import { useSalesTransfersGuideProcess } from '@/composables/bodegas/transferencia/useSalesTransfersGuideProcess';
import { useRepositionGuideProcess } from '@/composables/bodegas/reposiciones/useRepositionGuideProcess';

const {
  tipoIdentificacion,
  loading,
  createGuideTransfer,
  loadingVerifyGuide,
  verifyGuideTransfer
} = useSalesTransfersGuideProcess();
const {
  loadingReposition,
  createGuideReposition
} = useRepositionGuideProcess();
const store = useStore();
const templateStore = useTemplateStore();
const picking = computed(() => store.state.picking);
const despacho = ref(store.state.despacho);
const transportistas = computed(() => store.state.transportistas);
const vehiculos = computed(() => store.state.vehiculos);
const transportista = computed(() => store.state.transportista);
const vehiculo = computed(() => store.state.vehiculo);
const flatPickrState = computed(() => store.state.flatPickrState);
const observacion = ref('');
const ruta = ref('');
const boton_generar = ref('boton_generar');
const { currentBodega } = defineProps({
  currentBodega: Object,
});


function changeVehiculo() {
  if (vehiculos.value.find((item) => item.id === vehiculo.value.vehiculo_id).transportista_id) {
    var id = vehiculos.value.find((item) => item.id === vehiculo.value.vehiculo_id).transportista_id;
    transportista.value.transportista_id = transportistas.value.find((item) => item.id === id).id;
  }
}

async function generarGuia() {

  let vehi;
  let trans;
  if (despacho.value == 'Retiro en bodega') {
    if (!transportista.value.nombre || !transportista.value.identificacion || !transportista.value.tipo_identificacion || !vehiculo.value.placa) {
      swalWarning('Llenar datos de transporte externo');
      return;
    }
  } else {
    if (!transportista.value.transportista_id) {
      swalWarning('Seleccionar transportista');
      return;
    }
  }

  if (despacho.value == 'Retiro en bodega') {
    trans = transportista.value;
    vehi = vehiculo.value;
  } else {
    trans = transportistas.value.find(item => item.id === transportista.value.transportista_id);
    vehi = vehiculos.value.find(item => item.id === vehiculo.value.vehiculo_id);
  }

  const data = {
    transportista: trans,
    vehiculo: vehi,
    fecha_inicio: flatPickrState.value.horaInicio,
    fecha_fin: flatPickrState.value.horaFin,
    items: picking.value.data,
    observacion: observacion.value,
    ruta: ruta.value,
    tipo: currentBodega.tipo,
  };

  // 1) consultar

  // 2) generar guia de traslado de venta
  if (currentBodega.tipo == 'transferencia') {

    const respVerify = await verifyGuideTransfer(data);
    if (!respVerify.ok) {
      if (respVerify?.status >= 400 && respVerify?.status < 500) {
        swalWarning(respVerify?.message);
        return
      }
      if (respVerify?.status >= 500) {
        swalError(respVerify?.message);
        return;
      }
    }

    const resp = await createGuideTransfer(data);
    if (!resp.ok) {
      if (resp?.status >= 400 && resp?.status < 500) {
        swalWarning(resp?.message);
        return
      }
      if (resp?.status >= 500) {
        swalError(resp?.message);
        return;
      }
    }
    clearCampos();
    emit('generarGuia');
  }
  if (currentBodega.tipo == 'reposicion') {
    const respReposition = await createGuideReposition(data);
    if (!respReposition.ok) {
      if (respReposition?.status >= 400 && respReposition?.status < 500) {
        swalWarning(respReposition?.message);
        return
      }
      if (respReposition?.status >= 500) {
        swalError(respReposition?.message);
        return;
      }
    }
    clearCampos();
    emit('generarGuia');
  }

}

function clearCampos() {
  observacion.value = '';
  ruta.value = '';
}

const emit = defineEmits(["generarGuia"]);

</script>
<template>
  <BaseBlock v-if="currentBodega.bodega && currentBodega.bodega != ''"
    :title="'Generar guía de remisión hacia: ' + currentBodega.bodega" class="mb-0">
    <div class="table-responsive">
      <table v-if="!picking.loading && picking.data && picking.data.length"
        class="table table-striped table-sm table-vcenter">
        <thead>
          <tr>

            <th>CTL</th>
            <th>Descripción</th>
            <th>UDM</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Peso</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="(articulo, index) in picking.data" :key="index">

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
              {{ articulo.seleccionado }}
            </td>
            <td class="fs-sm text-end">
              {{ formatPrice(articulo.seleccionado * articulo.ART_PESO) }}
            </td>
          </tr>

          <tr>
            <th colspan="5">&nbsp;</th>
          </tr>
          <tr>
            <th colspan="4" class="fs-sm text-end">Peso total del despacho</th>
            <th class="fs-sm text-end">{{ formatPrice(picking.peso) }}</th>

          </tr>
        </tbody>
      </table>
      <table v-if="!picking.loading && picking.data && picking.data.length" class="table table-sm table-vcenter fs-sm">
        <tbody>
          <tr>
            <td class="text-end">Bodega origen: </td>
            <td>{{ picking.data[0].bodega_origen }}</td>
            <td class="text-end">Bodega destino: </td>
            <td>{{ picking.data[0].bodega_destino }}</td>
          </tr>
          <tr>
            <td class="text-end">Transporte: </td>
            <td>
              <select class="form-select" id="example-select-floating" name="example-select-floating"
                aria-label="Estado" v-model="despacho">
                <option value="Retiro en bodega">Externo</option>
                <option value="Despacho en ruta">Local</option>
              </select>
            </td>
          </tr>
          <tr v-if="despacho == 'Despacho en ruta'">
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
          <template v-if="despacho == 'Retiro en bodega'">
            <tr>
              <td class="text-end">Nombre Transportista: </td>
              <td>
                <input type="text" class="form-control" id="nombre" v-model="transportista.nombre" />
              </td>
              <td class="text-end">Tipo identificacion: </td>
              <td>
                <select class="form-select" v-model="transportista.tipo_identificacion" id="tipo_identificacion">
                  <option value="04">RUC</option>
                  <option value="05">Cédula</option>
                  <option value="06">Pasaporte</option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="text-end"># Identificacion: </td>
              <td>
                <input type="text" class="form-control" id="identificacion" v-model="transportista.identificacion" />
              </td>
              <td class="text-end">Placa de vehículo: </td>
              <td>
                <input type="text" class="form-control" id="placa" v-model="vehiculo.placa" />
              </td>
            </tr>
          </template>
          <tr>
            <td class="text-end">Fecha / Hora salida: </td>
            <td>
              <flat-pickr id="example-flatpickr-datetime24" class="form-control" v-model="flatPickrState.horaInicio"
                :config="flatPickrState.configDateTime24" />
            </td>
            <td class="text-end">Fecha / Hora llegada: </td>
            <td><flat-pickr id="example-flatpickr-datetime25" class="form-control" v-model="flatPickrState.horaFin"
                :config="flatPickrState.configDateTime24" /></td>
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
              <input type="text" class="form-control" id="ruta" placeholder="Ej: Guayaquil - Ambato" v-model="ruta" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-secondary btn-sm mx-2" data-bs-dismiss="modal"> Cancelar</button>
    <button ref="boton_generar" type="button" class="btn btn-success btn-sm mx-2" @click="generarGuia()"
      :disabled="loading || loadingVerifyGuide || loadingReposition"><i class="fa fa-file-lines"></i> Generar</button>
  </div>
</template>
