<template>
  <section class="retention-entry">
    <form class="retention-form" @submit.prevent="onSubmit()">
      <div class="retention-toolbar">
        <div class="min-w-0">
          <span class="retention-kicker">Comprobante SRI</span>
          <h4 class="retention-title">Ingreso de retencion</h4>
        </div>

        <button type="submit" class="btn btn-primary d-none d-md-inline-flex align-items-center gap-2" id="ingresar_retencion">
          <i class="fa fa-circle-plus"></i>
          Ingresar
        </button>
      </div>

      <div class="retention-section">
        <div class="section-heading">
          <div class="section-icon section-icon-info">
            <i class="fa fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h5>Factura</h5>
            <span>Documento base</span>
          </div>
        </div>

        <div class="row g-3 align-items-end">
          <div class="col-lg-7">
            <label class="form-label fs-sm fw-semibold" for="ret_factura">Factura</label>
            <div class="invoice-selector">
              <VueSelect
                class="retention-select"
                v-model="ret_selected"
                :options="facturas_retenciones.data"
                :reduce="(option) => option.ECD_DET_NUM_DOC"
                placeholder="Buscar..."
                label="ECD_DET_NUM_DOC"
              ></VueSelect>
              <button
                type="button"
                class="btn btn-alt-primary retention-icon-button"
                title="Cargar factura"
                @click="selectFacturaBuscar(ret_selected)"
              >
                <i class="fa fa-upload"></i>
              </button>
            </div>
            <input type="hidden" name="ret_factura" id="ret_factura" v-model="nuevaRetencion.ret_factura" />
          </div>

          <div class="col-sm-6 col-lg-2">
            <label class="form-label fs-sm fw-semibold" for="ret_fecha_emision">Emision</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="far fa-calendar"></i></span>
              <input
                type="text"
                class="form-control text-end fs-sm"
                id="ret_fecha_emision"
                name="ret_fecha_emision"
                v-model="nuevaRetencion.ret_fecha_emision"
                readonly
              />
            </div>
          </div>

          <div class="col-sm-6 col-lg-3">
            <label class="form-label fs-sm fw-semibold" for="ret_fecha_vencimiento">Vencimiento</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="far fa-calendar"></i></span>
              <input
                type="text"
                class="form-control text-end fs-sm"
                id="ret_fecha_vencimiento"
                name="ret_fecha_vencimiento"
                v-model="nuevaRetencion.ret_fecha_vencimiento"
                readonly
              />
            </div>
          </div>
        </div>

        <div class="invoice-metrics">
          <div class="invoice-metric">
            <label for="ret_subtotal_factura">Subtotal</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                id="ret_subtotal_factura"
                name="ret_subtotal_factura"
                v-model="nuevaRetencion.ret_subtotal_factura"
                readonly
              />
            </div>
          </div>

          <div class="invoice-metric">
            <label for="ret_iva_factura">IVA</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                id="ret_iva_factura"
                name="ret_iva_factura"
                v-model="nuevaRetencion.ret_iva_factura"
                readonly
              />
            </div>
          </div>

          <div class="invoice-metric">
            <label for="ret_original_factura">Total</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                id="ret_original_factura"
                name="ret_original_factura"
                v-model="nuevaRetencion.ret_original_factura"
                readonly
              />
            </div>
          </div>

          <div class="invoice-metric">
            <label for="ret_saldo_factura">Saldo</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                id="ret_saldo_factura"
                name="ret_saldo_factura"
                v-model="nuevaRetencion.ret_saldo_factura"
                readonly
              />
            </div>
          </div>
        </div>
      </div>

      <div class="retention-section">
        <div class="section-heading">
          <div class="section-icon section-icon-success">
            <i class="fa fa-percent"></i>
          </div>
          <div>
            <h5>Valores retenidos</h5>
            <span>Impuestos y fechas</span>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-lg-3">
            <label class="form-label fs-sm fw-semibold" for="ret_emision">F. emision</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="far fa-calendar"></i></span>
              <flat-pickr
                id="ret_emision"
                name="ret_emision"
                class="form-control fs-sm"
                placeholder="Y-m-d"
                v-model="nuevaRetencion.ret_emision"
                :config="flatPickrState.emision"
                :class="{ 'is-invalid': v$.ret_emision.$errors.length }"
                @blur="v$.ret_emision.$touch"
              />
            </div>
          </div>

          <div class="col-lg-9">
            <div class="tax-grid">
              <div class="tax-row">
                <div class="tax-row-label">Ret. IVA</div>
                <div class="tax-row-controls">
                  <div class="input-group input-group-sm">
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_porcentaje_iva"
                      name="ret_porcentaje_iva"
                      v-model="nuevaRetencion.ret_porcentaje_iva"
                      :class="{ 'is-invalid': v$.ret_porcentaje_iva.$errors.length }"
                      @blur="v$.ret_porcentaje_iva.$touch"
                      @change="cambiaPorcentajeIva"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_iva"
                      name="ret_iva"
                      v-model="nuevaRetencion.ret_iva"
                      :class="{ 'is-invalid': v$.ret_iva.$errors.length }"
                      @blur="v$.ret_iva.$touch"
                    />
                  </div>
                </div>
              </div>

              <div class="tax-row">
                <div class="tax-row-label">Ret. Renta</div>
                <div class="tax-row-controls">
                  <div class="input-group input-group-sm">
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_porcentaje_renta"
                      name="ret_porcentaje_renta"
                      v-model="nuevaRetencion.ret_porcentaje_renta"
                      :class="{ 'is-invalid': v$.ret_porcentaje_renta.$errors.length }"
                      @blur="v$.ret_porcentaje_renta.$touch"
                      @change="cambiaPorcentajeRenta"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      type="text"
                      class="form-control text-end required"
                      id="ret_renta"
                      name="ret_renta"
                      v-model="nuevaRetencion.ret_renta"
                      :class="{ 'is-invalid': v$.ret_renta.$errors.length }"
                      @blur="v$.ret_renta.$touch"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3">
            <label class="form-label fs-sm fw-semibold" for="ret_caducidad">F. caducidad</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="far fa-calendar"></i></span>
              <flat-pickr
                id="ret_caducidad"
                name="ret_caducidad"
                class="form-control fs-sm"
                placeholder="Y-m-d"
                v-model="nuevaRetencion.ret_caducidad"
                :config="flatPickrState.caducidad"
                :class="{ 'is-invalid': v$.ret_caducidad.$errors.length }"
                @blur="v$.ret_caducidad.$touch"
              />
            </div>
          </div>

          <div class="col-lg-9">
            <div class="tax-grid">
              <div class="tax-row">
                <div class="tax-row-label">Ret. IVA SRV</div>
                <div class="tax-row-controls">
                  <div class="input-group input-group-sm">
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_porcentaje_iva_srv"
                      name="ret_porcentaje_iva_srv"
                      v-model="nuevaRetencion.ret_porcentaje_iva_srv"
                      :class="{ 'is-invalid': v$.ret_porcentaje_iva_srv.$errors.length }"
                      @blur="v$.ret_porcentaje_iva_srv.$touch"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_iva_srv"
                      name="ret_iva_srv"
                      v-model="nuevaRetencion.ret_iva_srv"
                      :class="{ 'is-invalid': v$.ret_iva_srv.$errors.length }"
                      @blur="v$.ret_iva_srv.$touch"
                    />
                  </div>
                </div>
              </div>

              <div class="tax-row">
                <div class="tax-row-label">Ret. Renta SRV</div>
                <div class="tax-row-controls">
                  <div class="input-group input-group-sm">
                    <input
                      type="text"
                      class="form-control text-end"
                      id="ret_porcentaje_renta_srv"
                      name="ret_porcentaje_renta_srv"
                      v-model="nuevaRetencion.ret_porcentaje_renta_srv"
                      :class="{ 'is-invalid': v$.ret_porcentaje_renta_srv.$errors.length }"
                      @blur="v$.ret_porcentaje_renta_srv.$touch"
                    />
                    <span class="input-group-text">%</span>
                  </div>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input
                      type="text"
                      class="form-control text-end required"
                      id="ret_renta_srv"
                      name="ret_renta_srv"
                      v-model="nuevaRetencion.ret_renta_srv"
                      :class="{ 'is-invalid': v$.ret_renta_srv.$errors.length }"
                      @blur="v$.ret_renta_srv.$touch"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="retention-section">
        <div class="section-heading">
          <div class="section-icon section-icon-warning">
            <i class="fa fa-receipt"></i>
          </div>
          <div>
            <h5>Datos del comprobante</h5>
            <span>Numeracion y autorizacion</span>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-lg-5">
            <label class="form-label fs-sm fw-semibold" for="ret_comprobante">Numero de comprobante</label>
            <input
              type="text"
              name="ret_comprobante"
              id="ret_comprobante"
              v-model="nuevaRetencion.ret_comprobante"
              @change="checkComprobante()"
              class="form-control fs-sm"
              v-maska="'###-###-#########'"
              :class="{ 'is-invalid': v$.ret_comprobante.$errors.length }"
              @blur="v$.ret_comprobante.$touch"
            />
          </div>

          <div class="col-lg-7">
            <label class="form-label fs-sm fw-semibold" for="ret_autorizacion">Numero de autorizacion</label>
            <input
              type="text"
              name="ret_autorizacion"
              id="ret_autorizacion"
              v-model="nuevaRetencion.ret_autorizacion"
              class="form-control fs-sm"
              :class="{ 'is-invalid': v$.ret_autorizacion.$errors.length }"
              @blur="v$.ret_autorizacion.$touch"
            />
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-100 d-md-none" id="ingresar_retencion_mobile">
        <i class="fa fa-circle-plus me-1"></i>
        Ingresar
      </button>
    </form>

    <section class="retention-list">
      <div class="retention-list-header">
        <div class="min-w-0">
          <span class="retention-kicker">Retenciones agregadas</span>
          <h4 class="retention-title mb-0">{{ cobranza.retenciones.length }} comprobante(s)</h4>
        </div>

        <span class="retention-total">
          Total ${{ formatPriceJm(totalRetenciones) }}
        </span>
      </div>

      <div v-if="cobranza.retenciones.length" class="retention-cards">
        <article class="retention-card" v-for="(retencion, index) in cobranza.retenciones" :key="index">
          <header class="retention-card-header">
            <div class="d-flex align-items-start gap-3 min-w-0">
              <div class="retention-card-icon">
                <i class="fa fa-file-shield"></i>
              </div>
              <div class="min-w-0">
                <div class="retention-card-title text-truncate">
                  {{ retencion.ret_comprobante }}
                </div>
                <div class="retention-card-subtitle">
                  Factura {{ retencion.ret_factura }}
                </div>
              </div>
            </div>

            <button
              class="btn btn-sm btn-alt-danger retention-icon-button"
              type="button"
              title="Eliminar retencion"
              @click="confirmeliminarretencion(index, retencion)"
            >
              <i class="fa fa-trash"></i>
            </button>
          </header>

          <div class="retention-card-meta">
            <div>
              <span>Emision</span>
              <strong>{{ retencion.ret_emision }}</strong>
            </div>
            <div>
              <span>Caducidad</span>
              <strong>{{ retencion.ret_caducidad }}</strong>
            </div>
            <div>
              <span>Autorizacion</span>
              <strong class="text-break">{{ retencion.ret_autorizacion }}</strong>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-vcenter mb-0 retention-detail-table">
              <thead>
                <tr>
                  <th>Impuesto</th>
                  <th class="text-end">% Retencion</th>
                  <th class="text-end">Valor retenido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in getRetentionRows(retencion)" :key="row.label">
                  <td>{{ row.label }}</td>
                  <td class="text-end">{{ row.percentage }}%</td>
                  <td class="text-end">${{ row.amount }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="2" class="text-end">Total retenido</th>
                  <th class="text-end">${{ formatPriceJm(retencion.total) }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>
      </div>

      <div v-else class="retention-empty">
        <i class="fa fa-receipt"></i>
        <span>Sin retenciones ingresadas</span>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useStore } from "vuex";
import { swalError, toast } from "@/functions/swal-alert.js";
import useVuelidate from "@vuelidate/core";
import VueSelect from "vue-select";
import {
  required,
  minLength,
  decimal,
} from "@vuelidate/validators";

import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { formatPrice, formatPriceJm } from "@/functions";

const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  emision: {
    minDate: Date.now(),
    maxDate: Date.now(),
    locale: Spanish,
  },
  caducidad: {
    minDate: Date.now(),
    locale: Spanish,
  },
});

const store = useStore();
const facturas_retenciones = computed(() => store.state.facturas_retenciones);
const nuevaRetencion = computed(() => store.state.nuevaRetencion);
const cobranza = computed(() => store.state.cobranza);
const ret_selected = ref(store.state.ret_selected);

const retentionTaxRows = [
  {
    label: "IVA",
    percentageKey: "ret_porcentaje_iva",
    amountKey: "ret_iva",
    optional: false,
  },
  {
    label: "RENTA",
    percentageKey: "ret_porcentaje_renta",
    amountKey: "ret_renta",
    optional: false,
  },
  {
    label: "IVA SRV",
    percentageKey: "ret_porcentaje_iva_srv",
    amountKey: "ret_iva_srv",
    optional: true,
  },
  {
    label: "RENTA SRV",
    percentageKey: "ret_porcentaje_renta_srv",
    amountKey: "ret_renta_srv",
    optional: true,
  },
];

const totalRetenciones = computed(() => {
  return cobranza.value.retenciones.reduce((total, retencion) => {
    return total + toNumber(retencion.total);
  }, 0);
});

function toNumber(value) {
  const number = Number(String(value ?? 0).replace(/,/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function getRetentionRows(retencion) {
  return retentionTaxRows
    .filter((row) => !row.optional || retencion[row.amountKey])
    .map((row) => ({
      label: row.label,
      percentage: retencion[row.percentageKey],
      amount: retencion[row.amountKey],
    }));
}

function checkComprobante() {
  var error = false;
  cobranza.value.retenciones.map(retencion => {
    if (nuevaRetencion.value.ret_comprobante == retencion.ret_comprobante) {
      error = true;
    }
  });

  if (error) {
    nuevaRetencion.value.ret_comprobante = null,
      swalError("Este comprobante ya fue ingresado previamente");
    return;
  }

  const consulta = reactive({
    comprobante: nuevaRetencion.value.ret_comprobante,
    cliente_id: store.state.currentClienteCobro.id,
  });

  store.dispatch("consultaretencion", consulta).then((res) => {
    if (res.existe) {
      nuevaRetencion.value.ret_comprobante = null,
        swalError("Este comprobante ya fue ingresado en otro cobro");
      return;
    }
  });
}

function selectFacturaBuscar(ret_selected) {
  if (ret_selected) {
    var factura = facturas_retenciones.value.data.find(item => item.ECD_DET_NUM_DOC === ret_selected);
    selectFacturaRetencion(factura);
  } else {
    store.commit("enceraRetencion");
  }
}

function selectFacturaRetencion(factura) {
  v$.value.$reset();
  var error = false;
  cobranza.value.retenciones.map(retencion => {
    if (factura.ECD_DET_NUM_DOC == retencion.ret_factura) {
      error = true;
    }
  });

  if (error) {
    ret_selected.value = null;
    store.commit("enceraRetencion");
    swalError("Esta factura ya tiene una retencion ingresada");
    return;
  }

  var dt = new Date(factura.ECD_DET_FECHA_EMISION);
  var mesfactura = dt.getMonth();
  var anofactura = dt.getFullYear();
  var fechaActual = new Date();

  if (parseInt(fechaActual.getFullYear()) == parseInt(anofactura) && parseInt(fechaActual.getMonth()) == parseInt(mesfactura)) {
    dt.setDate(dt.getDate() + 6);
  } else if ((parseInt(fechaActual.getMonth()) - 1) == parseInt(mesfactura) && parseInt(fechaActual.getFullYear()) == parseInt(anofactura)) {
    var x = new Date();
    var primerdiadelmesactual = new Date(x.getFullYear(), x.getMonth(), 1);
    primerdiadelmesactual.setDate(primerdiadelmesactual.getDate() + 4);
    dt = primerdiadelmesactual;
  } else if (parseInt(fechaActual.getFullYear() - 1) == parseInt(anofactura) && mesfactura == 11) {
    var x = new Date();
    var primerdiadelmesactual = new Date(x.getFullYear(), x.getMonth(), 1);
    primerdiadelmesactual.setDate(primerdiadelmesactual.getDate() + 30); //4
    dt = primerdiadelmesactual;
  } else {
    ret_selected.value = null;
    store.commit("enceraRetencion");
    swalError("No puede ingresar una retencion de hace mas de un mes");
    return;
  }
  //factura.index = event.target.value;
  store.commit("asignaRetencion", factura);
  flatPickrState.emision.minDate = Date.parse(factura.ECD_DET_FECHA_EMISION);
  flatPickrState.emision.maxDate = dt;
  flatPickrState.caducidad.minDate = Date.parse(factura.ECD_DET_FECHA_EMISION);
}

const rules = computed(() => {
  return {
    ret_emision: {
      required,
    },
    ret_iva: {
      required,
      decimal,
    },
    ret_renta: {
      required,
      decimal,
    },
    ret_caducidad: {
      required,
    },
    ret_comprobante: {
      required,
      minLength: minLength(17),
    },
    ret_autorizacion: {
      required,
      minLength: minLength(10),
    },
    ret_porcentaje_iva: {
      required,
      decimal,
    },
    ret_porcentaje_renta: {
      required,
      decimal,
    },
    ret_iva_srv: {
      decimal,
    },
    ret_renta_srv: {
      decimal,
    },
    ret_porcentaje_iva_srv: {
      decimal,
    },
    ret_porcentaje_renta_srv: {
      decimal,
    },
  };
});

const v$ = useVuelidate(rules, nuevaRetencion);

// On form submission
async function onSubmit() {
  const result = await v$.value.$validate();

  if (!result) {
    // notify user form is invalid
    return;
  }

  if (nuevaRetencion.value.ret_autorizacion.length != 10 && nuevaRetencion.value.ret_autorizacion.length != 49) {
    swalError("El numero de autorizacion debe ser de 10 caracteres en caso de ser fisica y de 49 caracteres en caso de se electronica");
    return false;
  }

  if (!nuevaRetencion.value.ret_iva_srv) {
    nuevaRetencion.value.ret_iva_srv = 0;
  }
  if (!nuevaRetencion.value.ret_renta_srv) {
    nuevaRetencion.value.ret_renta_srv = 0;
  }

  nuevaRetencion.value.total = formatPrice(parseFloat(nuevaRetencion.value.ret_iva) + parseFloat(nuevaRetencion.value.ret_iva_srv) + parseFloat(nuevaRetencion.value.ret_renta) + parseFloat(nuevaRetencion.value.ret_renta_srv));

  cobranza.value.retenciones.push(nuevaRetencion.value);
  v$.value.$reset();
  ret_selected.value = null;
  store.commit("enceraRetencion");
  store.commit("calculaSaldoFacturas");

  const collapseRetenciones = document.getElementById("collapseRetenciones");
  new bootstrap.Collapse(collapseRetenciones);
  const collapseResumen = document.getElementById("collapseResumen");
  new bootstrap.Collapse(collapseResumen);
}

function cambiaPorcentajeIva() {
  nuevaRetencion.value.ret_iva = formatPrice(nuevaRetencion.value.ret_iva_factura * (nuevaRetencion.value.ret_porcentaje_iva / 100));
}
function cambiaPorcentajeRenta() {
  nuevaRetencion.value.ret_renta = formatPrice(nuevaRetencion.value.ret_subtotal_factura * (nuevaRetencion.value.ret_porcentaje_renta / 100));
}
function confirmeliminarretencion(index, retencion) {
  toast.fire({
    title: "Estas seguro?",
    text: "De eliminar la retencion " + retencion.ret_comprobante + "",
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Si, eliminarlo!",
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
        eliminarRetencion(retencion, index);
      }
    });
}

function eliminarRetencion(retencion, index) {
  cobranza.value.retenciones.splice(index, 1);
  store.commit("calculaSaldoFacturas");
}
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.retention-entry {
  display: grid;
  gap: 1rem;
}

.retention-form,
.retention-list {
  display: grid;
  gap: 1rem;
}

.retention-toolbar,
.retention-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.retention-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
}

.retention-section {
  padding: 1rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-heading h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.section-heading span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
}

.section-icon,
.retention-card-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: var(--tuval-radius-md, 8px);
}

.section-icon-info {
  color: #0369a1;
  background: #e0f2fe;
}

.section-icon-success {
  color: #047857;
  background: #dcfce7;
}

.section-icon-warning {
  color: #b45309;
  background: #fef3c7;
}

.invoice-selector {
  display: flex;
  min-width: 0;
}

.retention-select {
  flex: 1 1 auto;
  min-width: 0;
}

.retention-select :deep(.vs__dropdown-toggle) {
  min-height: 2.375rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-color: var(--bs-border-color);
  background: var(--bs-body-bg);
}

.retention-select :deep(.vs__search),
.retention-select :deep(.vs__selected) {
  margin-top: 0;
  font-size: 0.875rem;
}

.retention-icon-button {
  display: inline-flex;
  width: 2.375rem;
  min-width: 2.375rem;
  height: 2.375rem;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.invoice-selector .retention-icon-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.invoice-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.invoice-metric {
  min-width: 0;
}

.invoice-metric label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tax-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.tax-row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.8fr) minmax(0, 1.6fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.tax-row-label {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
  font-weight: 800;
}

.tax-row-controls {
  display: grid;
  grid-template-columns: minmax(5.25rem, 0.85fr) minmax(6.5rem, 1.15fr);
  gap: 0.5rem;
}

.retention-total {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  color: var(--bs-primary);
  background: var(--bs-primary-bg-subtle, #e7f1ff);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.retention-cards {
  display: grid;
  gap: 0.75rem;
}

.retention-card {
  overflow: hidden;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.retention-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
}

.retention-card-icon {
  color: #2563eb;
  background: #dbeafe;
}

.retention-card-title {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.95rem;
  font-weight: 800;
}

.retention-card-subtitle {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
}

.retention-card-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-card-meta span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-card-meta strong {
  display: block;
  margin-top: 0.15rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
}

.retention-detail-table th,
.retention-detail-table td {
  padding: 0.55rem 1rem;
  font-size: 0.82rem;
}

.retention-detail-table thead th {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  text-transform: uppercase;
}

.retention-detail-table tfoot th {
  border-top: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-empty {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 4rem;
  padding: 1rem;
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.85rem;
  font-weight: 700;
}

@media (max-width: 1199.98px) {
  .invoice-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tax-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .retention-toolbar,
  .retention-list-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .invoice-metrics,
  .retention-card-meta {
    grid-template-columns: 1fr;
  }

  .tax-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .retention-section,
  .retention-card-header,
  .retention-card-meta {
    padding: 0.85rem;
  }

  .tax-row-controls {
    grid-template-columns: 1fr;
  }
}
</style>
