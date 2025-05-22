"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

// Type for a carrier modal
interface CarrierModal {
  id: string;
  carrierId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

// Context type
interface ModalContextType {
  modals: CarrierModal[];
  openModal: (carrierId: string, title: string) => void;
  closeModal: (id: string) => void;
  focusModal: (id: string) => void;
  getHighestZIndex: () => number;
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Define provider props
interface ModalProviderProps {
  children: ReactNode;
}

// Create a provider component
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<CarrierModal[]>([]);

  // Get the highest z-index among all modals
  const getHighestZIndex = useCallback(() => {
    if (modals.length === 0) return 1000;
    return Math.max(...modals.map((modal) => modal.zIndex));
  }, [modals]);

  // Focus a modal (bring to front)
  const focusModal = useCallback(
    (id: string) => {
      setModals((prev) => {
        const newZIndex = getHighestZIndex() + 1;
        return prev.map((modal) =>
          modal.id === id ? { ...modal, zIndex: newZIndex } : modal
        );
      });
    },
    [getHighestZIndex]
  );

  // Close a modal by ID
  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id));
  }, []);

  // Open a new modal
  const openModal = useCallback(
    (carrierId: string, title: string) => {
      // Check if this carrier modal is already open
      const existingModalIndex = modals.findIndex(
        (m) => m.carrierId === carrierId
      );

      if (existingModalIndex >= 0) {
        // If it exists, bring it to front
        focusModal(modals[existingModalIndex].id);
        return;
      }

      // Calculate offset for staggered positioning
      const offset = modals.length * 20;

      // Create a new modal with a unique ID
      const newModal: CarrierModal = {
        id: `modal-${Date.now()}`,
        carrierId,
        title,
        position: { x: 100 + offset, y: 100 + offset },
        size: { width: 600, height: 550 },
        zIndex: getHighestZIndex() + 1,
      };

      setModals((prev) => [...prev, newModal]);
    },
    [modals, getHighestZIndex, focusModal]
  );

  // Provide the context value
  const contextValue: ModalContextType = {
    modals,
    openModal,
    closeModal,
    focusModal,
    getHighestZIndex,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModals = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
};
