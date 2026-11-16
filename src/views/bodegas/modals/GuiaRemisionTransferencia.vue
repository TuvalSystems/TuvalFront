<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from 'vuex'
import flatPickr from 'vue-flatpickr-component';

import { formatPrice } from "@/functions";
import { swalError, swalWarning } from "@/functions/swal-alert";
import { useSalesTransfersGuideProcess } from '@/composables/bodegas/transferencia/useSalesTransfersGuideProcess';
import { useRepositionGuideProcess } from '@/composables/bodegas/reposiciones/useRepositionGuideProcess';
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";

const {
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

const picking = computed(() => store.state.picking);
const despacho = ref(store.state.despacho);
const transportistas = computed(() => store.state.transportistas);
const vehiculos = computed(() => store.state.vehiculos);
const transportista = computed(() => store.state.transportista);
const vehiculo = computed(() => store.state.vehiculo);
const flatPickrState = computed(() => store.state.flatPickrState);
const observacion = ref('');
const ruta = ref('');
const maxLengthPlaca = 10;

const boton_generar = ref('boton_generar');
const props = defineProps({
  currentBodega: Object,
});

const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);
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
    if (!transportista.value.nombre) {
      swalWarning("Ingrese el nombre del transportista");
      return;
    }

    if (!validateTransportIdentification(true)) {
      return;
    }

    if (!vehiculo.value.placa) {
      swalWarning("Ingrese la placa del vehículo");
      return;
    }
  } else {
    if (!transportista.value.transportista_id) {
      swalWarning("Seleccionar transportista");
      return;
    }

    if (!vehiculo.value.vehiculo_id) {
      swalWarning("Seleccionar vehículo");
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
    tipo: props.currentBodega.tipo,
  };

  // 1) consultar

  // 2) generar guia de traslado de venta
  if (props.currentBodega.tipo == 'transferencia') {

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
  if (props.currentBodega.tipo == 'reposicion') {
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


/** Validación tipo identificación transportista externo */

const transportIdentifyError = ref("");

const isExternalMode = computed(() => {
  return despacho.value === "Retiro en bodega";
});

const selectedTransportTypeIdentify = computed(() => {
  return (
    listTypeIdentify.value.find(
      (tipo) =>
        String(tipo.codigo) === String(transportista.value.tipo_identificacion)
    ) ?? null
  );
});

const transportIdentifyMinSize = computed(() => {
  return Number(selectedTransportTypeIdentify.value?.min_size ?? 0);
});

const transportIdentifyMaxSize = computed(() => {
  return Number(selectedTransportTypeIdentify.value?.max_size ?? 0);
});

const transportIdentifyName = computed(() => {
  return selectedTransportTypeIdentify.value?.nombre ?? "Identificación";
});

const transportIdentifyMaxAllowed = computed(() => {
  return transportIdentifyMaxSize.value || 30;
});

const transportIdentifyCurrentLength = computed(() => {
  return String(transportista.value.identificacion ?? "").length;
});

const transportIdentifyRemainingCharacters = computed(() => {
  return Math.max(
    transportIdentifyMaxAllowed.value - transportIdentifyCurrentLength.value,
    0
  );
});

const transportIdentifyCounterClass = computed(() => {
  if (transportIdentifyRemainingCharacters.value === 0) {
    return "bg-danger text-white";
  }

  if (transportIdentifyRemainingCharacters.value <= 3) {
    return "bg-warning text-dark";
  }

  return "bg-body-secondary text-muted";
});

const transportIdentifyLengthMessage = computed(() => {
  const min = transportIdentifyMinSize.value;
  const max = transportIdentifyMaxSize.value;

  if (min && max && min === max) {
    return `${transportIdentifyName.value} debe tener ${max} caracteres`;
  }

  if (min && max) {
    return `${transportIdentifyName.value} debe tener entre ${min} y ${max} caracteres`;
  }

  if (max) {
    return `${transportIdentifyName.value} debe tener máximo ${max} caracteres`;
  }

  return `${transportIdentifyName.value} no tiene una longitud válida`;
});

const numericTransportIdentificationsCode = ["04", "05"];

const transportIdentifyOnlyNumbers = computed(() => {
  return numericTransportIdentificationsCode.includes(
    String(transportista.value.tipo_identificacion)
  );
});

const transportIdentifyInputMode = computed(() => {
  return transportIdentifyOnlyNumbers.value ? "numeric" : "text";
});

function setTransportIdentifyError(message, showMessage = true) {
  transportIdentifyError.value = message;

  if (showMessage && message) {
    swalWarning(message);
  }

  return false;
}

function validateTransportIdentification(showMessage = true) {
  if (!isExternalMode.value) {
    transportIdentifyError.value = "";
    return true;
  }

  const value = String(transportista.value.identificacion ?? "").trim();
  const tipo = selectedTransportTypeIdentify.value;

  if (!tipo) {
    return setTransportIdentifyError(
      "Seleccione un tipo de identificación",
      showMessage
    );
  }

  if (!value) {
    return setTransportIdentifyError(
      "Ingrese la identificación del transportista",
      showMessage
    );
  }

  if (transportIdentifyOnlyNumbers.value && !/^\d+$/.test(value)) {
    return setTransportIdentifyError(
      `${tipo.nombre} solo debe contener números`,
      showMessage
    );
  }

  if (!transportIdentifyOnlyNumbers.value && !/^[A-Za-z0-9]+$/.test(value)) {
    return setTransportIdentifyError(
      `${tipo.nombre} solo debe contener letras y números`,
      showMessage
    );
  }

  const min = transportIdentifyMinSize.value;
  const max = transportIdentifyMaxSize.value;

  if (min && max && min === max && value.length !== max) {
    return setTransportIdentifyError(
      `${tipo.nombre} debe tener ${max} caracteres`,
      showMessage
    );
  }

  if (min && value.length < min) {
    return setTransportIdentifyError(
      `${tipo.nombre} debe tener mínimo ${min} caracteres`,
      showMessage
    );
  }

  if (max && value.length > max) {
    return setTransportIdentifyError(
      `${tipo.nombre} debe tener máximo ${max} caracteres`,
      showMessage
    );
  }

  transportIdentifyError.value = "";
  return true;
}

function onTransportIdentificationInput(event) {
  let value = String(event.target.value ?? "");

  if (transportIdentifyOnlyNumbers.value) {
    value = value.replace(/\D/g, "");
  } else {
    value = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }

  transportista.value.identificacion = value;
  event.target.value = value;

  if (transportIdentifyError.value) {
    validateTransportIdentification(false);
  }
}

watch(
  () => transportista.value.tipo_identificacion,
  () => {
    transportista.value.identificacion = "";
    transportIdentifyError.value = "";
  }
);

watch(
  () => despacho.value,
  () => {
    transportIdentifyError.value = "";
  }
);

onMounted(() => {
  typeIdentifyStore.fetchAll();

});
</script>
<template>
  <BaseBlock v-if="currentBodega.bodega && currentBodega.bodega != ''"
    :title="'Generar guía de remisión hacia: ' + currentBodega.bodega" class="mb-0">
    <div class="table-responsive">
      <table v-if="!picking.loading && picking.data && picking.data.length"
        class="table table-striped table-sm table-vcenter">
        <thead>
          <tr>

            <th scope>CTL</th>
            <th scope>Descripción</th>
            <th scope>UDM</th>
            <th scope class="text-end">Cantidad</th>
            <th scope class="text-end">Peso</th>
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
            <th scope colspan="5">&nbsp;</th>
          </tr>
          <tr>
            <th scope colspan="4" class="fs-sm text-end">Peso total del despacho</th>
            <th scope class="fs-sm text-end">{{ formatPrice(picking.peso) }}</th>

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
              <select class="form-select" id="example-select-floating1" name="example-select-floating1"
                aria-label="Estado" v-model="vehiculo.vehiculo_id" @change="changeVehiculo()">
                <option v-for="(vehiculo, index) in vehiculos" :key="index" :value="vehiculo.id">
                  {{ vehiculo.nombre }} - {{ vehiculo.placa }}
                </option>
              </select>
            </td>
            <td class="text-end">Transportista:</td>
            <td>
              <select class="form-select" id="example-select-floating2" name="example-select-floating2"
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
                <select class="form-select" :required="despacho === 'Retiro en bodega'" :disabled="loadingIdentify"
                  v-model="transportista.tipo_identificacion">
                  <option value="">Seleccione...</option>
                  <option v-for="t in listTypeIdentify" :key="t.codigo" :value="t.codigo">
                    {{ t.nombre }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="text-end"># Identificacion: </td>
              <td>
                <div class="input-group">
                  <input type="text" class="form-control" id="identificacion" placeholder="Identificación"
                    v-model.trim="transportista.identificacion" :maxlength="transportIdentifyMaxAllowed"
                    :inputmode="transportIdentifyInputMode" :class="{ 'is-invalid': transportIdentifyError }"
                    autocomplete="off" @input="onTransportIdentificationInput"
                    @blur="validateTransportIdentification(false)" />

                  <span class="input-group-text fw-semibold" :class="transportIdentifyCounterClass"
                    style="min-width: 58px; justify-content: center;">
                    {{ transportIdentifyCurrentLength }}/{{ transportIdentifyMaxAllowed }}
                  </span>

                  <div v-if="transportIdentifyError" class="invalid-feedback">
                    {{ transportIdentifyError }}
                  </div>
                </div>

                <div v-if="!transportIdentifyError && selectedTransportTypeIdentify" class="form-text">
                  {{ transportIdentifyLengthMessage }}
                </div>
              </td>
              <td class="text-end">Placa de vehículo: </td>
              <td>
                <div class="position-relative">
                  <input type="text" class="form-control form-control" placeholder="ABC-1234" v-model="vehiculo.placa"
                    :maxlength="maxLengthPlaca">
                  <span class="position-absolute top-50 end-0 translate-middle-y me-2 badge bg-dark opacity-50 small">
                    {{ maxLengthPlaca -
                      (vehiculo.placa?.length ?? 0)
                    }}
                  </span>
                </div>
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
