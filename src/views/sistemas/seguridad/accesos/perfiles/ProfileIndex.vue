<script setup>
import ProfileForm from '@/components/admin/perfiles/ProfileForm.vue';
import ProfileList from '@/components/admin/perfiles/ProfileList.vue';
import ProfileSectionAssignment from '@/components/admin/perfiles/ProfileSectionAssignment.vue';
import { useProfileSectionAssignment } from '@/composables/sistemas/seguridad/accesos/perfiles/useProfileSectionAssignment';
import BaseBlock from '@/components/BaseBlock.vue';
import { useProfileList } from '@/composables/sistemas/seguridad/accesos/perfiles/useProfileList';
import { useProfileAction } from '@/composables/sistemas/seguridad/accesos/perfiles/useProfileAction';
import { watchDebounced } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

import {
  swalSuccess,
  swalError,
  swalWarning,
  toast
} from "@/functions/swal-alert.js";

const {
  payload,
  profiles,
  loading,
  fetchProfiles,
  refresh,
} = useProfileList();

const {
  saving,
  deleting,
  saveProfile,
  updateProfile,
  deleteProfile,
} = useProfileAction();

const {
  sections,
  selectedSectionIds,
  homeSectionId,
  loadingSections,
  savingSections,
  loadProfileSections,
  saveProfileSections,
  resetAssignment,
  toggleSection,
  setHomeSection,
  markAll,
  clearAll,
} = useProfileSectionAssignment();

const selectedProfile = ref(null);

async function handlePlatformChange() {
  selectedProfile.value = null;
  await fetchProfiles();
}

async function handleStatusChange() {
  selectedProfile.value = null;
  await fetchProfiles();
}

function handleSelectProfile(profile) {
  selectedProfile.value = profile;
}


function handleEditProfile(profile) {
  selectedProfile.value = profile;
}

function handleCreateProfile() {
  selectedProfile.value = null;
}

function handleCancelProfile() {
  selectedProfile.value = null;
}

async function handleDeleteProfile(form) {
  if (!form?.id) {
    return;
  }
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar el perfil  " + form.name + "",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, Eliminar",
      cancelButtonText: "Cancelar",
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
        deletProfile(form);
      }
    });

}

async function deletProfile(form) {
  const resp = await deleteProfile(form.id);
  if (resp?.ok) {
    selectedProfile.value = null;
    await fetchProfiles();
    swalSuccess("Perfil eliminado correctamente");
    return;
  }
  const msg = resp?.message || "No se pudo eliminar el perfil";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

async function handleSaveProfile(form) {
  if (form.id) {
    const resp = await updateProfile(form);
    if (resp?.ok) {
      selectedProfile.value = null;
      await fetchProfiles();
      return;
    }
    const msg = resp?.message || "No se pudo actualizar el estado del usuario";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
  } else {
    const respU = await saveProfile(form);
    if (respU?.ok) {
      selectedProfile.value = null;
      await fetchProfiles();
      return;
    }
    const msg = respU?.message || "No se pudo actualizar el estado del usuario";
    (respU?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
  }

  selectedProfile.value = null;
  await fetchProfiles();
}

watch(
  () => selectedProfile.value,
  async (profile) => {
    if (!profile?.id) {
      resetAssignment();
      return;
    }

    await loadProfileSections(profile);
  }
);

async function handleSaveProfileSections() {
  if (!selectedProfile.value?.id) {
    swalWarning('Selecciona un perfil antes de guardar accesos');
    return;
  }

  const resp = await saveProfileSections(selectedProfile.value.id);

  if (resp?.ok) {
    swalSuccess('Accesos del perfil guardados correctamente');
    return;
  }

  const msg = resp?.message || 'No se pudieron guardar los accesos del perfil';
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

watchDebounced(
  () => payload.search,
  async (value) => {
    const search = value?.trim() ?? '';

    if (search === '' || search.length >= 3) {
      selectedProfile.value = null;
      await fetchProfiles();
    }
  },
  {
    debounce: 600,
  }
);



onMounted(async () => {
  await fetchProfiles();
});
</script>

<template>
  <BasePageHeading title="Gestión de Perfiles">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Seguridad</li>
          <li class="breadcrumb-item" aria-current="page">Perfiles</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <div class="row">
      <!-- Lista de perfiles -->
      <div class="col-md-6">
        <ProfileList v-model:platform="payload.platform" v-model:status="payload.status" v-model:search="payload.search"
          :profiles="profiles" :loading="loading" :selected-id="selectedProfile?.id"
          @change-platform="handlePlatformChange" @change-status="handleStatusChange" @select="handleSelectProfile"
          @edit="handleEditProfile" @create="handleCreateProfile" />
      </div>

      <!-- Formulario -->
      <div class="col-md-6">
        <ProfileForm :profile="selectedProfile" :saving="saving" :deleting="deleting"
          :default-platform="payload.platform" @save="handleSaveProfile" @cancel="handleCancelProfile"
          @delete="handleDeleteProfile" />
      </div>
    </div>

    <!-- Accesos -->
    <div class="row">
            <div class="col-md-12">
              <ProfileSectionAssignment :profile="selectedProfile" :sections="sections"
                :selected-ids="selectedSectionIds"  :home-section-id="homeSectionId" :loading="loadingSections" :saving="savingSections"
                @toggle="toggleSection"  @set-home="setHomeSection"  @mark-all="markAll" @clear-all="clearAll" @save="handleSaveProfileSections" />
            </div>
          </div>
  </div>
</template>

<style scoped>
.profile-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.055);
  border-radius: 0.5rem;
  background: #fff;
  transition: all 0.15s ease-in-out;
}

.profile-item:hover {
  border-color: rgba(13, 110, 253, 0.25);
  background: rgba(13, 110, 253, 0.035);
}

.profile-item.active {
  border-color: rgba(13, 110, 253, 0.45);
  background: rgba(13, 110, 253, 0.08);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.profile-info {
  min-width: 0;
  flex: 1;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.permission-search {
  width: 240px;
}

.permission-group {
  margin-bottom: 1rem;
}

.permission-children {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

.form-check-label {
  cursor: pointer;
}

@media (max-width: 767.98px) {
  .profile-item {
    align-items: flex-start;
  }

  .profile-meta {
    justify-content: flex-start;
  }

  .permission-search {
    width: 100%;
  }
}
</style>