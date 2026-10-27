<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useTemplateStore } from "@/stores/template";
import { swalWarning, swalError } from "@/functions/swal-alert.js";
import flatPickr from "vue-flatpickr-component";
import { useDispatchGuideProcess } from "@/composables/bodegas/despachos/useDispatchGuideProcess";
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";

import { useExternalFreightActions } from "@/composables/sistemas/mantenimientos/external-freight/useExternalFreightActions";

import { formatPrice } from "../../../functions";
import { DISPATCH_TYPE, dispatchSelectionMode, providerDeliversItem, guideGroup, validateGuideSelection } from "@/functions/dispatchGuideSelection";
const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);
const { loading, createGuideDispatch } = useDispatchGuideProcess();

const store = useStore();
const templateStore = useTemplateStore();
const detalle_orden_despacho = computed(
  () => store.state.detalle_orden_despacho
);
const transportistas = computed(() => store.state.transportistas);
const vehiculos = computed(() => store.state.vehiculos);
const transportista = computed(() => store.state.transportista);
const vehiculo = computed(() => store.state.vehiculo);
const flatPickrState = computed(() => store.state.flatPickrState);
const observacion = ref("");
const pesototal = ref(0);
const maxLengthPlaca = 10;
const props = defineProps({
  verpedido: Object,
});

const verpedido = computed(() => props.verpedido);
const { loadingCarrierByProvider, fetchListCarrierByProviderSalesPoints } =
  useExternalFreightActions(listTypeIdentify);
const providerDrivers = ref([]);
const selectedDriverId = ref("");
const providerDriverError = ref("");
const dispatchTypeId = computed(() => Number(verpedido.value?.pedido?.tipo_despacho_id));
const usesProviderDriver = computed(() =>
  [DISPATCH_TYPE.PACKAGE, DISPATCH_TYPE.COLLECT_FREIGHT, DISPATCH_TYPE.PROVIDER].includes(dispatchTypeId.value)
);
const selectedProviderDriver = computed(() =>
  providerDrivers.value.find((driver) => driver.id === selectedDriverId.value)
);

watch(
  [
    () => props.verpedido,
    () => verpedido.value?.pedido?.id,
    () => verpedido.value?.pedido?.tipo_despacho_id,
    () => verpedido.value?.pedido?.fle_proveedor_id,
    () => store.state.puntoventaselectid,
  ],
  async (_, __, onCleanup) => {
    let active = true;
    onCleanup(() => {
      active = false;
    });
    providerDrivers.value = [];
    selectedDriverId.value = "";
    providerDriverError.value = "";
    if (!usesProviderDriver.value) return;
    const providerId = verpedido.value?.pedido?.fle_proveedor_id;
    if (!providerId || !store.state.puntoventaselectid) return;
    const result = await fetchListCarrierByProviderSalesPoints(providerId);
    if (!active) return;
    if (!result.ok) {
      providerDriverError.value = result.message;
      return;
    }
    providerDrivers.value = Array.isArray(result.data) ? result.data : [];
    if (providerDrivers.value.length === 1) {
      selectedDriverId.value = providerDrivers.value[0].id;
    }
  },
  { immediate: true }
);

const emit = defineEmits(["generarGuia", "cerrarGuia"]);

function changeVehiculo() {
  if (
    vehiculos.value.find((item) => item.id === vehiculo.value.vehiculo_id)
      .transportista_id
  ) {
    const id = vehiculos.value.find(
      (item) => item.id === vehiculo.value.vehiculo_id
    ).transportista_id;
    transportista.value.transportista_id = transportistas.value.find(
      (item) => item.id === id
    ).id;
  }
}

function aplicatodo(traslado) {
  if (selectionMode.value !== "normal") {
    selectRestrictedItem(traslado);
    return;
  }
  if (traslado.aplicar_todo === false) {
    traslado.seleccionado = "";
    checkgenerarguia();
    return;
  }
  traslado.seleccionado = traslado.pendiente;
  checkgenerarguia();
}

const todosSeleccionados = computed(
  () =>
    selectableGroup.value.length > 0 &&
    selectableGroup.value.every(
      (traslado) =>
        traslado.aplicar_todo &&
        Number(traslado.seleccionado) === Number(traslado.pendiente)
    )
);

function seleccionartodos() {
  const seleccionar = !todosSeleccionados.value;
  detalle_orden_despacho.value.forEach((traslado) => {
    const selected = seleccionar && selectableGroup.value.includes(traslado);
    traslado.seleccionado = selected ? traslado.pendiente : "";
    traslado.aplicar_todo = selected;
  });
  checkgenerarguia();
}

const selectionMode = computed(() => dispatchSelectionMode(dispatchTypeId.value));
const withFreight = ref(true);
const providerDelivery = ref(false);
const selectableGroup = computed(() => guideGroup(detalle_orden_despacho.value, selectionMode.value, withFreight.value, providerDelivery.value));

function selectFreightGroup(value) {
  withFreight.value = value;
  selectCurrentGroup();
}

function selectPackageGroup(value) {
  providerDelivery.value = value;
  selectCurrentGroup();
}

function selectCurrentGroup() {
  detalle_orden_despacho.value.forEach((item) => {
    item.aplicar_todo = selectableGroup.value.includes(item);
    item.seleccionado = item.aplicar_todo ? item.pendiente : "";
  });
  checkgenerarguia();
}

function selectRestrictedItem(item) {
  const selected = item.aplicar_todo;
  if (selectionMode.value === "collect") {
    withFreight.value = Number(item.fle_valor) > 0;
  } else if (selectionMode.value === "package") {
    providerDelivery.value = providerDeliversItem(item);
  }
  if (selectionMode.value === "collect" || !providerDeliversItem(item)) {
    detalle_orden_despacho.value.forEach((row) => {
      row.aplicar_todo = selected && selectableGroup.value.includes(row);
      row.seleccionado = row.aplicar_todo ? row.pendiente : "";
    });
  } else {
    detalle_orden_despacho.value.forEach((row) => {
      if (!providerDeliversItem(row)) {
        row.aplicar_todo = false;
        row.seleccionado = "";
      }
    });
    item.seleccionado = selected ? item.pendiente : "";
  }
  checkgenerarguia();
}

watch(
  [() => detalle_orden_despacho.value, () => props.verpedido, selectionMode],
  () => {
    if (selectionMode.value === "normal") return;
    providerDelivery.value = selectionMode.value === "package" &&
      guideGroup(detalle_orden_despacho.value, "package").length === 0;
    withFreight.value = guideGroup(detalle_orden_despacho.value, selectionMode.value).length > 0;
    detalle_orden_despacho.value.forEach((item) => {
      item.aplicar_todo = selectableGroup.value.includes(item);
      item.seleccionado = item.aplicar_todo ? item.pendiente : "";
    });
    checkgenerarguia();
  },
  { immediate: true }
);

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
  const x = Number.parseFloat(value);
  return !Number.isNaN(value) && (x | 0) === x;
}

function aplicartraslado(traslado) {
  if (!isInt(traslado.seleccionado) && traslado.ART_DECIMAL_CANTIDAD === 0) {
    traslado.seleccionado = 0;
    checkgenerarguia();
    traslado.aplicar_todo = false;
    return swalWarning("Ingresar un número entero");
  }

  if (Number.isNaN(traslado.seleccionado)) {
    traslado.seleccionado = 0;
    checkgenerarguia();
    traslado.aplicar_todo = false;
    return swalWarning("Ingresar un número");
  }

  if (Number.parseFloat(traslado.seleccionado) === 0) {
    traslado.aplicar_todo = false;
  } else if (Number.parseFloat(traslado.seleccionado) < 0) {
    traslado.aplicar_todo = false;
    traslado.seleccionado = 0;
    return swalWarning("No se puede ingresar números negativos");
  } else if (
    Number.parseFloat(traslado.seleccionado) <=
    Number.parseFloat(traslado.pendiente)
  ) {
    traslado.aplicar_todo = true;
  } else if (
    Number.parseFloat(traslado.seleccionado) >
    Number.parseFloat(traslado.pendiente)
  ) {
    traslado.seleccionado = traslado.pendiente;
    traslado.aplicar_todo = true;
    return swalWarning("El número ingresado es mayor a la cantidad pendiente");
  } else {
    traslado.aplicar_todo = true;
  }
  checkgenerarguia();
}

async function generarGuia(verpedido) {
  if (!Object.values(DISPATCH_TYPE).includes(dispatchTypeId.value)) {
    return swalWarning("El pedido debe incluir un tipo de despacho válido (tipo_despacho_id)");
  }
  const selectionError = validateGuideSelection(detalle_orden_despacho.value, selectionMode.value);
  if (selectionError) return swalWarning(selectionError);
  let itemsDespacho = detalle_orden_despacho.value.filter(
    (item) => item.seleccionado > 0
  );
  if (itemsDespacho.length === 0) {
    return swalWarning("Seleccionar al menos un item para generar la guia");
  }

  // 1. Validaciones
  const esRetiro = dispatchTypeId.value === DISPATCH_TYPE.WAREHOUSE_PICKUP;

  if (esRetiro) {
    if (!transportista.value.nombre) {
      swalWarning("Ingrese el nombre del transportista");
      return;
    }
    if (!vehiculo.value.placa) {
      swalWarning("Ingrese la placa del vehículo");
      return;
    }

    if (!validateTransportIdentification(true)) {
      return;
    }
  } else if (usesProviderDriver.value) {
    if (loadingCarrierByProvider.value || !selectedProviderDriver.value) {
      return swalWarning("Seleccione un chofer del proveedor de despacho");
    }
  } else {
    if (!transportista.value.transportista_id) {
      swalWarning("Seleccionar transportista");
      return;
    }
  }
  // 2. Armar transportista / vehículo
  let trans, vehi;
  if (esRetiro) {
    trans = transportista.value;
    vehi = vehiculo.value;
  } else if (usesProviderDriver.value) {
    const driver = selectedProviderDriver.value;
    trans = {
      nombre: driver.nombre,
      identificacion: driver.identificacion,
      tipo_identificacion: driver.tipo_identificacion?.codigo,
    };
    vehi = { placa: driver.placa };
  } else {
    trans = transportistas.value.find(
      (item) => item.id === transportista.value.transportista_id
    );
    vehi = vehiculos.value.find(
      (item) => item.id === vehiculo.value.vehiculo_id
    );
  }

  // 3. bloquear UI
  // disabledGenerarGuia.value = true;
  // templateStore.pageLoader({ mode: "on" });
  // 4. payload (objeto plano, no reactive)
  const data = {
    orden: verpedido,
    transportista: trans,
    vehiculo: vehi,
    ...(usesProviderDriver.value
      ? { fle_externo_id: selectedDriverId.value }
      : {}),
    fecha_inicio: flatPickrState.value.horaInicio,
    fecha_fin: flatPickrState.value.horaFin,
    items: itemsDespacho,
    observacion: observacion.value,
    // si el vehículo no tiene ruta, que no reviente:
    ruta: vehiculo.value?.ruta ?? null,
    mode: mode.value,
  };
  const resp = await createGuideDispatch(data);
  if (!resp.ok) {
    if (resp?.status >= 400 && resp?.status < 500) {
      swalWarning(resp?.message);
      return;
    }
    if (resp?.status >= 500) {
      swalError(resp?.message);
      return;
    }
  }
  emit("generarGuia");
  templateStore.pageLoader({ mode: "off" });
}

/**nuevas funciones  */
const mode = computed(() => dispatchTypeId.value === DISPATCH_TYPE.WAREHOUSE_PICKUP ? "externo" : "local");
function updateAnotherVariable() {
  // El nombre se conserva en el payload por compatibilidad; las reglas usan el ID.
  verpedido.value.pedido.despacho = dispatchTypeId.value === DISPATCH_TYPE.WAREHOUSE_PICKUP
    ? "Retiro en bodega" : "Despacho en ruta";
}

/** Validación tipo identificación transportista externo */

const transportIdentifyError = ref("");

const isExternalMode = computed(() => {
  return dispatchTypeId.value === DISPATCH_TYPE.WAREHOUSE_PICKUP;
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
  () => verpedido.value?.pedido?.tipo_despacho_id,
  () => {
    transportIdentifyError.value = "";
  }
);

onMounted(() => {
  typeIdentifyStore.fetchAll();
});
</script>

<template>
  <BaseBlock
    title="Generar guía de remisión despacho"
    class="mb-0"
    v-if="verpedido.pedido"
  >
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
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter">
        <tbody>
          <tr>
            <th scope class="fs-sm">#Orden</th>
            <td class="fs-sm">{{ verpedido.orden }}</td>
            <th scope class="fs-sm">Despacho</th>
            <td class="fs-sm">{{ verpedido.despacho }}</td>
            <td colspan="2"></td>
          </tr>
          <tr v-if="verpedido.pedido.factura !== ''">
            <th scope class="fs-sm">Factura</th>
            <td class="fs-sm">{{ verpedido.pedido.factura }}</td>
            <th scope v-if="verpedido.pedido.cotizacion" class="fs-sm">
              Cotización Origen
            </th>
            <td v-if="verpedido.pedido.cotizacion" class="fs-sm" colspan="3">
              {{ verpedido.pedido.cotizacion }}
            </td>
            <td
              v-if="!verpedido.pedido.cotizacion"
              class="fs-sm"
              colspan="4"
            ></td>
          </tr>
          <tr>
            <th scope class="fs-sm">Pedido</th>
            <td class="fs-sm">{{ verpedido.pedido.pedido }}</td>
            <th scope class="fs-sm">RUC</th>
            <td class="fs-sm">{{ verpedido.pedido.CLI_RUC }}</td>
            <th scope class="fs-sm">Razón Social</th>
            <td class="fs-sm">{{ verpedido.pedido.CLI_RAZON_SOCIAL }}</td>
          </tr>
          <tr>
            <th scope class="fs-sm">P. de venta</th>
            <td class="fs-sm">
              {{ verpedido.pedido.PTO_VTA_DESCRIPCION }}
            </td>

            <th scope class="fs-sm">Cond. Pago</th>
            <td class="fs-sm">
              {{ verpedido.pedido.COND_ID }}
            </td>
            <th scope class="fs-sm">Usuario</th>
            <td class="fs-sm">{{ verpedido.pedido.USERID }}</td>
          </tr>
          <tr>
            <th scope class="fs-sm">Bodega</th>
            <td class="fs-sm">
              {{ verpedido.pedido.BOD_BODEGA }}
            </td>
            <th scope class="fs-sm">% Descuento</th>
            <td class="fs-sm">
              {{ verpedido.pedido.porcentage_descuento }}
            </td>

            <th scope class="fs-sm">Fecha/hora</th>
            <td class="fs-sm">
              {{ verpedido.pedido.created_at }}
            </td>
          </tr>
        </tbody>
      </table>
      <table class="table table-sm table-vcenter fs-sm">
        <tbody>
          <tr>
            <td class="text-end">
              {{ verpedido.pedido.despacho }} Transporte:
            </td>
            <td v-if="!usesProviderDriver">
              <select
                class="form-select"
                id="example-select-floating"
                name="example-select-floating"
                aria-label="Estado"
                v-model.number="verpedido.pedido.tipo_despacho_id"
                :disabled="selectionMode !== 'normal'"
                @change="updateAnotherVariable($event)"
              >
                <option :value="DISPATCH_TYPE.WAREHOUSE_PICKUP">Externo</option>
                <option :value="DISPATCH_TYPE.ROUTE">Local</option>
              </select>
            </td>
          </tr>
          <tr v-if="usesProviderDriver">
            <td class="text-end">Flete externo:</td>
            <td>
              <select
                class="form-select"
                v-model="selectedDriverId"
                :disabled="loadingCarrierByProvider"
              >
                <option value="">
                  {{
                    loadingCarrierByProvider
                      ? "Cargando..."
                      : "Seleccione un chofer"
                  }}
                </option>
                <option
                  v-for="driver in providerDrivers"
                  :key="driver.id"
                  :value="driver.id"
                >
                  {{ driver.nombre }} - {{ driver.identificacion }}
                </option>
              </select>
              <div v-if="providerDriverError" class="text-danger">
                {{ providerDriverError }}
              </div>
              <div
                v-else-if="!loadingCarrierByProvider && !providerDrivers.length"
                class="form-text"
              >
                No hay choferes disponibles para el proveedor y punto de venta.
              </div>
            </td>
            <td class="text-end">Placa de vehículo:</td>
            <td>{{ selectedProviderDriver?.placa ?? "" }}</td>
          </tr>
          <tr v-if="dispatchTypeId === DISPATCH_TYPE.ROUTE">
            <td class="text-end">Vehículo:</td>
            <td>
              <select
                class="form-select"
                id="example-select-floating2"
                name="example-select-floating2"
                aria-label="Estado"
                v-model="vehiculo.vehiculo_id"
                @change="changeVehiculo()"
              >
                <option
                  v-for="(vehiculo, index) in vehiculos"
                  :key="index"
                  :value="vehiculo.id"
                >
                  {{ vehiculo.nombre }} - {{ vehiculo.placa }}
                </option>
              </select>
            </td>
            <td class="text-end">Transportista:</td>
            <td>
              <select
                class="form-select"
                id="example-select-floating1"
                name="example-select-floating1"
                aria-label="Estado"
                v-model="transportista.transportista_id"
              >
                <option
                  v-for="(transportista, index) in transportistas"
                  :key="index"
                  :value="transportista.id"
                >
                  {{ transportista.nombre }} -
                  {{ transportista.identificacion }}
                </option>
              </select>
            </td>
          </tr>
          <template v-if="dispatchTypeId === DISPATCH_TYPE.WAREHOUSE_PICKUP">
            <tr>
              <td class="text-end">Nombre Transportista:</td>
              <td>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="transportista.nombre"
                />
              </td>
              <td class="text-end">Tipo identificacion:</td>
              <td>
                <select
                  class="form-select"
                  :required="dispatchTypeId === DISPATCH_TYPE.WAREHOUSE_PICKUP"
                  :disabled="loadingIdentify"
                  v-model="transportista.tipo_identificacion"
                >
                  <option value="">Seleccione...</option>
                  <option
                    v-for="t in listTypeIdentify"
                    :key="t.codigo"
                    :value="t.codigo"
                  >
                    {{ t.nombre }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="text-end"># Identificacion:</td>
              <td>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    id="identificacion"
                    placeholder="Identificación"
                    v-model.trim="transportista.identificacion"
                    :maxlength="transportIdentifyMaxAllowed"
                    :inputmode="transportIdentifyInputMode"
                    :class="{ 'is-invalid': transportIdentifyError }"
                    autocomplete="off"
                    @input="onTransportIdentificationInput"
                    @blur="validateTransportIdentification(false)"
                  />

                  <span
                    class="input-group-text fw-semibold"
                    :class="transportIdentifyCounterClass"
                    style="min-width: 58px; justify-content: center"
                  >
                    {{ transportIdentifyCurrentLength }}/{{
                      transportIdentifyMaxAllowed
                    }}
                  </span>

                  <div v-if="transportIdentifyError" class="invalid-feedback">
                    {{ transportIdentifyError }}
                  </div>
                </div>

                <div
                  v-if="
                    !transportIdentifyError && selectedTransportTypeIdentify
                  "
                  class="form-text"
                >
                  {{ transportIdentifyLengthMessage }}
                </div>
              </td>
              <td class="text-end">Placa de vehículo:</td>
              <td>
                <div class="position-relative">
                  <input
                    type="text"
                    class="form-control form-control"
                    placeholder="ABC-1234"
                    v-model="vehiculo.placa"
                    :maxlength="maxLengthPlaca"
                  />
                  <span
                    class="position-absolute top-50 end-0 translate-middle-y me-2 badge bg-dark opacity-50 small"
                  >
                    {{ maxLengthPlaca - (vehiculo.placa?.length ?? 0) }}
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <tr>
            <td class="text-end">Fecha / Hora salida:</td>
            <td>
              <flat-pickr
                id="example-flatpickr-datetime24"
                class="form-control"
                v-model="flatPickrState.horaInicio"
                :config="flatPickrState.configDateTime24"
              />
            </td>
            <td class="text-end">Fecha / Hora llegada:</td>
            <td>
              <flat-pickr
                id="example-flatpickr-datetime25"
                class="form-control"
                v-model="flatPickrState.horaFin"
                :config="flatPickrState.configDateTime24"
              />
            </td>
          </tr>
          <tr>
            <td class="text-end">Observación:</td>
            <td colspan="3">
              <textarea
                class="form-control"
                id="telefono"
                v-model="observacion"
              ></textarea>
            </td>
          </tr>
          <tr>
            <td class="text-end">Ruta:</td>
            <td colspan="3">
              <input
                type="text"
                class="form-control"
                id="ruta"
                placeholder="Ej: Guayaquil – Ambato"
                v-model="vehiculo.ruta"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="selectionMode !== 'normal'" class="alert alert-info fs-sm">
      {{ selectionMode === 'package'
        ? 'Paquetería: seleccione los ítems que van por paquetería o los ítems L que despacha el proveedor. Cada grupo se genera en una guía independiente.'
        : 'Flete al cobro: seleccione todos los ítems con flete o todos los ítems sin monto de flete. Cada grupo se genera en una guía independiente.' }}
    </div>
    <div v-if="selectionMode === 'package'" class="mb-2 d-flex gap-2">
      <button type="button" class="btn btn-sm"
        :class="!providerDelivery ? 'btn-primary' : 'btn-outline-primary'"
        @click="selectPackageGroup(false)">Seleccionar para paquetería</button>
      <button type="button" class="btn btn-sm"
        :class="providerDelivery ? 'btn-primary' : 'btn-outline-primary'"
        @click="selectPackageGroup(true)">Seleccionar L que despacha proveedor</button>
    </div>
    <div v-if="selectionMode === 'collect'" class="mb-2 d-flex gap-2">
      <button type="button" class="btn btn-sm"
        :class="withFreight ? 'btn-primary' : 'btn-outline-primary'"
        @click="selectFreightGroup(true)">Seleccionar con flete</button>
      <button type="button" class="btn btn-sm"
        :class="!withFreight ? 'btn-primary' : 'btn-outline-primary'"
        @click="selectFreightGroup(false)">Seleccionar sin flete</button>
    </div>
    <div class="col-sm-12 text-end">
      <button
        type="button"
        class="btn btn-sm btn-primary"
        @click="seleccionartodos()"
      >
        <i class="fa fa-hand-pointer"></i>
        {{ todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos" }}
      </button>
    </div>
    <div class="table-responsive">
      <table
        v-if="detalle_orden_despacho.length"
        class="table table-striped table-sm table-vcenter"
      >
        <thead>
          <tr>
            <th scope="col">CTL</th>
            <th scope="col">Descripción</th>
            <th scope="col">UDM</th>
            <th scope="col" class="text-end">Cantidad</th>
            <th scope="col" class="text-end">Reservado</th>
            <th scope="col" class="text-end">Trasladado</th>
            <th scope="col" class="text-end">Pendiente</th>
            <th scope="col" colspan="2"></th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(articulo, index) in detalle_orden_despacho"
            :key="index"
          >
            <tr
              :class="
                (articulo.reservado > 0 &&
                articulo.reservado === articulo.ART_CANTIDAD
                  ? 'table-success'
                  : '') ||
                (articulo.reservado > 0 && articulo.pendiente === 0
                  ? 'table-success'
                  : '') ||
                (articulo.reservado > 0 && articulo.pendiente > 0
                  ? 'table-warning'
                  : '')
              "
            >
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
                  :readonly="selectionMode !== 'normal'"
                  @change="aplicartraslado(articulo)"
                />
              </td>
            </tr>
          </template>
          <tr>
            <th scope="col" colspan="9">&nbsp;</th>
          </tr>
          <tr>
            <th scope="col" colspan="8" class="fs-sm text-end">
              Peso total del despacho
            </th>
            <th scope="col" class="fs-sm text-end">
              {{ formatPrice(pesototal) }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button
      :disabled="loading || (usesProviderDriver && loadingCarrierByProvider)"
      type="button"
      class="btn btn-sm btn-success mx-2"
      @click="generarGuia(verpedido)"
    >
      <i class="fa fa-file-lines"></i> Generar
    </button>
    <button
      type="button"
      class="btn btn-primary btn-sm mx-2"
      data-bs-dismiss="modal"
    >
      Cerrar
    </button>
  </div>
</template>
