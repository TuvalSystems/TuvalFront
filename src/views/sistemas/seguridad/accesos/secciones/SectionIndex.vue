<script setup>
import { onMounted, computed } from 'vue';
import SectionTreeNode from '@/components/admin/secciones/SectionTreeNode.vue';
import SectionForm from '@/components/admin/secciones/SectionForm.vue';

import { useSectionTree } from "@/composables/sistemas/seguridad/accesos/secciones/useSectionTree";
import { useSectionAction } from '@/composables/sistemas/seguridad/accesos/secciones/useSectionAction';

const {
    payload,
    loading,
    loadingOptions,
    sections,
    fetchSections,
    parentOptions,
    fetchParentOptions,
    hasSections,
    refresh,
    changeOnlyActive,
    changePlatform,
    selectSection,
    clearSelection,
    selectedSection
} = useSectionTree();

const {
    form,
    isEditing,
    loadingSaving,
    loadingUpdate,
    loadingDeleting,
    resetForm,
    editSection,
    createSection,
    saveSection,
    updateSection,
    deleteSection
} = useSectionAction();
async function handleCreateRoot() {
    clearSelection();
    createSection(null, payload.platform);
    await fetchParentOptions();
}



async function handleCreateChild(section) {
    selectSection(section);
    createSection(section.id, section.platform || payload.platform);
    await fetchParentOptions();
}

const activeSectionId = computed(() => {
    return selectedSection.value?.id || null;
});

async function handleFilterChange() {
    resetForm();
    clearSelection();
    await fetchSections();
    await fetchParentOptions();
}

async function handlePlatformChange(event) {
    changePlatform(event.target.value);
    await handleFilterChange();
}
async function handleOnlyActiveChange(event) {
    changeOnlyActive(event.target.checked);
    await handleFilterChange();

}

async function handleCancel() {
    resetForm();
    clearSelection();
    await fetchParentOptions();
}
async function handleSelectSection(section) {
    selectSection(section);
    editSection(section);
    await fetchParentOptions(section.id);
}

async function handleSave() {
    if (isEditing.value) {
        await updateSection();
    } else {
        await saveSection();
    }

    resetForm();
    clearSelection();
    await fetchSections();
    await fetchParentOptions();
}

async function handleDelete() {
    if (!form.value.id) {
        return;
    }
    await deleteSection(form.value.id);
    resetForm();
    clearSelection();
    await fetchSections();
    await fetchParentOptions();
}

onMounted(async () => {
    await refresh();
    await fetchParentOptions();
});
</script>
<template>
    <BasePageHeading title="Gestión de Secciones">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Sistemas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Seguridad</li>
                    <li class="breadcrumb-item" aria-current="page">Secciones</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>


    <div class="content">
        <div class="row">
            <div class="col-md-6">
                <BaseBlock title="Árbol de secciones" class="mb-2">
                    <template #options>
                        <button type="button" class="btn btn-success btn-sm" @click="handleCreateRoot">
                            <i class="fa fa-plus me-1"></i>
                            Crear sección
                        </button>
                    </template>
                    <p class="fs-sm text-muted">
                        Administra las secciones del sistema en formato árbol.
                    </p>

                    <div class="row g-2 mb-4">
                        <div class="col-md-7">
                            <div class="form-floating">
                                <select id="filter-platform" class="form-select form-select-sm" :value="payload.platform"
                                    @change="handlePlatformChange">
                                    <option value="web">Web</option>
                                    <option value="app">App</option>
                                </select>
                                <label for="filter-platform">Plataforma</label>
                            </div>
                        </div>
                        <div class="col-md-5 d-flex align-items-center">
                            <div class="form-check form-switch">
                                <input id="filter-active" class="form-check-input" type="checkbox"
                                    :checked="payload.onlyActive" @change="handleOnlyActiveChange" />
                                <label class="form-check-label" for="filter-active">
                                    Solo activas
                                </label>
                            </div>
                        </div>
                    </div>

                    <div v-if="loading" class="text-muted py-4 text-center">
                        <i class="fa fa-spinner fa-spin me-1"></i>
                        Cargando secciones...
                    </div>
                    <div v-else-if="!hasSections" class="alert alert-info mb-4">
                        No existen secciones registradas para los filtros seleccionados.
                    </div>
                    <ul v-else class="list-unstyled mb-0">
                        <SectionTreeNode v-for="section in sections" :key="section.id" :section="section"
                            :selected-id="activeSectionId" :max-depth="3" @select="handleSelectSection"
                            @create-child="handleCreateChild" />
                    </ul>

                </BaseBlock>
            </div>
            <div class="col-md-6">
                <SectionForm v-model="form" :parent-options="parentOptions" :is-editing="isEditing"
                    :saving="loadingSaving || loadingUpdate" :deleting="loadingDeleting"
                    :loading-options="loadingOptions" @save="handleSave" @cancel="handleCancel"
                    @remove="handleDelete" />
            </div>
        </div>
    </div>
</template>
