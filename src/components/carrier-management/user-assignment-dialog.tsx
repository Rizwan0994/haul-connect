"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data - would be replaced with real API calls
const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", avatar: "" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "" },
  { id: "3", name: "Robert Johnson", email: "robert@example.com", avatar: "" },
  { id: "4", name: "Emily Davis", email: "emily@example.com", avatar: "" },
  { id: "5", name: "Michael Wilson", email: "michael@example.com", avatar: "" },
  { id: "6", name: "Sarah Brown", email: "sarah@example.com", avatar: "" },
  { id: "7", name: "David Miller", email: "david@example.com", avatar: "" },
  { id: "8", name: "Jessica Taylor", email: "jessica@example.com", avatar: "" },
  { id: "9", name: "Thomas Anderson", email: "thomas@example.com", avatar: "" },
  { id: "10", name: "Lisa White", email: "lisa@example.com", avatar: "" },
];

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UserAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  carrierId: string;
  carrierName: string;
  onAssignmentChange?: (count: number) => void;
}

const UserAssignmentDialog: React.FC<UserAssignmentDialogProps> = ({
  isOpen,
  onClose,
  carrierId,
  carrierName,
  onAssignmentChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  // In a real app, you would fetch the users and already assigned users here
  useEffect(() => {
    // Mock API call to get assigned users
    const fetchAssignedUsers = async () => {
      // This would be an API call in a real application
      // For demo purposes, randomly assign some users
      const alreadyAssigned = mockUsers
        .filter(() => Math.random() > 0.7)
        .map((user) => user.id);

      setAssignedUsers(alreadyAssigned);
      setSelectedUsers(alreadyAssigned);
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [isOpen, carrierId]);

  const filteredUsers = users.filter((user) => {
    // First apply text search filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Then apply status filter
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "assigned")
      return matchesSearch && assignedUsers.includes(user.id);
    if (filterMode === "unassigned")
      return matchesSearch && !assignedUsers.includes(user.id);

    return matchesSearch;
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      // This would be an API call in a real application
      console.log(
        `Assigning users ${selectedUsers.join(", ")} to carrier ${carrierId}`
      );

      // Update the assigned users
      setAssignedUsers(selectedUsers);

      // Notify parent component about the change in assigned users count
      if (onAssignmentChange) {
        onAssignmentChange(selectedUsers.length);
      }

      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error assigning users:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Calculate changes
  const usersToAdd = selectedUsers.filter((id) => !assignedUsers.includes(id));
  const usersToRemove = assignedUsers.filter(
    (id) => !selectedUsers.includes(id)
  );
  const hasChanges = usersToAdd.length > 0 || usersToRemove.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Users to Carrier</DialogTitle>
          <DialogDescription>
            Assign or remove users from {carrierName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant={filterMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("all")}
              >
                All ({users.length})
              </Button>
              <Button
                variant={filterMode === "assigned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("assigned")}
              >
                Assigned ({assignedUsers.length})
              </Button>
              <Button
                variant={filterMode === "unassigned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("unassigned")}
              >
                Unassigned ({users.length - assignedUsers.length})
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-muted/50 p-2 rounded text-sm">
              {usersToAdd.length > 0 && (
                <div className="text-green-600">
                  Adding {usersToAdd.length} user
                  {usersToAdd.length !== 1 ? "s" : ""}
                </div>
              )}
              {usersToRemove.length > 0 && (
                <div className="text-red-600">
                  Removing {usersToRemove.length} user
                  {usersToRemove.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="h-[300px] pr-4 mt-2">
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  {assignedUsers.includes(user.id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      Assigned
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              {hasChanges ? "Save Changes" : "No Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserAssignmentDialog;
