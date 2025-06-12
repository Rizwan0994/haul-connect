import { useCallback } from "react";
import { useModals } from "@/components/dispatch-management/modal-context";

/**
 * Custom hook for opening dispatch profile modals
 */
export const useDispatchModal = () => {
  const { openModal, closeModal } = useModals();

  /**
   * Open a dispatch profile modal
   * @param dispatchId - The ID of the dispatch to display
   * @param title - The title to display in the modal header
   */
  const openDispatchModal = useCallback(
    (dispatchId: string, title: string) => {
      openModal(dispatchId, title);
    },
    [openModal]
  );

  /**
   * Close a dispatch profile modal
   * @param modalId - The ID of the modal to close
   */
  const closeDispatchModal = useCallback(
    (modalId: string) => {
      closeModal(modalId);
    },
    [closeModal]
  );

  /**
   * Open modal for creating/editing dispatches
   * @param mode - 'create' for new dispatch, 'edit' for editing existing
   * @param dispatchId - Optional dispatch ID for edit mode
   */
  const onOpen = useCallback(
    (mode: 'create' | 'edit', dispatchId?: string) => {
      const title = mode === 'create' ? 'Add New Dispatch' : 'Edit Dispatch';
      const id = mode === 'create' ? 'create-dispatch' : dispatchId!;
      openModal(id, title);
    },
    [openModal]
  );

  return {
    openDispatchModal,
    closeDispatchModal,
    onOpen,
  };
};

export default useDispatchModal;
