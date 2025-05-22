"use client";

import { useState, useCallback } from "react";

// If you need global state management, consider installing zustand:
// npm install zustand or yarn add zustand

export const useUserAssignmentDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [carrierId, setCarrierId] = useState("");
  const [carrierName, setCarrierName] = useState("");

  const openDialog = useCallback((id: string, name: string) => {
    setCarrierId(id);
    setCarrierName(name);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    carrierId,
    carrierName,
    openDialog,
    closeDialog,
  };
};

export default useUserAssignmentDialog;
