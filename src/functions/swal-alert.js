import Swal from "sweetalert2";


export let toast = Swal.mixin({
    buttonsStyling: false,
    target: "#page-container",
    // Escape cierra la alerta antes de llegar al modal de Bootstrap.
    keydownListenerCapture: true,
    willOpen: (popup) => {
        const openModals = document.querySelectorAll(".modal.show");
        const modal = openModals[openModals.length - 1];
        if (!modal) return;

        // Mantener la alerta dentro del área de foco del modal, fuera de
        // .modal-dialog para evitar sus transformaciones y recortes.
        modal.appendChild(popup.parentElement);

        // SweetAlert guarda el foco después de willOpen. Si estaba en un
        // VueSelect, regresar al modal evita desplegarlo de nuevo al cerrar.
        if (document.activeElement?.closest(".v-select")) {
            modal.focus({ preventScroll: true });
        }
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
