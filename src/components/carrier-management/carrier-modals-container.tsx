"use client";

import React from "react";
import { useModals } from "./modal-context";
import CarrierProfileModal from "./carrier-profile-modal";

/**
 * Container component that renders all open carrier modals
 * This should be placed at the app layout level to ensure modals can appear anywhere
 */
const CarrierModalsContainer: React.FC = () => {
  const { modals } = useModals();

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => modal && (
        <CarrierProfileModal
          key={modal.id}
          id={modal.carrierId}
          modalId={modal.id}
          zIndex={modal.zIndex}
        />
      ))}
    </>
  );
};

export default CarrierModalsContainer;
