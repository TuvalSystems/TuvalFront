<script setup>
import { nextTick, onMounted, ref } from 'vue';
import {
  swalSuccess,
  swalError,
  swalWarning,
  toast
} from "@/functions/swal-alert.js";
import BaseTable from "@/components/BaseTable.vue";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import { useUserTable } from "@/composables/sistemas/seguridad/usuarios/useUserTable";
import { useUserActions } from "@/composables/sistemas/seguridad/usuarios/useUserActions";
import verModalGestionUsuario from "@/views/sistemas/seguridad/usuarios/modals/verModalGestionUsuario.vue"

const {
  table,
  listPerpage,
  columns,
  loadingRef,
  fetchList,
  onSort,
  refresh,
  estadoClass,
  booleanBadgeClass
} = useUserTable();

const {
  loadingStatus,
  UpdateStatus,
  loadingReset,
  resetPasswordUser,

  //detalle de usuario 
  loadingDetail,
  detailUser,
  getDetailUser,

  //lista de perfiles web 
  loadingProfileWeb,
  getProfilesWeb,
  perfilesWeb,
  //lista de perfiles app
  loadingProfileApp,
  getProfilesApp,
  perfilesApp,
  //funciones helpers 
  hasMobileAppAccess,
  hasAdminCollectionAccess,
  //access app movil
  loadingMobileAppAccess,
  updateMobileAppAccess,

  //acceso admin cobros
  loadingAdminCollectionAccess,
  updateAdminCollectionAccess
} = useUserActions();

//modals 
const modalSeleccionRef = ref(null);
const modalSeleccionObj = useBootstrapModal(modalSeleccionRef);


const handleClick = ({ row, col }) => {

};

function isRowDisabled(row) {
  return false;

}

async function openAlertChangeStatus(row) {
  const isActive = Number(row.status) === 1;
  const confirmText = isActive ? "Sí, desactivar" : "Sí, activar";
  const confirmClass = isActive ? "btn btn-danger m-1" : "btn btn-success m-1";

  const message = isActive
    ? `Si desactivas a ${row.USERNAME}, no podrá acceder al sistema.`
    : `Si activas a ${row.USERNAME}, podrá acceder nuevamente a la plataforma.`;
  toast.fire({
    title: "¿Estás seguro?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: confirmClass,
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    html: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 50);
      });
    },
  }).then((result) => {
    if (result.isConfirmed || result.value) {
      changeStatusUser(row);
    }
  });
}

async function changeStatusUser(row) {
  const resp = await UpdateStatus(row.id);
  if (resp?.ok) {
    swalSuccess(resp.message);
    refreshAnyFilters();
    return;
  }
  const msg = resp?.message || "No se pudo actualizar el estado del usuario";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}


async function openAlertResetPassword(row) {
  const username = row?.USERNAME ?? 'este usuario';

  const result = await toast.fire({
    title: "¿Estás seguro?",
    text: `Si reseteas la contraseña de ${username}, obligatoriamente tendrá que cambiarla al iniciar sesión.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: "btn btn-danger m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: "Sí, resetearla",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
  });
  if (!result.isConfirmed) return;
  if (result.isConfirmed) {
    await resetPassword(row);
  }
}


async function resetPassword(row) {
  const resp = await resetPasswordUser(row.id);
  if (resp?.ok) {
    swalSuccess(resp.message);
    refreshAnyFilters();
    return;
  }
  const msg = resp?.message || "No se pudo actualizar el estado del usuario";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}



async function openAlertMobileAppAccess(row) {
  const username = row?.USERNAME ?? 'este usuario';
  const hasAccess = hasMobileAppAccess(row);

  const result = await toast.fire({
    title: "¿Estás seguro?",
    text: hasAccess
      ? `Se quitará el acceso a la App móvil para ${username}.`
      : `Se dará acceso a la App móvil para ${username}.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: hasAccess ? "btn btn-danger m-1" : "btn btn-success m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: hasAccess ? "Sí, quitar acceso" : "Sí, dar acceso",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  await changeMobileAppAccess(row);
}

async function changeMobileAppAccess(row) {
  const resp = await updateMobileAppAccess(row.id);

  if (resp?.ok) {
    swalSuccess(resp.message);
    refreshAnyFilters();
    return;
  }

  const msg = resp?.message || "No se pudo actualizar el acceso a la App móvil";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

async function openAlertAdminCollectionAccess(row) {
  const username = row?.USERNAME ?? 'este usuario';
  const hasAccess = hasAdminCollectionAccess(row);

  const result = await toast.fire({
    title: "¿Estás seguro?",
    text: hasAccess
      ? `Se quitará el acceso completo de Admin Cobros para ${username}.`
      : `Se dará acceso completo de Admin Cobros para ${username}.`,
    icon: "warning",
    showCancelButton: true,
    customClass: {
      confirmButton: hasAccess ? "btn btn-danger m-1" : "btn btn-success m-1",
      cancelButton: "btn btn-secondary m-1",
    },
    confirmButtonText: hasAccess ? "Sí, quitar acceso" : "Sí, dar acceso",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  await changeAdminCollectionAccess(row);
}

async function changeAdminCollectionAccess(row) {
  const resp = await updateAdminCollectionAccess(row.id);

  if (resp?.ok) {
    swalSuccess(resp.message);
    refreshAnyFilters();
    return;
  }

  const msg = resp?.message || "No se pudo actualizar el acceso de Admin Cobros";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}


async function openModalGestionPerfiles(row) {

  const promises = [
    getDetailUser(row.id),
  ];

  if (!perfilesWeb.value?.length) {
    promises.push(getProfilesWeb());
  }

  if (!perfilesApp.value?.length) {
    promises.push(getProfilesApp());
  }

  const responses = await Promise.all(promises);
  
  const errorResponse = responses.find((resp) => resp?.ok === false);

  if (errorResponse) {
    const msg = errorResponse?.message || 'No se pudo cargar la información del usuario';
    (errorResponse?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  await nextTick();
  modalSeleccionObj.show();
}

async function closeModal() {
  await nextTick();
  modalSeleccionObj.hide();
}

async function refreshAnyFilters(){
  fetchList(1);
}



onMounted(() => {
  fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Gestión de Usuarios">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Seguridad</li>
          <li class="breadcrumb-item" aria-current="page">Usuarios</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Lista de Usuarios" content-full rounded>
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-primary btn-sm" @click="refresh" :disabled="table.loading" title="Refrescar"
            aria-label="Refrescar">
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>

      <!-- paginacion y busqueda -->
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.filters.perpage" class="form-select form-select-sm">
            <option v-for="item in listPerpage" :key="item.value" :value="item.value"> {{ item.label }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <input v-model="table.filters.search" placeholder="Buscar..." class="form-control form-control-sm" />
        </div>
      </div>

      <!-- table -->
      <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.filters.perpage"
        :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
        :sortField="table.filters.sortField" :sortOrder="table.filters.sortOrder" @onSort="onSort"
        @onPageChange="fetchList" @onClick="handleClick" @onKeyDown="handleClick" :is-row-disabled="isRowDisabled">

        <template #cell-id="{ row }">
          <span class="badge bg-body-secondary  text-muted  border" style="font-size:12px">
            #{{ row.id }}
          </span>
        </template>
        <template #cell-USERID="{ row }">
          <div class="d-flex align-items-center gap-2">
            <div class="user-avatar">
              {{ String(row.USERNAME || row.USERID || '?').charAt(0).toUpperCase() }}
            </div>

            <div class="text-start">
              <div class="fw-semibold text-primary">
                {{ row.USERNAME }}
              </div>
              <div class="fs-xs text-muted">
                {{ row.USERID }}
              </div>
            </div>
          </div>
        </template>

        <template #cell-perfil_name="{ value }">
          <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2"
            style="font-size:12px">
            <i class="fa fa-user-shield me-1"></i>
            {{ value || 'Sin perfil' }}
          </span>
        </template>
        <template #cell-perfil_app_name="{ value }">
          <span v-if="value" class="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-3 py-2"
            style="font-size:12px">
            <i class="fa fa-mobile-alt me-1"></i>
            {{ value }}
          </span>

          <span v-else class="badge rounded-pill bg-body-secondary text-muted border px-3 py-2" style="font-size:12px">
            <i class="fa fa-minus-circle me-1"></i>
            Sin perfil app
          </span>
        </template>
        <template #cell-is_admin_cobros="{ value }">
          <span :class="booleanBadgeClass(value)" style="font-size:12px">
            <i class="fa me-1" :class="value ? 'fa-cash-register' : 'fa-ban'"></i>
            {{ value ? 'Sí' : 'No' }}
          </span>
        </template>

        <template #cell-app_access="{ value }">
          <span :class="booleanBadgeClass(value)" style="font-size:12px">
            <i class="fa me-1" :class="value ? 'fa-mobile-screen-button' : 'fa-mobile-screen'"></i>
            {{ value ? 'Sí' : 'No' }}
          </span>
        </template>

        <template #cell-status="{ value }">
          <span :class="booleanBadgeClass(value)" style="font-size:12px">
            {{ value ? 'Activo' : 'Inactivo' }}
          </span>
        </template>

        <!-- Slot de vacío -->
        <template #empty>
          <div class="text-center py-5">
            <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">
              No se encontraron registros para mostrar
            </p>
          </div>
        </template>

        <!-- slot de acciones -->
        <template #actions="{ row }">
          <button type="button" class="btn btn-sm btn-alt-secondary" :id="`dropOptions-${row.id}`"
            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-fw fa-ellipsis-v"></i> </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm"
            :aria-labelledby="`dropOptions-${row.id}`">
            <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Gestión</li>
            <li v-if="row.apk_url">
              <a class="dropdown-item d-flex align-items-center gap-2 py-2" :href="row.apk_url" target="_blank"
                rel="noopener noreferrer">
                <i class="fa fa-download fa-fw text-success"></i> <span>Descargar APK</span>
              </a>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                @click="openAlertChangeStatus(row)">
                <i class="fa fa-fw" :class="Number(row.status) === 1
                  ? 'fa-toggle-off text-warning'
                  : 'fa-toggle-on text-success'"></i>
                <span>
                  {{ Boolean(row.status) === true ? 'Desactivar' : 'Activar' }}
                </span>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                @click="openAlertResetPassword(row)">
                <i class="fa fa-key "></i> Resetear Contraseña
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                @click="openModalGestionPerfiles(row)">
                <i class="fa fa-users-gear"></i> Gestionar
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                :disabled="loadingMobileAppAccess" @click="openAlertMobileAppAccess(row)">
                <i class="fa fa-fw" :class="hasMobileAppAccess(row)
                  ? 'fa-mobile-screen-button text-success'
                  : 'fa-mobile-screen-button text-muted'"></i>
                <span>
                  {{ hasMobileAppAccess(row) ? 'Quitar acceso App móvil' : 'Dar acceso App móvil' }}
                </span>
              </button>
            </li>

            <li>
              <button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2"
                :disabled="loadingAdminCollectionAccess" @click="openAlertAdminCollectionAccess(row)">
                <i class="fa fa-fw" :class="hasAdminCollectionAccess(row)
                  ? 'fa-cash-register text-success'
                  : 'fa-cash-register text-muted'"></i>
                <span>
                  {{ hasAdminCollectionAccess(row) ? 'Quitar Admin Cobros' : 'Dar Admin Cobros' }}
                </span>
              </button>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                @click="eliminarVersion(row)">
                <i class="fa fa-trash fa-fw"></i>
                <span>Eliminar</span>
              </button>
            </li>
          </ul>
        </template>
        <!-- end slot de acciones -->
      </BaseTable>
      <!-- end table -->
    </BaseBlock>
  </div>


  <!-- modales -->
  <div class="modal" id="modal-seleccion-perfiles" tabindex="-1" aria-labelledby="modal-seleccion-perfiles"
    aria-hidden="true" ref="modalSeleccionRef">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <verModalGestionUsuario v-if="detailUser"
          :detail-user="detailUser" :perfiles-web="perfilesWeb" :perfiles-app="perfilesApp" @closeModal="closeModal"
          @refresh="refreshAnyFilters">
        </verModalGestionUsuario>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-avatar {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  background: rgba(13, 110, 253, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(13, 110, 253, 0.25);
}

.fs-xs {
  font-size: 11px;
}
</style>
