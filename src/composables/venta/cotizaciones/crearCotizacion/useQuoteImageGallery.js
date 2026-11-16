import { ref, reactive, watch } from "vue";

export function useQuoteImageGallery({
    uploadedFiles,
    form,
}) {
/** visualizacion de imagenes  */
const gallery = reactive({
  visible: false,
  index: 0,
  photos: [],
});
function showPhoto(imagenes) {
  gallery.index = 0;
  gallery.visible = true;
  gallery.photos = imagenes;
}

function handleHide() {
  gallery.visible = false;
}

/** proceso de imagen de operaciones  */
const fileInput = ref(null);
const triggerFileInput = () => {
  fileInput.value.click();
};

const previewUploadedImages = (index) => {
  const photoUrl = uploadedFiles.value.map((file) => file.preview);
  gallery.photos = photoUrl;
  gallery.index = index;
  gallery.visible = true;
};

/** asignacion de imagenes a mi form de cotizacion para que se mantengan
 * en el store cuando se recargue la pagina y no se pierdan
 */
watch(
  uploadedFiles,
  (newFiles) => {
    const procesados = newFiles
      .map((item) => {
        if (item.file) return item.file;
        if (item.isPersisted) return item.preview;
        return null;
      })
      .filter((f) => f !== null);
    form.value.imagenesoperaciones = procesados;
  },
  { deep: true }
);


    return {
        gallery,
        showPhoto,
        handleHide,
        fileInput,
        triggerFileInput,
        previewUploadedImages,
    };
}
