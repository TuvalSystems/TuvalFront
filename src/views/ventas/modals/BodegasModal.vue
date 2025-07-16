<template>
  <BaseBlock v-if="verbodegas" :title="'Selección de stock por bodega'" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>

      <div class="block-content fs-sm mb-4 space-y-2">
        <table class="table table-sm table-vcenter">
          <thead>
            <tr>
              <th>Bodega</th>
              <th class="text-end">Stock</th>
              <th class="col-1">Asignado</th>
            </tr>
          </thead>

          <tbody v-if="cotizacion.data.length">
            <tr v-for="(stock, index) in cotizacion.data[indexbodegas].stock" :key="index">
              <td>
                {{ stock.STO_ART_BODEGA }}
              </td>
              <td class="text-end">
                {{ stock.STO_ART_STOCK_DISPONIBLE }}
              </td>
              <td>
                <input type="text" class="form-control text-end" :class="stock.error ? 'is-invalid' : ''"
                  v-model="stock.seleccionado" @change="updateStock($event, indexbodegas, index)"
                  @keyup.enter="emit('cerrar')" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal">
      Cerrar
    </button>
  </div>
</template>
<script setup>
import { ref, computed, reactive, watch } from "vue";
import { useStore } from "vuex";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

const { indexbodegas, verbodegas } = defineProps({
  indexbodegas: Number,
  verbodegas: Boolean,
});
const store = useStore();
const cotizacion = computed(() => store.state.cotizacion);


let errorMsg = ref("");

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function updateStock(event, indexbodegas, index) {
  if (event.target.value == "") {
    cotizacion.value.data[indexbodegas].stock[index].seleccionado = 0;
  } else if (
    !isInt(event.target.value) &&
    cotizacion.value.data[indexbodegas].ART_DECIMAL_CANTIDAD == 0
  ) {
    cotizacion.value.data[indexbodegas].stock[index].error = true;
    swalError("Ingresar un número entero");
    return false;
  } else if (
    cotizacion.value.data[indexbodegas].ART_DECIMAL_CANTIDAD > 0 &&
    isNaN(event.target.value)
  ) {
    cotizacion.value.data[indexbodegas].stock[index].error = true;
    swalError("Ingresar un número");
    return false;
  }

  if (
    parseFloat(
      cotizacion.value.data[indexbodegas].stock[index].STO_ART_STOCK_DISPONIBLE
    ) < parseFloat(event.target.value)
  ) {
    cotizacion.value.data[indexbodegas].stock[index].error = true;
    swalError("No hay stock suficiente");
    return false;
  }

  if (cotizacion.value.data[indexbodegas].ART_DECIMAL_CANTIDAD > 0) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
  }
  cotizacion.value.data[indexbodegas].stock[index].error = false;
  guardarBodegas(indexbodegas, false);
}

const emit = defineEmits(["cerrar", "verificarstoc", "calcTotales"]);

function guardarBodegas(indexbodegas, cerrar = true) {
  let hayerror = false;
  cotizacion.value.data[indexbodegas].stock.map((bodega) => {
    if (bodega.error) {
      hayerror = true;
    }
  });
  emit("verificarstoc");
  if (!hayerror) {
    var total = 0;
    cotizacion.value.data[indexbodegas].stock.map((bodega) => {
      total += parseFloat(bodega.seleccionado);
    });
    cotizacion.value.data[indexbodegas].ART_CANTIDAD = total;

    const updatecantidad = reactive({
      articulo: cotizacion.value.data[indexbodegas].id,
      cantidad: cotizacion.value.data[indexbodegas].ART_CANTIDAD,
    });
    store.dispatch("updateCantidad", updatecantidad).then(() => {
      emit("calcTotales");
    });

    store
      .dispatch("updateStock", cotizacion.value.data[indexbodegas].stock)
      .then(() => {
        if (cerrar) emit("cerrar");
      })
      .catch((err) => {
        swalError(err.response.message);
      });
  }
  return false;
}
</script>
