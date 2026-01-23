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
                    console.log(`Peso original de ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                    const compressedFile = await imageCompression(file, options);
                    console.log(`Peso comprimido de ${file.name}: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                    const previewUrl = URL.createObjectURL(compressedFile);
                    uploadedFiles.value.push({
                        file: compressedFile,
                        name: compressedFile.name,
                        size: compressedFile.size,
                        type: compressedFile.type,
                        preview: previewUrl
                    });
                } catch (error) {
                    console.error("Error al comprimir:", error);
                    const previewUrl = URL.createObjectURL(file);
                    uploadedFiles.value.push({
                        file: file,
                        name: file.name,
                        preview: previewUrl
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