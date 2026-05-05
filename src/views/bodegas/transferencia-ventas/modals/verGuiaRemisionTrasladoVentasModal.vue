<script setup>
import { storeToRefs } from "pinia";
import { onMounted, reactive, watch, toRef, computed } from 'vue';
import { useVehiclesStore } from "@/stores/bodegas/guiasremision/vehicles";
import { useSalesTransfersProcess } from "@/composables/bodegas/transferencia/useSalesTransferProcess";
import { useSalesTransfersGuideProcess } from "@/composables/bodegas/transferencia/useSalesTransfersGuideProcess";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import {
  swalSuccess,
  swalError,
  swalWarning
} from "@/functions/swal-alert.js";
const emit = defineEmits(["refresh", "closeModal"]);
const props = defineProps({
  header: { type: Object, default: () => ({}) },
  detalle: { type: Array, default: () => [] }
});
const vehicles = useVehiclesStore();
const {
  // state
  data,
  modo,
  tipoIdentificacion,
  pesoTotalItemsFmt,
  loading,
  createGuideTransfer,
  loadingVerifyGuide,
  verifyGuideTransfer,


  // funciones de valiaciones y generacion de guia 
  calcularPesoItems,
  assignHeader,
  assignDetail,
  clearChangeModeLocal,
  clearChangeModeExterno,
  validationModo,
  // despachar guia de transferencia de venta
  loadingSendGuide,
  sendGuideSalesTransfer,
} = useSalesTransfersGuideProcess();
const { printGuidePdf } = useSalesTransfersProcess();
const { vehicles: vehiculos, transporters: transportes, loading: loadingVehiculos } = storeToRefs(vehicles);

const flatPickrState = reactive({
  horaInicio: addMinutes(new Date(), 20), // Date
  horaFin: addDays(new Date(), 9),
  configDateTime24: {
    enableTime: true,
    minDate: new Date(),
    time_24hr: true,
    locale: Spanish,
    monthSelectorType: "static",
    dateFormat: 'Y-m-d H:i',
  },
});
function addMinutes(d, m) { const x = new Date(d); x.setMinutes(x.getMinutes() + m); return x }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function pad(n) { return String(n).padStart(2, '0') }
function formatDateTime(d) {
  const dt = (d instanceof Date) ? d : new Date(d)
  if (Number.isNaN(dt)) return ''
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}



const detalleRef = toRef(props, "detalle");
const activeItemsCount = computed(() => Array.isArray(detalleRef.value) ? detalleRef.value.filter(item => Number(item?.seleccionado) > 0).length : 0);

watch(() => [flatPickrState.horaInicio, flatPickrState.horaFin], ([a, b]) => {
  data.fecha_salida = formatDateTime(a)
  data.fecha_llegada = formatDateTime(b)
}, { immediate: true });

watch(() => [props.header, props.detalle], ([h, d]) => {
  calcularPesoItems(d ?? []);
  assignHeader(h);
  assignDetail(d);
},
  { immediate: true });

function changeVehicleTransport() {
  const selectedVehicle = vehiculos.value.find((item) => item.id === data.vehiculo_id);
  if (selectedVehicle?.transportista_id) {
    const existeTransportista = transportes.value.some(t => t.id === selectedVehicle.transportista_id);
    if (existeTransportista) {
      data.transporte_id = selectedVehicle.transportista_id;
    }
    else {
      data.transporte_id = '';
    }
  }
};


async function storeGuideRemision() {
  const isValid = validationModo();
  if (!isValid) {
    return;
  }
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
  const id = resp?.data?.id;
  const respDispatch = await sendGuideSalesTransfer(id);
  if (!respDispatch?.ok) {
    swalError(respDispatch?.message ?? 'No se pudo aplicar la transferencia.');
    return
  }
  swalSuccess(respDispatch?.message ?? 'Guía procesada correctamente.');
  const respdf = await printGuidePdf({ 'id': id });
  if (!respdf.ok) {
    swalError(respdf?.message || 'No se pudo generar el PDF.');
  }
  emit("closeModal");

}



onMounted(() => { });
</script>

<template>
  <BaseBlock :title="`Destino: ${props.header.destination}`" class="mb-0 modal-card shadow-lg" bordered themed
    transparent>
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <!-- header -->
    <div class="modal-header d-flex flex-wrap gap-2 align-items-center px-2 py-3 border-bottom">
      <div class="flex-grow-1">
        <div class="d-flex flex-wrap gap-1">
          <span class="pill bg-primary text-light"><i class="fa-solid fa-warehouse"></i> Origen: {{ props.header.origenDescription
          }}</span>
          <span class="pill bg-primary text-light"><i class="fa-solid fa-location-dot"></i>Destino: {{
            props.header.destination }}</span>
          <span class="pill bg-primary text-light"><i class="fa-solid fa-weight-hanging"></i>Peso total:
            <strong>{{ pesoTotalItemsFmt }} </strong> kg</span>
        </div>
      </div>
    </div>

    <!-- body -->
    <div class="row g-0">
      <!-- Left: Items -->
      <div class="col-lg-7 p-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="label-sm mb-2">Items</div>
        </div>
        <!-- table -->
        <div>
          <table class="table table-sm table-vcenter align-middle fs-sm table-fixed">
            <thead>
              <tr>
                <th scope style="width:40px" class="mini">CTL</th>
                <th scope class="mini">Descripción</th>
                <th scope style="width:40px" class="mini">UDM</th>
                <th scope class="text-end mini" style="width:50px">Cant</th>
                <th scope class="text-end mini" style="width:60px">Peso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(art, i) in props.detalle" :key="i">
                <td><span class="badge text-bg-dark border border-secondary "> {{ art.ART_CODIGO_TRES_LETRAS }}</span>
                </td>
                <td class="mini text-wrap">{{ art.ART_DESCRIPCION }}</td>
                <td><span class="badge rounded-pill text-bg-secondary">{{ art.ART_PLAN_UMEDIDA }}</span></td>
                <td class="text-end mini">{{ art.seleccionado }}</td>
                <td class="text-end mini">{{ art.ART_PESO }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope class=" mini">Peso total del despacho</th>
                <th scope class="mini text-end" style="width:auto">{{ pesoTotalItemsFmt }}kg</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


      <!-- Rigth :form -->
      <div class="col-lg-5 right-rail p-4">
        <div class="sticky-rail">
          <div class="mb-1">
            <div class="label-sm mb-1">Transporte</div>
            <div class="btn-group btn-group-sm mb-3">
              <input type="radio" class="btn-check" name="transporte" id="optLocal" checked value="local" v-model="modo"
                @click="clearChangeModeLocal()">
              <label class="btn btn-sm btn-outline-primary" for="optLocal"><i
                  class="fa-solid fa-truck-fast me-2"></i>Local</label>
              <input type="radio" class="btn-check" name="transporte" id="optExterno" value="externo" v-model="modo"
                @click="clearChangeModeExterno()">
              <label class="btn btn-sm  btn-outline-primary" for="optExterno"><i
                  class="fa-solid fa-people-carry-box me-2"></i>Externo</label>
            </div>
          </div>
          <!-- local -->

          <div class="row g-3 mb-3" v-show="modo === 'local'">
            <div class="col-12">
              <div class="label-sm mb-1">Vehículo</div>
              <select class="form-select form-select-sm" :required="modo === 'local'"
                @change="changeVehicleTransport($event.target.value)" :disabled="loadingVehiculos"
                v-model="data.vehiculo_id">
                <option value="">Selecciona vehículo…</option>
                <option v-for="v in vehiculos" :key="v.id" :value="v.id">{{ v.nombre }} - {{ v.placa }}</option>
              </select>
            </div>
            <div class="col-12">
              <div class="label-sm mb-1">Transportista</div>
              <select class="form-select form-select-sm" :required="modo === 'local'" :disabled="loadingVehiculos"
                v-model="data.transporte_id">
                <option value="">Selecciona transportista…</option>
                <option v-for="t in transportes" :key="t.id" :value="t.id">{{ t.nombre }} - {{ t.identificacion }}
                </option>
              </select>
            </div>

          </div>
          <!-- externo -->
          <div class="row g-3 mb-3" v-show="modo === 'externo'">
            <div class="col-12">
              <div class="label-sm mb-1">Nombre Transportista</div>
              <input type="text" class="form-control form-control-sm" placeholder="Nombre"
                v-model="data.nombre_transporte" :required="modo === 'externo'">
            </div>
            <div class="col-12 col-md-6">
              <div class="label-sm mb-1">Tipo Identificación</div>
              <select class="form-select form-select-sm" :required="modo === 'externo'"
                v-model="data.tipo_identificacion">
                <option value="">Selecciona Tipo</option>
                <option v-for="t in tipoIdentificacion" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <div class="label-sm mb-1">#Identificación</div>
              <input type="text" class="form-control form-control-sm" placeholder="Identificación"
                v-model="data.identificacion">
            </div>
            <div class="col-12">
              <div class="label-sm  mb-1">Placa del Vehiculo</div>
              <input type="text" class="form-control form-control-sm" placeholder="ABC-1234" v-model="data.placa">
            </div>
          </div>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="label-sm mb-12">Fecha / Hora salida</div>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-regular fa-clock"></i></span>
                <flat-pickr id="example-flatpickr-datetime24" class="form-control form-control-sm"
                  :config="flatPickrState.configDateTime24" v-model="flatPickrState.horaInicio" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="label-sm mb-1">Fecha / Hora llegada</div>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-regular fa-clock"></i></span>
                <flat-pickr id="example-flatpickr-datetime25" class="form-control form-control-sm"
                  :config="flatPickrState.configDateTime24" v-model="flatPickrState.horaFin" />
              </div>
            </div>
            <div class="col-12">
              <div class="label-sm mb-1">Observación</div>
              <textarea class="form-control form-control-sm" rows="3" placeholder="Notas del despacho…"
                v-model="data.observacion"></textarea>
            </div>
            <div class="col-12">
              <div class="label-sm mb-1">Ruta</div>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-route"></i></span>
                <input type="text" class="form-control form-control-sm" placeholder="Ej: Guayaquil – Ambato"
                  v-model="data.ruta" />
              </div>
            </div>
          </div>
          <!-- Totals / CTA -->
          <div class="totals p-3 mt-4 bg-primary text-light">
            <div class="d-flex justify-content-between mini "><span>Ítems</span><strong>{{ activeItemsCount }}</strong>
            </div>
            <div class="d-flex justify-content-between mini "><span>Peso total</span><strong>{{ pesoTotalItemsFmt
                }}kg</strong></div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-dark btn-sm" data-bs-dismiss="modal">
              Cancelar</button>
            <button class="btn btn-primary btn-sm" @click="storeGuideRemision()" :disabled="loading"><i
                class="fa-solid fa-file-lines me-2"></i>Generar</button>
          </div>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>


<style lang="css" scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .25rem .6rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: .8rem;
  color: var(--muted)
}


.right-rail {
  border-left: 2px solid var(--line)
}

.sticky-rail {
  position: sticky;
  top: 1rem
}

.totals {
  border: 5px;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.label-sm {
  font-size: .8rem;
  color: var(--muted)
}

.segmented .btn-check:checked {
  border-color: var(--accent-2);
  color: #e0f2fe
}

.mini {
  font-size: .85rem
}

.table-fixed {
  border-collapse: separate;
  /* evita saltos raros al bloquear */
  border-spacing: 0;
  table-layout: fixed;
  /* ayuda a alinear columnas */
}

/* volvemos bloques las secciones */
.table-fixed thead,
.table-fixed tbody,
.table-fixed tfoot {
  display: block;
}

/* alto y scroll solo para el cuerpo */
.table-fixed tbody {
  max-height: 500px;
  /* ← ajusta según tu UI */
  overflow-y: auto;
  overflow-x: hidden;
}

/* alineamos columnas por índice */
.table-fixed thead tr,
.table-fixed tfoot tr {
  display: grid;
  grid-template-columns: 40px 1fr 40px 50px 60px;
  /* CTL, Descripción, UDM, Cant, Peso */
}

.table-fixed tbody tr {
  display: grid;
  grid-template-columns: 40px 1fr 40px 50px 60px;
  /* mismas columnas que thead/tbody */
}

.table-fixed tfoot th:first-child {
  grid-column: 1 / span 3;
  text-align: start;
  /* equivalente a tu .text-end */
  padding-right: .5rem;
  /* opcional */
  white-space: nowrap;
  /* evita saltos raros */
}

/* el total va en la 5ta columna y a la derecha */
.table-fixed tfoot th:last-child {
  grid-column: 4 / span 2;
  text-align: left;
}

/* opcional: que el header quede encima del body si usas z-index */
.table-fixed thead {
  z-index: 2;
  position: relative;
}

.table-fixed tfoot {
  z-index: 2;
  position: relative;
}
</style>
