<script setup>
import SectionIconPicker from '@/components/admin/secciones/SectionIconPicker.vue';
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    },
    parentOptions: {
        type: Array,
        default: () => [],
    },
    isEditing: {
        type: Boolean,
        default: false,
    },
    saving: {
        type: Boolean,
        default: false,
    },
    deleting: {
        type: Boolean,
        default: false,
    },
    loadingOptions: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
});

const emit = defineEmits([
    'update:modelValue',
    'save',
    'cancel',
    'remove',
]);

const title = computed(() => {
    return props.isEditing ? 'Editar sección' : 'Nueva sección';
});

function updateField(field, value) {
    emit('update:modelValue', {
        ...props.modelValue,
        [field]: value,
    });
}

function updateParentId(value) {
    updateField('parent_id', value ? Number(value) : null);
}

function updateSortOrder(value) {
    updateField('sort_order', value === '' ? 0 : Number(value));
}

function submitForm() {
    emit('save');
}
</script>

<template>
    <BaseBlock :title="title" bordered>
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <form @submit.prevent="submitForm" class="mb-2">
            <div class="form-floating mb-4">
                <input id="section-name" type="text" class="form-control" placeholder="Nombre" :value="modelValue.name"
                    @input="updateField('name', $event.target.value)" />
                <label for="section-name">Nombre</label>
            </div>

            <div class="form-floating mb-4">
                <input id="section-url" type="text" class="form-control" placeholder="URL" :value="modelValue.url"
                    @input="updateField('url', $event.target.value)" />
                <label for="section-url">URL</label>
            </div>

            <div class="form-floating mb-4">
                <input id="section-route-name" type="text" class="form-control" placeholder="Nombre de ruta"
                    :value="modelValue.route_name" @input="updateField('route_name', $event.target.value)" />
                <label for="section-route-name">Nombre de ruta</label>
            </div>
            <div class="mb-4">
                <label for="" class="form-label fw-semibold">
                    Ícono
                </label>

                <SectionIconPicker :model-value="modelValue.icon" @update:modelValue="updateField('icon', $event)" />
            </div>

            <div class="form-floating mb-4">
                <select id="section-parent" class="form-select" :value="modelValue.parent_id ?? ''"
                    :disabled="loadingOptions" @change="updateParentId($event.target.value)">
                    <option value="">Sin padre / sección raíz</option>

                    <option v-for="option in parentOptions" :key="option.id" :value="option.id">
                        {{ option.full_name }}
                    </option>
                </select>
                <label for="section-parent">
                    {{ loadingOptions ? 'Cargando padres...' : 'Sección padre' }}
                </label>
            </div>

            <div class="form-floating mb-4">
                <input id="section-sort-order" type="number" min="0" class="form-control" placeholder="Orden"
                    :value="modelValue.sort_order" @input="updateSortOrder($event.target.value)" />
                <label for="section-sort-order">Orden</label>
            </div>

            <div class="form-floating mb-4">
                <select id="section-platform" class="form-select" :value="modelValue.platform"
                    @change="updateField('platform', $event.target.value)">
                    <option value="web">Web</option>
                    <option value="app">App</option>
                </select>
                <label for="section-platform">Plataforma</label>
            </div>

            <div class="form-check form-switch mb-4">
                <input id="section-status" class="form-check-input" type="checkbox" :checked="modelValue.status"
                    @change="updateField('status', $event.target.checked)" />
                <label class="form-check-label" for="section-status">
                    Sección activa
                </label>
            </div>

            <div class="d-flex justify-content-between gap-2">
                <button v-if="isEditing" type="button" class="btn btn-danger" :disabled="deleting || saving"
                    @click="$emit('remove')">
                    <i class="fa fa-trash me-1"></i>
                    {{ deleting ? 'Eliminando...' : 'Eliminar' }}
                </button>

                <span v-else></span>

                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-secondary" :disabled="saving || deleting"
                        @click="$emit('cancel')">
                        Cancelar
                    </button>

                    <button type="submit" class="btn btn-primary" :disabled="saving || deleting">
                        <i class="fa fa-save me-1"></i>
                        {{ saving ? 'Guardando...' : 'Guardar' }}
                    </button>
                </div>
            </div>
        </form>
    </BaseBlock>
</template>