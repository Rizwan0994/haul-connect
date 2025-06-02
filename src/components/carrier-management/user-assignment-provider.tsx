"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import UserAssignmentDialog from "./user-assignment-dialog";
import AssignedUsersList from "./assigned-users-list";
import { userAssignmentApi } from "@/services/userAssignmentApi";

// Create a context to hold all dialog states
interface UserAssignmentContextType {
  openAssignmentDialog: (carrierId: string, carrierName: string) => void;
  openUsersList: (carrierId: string, carrierName: string) => void;
  getAssignedUserCount: (carrierId: string) => number;
  updateAssignedUserCount: (carrierId: string, count: number) => void;
  refreshAssignedCounts: () => void;
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

  // Fetch assigned user counts for all carriers
  const fetchAssignedCounts = useCallback(async () => {
    try {
      // This could be optimized by fetching all carrier counts in a single API call
      // For now, we'll fetch counts as needed when dialogs are opened
    } catch (error) {
      console.error("Error fetching assigned counts:", error);
    }
  }, []);

  // Initialize data on first load
  useEffect(() => {
    fetchAssignedCounts();
  }, [fetchAssignedCounts]);

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
  }, []);

  // Refresh assigned counts (can be called when assignments change)
  const refreshAssignedCounts = useCallback(async () => {
    await fetchAssignedCounts();
  }, [fetchAssignedCounts]);

  // Context value
  const contextValue = {
    openAssignmentDialog,
    openUsersList,
    getAssignedUserCount,
    updateAssignedUserCount,
    refreshAssignedCounts,
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
