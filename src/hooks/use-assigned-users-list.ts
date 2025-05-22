"use client";

import { useState, useCallback } from "react";

export const useAssignedUsersList = () => {
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

export default useAssignedUsersList;
