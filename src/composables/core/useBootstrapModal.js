import { onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";

export function useBootstrapModal(elementRef, options = {}) {

    const { onHidden = null, ...bootstrapOptions } = options;
    let modalInstance = null;
    let modalElement = null;


    const blurFocusedElement = () => {
        const el = modalElement || elementRef.value;
        if (el && document.activeElement instanceof HTMLElement && el.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    };

    const handleHideEvent = () => {
        blurFocusedElement();
    };

    const handleHiddenEvent = () => {
        if (onHidden && typeof onHidden === "function") {
            onHidden();
        }
    };

    // Inicializamos el modal cuando el componente se monta
    onMounted(() => {
        modalElement = elementRef.value;

        if (!modalElement) return;

        modalInstance = Modal.getOrCreateInstance(
            modalElement,
            bootstrapOptions
        );

        modalElement.addEventListener("hide.bs.modal", handleHideEvent);
        modalElement.addEventListener("hidden.bs.modal", handleHiddenEvent);
    });

    onUnmounted(() => {
        if (modalElement) {
            modalElement.removeEventListener("hide.bs.modal", handleHideEvent);
            modalElement.removeEventListener("hidden.bs.modal", handleHiddenEvent);
        }

        modalInstance?.dispose();
        modalInstance = null;
        modalElement = null;
    });



    const show = () => {
        modalInstance?.show();
    };

    const hide = () => {
        blurFocusedElement();
        modalInstance?.hide();
    };

    const toggle = () => {
        blurFocusedElement();
        modalInstance?.toggle();
    };

    return { show, hide, toggle };

}