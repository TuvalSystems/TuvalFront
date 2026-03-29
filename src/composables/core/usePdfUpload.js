import { ref } from "vue";

export function usePdfUpload() {
    const uploadedPdfs = ref([]);
    const isDraggingPdf = ref(false);
    const isProcessingPdf = ref(false);

    const MAX_PDF_MB = 10;

    const processFiles = async (files) => {
        isProcessingPdf.value = true;

        try {
            for (const file of files) {
                const isPdf =
                    file.type === 'application/pdf' ||
                    (file.name || '').toLowerCase().endsWith('.pdf')

                if (!isPdf) continue;

                const maxBytes = MAX_PDF_MB * 1024 * 1024;
                if (file.size > maxBytes) {
                    console.warn(`El archivo ${file.name} es demasiado grande (${file.size} bytes). El tamaño máximo permitido es ${MAX_PDF_MB} MB.`);
                    continue;
                }
                const previewUrl = URL.createObjectURL(file);

                uploadedPdfs.value.push({
                    id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: previewUrl,
                    isPersisted: false
                });
            }
        } finally {
            isProcessingPdf.value = false;
        }
    };


    const handleDropPdf = async (event) => {
        isDraggingPdf.value = false;
        const files = Array.from(event.dataTransfer?.files || []);
        await processFiles(files);
    }

    const handleInputPdf = async (event) => {
        const files = Array.from(event.target.files || []);
        await processFiles(files);
        event.target.value = '';
    };

    const removePdf = (index) => {
        const item = uploadedPdfs.value[index];
        if (!item) return;

        if (!item.isPersisted && item.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
        }

        uploadedPdfs.value.splice(index, 1);
    };
    const clearPdfs = () => {
        uploadedPdfs.value.forEach((item) => {
            if (!item.isPersisted && item.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(item.preview);
            }
        });
        uploadedPdfs.value = [];
    };


    const restorePersistedPdfs = (pdfs = []) => {
        uploadedPdfs.value = pdfs.map((item, index) => ({
            id: item.id || `pdf-restored-${index}`,
            file: null,
            name: item.nombre || item.name || `Documento ${index + 1}.pdf`,
            size: item.size || 0,
            type: item.mime_type || 'application/pdf',
            preview: item.url,
            isPersisted: true
        }));
    };


    return {
        uploadedPdfs,
        isDraggingPdf,
        isProcessingPdf,
        handleDropPdf,
        handleInputPdf,
        removePdf,
        clearPdfs,
        restorePersistedPdfs
    };
}