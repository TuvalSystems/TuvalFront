import axiosClient from "@/axios";
import { ref, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";



function defaultForm() {
    return {
        id: null,
        parent_id: null,
        route_name: '',
        url: '',
        name: '',
        icon: '',
        sort_order: 0,
        platform: 'web',
        status: true,
    };
}

export function useSectionAction({ onSuccess } = {}) {

    const { run } = useApiAction();

    const form = ref(defaultForm());
    const loadingSaving = ref(false);

    const apiSaving = 'secciones';
    const loadingUpdate = ref(false);
    const loadingDeleting = ref(false);
    const apiDelete = 'secciones/eliminar-seccion';
    const isEditing = computed(() => Boolean(form.value.id));

    function resetForm() {
        form.value = defaultForm();
    }


    function createSection(parentId = null, platform = 'web') {
        form.value = {
            ...defaultForm(),
            parent_id: parentId,
            platform,
        };
    }

    function editSection(section) {
        form.value = {
            id: section.id,
            parent_id: section.parent_id ?? null,
            route_name: section.route_name ?? '',
            url: section.url ?? '',
            name: section.name ?? '',
            icon: section.icon ?? '',
            sort_order: section.sort_order ?? 0,
            platform: section.platform ?? 'web',
            status: Boolean(section.status),
        };
    }

    function buildPayload() {
        return {
            parent_id: form.value.parent_id || null,
            route_name: form.value.route_name || null,
            url: form.value.url || null,
            name: form.value.name,
            icon: form.value.icon || null,
            sort_order: Number(form.value.sort_order || 0),
            platform: form.value.platform || 'web',
            status: Boolean(form.value.status),
        };
    }

    async function saveSection() {
        const payload = buildPayload();
        return run(() => axiosClient.post(apiSaving,payload), {
            loadingRef: loadingSaving,
        });
    }

    async function updateSection() {
        const payload = buildPayload();
        return run(() => axiosClient.put(`secciones/${form.value.id}`, payload), {
            loadingRef: loadingUpdate,
        });
    }




    async function deleteSection(id) {
        if (!id) {
            return;
        }
        return run(() => axiosClient.post(apiDelete, { id: id }), {
            loadingRef: loadingDeleting,
        });
    }

    return {
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
    }
}
