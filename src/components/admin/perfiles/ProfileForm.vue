<script setup>
import BaseBlock from '@/components/BaseBlock.vue';
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  deleting: {
    type: Boolean,
    default: false,
  },
  defaultPlatform: {
    type: String,
    default: 'web',
  },
});

const emit = defineEmits(['save', 'cancel', 'delete']);

const form = reactive({
  id: null,
  name: '',
  platform: 'web',
  state: 'active',
});

const isEditing = computed(() => {
  return Boolean(form.id);
});

const blockTitle = computed(() => {
  return isEditing.value ? 'Datos del perfil' : 'Nuevo perfil';
});

const platformLabel = computed(() => {
  return form.platform === 'app' ? 'App' : 'Web';
});

const canSave = computed(() => {
  return form.name.trim().length > 0 && !props.saving;
});

const canDelete = computed(() => {
  return isEditing.value && !props.saving && !props.deleting;
});

function normalizeState(value) {
  if (value === true || value === 1 || value === '1' || value === 'active') {
    return 'active';
  }
  return 'inactive';
}

function resetForm() {
  form.id = null;
  form.name = '';
  form.platform = props.defaultPlatform || 'web';
  form.state = 'active';
}

function fillForm(profile) {
  form.id = profile?.id ?? null;
  form.name = profile?.name ?? '';
  form.platform = profile?.platform ?? props.defaultPlatform ?? 'web';
  form.state = normalizeState(profile?.state);
}

function handleSubmit() {
  if (!canSave.value) {
    return;
  }

  emit('save', {
    id: form.id,
    name: form.name.trim(),
    platform: form.platform,
    state: form.state,
  });
}

function handleDelete() {
  if (!canDelete.value) {
    return;
  }
  emit('delete', {
    id: form.id,
    name: form.name,
    platform: form.platform,
    state: form.state,
  });
}

function handleCancel() {
  resetForm();
  emit('cancel');
}



watch(
  () => props.profile,
  (profile) => {
    if (profile) {
      fillForm(profile);
      return;
    }

    resetForm();
  },
  { immediate: true }
);

watch(
  () => props.defaultPlatform,
  (platform) => {
    if (!isEditing.value && !form.name) {
      form.platform = platform || 'web';
    }
  }
);
</script>

<template>
  <BaseBlock :title="blockTitle" class="mb-2">
    <template #options>
      <span class="badge" :class="form.platform === 'app' ? 'bg-primary-lt' : 'bg-info-lt'">
        {{ platformLabel }}
      </span>
    </template>

    <p class="fs-sm text-muted">
      Define el nombre, plataforma y estado del perfil.
    </p>

    <div class="profile-form-card">
      <div class="row g-3">
        <div class="col-12">
          <div class="form-floating">
            <input id="profile-name" v-model.trim="form.name" type="text" class="form-control" placeholder="Nombre"
              autocomplete="off">
            <label for="profile-name">Nombre del perfil</label>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <select id="profile-platform" v-model="form.platform" class="form-select">
              <option value="web">Web</option>
              <option value="app">App</option>
            </select>
            <label for="profile-platform">Plataforma</label>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating">
            <select id="profile-status" v-model="form.state" class="form-select">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <label for="profile-status">Estado</label>
          </div>
        </div>

        <div class="col-12">
          <div class="profile-info-box">
            <i class="fa fa-info-circle me-1"></i>
            Las secciones disponibles dependerán de la plataforma seleccionada.
          </div>
        </div>

        <div class="col-12">
          <div class="profile-current-state">
            <div class="profile-current-icon">
              <i class="fa fa-user-shield"></i>
            </div>

            <div class="profile-current-text">
              <div class="fw-semibold">
                {{ form.name || 'Sin nombre definido' }}
              </div>

              <div class="fs-sm text-muted">
                Plataforma {{ platformLabel }} ·
                {{ form.state === 'active' ? 'Activo' : 'Inactivo' }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 d-flex justify-content-between gap-2">
          <button v-if="isEditing" type="button" class="btn btn-danger" :disabled="!canDelete"
            @click="handleDelete">
            <i class="me-1" :class="deleting ? 'fa fa-spinner fa-spin' : 'fa fa-trash'"></i>
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>

          <div v-else></div>

          <div class="d-flex gap-2">
            <button type="button" class="btn btn-alt-secondary" :disabled="saving || deleting" @click="handleCancel">
              Cancelar
            </button>

            <button type="button" class="btn btn-primary" :disabled="!canSave" @click="handleSubmit">
              <i class="me-1" :class="saving ? 'fa fa-spinner fa-spin' : 'fa fa-save'"></i>
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>

<style scoped>
.profile-form-card {
  --profile-card-bg: var(--bs-body-bg);
  --profile-card-border: var(--bs-border-color);
  --profile-card-color: var(--bs-body-color);
  --profile-muted-color: var(--bs-secondary-color);
  --profile-box-bg: var(--bs-tertiary-bg);

  padding: 0.85rem;
  border: 1px solid var(--profile-card-border);
  border-radius: 0.85rem;
  background: var(--profile-card-bg);
  color: var(--profile-card-color);
}

.profile-info-box {
  padding: 0.75rem 0.85rem;
  border-radius: 0.75rem;
  background: rgba(var(--bs-info-rgb), 0.12);
  color: var(--bs-info);
  font-size: 0.82rem;
  font-weight: 600;
}

.profile-current-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.85rem;
  background: var(--profile-box-bg);
  border: 1px dashed var(--profile-card-border);
}

.profile-current-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.profile-current-text {
  min-width: 0;
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.28rem 0.48rem;
}

.bg-primary-lt {
  background-color: rgba(var(--bs-primary-rgb), 0.14);
  color: var(--bs-primary);
}

.bg-info-lt {
  background-color: rgba(var(--bs-info-rgb), 0.16);
  color: var(--bs-info);
}

:global(#page-container.dark-mode .profile-form-card) {
  background: #243447 !important;
  color: #e5ecf5 !important;
  border-color: rgba(255, 255, 255, 0.10) !important;
}

:global(#page-container.dark-mode .profile-info-box) {
  background: rgba(var(--bs-info-rgb), 0.16) !important;
  color: var(--bs-info) !important;
}

:global(#page-container.dark-mode .profile-current-state) {
  background: rgba(0, 0, 0, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

:global(#page-container.dark-mode .profile-current-icon) {
  background: rgba(var(--bs-primary-rgb), 0.18) !important;
  color: var(--bs-primary) !important;
}
</style>