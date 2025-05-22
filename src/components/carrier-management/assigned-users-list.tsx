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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data - would be replaced with real API calls in production
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
    role: "Admin",
    assignedDate: "2023-05-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "",
    role: "Dispatcher",
    assignedDate: "2023-06-22",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    avatar: "",
    role: "Account Manager",
    assignedDate: "2023-07-11",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    avatar: "",
    role: "Operations",
    assignedDate: "2023-08-04",
  },
];

interface AssignedUser {
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
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);

  // In a real app, you would fetch the assigned users here
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      // This would be an API call in a real application
      // For now, just use some of the mock users
      const randomSelection = mockUsers.filter(() => Math.random() > 0.3);
      setAssignedUsers(randomSelection);

      // In a real implementation, you would update the context here:
      // if (updateAssignedUserCount) {
      //   updateAssignedUserCount(carrierId, randomSelection.length);
      // }
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [isOpen, carrierId]);

  const filteredUsers = assignedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
          {assignedUsers.length} user{assignedUsers.length !== 1 ? "s" : ""}{" "}
          assigned
        </div>

        {assignedUsers.length === 0 ? (
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
