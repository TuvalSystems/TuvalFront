<template>
  <template v-if="verproveedor">
    <BaseBlock
               :title="'Proveedor: '+cotizacion.data[indexproveedor].ART_DESCRIPCION+' $'+cotizacion.data[indexproveedor].ART_VALOR"
               transparent class="mb-0">
      <template #options>
        Cantidad: <span class="text-danger">{{ cotizacion.data[indexproveedor].ART_CANTIDAD }} </span>
      </template>

      <template #content>
        <div class="block-content fs-sm">
          <div class="text-end">
            <button class="btn btn-sm btn-success" @click="addProveedor(indexproveedor)">Agregar Proveedor</button>
          </div>
        </div>
        <div class="block-content fs-sm pb-4">
          <BaseBlock
              v-for="(proveedor, index) in cotizacion.data[indexproveedor].proveedores" :key="index"
              title="Proveedor"
              themed
              bordered
              class="pb-4"
          >
            <template #options>
              <button type="button" class="btn-block-option" @click="eliminarProveedor(index)">
                <i class="fa fa-trash"></i>
              </button>
            </template>
            <div class="row mb-2">
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-proveedor-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Proveedor:
                  </label>
                  <div class="col-sm-8">

                    <VueSelect
                        v-model="proveedor.ID_PROVEEDOR"
                        :options="proveedores"
                        :reduce="(option) => option.id"
                        placeholder="Buscar.."
                        label="PROV_RAZON_SOCIAL"

                    ></VueSelect>


                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-descripcion-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Descripción:
                  </label>
                  <div class="col-sm-8">
                    <input
                        type="text"
                        class="form-control"
                        v-model="proveedor.DESCRIPCION_ARTICULO"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-cantidad-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Cantidad:
                  </label>
                  <div class="col-sm-8">
                    <input
                        type="text"
                        class="form-control text-end"
                        v-model="proveedor.CANTIDAD"
                        @change="validaCantidadProveedor($event, index)"
                    />
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-costo-unitario-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Costo unitario:
                  </label>
                  <div class="col-sm-8">
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                          type="text"
                          class="form-control text-end"
                          v-model="proveedor.COSTO_UNITARIO"
                          @change="emit('calculaTotalProveedor', index)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-total-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Total:
                  </label>
                  <div class="col-sm-8">
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                          type="text"
                          class="form-control text-end"
                          readonly
                          v-model="proveedor.TOTAL"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-impuesto-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Impuesto IVA:
                  </label>
                  <div class="col-sm-8">
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                          type="text"
                          class="form-control text-end"
                          v-model="proveedor.IMPUESTO"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div class="row mb-2">
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-fecha-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Fecha de entrega:
                  </label>
                  <div class="col-sm-8">
                    <flat-pickr
                        :value="proveedor.FECHA_ENTREGA"
                        class="form-control"
                        v-model="proveedor.FECHA_ENTREGA"
                        :config="flatPickrState"
                    />
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-nota-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Nota:
                  </label>
                  <div class="col-sm-8">
                          <textarea
                              type="text"
                              class="form-control"
                              v-model="proveedor.NOTA"
                          ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-sm-6">
                <div class="row">
                  <label
                      :for="'select-margen-'+index"
                      class="col-sm-4 col-form-label text-right"
                  >
                    Margen:
                  </label>
                  <div class="col-sm-8">
                    <div class="input-group">
                      <input
                          type="number"
                          class="form-control text-end"
                          v-model="proveedor.MARGEN"
                          @change="emit('calculaTotalProveedor', index)"
                      />
                      <span class="input-group-text">%</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-2" v-if="proveedor.TOTAL < 300">
              <p class="alert alert-warning">El pedido debe superar los $300</p>
            </div>
          </BaseBlock>
        </div>
        <div class="block-content block-content-full text-end bg-body">

          <button
              type="button"
              class="btn btn-sm btn-primary"

              @click="guardarProveedor()"
          >
            Guardar
          </button>
        </div>
      </template>
    </BaseBlock>
  </template>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore} from 'vuex'
import {formatPrice, formatPrice4, formatPrice3, formatPriceClean, format, format4} from "@/functions";
import VueSelect from "vue-select";
import {swalError} from "@/functions/swal-alert";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
const store = useStore();
const verproveedor = computed(() => store.state.verproveedor);
const indexproveedor = computed(() => store.state.indexproveedor);
const proveedores = ref(store.state.proveedores);
const cotizacion = computed(() => store.state.cotizacion);

const flatPickrState = reactive({
  minDate: Date.now(),
  monthSelectorType: "static",
  locale: Spanish,
});

const emit = defineEmits(["calculaTotalProveedor", "verificarProveedores"]);
// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});
function addProveedor(index) {
  const newProveedor = {
    ID_PROVEEDOR: "",
    DESCRIPCION_ARTICULO: cotizacion.value.data[indexproveedor.value].ART_DESCRIPCION,
    FECHA_ENTREGA: "",
    CANTIDAD: "",
    COSTO_UNITARIO: "",
    IMPUESTO: "",
    TOTAL: "",
    TOTALCONIMPUESTO: "",
    NOTA: "",
    MARGEN: 16,
  };
  cotizacion.value.data[index].proveedores.push(newProveedor);
}

function eliminarProveedor(index) {
  cotizacion.value.data[indexproveedor.value].proveedores.splice(index, 1);
}

function validaCantidadProveedor(event, index){
  if(!isInt(event.target.value) && cotizacion.value.data[indexproveedor.value].ART_DECIMAL_CANTIDAD === 0){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número entero');
    return false;
  }else if(cotizacion.value.data[indexproveedor.value].ART_DECIMAL_CANTIDAD > 0 && isNaN(event.target.value)){
    cotizacion.value.data[index].errorCantidad = true;
    swalError('Ingresar un número');
    return false;
  }
  emit('calculaTotalProveedor', index)
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function guardarProveedor(){
  let error = false;
  cotizacion.value.data[indexproveedor.value].proveedores.map(proveedor=>{
    if(proveedor.CANTIDAD === '' || proveedor.CANTIDAD === null ||
        proveedor.COSTO_UNITARIO === '' || proveedor.COSTO_UNITARIO === null ||
        proveedor.FECHA_ENTREGA === null || proveedor.FECHA_ENTREGA === '' ||
        proveedor.ID_PROVEEDOR === '' || proveedor.ID_PROVEEDOR === null ||
        proveedor.MARGEN === '' || proveedor.MARGEN === null){
      error = true;
    }
  })

  if(error){
    swalError('Todos los campos deben ser llenados');
    return;
  }

  store.dispatch('saveProveedor', cotizacion.value.data[indexproveedor.value]).then(() => {
    emit('verificarProveedores')
  });
}

</script>