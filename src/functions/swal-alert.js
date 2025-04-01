import Swal from "sweetalert2";


export let toast = Swal.mixin({
    buttonsStyling: false,
    target: "#page-container",
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