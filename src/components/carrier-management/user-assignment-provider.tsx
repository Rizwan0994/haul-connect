"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import UserAssignmentDialog from "./user-assignment-dialog";
import AssignedUsersList from "./assigned-users-list";

// Mock storage for assigned user counts
const mockAssignedCounts: Record<string, number> = {};

// Create a context to hold all dialog states
interface UserAssignmentContextType {
  openAssignmentDialog: (carrierId: string, carrierName: string) => void;
  openUsersList: (carrierId: string, carrierName: string) => void;
  getAssignedUserCount: (carrierId: string) => number;
  updateAssignedUserCount: (carrierId: string, count: number) => void;
}

const UserAssignmentContext = createContext<UserAssignmentContextType | null>(
  null
);

// Custom hook to use the context
export const useUserAssignment = () => {
  const context = useContext(UserAssignmentContext);
  if (!context) {
    throw new Error(
      "useUserAssignment must be used within a UserAssignmentProvider"
    );
  }
  return context;
};

export const UserAssignmentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Assignment dialog state
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [assignmentCarrierId, setAssignmentCarrierId] = useState("");
  const [assignmentCarrierName, setAssignmentCarrierName] = useState("");

  // User list dialog state
  const [isListOpen, setIsListOpen] = useState(false);
  const [listCarrierId, setListCarrierId] = useState("");
  const [listCarrierName, setListCarrierName] = useState("");

  // Assigned user counts state
  const [assignedCounts, setAssignedCounts] = useState<Record<string, number>>({});

  // Initialize mock data on first load
  useEffect(() => {
    // Initialize random counts for testing purposes
    const initializeMockCounts = () => {
      // For demo purposes only - in a real app this would be fetched from an API
      const carrierIds = ["carrier1", "carrier2", "carrier3", "carrier4", "carrier5"];
      const newCounts = { ...mockAssignedCounts };
      
      carrierIds.forEach(id => {
        if (!newCounts[id]) {
          newCounts[id] = Math.floor(Math.random() * 6); // Random count between 0-5
        }
      });

      setAssignedCounts(newCounts);
    };

    initializeMockCounts();
  }, []);

  // Open assignment dialog
  const openAssignmentDialog = useCallback(
    (carrierId: string, carrierName: string) => {
      setAssignmentCarrierId(carrierId);
      setAssignmentCarrierName(carrierName);
      setIsAssignmentOpen(true);
    },
    []
  );

  // Close assignment dialog
  const closeAssignmentDialog = useCallback(() => {
    setIsAssignmentOpen(false);
  }, []);

  // Open user list dialog
  const openUsersList = useCallback(
    (carrierId: string, carrierName: string) => {
      setListCarrierId(carrierId);
      setListCarrierName(carrierName);
      setIsListOpen(true);
    },
    []
  );

  // Close user list dialog
  const closeUsersList = useCallback(() => {
    setIsListOpen(false);
  }, []);

  // Get assigned user count
  const getAssignedUserCount = useCallback((carrierId: string) => {
    return assignedCounts[carrierId] || 0;
  }, [assignedCounts]);

  // Update assigned user count
  const updateAssignedUserCount = useCallback((carrierId: string, count: number) => {
    setAssignedCounts(prev => ({
      ...prev,
      [carrierId]: count
    }));
    
    // Also update our mock storage for persistence
    mockAssignedCounts[carrierId] = count;
  }, []);

  // Context value
  const contextValue = {
    openAssignmentDialog,
    openUsersList,
    getAssignedUserCount,
    updateAssignedUserCount,
  };

  return (
    <UserAssignmentContext.Provider value={contextValue}>
      {children}

      {/* Dialog for assigning users */}
      <UserAssignmentDialog
        isOpen={isAssignmentOpen}
        onClose={closeAssignmentDialog}
        carrierId={assignmentCarrierId}
        carrierName={assignmentCarrierName}
        onAssignmentChange={(count) => updateAssignedUserCount(assignmentCarrierId, count)}
      />

      {/* Dialog for viewing assigned users */}
      <AssignedUsersList
        isOpen={isListOpen}
        onClose={closeUsersList}
        carrierId={listCarrierId}
        carrierName={listCarrierName}
      />
    </UserAssignmentContext.Provider>
  );
};

export default UserAssignmentProvider;
