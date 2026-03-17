<script setup>
import { ref } from 'vue'
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
const props = defineProps({
    documentos: {
        type: Array,
        default: () => []
    }
})
const selectedPdf = ref(null)
const modalPreviewRef = ref(null)
const { show, hide } = useBootstrapModal(modalPreviewRef, {
    onHidden: () => {
        selectedPdf.value = null
    }
})

const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const openPreview = (documento) => {
    selectedPdf.value = documento
    show()
}

const getPdfViewerUrl = (url) => {
    return `${url}#toolbar=1&navpanes=0&scrollbar=1`
}
</script>

<template>
    <BaseBlock title="Documentos PDF" class="mb-0" content-class="p-0">
        <template #options>
            <span class="badge bg-primary">{{ documentos.length }}</span>
        </template>

        <template #content>
            <div v-if="documentos.length" class="list-group list-group-flush">
                <div v-for="documento in documentos" :key="documento.id"
                    class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div class="flex-grow-1">
                        <div class="fw-semibold">
                            {{ documento.nombre }}
                        </div>

                        <div class="fs-sm text-muted">
                            {{ documento.mime_type }} · {{ formatSize(documento.size) }}
                        </div>

                        <div class="fs-sm text-muted">
                            {{ documento.file_name }}
                        </div>
                    </div>

                    <div class="d-flex gap-2 flex-shrink-0">
                        <button type="button" class="btn btn-sm btn-alt-primary" @click="openPreview(documento)">
                            <i class="fa fa-eye me-1"></i>
                            Ver
                        </button>

                        <a :href="documento.url" target="_blank" rel="noopener noreferrer"
                            class="btn btn-sm btn-alt-secondary">
                            <i class="fa fa-up-right-from-square me-1"></i>
                            Abrir
                        </a>
                    </div>
                </div>
            </div>

            <div v-else class="p-4 text-center text-muted">
                No hay documentos PDF cargados.
            </div>
        </template>
    </BaseBlock>

    <div ref="modalPreviewRef" class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h5 class="modal-title mb-0">
                            {{ selectedPdf?.nombre || 'Vista previa del PDF' }}
                        </h5>
                        <small v-if="selectedPdf" class="text-muted">
                            {{ formatSize(selectedPdf.size) }}
                        </small>
                    </div>

                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-0">
                    <iframe v-if="selectedPdf?.url" title="Documento Pdf" :src="getPdfViewerUrl(selectedPdf.url)" width="100%" height="700"
                        style="border: 0;" />
                </div>

                <div class="modal-footer">
                    <a v-if="selectedPdf?.url" :href="selectedPdf.url" target="_blank" rel="noopener noreferrer"
                        class="btn btn-alt-secondary">
                        <i class="fa fa-up-right-from-square me-1"></i>
                        Abrir en otra pestaña
                    </a>

                    <button type="button" class="btn btn-primary" @click="hide">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>