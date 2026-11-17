<script setup>
import { computed, watch } from 'vue';
import { useUserTable } from "@/composables/sistemas/seguridad/usuarios/useUserTable";
import { useUserActions } from "@/composables/sistemas/seguridad/usuarios/useUserActions";
import {
  swalError, swalWarning, swalSuccess
} from "@/functions/swal-alert.js";
const emit = defineEmits(["closeModal", "refresh"]);
const {
  //proceso de actualizacion de detalle de usuario 
  form,
  loadingUpdateProfiles,
  updateProfilesUser
} = useUserActions();

const props = defineProps({
  detailUser: {
    type: Object,
    required: true,
  },
  perfilesWeb: {
    type: Array,
    default: () => [],
  },
  perfilesApp: {
    type: Array,
    default: () => [],
  },
});

const { booleanBadgeClass } = useUserTable();


watch(
  () => props.detailUser,
  (user) => {
    form.user_id = user?.id
    form.perfil_id = user?.perfil_id ?? null;
    form.perfil_app_id = user?.perfil_app_id ?? null;
  },
  { immediate: true }
);

const userInitial = computed(() => {
  return String(
    props.detailUser?.USERNAME ||
    props.detailUser?.USERID ||
    '?'
  ).charAt(0).toUpperCase();
});

const perfilWebActual = computed(() => {
  return props.detailUser?.perfil?.name || 'Sin perfil web';
});

const perfilAppActual = computed(() => {
  return props.detailUser?.perfil_app?.name || 'Sin perfil app';
});

const hasChanges = computed(() => {
  return Number(form.perfil_id ?? 0) !== Number(props.detailUser?.perfil_id ?? 0)
    || Number(form.perfil_app_id ?? 0) !== Number(props.detailUser?.perfil_app_id ?? 0);
});

function cerrarModal() {
  emit('closeModal');
}

async function guardarCambios() {
  const resp = await updateProfilesUser();
  if (!resp?.ok) {
    if (resp?.status >= 400 && resp?.status < 499) {
      swalWarning(resp?.message);
    } else {
      swalError(resp?.message);
    }
  }
  if (resp?.ok) {
    swalSuccess(resp?.message);
    emit('closeModal');
    emit('refresh');
  }

}

</script>

<template>
  <BaseBlock title="Gestión de Usuario" class="mb-2" transparent>
    <template #options>
      <button type="button" class="btn-block-option" aria-label="Close" @click="cerrarModal">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <div class="block-content block-content-full">
      <div class="row g-3">
        <!-- Resumen -->
        <div class="col-md-6">
          <BaseBlock title="Resumen del Usuario" rounded>
            <div class="block-content">
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="user-avatar-lg">
                  {{ userInitial }}
                </div>

                <div>
                  <h5 class="mb-1">
                    {{ detailUser.USERNAME || 'Sin nombre' }}
                  </h5>
                  <div class="text-muted fs-sm">
                    {{ detailUser.USERID || 'Sin usuario' }}
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Código interno</small>
                    <div class="badge bg-body-secondary text-muted  border">
                      #{{ detailUser.id }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Usuario GP</small>
                    <div class="fw-semibold">
                      {{ detailUser.co_usr || 'N/A' }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Perfil Web Actual</small>
                    <div class="fw-semibold text-truncate">
                      {{ perfilWebActual }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Perfil App Actual</small>
                    <div class="fw-semibold text-truncate">
                      {{ perfilAppActual }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Admin cobros</small>
                    <span :class="booleanBadgeClass(detailUser.is_admin_cobros)" style="font-size:12px">
                      <i class="fa me-1" :class="detailUser.is_admin_cobros ? 'fa-cash-register' : 'fa-ban'"></i>
                      {{ detailUser.is_admin_cobros ? 'Sí' : 'No' }}
                    </span>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Acceso App</small>
                    <span :class="booleanBadgeClass(detailUser.app_access)" style="font-size:12px">
                      <i class="fa me-1"
                        :class="detailUser.app_access ? 'fa-mobile-screen-button' : 'fa-mobile-screen'"></i>
                      {{ detailUser.app_access ? 'Sí' : 'No' }}
                    </span>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <small class="text-label-muted">Estado</small>
                    <span :class="booleanBadgeClass(detailUser.status)" style="font-size:12px">
                      <i class="fa me-1" :class="detailUser.status ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
                      {{ detailUser.status ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>

                <div class="col-6">
                  <div class="kv">
                    <label for="" class="text-label-muted">Cambio de contraseña</label>
                    <span class="badge rounded-pill border px-3 py-2" :class="detailUser.must_change_password
                      ? 'bg-warning-subtle text-warning border-warning-subtle'
                      : 'bg-body-secondary text-muted'" style="font-size:12px">
                      <i class="fa me-1" :class="detailUser.must_change_password ? 'fa-key' : 'fa-lock-open'"></i>
                      {{ detailUser.must_change_password ? 'Pendiente' : 'No requerido' }}
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </BaseBlock>
        </div>

        <!-- Formulario -->
        <div class="col-md-6">
          <BaseBlock title="Datos de Gestión" rounded>
            <div class="block-content">
              <div class="mb-3">
                <div class="kv">
                  <small class="text-label-muted">Perfil Web</small>
                  <select id="perfilWeb" class="form-select form-select-sm" v-model="form.perfil_id">
                    <option :value="null">Seleccione…</option>
                    <option v-for="perfil in perfilesWeb" :key="perfil.id" :value="perfil.id">
                      {{ perfil.name }}
                    </option>
                  </select>
                  <div class="text-muted text-uppercase" style="font-size:8px">
                    Perfil usado para permisos y accesos dentro del sistema web.
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="kv">
                  <small class="text-label-muted"> Perfil App</small>
                  <select id="perfilApp" class="form-select form-select-sm" v-model="form.perfil_app_id">
                    <option :value="null">Sin perfil app</option>
                    <option v-for="perfil in perfilesApp" :key="perfil.id" :value="perfil.id">
                      {{ perfil.name }}
                    </option>
                  </select>

                  <div class="text-muted text-uppercase" style="font-size:8px">
                    Perfil usado para permisos y accesos dentro de la aplicación móvil.
                  </div>
                </div>
              </div>

              <div class="row g-3 mt-2">
                <div class="col-12">
                  <div class="border rounded p-3 bg-body-light">
                    <div class="d-flex align-items-start gap-2">
                      <i class="fa fa-user-shield text-primary mt-1"></i>
                      <div>
                        <div class="fw-semibold mb-1">
                          Asignación actual
                        </div>
                        <div class="fs-sm text-muted">
                          Web:
                          <span class="fw-semibold text-secondary">
                            {{ perfilWebActual }}
                          </span>
                        </div>
                        <div class="fs-sm text-muted">
                          App:
                          <span class="fw-semibold text-secondary">
                            {{ perfilAppActual }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="hasChanges" class="col-12">
                  <div class="alert alert-warning mb-0">
                    <i class="fa fa-triangle-exclamation me-1"></i>
                    Existen cambios pendientes por guardar.
                  </div>
                </div>

                <div v-else class="col-12">
                  <div class="alert alert-secondary mb-0">
                    <i class="fa fa-check-circle me-1"></i>
                    No hay cambios pendientes.
                  </div>
                </div>
              </div>
            </div>
          </BaseBlock>
        </div>
      </div>
    </div>
  </BaseBlock>

  <div class="content text-end mb-4 space-x-2">
    <button type="button" class="btn btn-danger btn-sm" @click="cerrarModal">
      Cancelar
    </button>

    <button type="button" class="btn btn-sm btn-primary" :disabled="!hasChanges || loadingUpdateProfiles"
      @click="guardarCambios">
      <i class="fa fa-save me-1"></i>
      Guardar cambios
    </button>
  </div>
</template>

<style scoped>
.user-avatar-lg {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 50%;
  background: rgba(var(--bs-primary-rgb), 0.16);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
}

.fs-sm {
  font-size: 10px;
}

.kv small {
  display: block;
  line-height: 2;
}


.kv .badge2 {
  white-space: normal;
  text-align: left;
  display: block;
  line-height: 1.4;
  font-weight: 10px;
}


.kv .fw-semibold {
  line-height: 1.2;
}

.text-label-muted {
  color: var(--tuval-text-muted);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
}

.bg-body-light {
  background: rgba(0, 0, 0, 0.02);
}
</style>