import { ref } from 'vue';
import imageCompression from 'browser-image-compression';
export function useImageUpload() {
    const uploadedFiles = ref([]);
    const isDragging = ref(false);
    const isCompressing = ref(false);

    const processFiles = async (files) => {
        isCompressing.value = true;
        const options = {
            maxSizeMB: 1,          // Si pasa de 1MB, la comprime. Si pesa menos, no la toca mucho.
            maxWidthOrHeight: 1920, // Redimensiona si es gigante (ej: fotos de iPhone 4k)
            useWebWorker: true,    // Usa hilos secundarios para no congelar la pantalla
            initialQuality: 0.8,    // Calidad (0 a 1)
            fileType: 'image/jpeg',
        };
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedBlob = await imageCompression(file, options);
                    const finalFile = new File([compressedBlob], file.name, {
                        type: compressedBlob.type,
                        lastModified: Date.now()
                    });
                    const previewUrl = URL.createObjectURL(finalFile);
                    uploadedFiles.value.push({
                        file: finalFile,
                        name: finalFile.name,
                        size: finalFile.size,
                        type: finalFile.type,
                        preview: previewUrl,
                        isPersisted: false
                    });
                } catch (error) {
                    const previewUrl = URL.createObjectURL(file);
                    uploadedFiles.value.push({
                        file: file,
                        name: file.name,
                        preview: previewUrl,
                        isPersisted: false
                    });
                }
            }

        }
        isCompressing.value = false;
    }

    const handleDrop = (event) => {
        isDragging.value = false;
        const files = Array.from(event.dataTransfer.files);
        processFiles(files);
        event.target.value = '';
    }

    const handleInputFiles = (event) => {
        const files = Array.from(event.target.files);
        processFiles(files);
    }

    const removeFile = (index) => {
        if (uploadedFiles.value[index].preview) {
            URL.revokeObjectURL(uploadedFiles.value[index].preview);
        }
        uploadedFiles.value.splice(index, 1);
    }

    const clearFiles = () => {
        uploadedFiles.value.forEach(file => URL.revokeObjectURL(file.preview));
        uploadedFiles.value = [];
    }

    return {
        uploadedFiles,
        isDragging,
        isCompressing,
        handleDrop,
        handleInputFiles,
        removeFile,
        clearFiles
    }
}