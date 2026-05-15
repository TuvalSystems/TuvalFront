import axiosClient from "@/axios";
import { ref, reactive, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useVersionManagementProcess() {
    const { run } = useApiAction();


    const loadingUpdateStatus = ref(false);
    const loadingDelete = ref(false);
    const apiBase = "/movil/admin/app/versions";

    async function updateStatusVersion(id, isActive) {
        return run(() => axiosClient.patch(`${apiBase}/${id}/active`, {
            is_active: isActive
        }), {
            loadingRef: loadingUpdateStatus,
        });
    }


    const formatApkSize = (bytes) => {
        const value = Number(bytes);
        if (!Number.isFinite(value) || value <= 0) {
            return "0 MB";
        }

        const mb = value / 1024 / 1024;

        return `${mb.toFixed(2)} MB`;
    }


    async function deleteVersion(id) {
        return run(() => axiosClient.delete(`${apiBase}/${id}`), {
            loadingRef: loadingDelete,
           
        })
    }


    /** proceso de subir de version  */
    const loadingCreate = ref(false);
    const uploadProgress = ref(0);
    const fileInputRef = ref(null);
    const form = reactive({
        platform: "android",
        version_name: "",
        build_number: "",
        minimum_required_build: "",
        message: "",
        release_notes: "",
        is_active: true,
        apk: null,
    });

    const fileName = computed(() => form.apk?.name || "Ningún archivo seleccionado");

    const fileSize = computed(() => {
        if (!form.apk?.size) return "0 MB";
        const mb = form.apk.size / 1024 / 1024;
        return `${mb.toFixed(2)} MB`;
    });

    const isValidApk = computed(() => {
        if (!form.apk) return false;
        return form.apk.name.toLowerCase().endsWith(".apk");
    });


    const isInvalidMinimumBuild = computed(() => {
        const build = Number(form.build_number);
        const minBuild = Number(form.minimum_required_build);
        if (!build || !minBuild) return false;
        return minBuild > build;
    });

    function handleFileChange(event) {
        const file = event.target.files?.[0] ?? null;
        form.apk = file;
    }


    const canSubmit = computed(() => {
        return (
            form.platform &&
            form.version_name &&
            Number(form.build_number) > 0 &&
            Number(form.minimum_required_build) > 0 &&
            form.apk &&
            isValidApk.value &&
            !isInvalidMinimumBuild.value &&
            !loadingCreate.value
        );
    });

    function resetForm() {
        form.platform = "android";
        form.version_name = "";
        form.build_number = "";
        form.minimum_required_build = "";
        form.message = "";
        form.release_notes = "";
        form.is_active = true;
        form.apk = null;

        uploadProgress.value = 0;

        if (fileInputRef.value) {
            fileInputRef.value.value = "";
        }
    }


    const apiCreateVersion = "/movil/admin/app/versions";
    async function createVersion() {
        const formData = new FormData();
        formData.append("platform", form.platform ?? "android");
        formData.append("version_name", form.version_name);
        formData.append("build_number", Number(form.build_number));
        formData.append("minimum_required_build", Number(form.minimum_required_build));
        formData.append("message", form.message ?? "");
        formData.append("release_notes", form.release_notes ?? "");
        formData.append("is_active", form.is_active ? 1 : 0);
        formData.append("apk", form.apk);
        uploadProgress.value = 0;

        return run(() => axiosClient.post(apiCreateVersion, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event) => {
                if (!event.total) return;

                uploadProgress.value = Math.round(
                    (event.loaded * 100) / event.total
                );
            },
        }), {
            loadingRef: loadingCreate,
            key: "create-version-apk"
        });


    }



    return {
        loadingUpdateStatus,
        updateStatusVersion,
        formatApkSize,
        loadingDelete,
        deleteVersion,

        //subir version 
        form,
        loadingCreate,
        fileName,
        isValidApk,
        fileSize,
        canSubmit,
        resetForm,
        isInvalidMinimumBuild,
        fileInputRef,
        uploadProgress,
        handleFileChange,
        createVersion

    }
}