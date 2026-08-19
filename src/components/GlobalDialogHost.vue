<template>
  <Modal
    :show="dialogState.show"
    :title="dialogState.title"
    :message="dialogState.message"
    :type="dialogState.type"
    :confirm-text="dialogState.confirmText"
    :cancel-text="dialogState.cancelText"
    :show-cancel="dialogState.mode === 'confirm'"
    @confirm="closeGlobalDialog(true)"
    @cancel="closeGlobalDialog(false)"
    @close="closeGlobalDialog(false)"
  >
    <p class="global-dialog-message">{{ dialogState.message }}</p>
  </Modal>
</template>

<script setup>
import Modal from '@/components/Modal.vue'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

const { dialogState, closeGlobalDialog } = useGlobalDialog()
</script>

<style scoped>
.global-dialog-message {
  color: var(--workbench-text-muted, #52525b);
  font-size: 0.92rem;
  line-height: 1.75;
  white-space: pre-line;
}
</style>
