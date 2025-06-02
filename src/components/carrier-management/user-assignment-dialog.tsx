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
import { Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userAPI, User } from "@/lib/user-api";
import { userAssignmentApi, AssignedUser } from "@/services/userAssignmentApi";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterMode, setFilterMode] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  // Fetch users and assigned users when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Fetch all users and assigned users in parallel
        const [allUsers, assignedUserData] = await Promise.all([
          userAPI.getAllUsers(),
          userAssignmentApi.getCarrierUsers(carrierId)
        ]);

        setUsers(allUsers);
        
        // Extract assigned user IDs
        const assignedUserIds = assignedUserData.map(user => user.id);
        setAssignedUsers(assignedUserIds);
        setSelectedUsers(assignedUserIds);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load users and assignments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, carrierId]); // Removed toast from dependencies

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setUsers([]);
      setSelectedUsers([]);
      setAssignedUsers([]);
      setFilterMode("all");
    }
  }, [isOpen]);

  const filteredUsers = users.filter((user) => {
    // First apply text search filter
    const fullName = `${user.first_name} ${user.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Then apply status filter
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "assigned")
      return matchesSearch && assignedUsers.includes(user.id);
    if (filterMode === "unassigned")
      return matchesSearch && !assignedUsers.includes(user.id);

    return matchesSearch;
  });

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Calculate users to add and remove
      const usersToAdd = selectedUsers.filter((id) => !assignedUsers.includes(id));
      const usersToRemove = assignedUsers.filter((id) => !selectedUsers.includes(id));

      // Remove users first
      for (const userId of usersToRemove) {
        await userAssignmentApi.removeUserFromCarrier(carrierId, userId);
      }

      // Add new users
      if (usersToAdd.length > 0) {
        await userAssignmentApi.assignUsersToCarrier(carrierId, usersToAdd);
      }

      // Update the assigned users
      setAssignedUsers(selectedUsers);

      // Notify parent component about the change in assigned users count
      if (onAssignmentChange) {
        onAssignmentChange(selectedUsers.length);
      }

      toast({
        title: "Success",
        description: `User assignments updated successfully`,
      });

      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error("Error updating assignments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user assignments",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (user: User) => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : (
          <>
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
                          <AvatarImage src="" alt={`${user.first_name} ${user.last_name}`} />
                          <AvatarFallback>{getInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {user.first_name} {user.last_name}
                          </div>
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
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : hasChanges ? (
                    "Save Changes"
                  ) : (
                    "No Changes"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserAssignmentDialog;
