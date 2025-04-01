<template>
  <BaseBlock v-if="modArticulo" :title="'Peso de: '+modArticulo.ART_DESCRIPCION" class="mb-0">
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
    <template #content>
      <div class="block-content fs-sm mb-4 space-y-2">
        <div class="input-group">
          <input
              type="text"
              class="form-control text-end"
              v-model="modArticulo.ART_PESO"
              @change="updatePeso($event, indexArticulo)"
              @keyup.enter="emit('cerrar')"
          />
          <span class="input-group-text">Kg</span>
        </div>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button
        type="button"
        class="btn btn-sm btn-primary"
        data-bs-dismiss="modal"
    >
      Guardar
    </button>
  </div>
</template>
<script setup>
import { ref, computed, reactive } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

const { indexArticulo, modArticulo } = defineProps({
  indexArticulo: Number,
  modArticulo:Object,
});

const store = useStore();
const cotizacion = computed(() => store.state.cotizacion);


let errorMsg = ref('');

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function updatePeso(event, indexArticulo){
  
  if(event.target.value == ''){
    cotizacion.value.data[indexArticulo].ART_PESO = 0;
  }else if(isNaN(event.target.value)){
    cotizacion.value.data[indexArticulo].ART_PESO = 0;
    swalError('Ingresar un número');
    return false;
  }
  event.target.value = parseFloat(event.target.value);


  guardarPeso(indexArticulo, false);
}

const emit = defineEmits(["cerrar", "calcTotales"]);

function guardarPeso(indexArticulo){
    const updatePeso = reactive({
      articulo: cotizacion.value.data[indexArticulo].id,
      peso: cotizacion.value.data[indexArticulo].ART_PESO,
    })
    store.dispatch('updatePeso', updatePeso).then(() => {
      emit('calcTotales');
    });
}

</script>