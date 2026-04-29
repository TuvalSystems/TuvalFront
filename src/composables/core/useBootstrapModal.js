import { onMounted, onUnmounted } from "vue";
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
        const el = elementRef.value;
        if (!el) return;
        modalInstance = Modal.getOrCreateInstance(el, bootstrapOptions);
        el.addEventListener('hidden.bs.modal', handleHiddenEvent);

        onUnmounted(() => {
            el.removeEventListener('hidden.bs.modal', handleHiddenEvent);
            modalInstance?.dispose();
            modalInstance = null;
        });
    });

    // //Limpiamos la instacia cuando el componente se destruye
    // onUnmounted(() => {
    //     if (elementRef.value) {
    //         elementRef.value.removeEventListener('hidden.bs.modal', handleHiddenEvent);
    //     }
    //     if (modalInstance) {
    //         modalInstance.dispose();
    //         modalInstance = null;
    //     }
    // });

    const show = () => modalInstance?.show();
    const hide = () => modalInstance?.hide();
    const toggle = () => modalInstance?.toggle();

    return { show, hide, toggle };

}