<template>
  <BaseBlock :title="transportista.id ? 'Editar Transportista' : 'Nuevo Transportista'" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="nombre">Nombre</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="nombre" v-model="transportista.nombre" :class="{
              'is-invalid': v$.nombre.$errors.length,
            }" @blur="v$.nombre.$touch" />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="tipo_identificacion">Tipo identificacion</label>
          <div class="col-sm-9">
            <select class="form-select" v-model="transportista.tipo_identificacion" id="tipo_identificacion"
              :disabled="loadingIdentify" :class="{
                'is-invalid': v$.tipo_identificacion.$errors.length,
              }" @blur="v$.tipo_identificacion.$touch">
              <option value="">Seleccione...</option>

              <option v-for="tipo in listTypeIdentify" :key="tipo.codigo" :value="tipo.codigo">
                {{ tipo.nombre }}
              </option>
            </select>

            <div v-if="v$.tipo_identificacion.$errors.length" class="invalid-feedback d-block">
              Seleccione un tipo de identificación.
            </div>
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="identificacion"># Identificacion</label>
            <div class="col-sm-9">

          <div class="input-group">
            <input type="text" class="form-control" id="identificacion" v-model.trim="transportista.identificacion"
              :maxlength="identifyMaxAllowed" :inputmode="identifyInputMode" autocomplete="off" :class="{
                'is-invalid': v$.identificacion.$errors.length,
              }" @input="onIdentificationInput" @blur="v$.identificacion.$touch" />

            <span class="input-group-text fw-semibold" :class="identifyCounterClass"
              style="min-width: 58px; justify-content: center;">
              {{ identifyCurrentLength }}/{{ identifyMaxAllowed }}
            </span>
          </div>

          <div v-if="v$.identificacion.$errors.length" class="invalid-feedback d-block">
            {{ v$.identificacion.$errors[0].$message }}
          </div>

          <div v-else-if="selectedTypeIdentify" class="form-text">
            {{ identifyLengthMessage }}
          </div>
            </div>

        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="tipo_licencia">Tipo Licencia</label>
          <div class="col-sm-9">
            <select class="form-select" v-model="transportista.tipo_licencia" id="tipo_licencia" :class="{
              'is-invalid': v$.tipo_licencia.$errors.length,
            }" @blur="v$.tipo_licencia.$touch">
              <option value="Tipo A">Tipo A</option>
              <option value="Tipo B">Tipo B</option>
              <option value="Tipo C">Tipo C</option>
              <option value="Tipo E">Tipo E</option>
            </select>
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="telefono">Teléfono</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="telefono" v-model="transportista.telefono" :class="{
              'is-invalid': v$.telefono.$errors.length,
            }" @blur="v$.telefono.$touch" />
          </div>
        </div>
        <div class="row mb-4">
          <label class="col-sm-3 col-form-label" for="telefono">Dirección</label>
          <div class="col-sm-9">
            <textarea class="form-control" id="telefono" v-model="transportista.direccion" :class="{
              'is-invalid': v$.direccion.$errors.length,
            }" @blur="v$.direccion.$touch"></textarea>
          </div>
        </div>

      </div>
      <div class="block-content block-content-full text-end ">
        <button type="button" class="btn btn-secondary btn-sm mx-2" data-bs-dismiss="modal"><i class="fa fa-times"></i>
          Cancelar</button>
        <button type="button" class="btn btn-success btn-sm" @click="guardarTransportista()"><i class="fa fa-check"></i>
          Guardar</button>
      </div>
    </template>
  </BaseBlock>
</template>
<script setup>
import { computed, onMounted , watch} from "vue";
import { useStore } from 'vuex';
import useVuelidate from "@vuelidate/core";
import {
  required,
  maxLength, helpers
} from "@vuelidate/validators";
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";

const store = useStore();
const transportista = computed(() => store.state.transportista);

const emit = defineEmits(["guardarTransportista"]);
const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);

const selectedTypeIdentify = computed(() => {
  return (
    listTypeIdentify.value.find(
      (tipo) => String(tipo.codigo) === String(transportista.value.tipo_identificacion)
    ) ?? null
  );
});

const identifyMinSize = computed(() => {
  return Number(selectedTypeIdentify.value?.min_size ?? 0);
});

const identifyMaxSize = computed(() => {
  return Number(selectedTypeIdentify.value?.max_size ?? 0);
});

const identifyName = computed(() => {
  return selectedTypeIdentify.value?.nombre ?? "Identificación";
});

const identifyMaxAllowed = computed(() => {
  return identifyMaxSize.value || 30;
});

const identifyCurrentLength = computed(() => {
  return String(transportista.value.identificacion ?? "").length;
});

const identifyRemainingCharacters = computed(() => {
  return Math.max(identifyMaxAllowed.value - identifyCurrentLength.value, 0);
});

const identifyCounterClass = computed(() => {
  if (identifyRemainingCharacters.value === 0) {
    return "bg-danger text-white";
  }

  if (identifyRemainingCharacters.value <= 3) {
    return "bg-warning text-dark";
  }

  return "bg-body-secondary text-muted";
});

const identifyLengthMessage = computed(() => {
  const min = identifyMinSize.value;
  const max = identifyMaxSize.value;

  if (min && max && min === max) {
    return `${identifyName.value} debe tener ${max} caracteres`;
  }

  if (min && max) {
    return `${identifyName.value} debe tener entre ${min} y ${max} caracteres`;
  }

  if (max) {
    return `${identifyName.value} debe tener máximo ${max} caracteres`;
  }

  return `${identifyName.value} no tiene una longitud válida`;
});

const numericIdentificationsCode = ["04", "05"];

const identifyOnlyNumbers = computed(() => {
  return numericIdentificationsCode.includes(
    String(transportista.value.tipo_identificacion)
  );
});

const identifyInputMode = computed(() => {
  return identifyOnlyNumbers.value ? "numeric" : "text";
});

const identifyFormatMessage = computed(() => {
  if (identifyOnlyNumbers.value) {
    return `${identifyName.value} solo debe contener números`;
  }

  return `${identifyName.value} solo debe contener letras y números`;
});

const validIdentifyLength = helpers.withMessage(
  () => identifyLengthMessage.value,
  (value) => {
    const text = String(value ?? "").trim();

    if (!text) {
      return true;
    }

    const min = identifyMinSize.value;
    const max = identifyMaxSize.value;

    if (min && text.length < min) {
      return false;
    }

    if (max && text.length > max) {
      return false;
    }

    return true;
  }
);

const validIdentifyFormat = helpers.withMessage(
  () => identifyFormatMessage.value,
  (value) => {
    const text = String(value ?? "").trim();

    if (!text) {
      return true;
    }

    if (identifyOnlyNumbers.value) {
      return /^\d+$/.test(text);
    }

    return /^[A-Za-z0-9]+$/.test(text);
  }
);

function onIdentificationInput(event) {
  let value = String(event.target.value ?? "");

  if (identifyOnlyNumbers.value) {
    value = value.replace(/\D/g, "");
  } else {
      value = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }

  transportista.value.identificacion = value;
  event.target.value = value;
}


const rules = computed(() => {
  return {
    nombre: {
      required,
      maxLength: maxLength(300),
    },
    tipo_identificacion: {
      required,
    },
    identificacion: {
      required,
      validIdentifyFormat,
      validIdentifyLength,
    },
    tipo_licencia: {
      required,
    },
    direccion: {
      required,
      maxLength: maxLength(300),
    },
    telefono: {
      required,
      maxLength: maxLength(20),
    },
  };
});

const v$ = useVuelidate(rules, transportista);

watch(
  () => transportista.value.tipo_identificacion,
  () => {
    transportista.value.identificacion = "";
    v$.value.identificacion.$reset();
  }
);

async function guardarTransportista() {

  const result = await v$.value.$validate();

  if (!result) {
    return;
  }

  emit('guardarTransportista')
}

onMounted(() => {
  typeIdentifyStore.fetchAll();

});
</script>
