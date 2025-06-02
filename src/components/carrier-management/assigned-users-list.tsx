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
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userAssignmentApi, AssignedUser } from "@/services/userAssignmentApi";
import { useToast } from "@/components/ui/use-toast";
import { useUserAssignment } from "./user-assignment-provider";

// Local interface for transformed user data
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  assignedDate: string;
}

interface AssignedUsersListProps {
  isOpen: boolean;
  onClose: () => void;
  carrierId: string;
  carrierName: string;
}

const AssignedUsersList: React.FC<AssignedUsersListProps> = ({
  isOpen,
  onClose,
  carrierId,
  carrierName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { updateAssignedUserCount } = useUserAssignment();

  // Fetch assigned users when dialog opens
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!isOpen || !carrierId) return;
      
      setLoading(true);
      try {
        const users = await userAssignmentApi.getCarrierUsers(carrierId);
        
        // Transform API response to display format
        const transformedUsers: DisplayUser[] = users.map(user => ({
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          avatar: '', // API doesn't provide avatar
          role: user.role || user.category || 'User',
          assignedDate: user.assigned_at
        }));
        
        setAssignedUsers(transformedUsers);
        // Update the context with the current count
        updateAssignedUserCount(carrierId, users.length);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
        toast({
          title: "Error",
          description: "Failed to load assigned users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedUsers();
  }, [isOpen, carrierId]); // Removed toast and updateAssignedUserCount from dependencies

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setAssignedUsers([]);
    }
  }, [isOpen]);

  const filteredUsers = assignedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigned Users</DialogTitle>
          <DialogDescription>
            Users currently assigned to {carrierName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-2 text-sm text-muted-foreground">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users...
            </div>
          ) : (
            <>
              {assignedUsers.length} user{assignedUsers.length !== 1 ? "s" : ""}{" "}
              assigned
            </>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : assignedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users assigned to this carrier
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start justify-between rounded-md border p-3 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {user.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Assigned: {formatDate(user.assignedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="sm:justify-end">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignedUsersList;
