<script setup>
import { computed, ref, useSlots } from "vue";
import BaseBlock from "@/components/BaseBlock.vue";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "xl",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },
  centered: {
    type: Boolean,
    default: true,
  },
  scrollable: {
    type: Boolean,
    default: false,
  },
  backdrop: {
    type: [Boolean, String],
    default: true,
    validator: (value) => typeof value === "boolean" || value === "static",
  },
  keyboard: {
    type: Boolean,
    default: true,
  },
  focus: {
    type: Boolean,
    default: true,
  },
  busy: {
    type: Boolean,
    default: false,
  },
  closable: {
    type: Boolean,
    default: true,
  },
  bodyClass: {
    type: [String, Array, Object],
    default: "",
  },
  dialogClass: {
    type: [String, Array, Object],
    default: "",
  },
  contentClass: {
    type: [String, Array, Object],
    default: "",
  },
  footerClass: {
    type: [String, Array, Object],
    default: "",
  },
});

const emit = defineEmits(["show", "shown", "hide", "hidden"]);
const slots = useSlots();
const modalElement = ref(null);

const titleId = computed(() => `${props.id}-title`);
const dialogClasses = computed(() => [
  "modal-dialog",
  props.size ? `modal-${props.size}` : null,
  {
    "modal-dialog-centered": props.centered,
    "modal-dialog-scrollable": props.scrollable,
  },
  props.dialogClass,
]);

const modal = useBootstrapModal(modalElement, {
  backdrop: props.backdrop,
  keyboard: props.keyboard,
  focus: props.focus,
  onShow: (event) => emit("show", event),
  onShown: (event) => emit("shown", event),
  onHide: (event) => {
    if (props.busy) {
      event.preventDefault();
      return;
    }
    emit("hide", event);
  },
  onHidden: (event) => emit("hidden", event),
});

function show() {
  modal.show();
}

function hide() {
  if (props.busy) return;
  modal.hide();
}

function toggle() {
  if (props.busy) return;
  modal.toggle();
}

defineExpose({ show, hide, toggle });
</script>

<template>
  <div
    :id="id"
    ref="modalElement"
    class="modal fade"
    tabindex="-1"
    role="dialog"
    :aria-labelledby="titleId"
    aria-hidden="true"
  >
    <div :class="dialogClasses" role="document">
      <div class="modal-content" :class="contentClass">
        <BaseBlock transparent rounded class="mb-0">
          <template #title>
            <span :id="titleId">
              <slot name="title">{{ title }}</slot>
            </span>
          </template>

          <template #options>
            <slot name="header-actions" :close="hide" />
            <button
              v-if="closable"
              type="button"
              class="btn-block-option"
              aria-label="Cerrar"
              :disabled="busy"
              @click="hide"
            >
              <i class="fa fa-fw fa-times"></i>
            </button>
          </template>

          <template #content>
            <div class="block-content block-content-full" :class="bodyClass">
              <slot :close="hide" />
            </div>

            <div
              v-if="slots.footer"
              class="block-content base-modal-footer border-top bg-body-light"
              :class="footerClass"
            >
              <slot name="footer" :close="hide" />
            </div>
          </template>
        </BaseBlock>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-modal-footer {
  padding: 0.625rem 1rem;
}
</style>
