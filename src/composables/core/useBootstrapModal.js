import { ref, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";

export function useBootstrapModal(elementRef, options = {}) {

    const { onHidden = null, ...bootstrapOptions } = options;
    let modalInstance = null;

    // Esta función se ejecutará cuando Bootstrap diga "ya me cerré"
    const handleHiddenEvent = () => {
        // Si nos pasaron una función de limpieza, la ejecutamos
        if (onHidden && typeof onHidden === "function") {
            onHidden();
        }
    };

    // Inicializamos el modal cuando el componente se monta
    onMounted(() => {
        if (elementRef.value) {
            // Inicializamos el modal de Bootstrap normalmente
            modalInstance = Modal.getOrCreateInstance(elementRef.value, bootstrapOptions);

            // --- AQUÍ ESTÁ LA MAGIA ---
            // Escuchamos el evento nativo de Bootstrap
            elementRef.value.addEventListener('hidden.bs.modal', handleHiddenEvent);
        }
    });

    //Limpiamos la instacia cuando el componente se destruye
    onUnmounted(() => {
        if (elementRef.value) {
            elementRef.value.removeEventListener('hidden.bs.modal', handleHiddenEvent);
        }
        if (modalInstance) {
            modalInstance.dispose();
            modalInstance = null;
        }
    });

    const show = () => modalInstance?.show();
    const hide = () => modalInstance?.hide();
    const toggle = () => modalInstance?.toggle();

    return { show, hide, toggle };
    
}