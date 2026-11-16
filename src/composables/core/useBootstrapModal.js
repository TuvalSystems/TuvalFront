import { onMounted, onUnmounted, watch } from "vue";
import { Modal } from "bootstrap";

export function useBootstrapModal(elementRef, options = {}) {

    const {
        onShow = null,
        onShown = null,
        onHide = null,
        onHidden = null,
        ...bootstrapOptions
    } = options;
    let modalInstance = null;
    let modalElement = null;


    const blurFocusedElement = () => {
        const el = modalElement || elementRef.value;
        if (el && document.activeElement instanceof HTMLElement && el.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    };

    const runCallback = (callback, event) => {
        if (typeof callback === "function") {
            callback(event);
        }
    };

    const handleShowEvent = (event) => {
        runCallback(onShow, event);
    };

    const handleShownEvent = (event) => {
        runCallback(onShown, event);
    };

    const handleHideEvent = (event) => {
        runCallback(onHide, event);
        if (!event.defaultPrevented) {
            blurFocusedElement();
        }
    };

    const handleHiddenEvent = (event) => {
        runCallback(onHidden, event);
    };

    const disposeModal = () => {
        if (modalElement) {
            modalElement.removeEventListener("show.bs.modal", handleShowEvent);
            modalElement.removeEventListener("shown.bs.modal", handleShownEvent);
            modalElement.removeEventListener("hide.bs.modal", handleHideEvent);
            modalElement.removeEventListener("hidden.bs.modal", handleHiddenEvent);
        }
        modalInstance?.dispose();
        modalInstance = null;
        modalElement = null;
    };

    const initializeModal = () => {
        if (modalElement === elementRef.value) return;
        disposeModal();
        modalElement = elementRef.value;

        if (!modalElement) return;

        modalInstance = Modal.getOrCreateInstance(
            modalElement,
            bootstrapOptions
        );

        modalElement.addEventListener("show.bs.modal", handleShowEvent);
        modalElement.addEventListener("shown.bs.modal", handleShownEvent);
        modalElement.addEventListener("hide.bs.modal", handleHideEvent);
        modalElement.addEventListener("hidden.bs.modal", handleHiddenEvent);
    };

    onMounted(initializeModal);
    // Los formularios con :key reemplazan el elemento al recuperar otro borrador.
    watch(elementRef, initializeModal, { flush: 'post' });
    onUnmounted(disposeModal);

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
