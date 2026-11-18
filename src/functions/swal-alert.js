import Swal from "sweetalert2";

let cleanupModalAlert = null;

export let toast = Swal.mixin({
    buttonsStyling: false,
    target: "#page-container",
    // Escape cierra la alerta antes de llegar al modal de Bootstrap.
    keydownListenerCapture: true,
    willOpen: (popup) => {
        cleanupModalAlert?.();
        cleanupModalAlert = null;
        const openModals = document.querySelectorAll(".modal.show");
        const modal = openModals[openModals.length - 1];
        if (!modal) return;

        // Mantener la alerta dentro del área de foco del modal, fuera de
        // .modal-dialog para evitar sus transformaciones y recortes.
        modal.appendChild(popup.parentElement);

        // Algunos flujos muestran el resultado y cierran el modal enseguida.
        // Sacar la alerta al terminar el cierre evita ocultarla con el modal,
        // conservando el manejo del foco mientras este permanece abierto.
        const container = popup.parentElement;
        const moveAlertOutsideModal = () => {
            if (!modal.contains(container)) return;
            const focusedElement = container.contains(document.activeElement)
                ? document.activeElement
                : popup;
            const target = document.querySelector("#page-container") || document.body;
            target.appendChild(container);
            focusedElement.focus({ preventScroll: true });
        };
        modal.addEventListener("hidden.bs.modal", moveAlertOutsideModal, { once: true });
        cleanupModalAlert = () => {
            modal.removeEventListener("hidden.bs.modal", moveAlertOutsideModal);
        };

        // SweetAlert guarda el foco después de willOpen. Si estaba en un
        // VueSelect, regresar al modal evita desplegarlo de nuevo al cerrar.
        if (document.activeElement?.closest(".v-select")) {
            modal.focus({ preventScroll: true });
        }
    },
    didDestroy: () => {
        cleanupModalAlert?.();
        cleanupModalAlert = null;
    },
    customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control",
    },
});

export const swalSimple = (msg) => {
    toast.fire(msg);
}
export const swalInfo = (titulo, msg) => {
    toast.fire(titulo, msg, "info");
}
export const swalSuccess = (msg) => {
    toast.fire("Listo!", msg, "success");
}
export const swalWarning = (msg) => {
    toast.fire("Advertencia", msg, "warning");
}
export const swalError = (msg) => {
    toast.fire("Error", msg, "error");
}

export default { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast}
