import { computed, ref } from "vue";

export function useQuotationImageUpload({ images, disabled, addFiles }) {
  const previewVisible = ref(false);
  const previewIndex = ref(0);
  const previewImages = computed(() =>
    images.value.map((image) => ({ src: image.url, title: image.file.name }))
  );
  const dragDepth = ref(0);
  const canAddImages = computed(() => !disabled.value && images.value.length < 3);
  const draggingImages = computed(() => canAddImages.value && dragDepth.value > 0);
  
  function dragEnter(event) {
    if (canAddImages.value && Array.from(event.dataTransfer?.types || []).includes("Files")) dragDepth.value++;
  }
  function dragOver(event) {
    if (event.dataTransfer) event.dataTransfer.dropEffect = canAddImages.value ? "copy" : "none";
  }
  function dragLeave() {
    dragDepth.value = Math.max(0, dragDepth.value - 1);
  }
  function pasteImages(event) {
    const files = Array.from(event.clipboardData?.items || [])
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (!files.length) return;
    event.preventDefault();
    if (disabled.value) return;
    addFiles(files);
  }
  
  function dropImages(event) {
    dragDepth.value = 0;
    if (!canAddImages.value) return;
    const files = event.dataTransfer?.files;
    if (files?.length) addFiles(files);
  }
  
  function selectFiles(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }
  
  return { previewVisible, previewIndex, previewImages, canAddImages, draggingImages,
    dragEnter, dragOver, dragLeave, pasteImages, dropImages, selectFiles };
}
