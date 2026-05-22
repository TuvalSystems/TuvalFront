import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useProfileSectionAssignment() {
    const { run } = useApiAction();

    const sections = ref([]);
    const selectedSectionIds = ref([]);
    const homeSectionId = ref(null);


    const loadingSections = ref(false);
    const savingSections = ref(false);

    const apiSections = "secciones/lista-secciones";
    const apiAssignedSections = "perfiles/secciones-asignadas";
    const apiSaveSections = "perfiles/secciones/guardar";

    async function fetchSections(platform = "web") {
        return run(() => axiosClient.get(apiSections, {
            params: {
                platform,
                only_active: 1,
            },
        }), {
            loadingRef: loadingSections,
            onSuccess: (info) => {
                sections.value = info ?? [];
            },
        });
    }

    async function fetchAssignedSections(profileId) {
        if (!profileId) {
            selectedSectionIds.value = [];
            homeSectionId.value = null;
            return;
        }

        return run(() => axiosClient.get(apiAssignedSections, {
            params: {
                perfil_id: profileId,
            },
        }), {
            loadingRef: loadingSections,
            onSuccess: (info) => {
                selectedSectionIds.value = info?.section_ids ?? [];
                homeSectionId.value = info?.home_section_id ?? null;
            },
        });
    }

    async function loadProfileSections(profile) {
        if (!profile?.id) {
            resetAssignment();
            return;
        }

        await fetchSections(profile.platform);
        await fetchAssignedSections(profile.id);
    }

    async function saveProfileSections(profileId) {
        return run(() => axiosClient.post(apiSaveSections, {
            perfil_id: profileId,
            section_ids: selectedSectionIds.value,
            home_section_id: homeSectionId.value,
        }), {
            loadingRef: savingSections,
        });
    }

    function resetAssignment() {
        sections.value = [];
        selectedSectionIds.value = [];
        homeSectionId.value = null;
    }

    function getChildren(section) {
        return section.children ?? [];
    }

    function getDescendantIds(section) {
        const ids = [];

        function walk(node) {
            ids.push(Number(node.id));

            for (const child of getChildren(node)) {
                walk(child);
            }
        }

        walk(section);

        return ids;
    }

    function toggleSection(section, checked) {
        const ids = getDescendantIds(section);
        const current = new Set(selectedSectionIds.value.map(Number));

        if (checked) {
            ids.forEach((id) => current.add(id));
        } else {
            ids.forEach((id) => current.delete(id));
            if (ids.includes(Number(homeSectionId.value))) {
                homeSectionId.value = null;
            }
        }

        selectedSectionIds.value = Array.from(current);
    }


    function setHomeSection(section) {
        const sectionId = Number(section.id);
        const current = new Set(selectedSectionIds.value.map(Number));

        if (!current.has(sectionId)) {
            current.add(sectionId);
            selectedSectionIds.value = Array.from(current);
        }

        homeSectionId.value = sectionId;
    }

    function markAll() {
        const ids = [];

        function walk(items) {
            for (const item of items) {
                ids.push(Number(item.id));

                if (item.children?.length) {
                    walk(item.children);
                }
            }
        }

        walk(sections.value);

        selectedSectionIds.value = [...new Set(ids)];
    }

    function clearAll() {
        selectedSectionIds.value = [];
        homeSectionId.value = null;
    }

    return {
        sections,
        selectedSectionIds,
        homeSectionId,
        loadingSections,
        savingSections,

        fetchSections,
        fetchAssignedSections,
        loadProfileSections,
        saveProfileSections,
        resetAssignment,

        toggleSection,
        setHomeSection,
        markAll,
        clearAll,
    };
}