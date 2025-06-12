"use client";

import React from "react";
import { useModals } from "./modal-context";
import DispatchProfileModal from "./dispatch-profile-modal";

/**
 * Container component that renders all open dispatch modals
 * This should be placed at the app layout level to ensure modals can appear anywhere
 */
const DispatchModalsContainer: React.FC = () => {
  const { modals } = useModals();

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => modal && (
        <DispatchProfileModal
          key={modal.id}
          id={modal.dispatchId}
          modalId={modal.id}
          zIndex={modal.zIndex}
        />
      ))}
    </>
  );
};

export default DispatchModalsContainer;
