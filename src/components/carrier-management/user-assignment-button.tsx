"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUserAssignment } from "./user-assignment-provider";

interface UserAssignmentButtonProps {
  carrierId: string;
  carrierName: string;
  status: string;
}

const UserAssignmentButton: React.FC<UserAssignmentButtonProps> = ({
  carrierId,
  carrierName,
  status,
}) => {
  const { openAssignmentDialog, openUsersList, getAssignedUserCount } =
    useUserAssignment();
  const assignedUserCount = getAssignedUserCount(carrierId);
  const isBlacklisted = status === "Blacklist";

  const handleAssignUsers = () => {
    if (isBlacklisted) return;
    openAssignmentDialog(carrierId, carrierName);
  };

  const handleViewAssignedUsers = () => {
    openUsersList(carrierId, carrierName);
  };

  if (isBlacklisted) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative text-muted-foreground"
              disabled
            >
              <AlertCircle className="h-4 w-4" />
              <span className="sr-only">Carrier blacklisted</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>User management disabled - carrier is blacklisted</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative"
                >
                  <Users className="h-4 w-4" />
                  {assignedUserCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
                      {assignedUserCount}
                    </Badge>
                  )}
                  <span className="sr-only">User management</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {assignedUserCount === 0
                  ? "Manage users"
                  : `${assignedUserCount} assigned users`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAssignUsers}>
            Assign Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewAssignedUsers}>
            View Assigned Users{" "}
            {assignedUserCount > 0 && `(${assignedUserCount})`}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAssignmentButton;
