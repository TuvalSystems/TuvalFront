<template>
  <form @submit.prevent="aplicar_aplicaciones()">
    <div class="row">
      <div class="col-sm-10 offset-1">
        <table class="table table-bordered table-condensed">
          <thead>
            <tr>
              <th>Cobro</th>
              <th>Documento</th>
              <th>Fecha</th>
              <th class="text-end">Monto original</th>
              <th class="text-end">Saldo pendiente</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="input-group" style="max-width: 150px;">
                  <select id="cobro_sin_aplicar" name="cobro_sin_aplicar" class="form-select fs-sm"
                    v-model="ingreso_aplicacion.cobro" @change="selectCobro($event)" :class="{
                      'is-invalid': v$.cobro.$errors.length,
                    }" @blur="v$.cobro.$touch">
                    <option v-for="(cobro, index) in cobros_sin_aplicar" :key="index" :value="index">
                      {{ cobro.CN_DOCUMENTO }} ${{ cobro.CN_MONTO_ORIGINAL }}</option>
                  </select>
                  <button type="button" class="btn btn-sm btn-primary" @click="updatedListApplicationDocs"> <i
                      class="si si-refresh"></i></button>
                </div>
              </td>
              <td>
                {{ cobro_selected.CN_DOCUMENTO }}
              </td>
              <td>
                  {{ cobro_selected.CN_FECHA_EMISION?.date?.slice(0, 10) ?? '' }}
              </td>
              <td class="text-end">
                ${{ cobro_selected.CN_MONTO_ORIGINAL }}
              </td>
              <td class="text-end">
                ${{ cobro_selected.CN_SALDO_PENDIENTE }}
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <div class="row">
                  <label class="col-sm-4 col-form-label text-end">Comentario:</label>
                  <div class="col-sm-8">
                    <input type="text" class="form-control" v-model="ingreso_aplicacion.comentario" />
                  </div>
                </div>
              </td>
              <td class="text-end">
                <input type="submit" class="btn btn-primary" value="Aplicar" id="aplicar_aplicaciones" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </form>
  <div v-if="ingreso_aplicacion.monto_original" class="row">
    <div class="col-sm-12">
      <div class="row">
        <div class="col-sm-6 offset-3">
          <table class="table table-bordered table-sm fs-sm">
            <thead>
              <tr>
                <th class="text-end">Monto original</th>
                <th class="text-end">${{ formatPrice(ingreso_aplicacion.monto_original) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto no aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_aplicacion.monto_no_aplicado) }}</th>
              </tr>
              <tr>
                <th class="text-end">Monto aplicado</th>
                <th class="text-end">${{ formatPrice(ingreso_aplicacion.monto_aplicado) }}</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 justify-content-center">
          <Dataset v-if="facturas.data && facturas.data.length" v-slot="{ ds }" :ds-data="facturas.data"
            :ds-sortby="sortBy" :ds-search-in="['ECD_DET_NUM_DOC',]">
            <div class="row mb-2">
              <div class="col-sm-3">
                <div class="input-group ">
                  <span class="input-group-text" id="basic-addon1">
                    <i class="fa fa-magnifying-glass"></i>
                  </span>
                  <DatasetSearch ds-search-placeholder="Buscar factura..." />
                </div>
              </div>
            </div>
            <table class="table table-bordered table-sm fs-sm centered" style="margin-bottom: 0px;">
              <thead>
                <tr>
                  <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                    @click="onSort($event, index)" class="nowrap">
                    {{ th.name }} <i class="gg-select float-end"></i>
                  </th>
                  <th style="width: 31px;" class="text-center"><i class="fa fa-check"></i></th>
                  <th style="width: 120px;">Aplicar Monto</th>
                  <th>Observación</th>

                </tr>
              </thead>
              <DatasetItem tag="tbody">
                <template #default="{ row, index }">
                  <tr>
                    <td style="width: 140px;" class="numero_factura_efe">{{ row.ECD_DET_NUM_DOC }}</td>
                    <td style="width: 90px;">{{ row.ECD_DET_FECHA_EMISION }}</td>
                    <td style="width: 100px;">{{ row.ECD_DET_FECHA_VENCIMIENTO }}</td>
                    <td style="width: 90px;" class="text-end">${{ row.ECD_DET_MONTO_ORIGINAL }}</td>
                    <td style="width: 90px;" class="text-end">${{ formatPrice(parseFloat(row.ECD_DET_SALDO_CLIENTE) -
                      parseFloat(row.aplicar_monto_aplicacion)) }}</td>
                    <td style="width: 31px;" class="text-center">
                      <input type="checkbox" class="form-check-input" v-model="row.aplicar_todo_aplicacion"
                        @change="aplicatodo(row)" />
                    </td>
                    <td style="width: 120px;">
                      <input type="text" class="form-control text-end" v-model="row.aplicar_monto_aplicacion"
                        @change="aplicarsaldos(row)" @focus="encera(row)" />
                    </td>
                    <td>
                      <input type="text" class="form-control" v-model="row.observacion_aplicacion" />
                    </td>
                  </tr>
                </template>
              </DatasetItem>
            </table>
            <div class="mt-2">
              <DatasetPager class="" />
            </div>
          </Dataset>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 text-end">
          <input type="button" class="btn btn-primary" value="Enviar Aplicación" @click="enviaraplicacion()" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { useStore } from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import useVuelidate from "@vuelidate/core";
import { formatPrice } from "@/functions";
import { useCustomerApplicationsPending } from "@/composables/cobranzas/cobros/useCustomerApplicationsPending";

const {
  isUpdatingApplicationBalances,
  refreshPendingApplicationDocumentBalances
} = useCustomerApplicationsPending();
import {
  required,
  decimal,
} from "@vuelidate/validators";

const cols = reactive([
  {
    name: "Factura",
    field: "ECD_DET_NUM_DOC",
    sort: "",
  },
  {
    name: "Fecha Emisión",
    field: "ECD_DET_FECHA_EMISION",
    sort: "",
  },
  {
    name: "Fecha Vencimiento",
    field: "ECD_DET_FECHA_VENCIMIENTO",
    sort: "",
  },
  {
    name: "Monto Original",
    field: "ECD_DET_MONTO_ORIGINAL",
    sort: "",
  },
  {
    name: "Monto Pendiente",
    field: "ECD_DET_SALDO_CLIENTE",
    sort: "",
  },
]);

// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

// On sort th click
function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }
  if (!sortEl.sort) {
    toset = "asc";
  }
  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }
  if (sortEl.sort === "asc") {
    toset = "desc";
  }
  sortEl.sort = toset;
}

const store = useStore();
const cobranza = computed(() => store.state.cobranza);
const currentClienteCobro = computed(() => store.state.currentClienteCobro);
const facturas = computed(() => store.state.facturas);
const cobros_sin_aplicar = computed(() => store.state.cobros_sin_aplicar);
const ingreso_aplicacion = computed(() => store.state.ingreso_aplicacion);
const cobro_selected = ref({
  CN_DOCUMENTO: '',
  CN_MONTO_ORIGINAL: '',
  CN_FECHA_EMISION: { date: '' },
  CN_MONTO_ORIGINAL: '',
  CN_SALDO_PENDIENTE: '',
});
const today = new Date();
const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

var currentTime = new Date();
var startDateFrom = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
var d = new Date(today.getFullYear(), today.getMonth(), 0);

function selectCobro() {
  cobro_selected.value = cobros_sin_aplicar.value[ingreso_aplicacion.value.cobro];
  ingreso_aplicacion.value.monto = cobros_sin_aplicar.value[ingreso_aplicacion.value.cobro].CN_SALDO_PENDIENTE;
}

const rules = computed(() => {
  return {
    cobro: {
      required,
    },
  };
});

const v$ = useVuelidate(rules, ingreso_aplicacion);

// On form submission
async function aplicar_aplicaciones() {

  facturas.value.data.map(factura => {
    factura.aplicar_todo_aplicacion = false;
    factura.aplicar_monto_aplicacion = 0;
  });

  store.commit('calculaSaldoFacturas');
  const result = await v$.value.$validate();

  if (!result) {
    // notify user form is invalid
    return;
  }
  ingreso_aplicacion.value.monto_original = ingreso_aplicacion.value.monto;
  ingreso_aplicacion.value.monto_no_aplicado = ingreso_aplicacion.value.monto;
  ingreso_aplicacion.value.detalle = cobros_sin_aplicar.value[ingreso_aplicacion.value.cobro];
  v$.value.$reset();
}

function aplicatodo(factura) {
  //factura.aplicar_todo_aplicacion = false;
  if (factura.aplicar_todo_aplicacion == false) {
    factura.aplicar_monto_aplicacion = 0;
    store.commit('calculaSaldoFacturas');
    return;
  }

  if (parseFloat(ingreso_aplicacion.value.monto_no_aplicado) > parseFloat(factura.ECD_DET_SALDO_CLIENTE)) {
    factura.aplicar_monto_aplicacion = formatPrice(factura.ECD_DET_SALDO_CLIENTE);
    store.commit('calculaSaldoFacturas');
  } else if (ingreso_aplicacion.value.monto_no_aplicado <= 0) {
    swalError('Ya no queda monto por aplicar');
    factura.aplicar_todo_aplicacion = false;
    return;
  } else {
    factura.aplicar_monto_aplicacion = formatPrice(ingreso_aplicacion.value.monto_no_aplicado);
    store.commit('calculaSaldoFacturas');
  }
}

function encera(factura) {
  factura.aplicar_monto_aplicacion = 0;
  aplicarsaldos(factura);
}

function aplicarsaldos(factura) {
  console.log('factura', factura);
  if (isNaN(factura.aplicar_monto_aplicacion)) {

    swalError('Ingresar un número');
    store.commit('calculaSaldoFacturas');
    factura.aplicar_monto_aplicacion = 0;
    return false;
  }

  if (parseFloat(factura.aplicar_monto_aplicacion) < 0) {
    swalWarning('No se pueden ingresar valores negativos');
    factura.aplicar_monto_aplicacion = 0;
    return false;
  }

  if (factura.aplicar_monto_aplicacion == '') {
    factura.aplicar_monto_aplicacion = 0;
  }

  if (parseFloat(factura.ECD_DET_SALDO_CLIENTE) < parseFloat(factura.aplicar_monto_aplicacion)) {
    swalInfo('La cantidad ingresada es mayor al monto pendiente de la factura');
    factura.aplicar_monto_aplicacion = 0;
    factura.aplicar_todo_aplicacion = false;
    store.commit('calculaSaldoFacturas');
    return;
  }

  if (parseFloat(factura.aplicar_monto_aplicacion) == 0) {
    store.commit('calculaSaldoFacturas');
    factura.aplicar_todo_aplicacion = false;
  } else if (parseFloat(ingreso_aplicacion.value.monto_no_aplicado) >= parseFloat(factura.aplicar_monto_aplicacion)) {
    store.commit('calculaSaldoFacturas');
    factura.aplicar_todo_aplicacion = true;
  } else if (ingreso_aplicacion.value.monto_no_aplicado == 0) {
    swalError('Ya no queda monto por aplicar');
    factura.aplicar_monto_aplicacion = 0;
    factura.aplicar_todo_aplicacion = false;
    return;
  } else if (parseFloat(ingreso_aplicacion.value.monto_no_aplicado) < parseFloat(factura.aplicar_monto_aplicacion)) {
    swalInfo('La cantidad ingresada es mayor al Monto Pendiente');
    factura.aplicar_monto_aplicacion = formatPrice(parseFloat(ingreso_aplicacion.value.monto_no_aplicado));
    factura.aplicar_todo_aplicacion = true;
    store.commit('calculaSaldoFacturas');
  }
  store.commit('calculaSaldoFacturas');
}

function enviaraplicacion() {
  const detalleAplicacion = ingreso_aplicacion.value?.detalle ?? {};
  const documentoAplicacion = String(detalleAplicacion.CN_DOCUMENTO ?? '').trim();

  if (!documentoAplicacion) {
    swalWarning('No se encontró el documento de aplicación.');
    return;
  }

  const facturasAplicar = [];

  for (const factura of facturas.value.data) {
    const montoAplicar = Number(factura.aplicar_monto_aplicacion ?? 0);

    if (montoAplicar <= 0) {
      continue;
    }

    const facturaDocumento = String(factura.ECD_DET_NUM_DOC ?? '').trim();

    const yaExiste = cobranza.value.ingreso_aplicaciones.some((aplicacion) => {
      const docExistente = String(aplicacion?.detalle?.CN_DOCUMENTO ?? '').trim();

      return docExistente === documentoAplicacion &&
        (aplicacion.facturas ?? []).some((facturaExistente) => {
          const facturaExistenteDoc = String(facturaExistente.ECD_DET_NUM_DOC ?? '').trim();

          return facturaExistenteDoc === facturaDocumento;
        });
    });

    if (yaExiste) {
      swalWarning(
        `El documento ${documentoAplicacion} ya fue aplicado a la factura ${facturaDocumento}.`
      );
      return;
    }

    facturasAplicar.push({
      ECD_DET_NUM_DOC: factura.ECD_DET_NUM_DOC,
      ECD_DET_FECHA_VENCIMIENTO: factura.ECD_DET_FECHA_VENCIMIENTO,
      ECD_DET_MONTO_ORIGINAL: factura.ECD_DET_MONTO_ORIGINAL,
      ECD_DET_SALDO_CLIENTE: formatPrice(
        Number(factura.ECD_DET_SALDO_CLIENTE ?? 0) - montoAplicar
      ),
      aplicar_monto_aplicacion: montoAplicar,
      observacion_aplicacion: factura.observacion_aplicacion,
    });
  }

  if (facturasAplicar.length === 0) {
    swalWarning('Debe ingresar un monto a aplicar en al menos una factura.');
    return;
  }

  const nuevaAplicacion = {
    ...ingreso_aplicacion.value,
    facturas: facturasAplicar,
  };

  cobranza.value.ingreso_aplicaciones.push(nuevaAplicacion);

  store.commit('enceraAplicacion');
  store.commit('checkPermitePedido');

  const collapseDepositos = document.getElementById('collapseAplicar');
  new bootstrap.Collapse(collapseDepositos);

  const collapseCheques = document.getElementById('collapseResumen');
  new bootstrap.Collapse(collapseCheques);
}


async function updatedListApplicationDocs() {
  const collections = cobros_sin_aplicar.value ?? [];
  if (!collections.length) {
    swalWarning("No existen cobros sin aplicar para actualizar.");
    return;
  }

  const clientId = currentClienteCobro.value.id;
  if (!clientId) {
    swalWarning("No se encontró el cliente para actualizar los saldos.");
    return;
  }

  const resp = await refreshPendingApplicationDocumentBalances(clientId, collections);
  if (!resp?.ok) {
    const msg = resp?.message || "Opps! Ocurrio un Error inesperado";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  const updatedCollections = resp?.data ?? [];
  cobros_sin_aplicar.value.splice(
    0,
    cobros_sin_aplicar.value.length,
    ...updatedCollections
  );
  const selectedIndex = ingreso_aplicacion.value?.cobro;
  if (selectedIndex !== null && selectedIndex !== undefined && selectedIndex !== "") {
    const selectedCollection = cobros_sin_aplicar.value[selectedIndex];
    if (selectedCollection) {
      cobro_selected.value = selectedCollection;
      ingreso_aplicacion.value.monto = selectedCollection.CN_SALDO_PENDIENTE;
    }
  }
  swalSuccess(resp?.message);
}
</script>