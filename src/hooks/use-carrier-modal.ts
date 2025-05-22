import { useCallback } from "react";
import { useModals } from "@/components/carrier-management/modal-context";

/**
 * Custom hook for opening carrier profile modals
 */
export const useCarrierModal = () => {
  const { openModal, closeModal } = useModals();

  /**
   * Open a carrier profile modal
   * @param carrierId - The ID of the carrier to display
   * @param title - The title to display in the modal header
   */
  const openCarrierModal = useCallback(
    (carrierId: string, title: string) => {
      openModal(carrierId, title);
    },
    [openModal]
  );

  /**
   * Close a carrier profile modal
   * @param modalId - The ID of the modal to close
   */
  const closeCarrierModal = useCallback(
    (modalId: string) => {
      closeModal(modalId);
    },
    [closeModal]
  );

  return {
    openCarrierModal,
    closeCarrierModal,
  };
};

export default useCarrierModal;
