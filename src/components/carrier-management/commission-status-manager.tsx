"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, CheckCircle } from "lucide-react";
import { Carrier } from "./columns";
import { commissionApi } from "@/lib/commission-api";

interface CommissionStatusManagerProps {
  carrier: Carrier;
  onUpdate?: (carrierId: string, newStatus: string) => void;
}

const CommissionStatusManager = ({ carrier, onUpdate }: CommissionStatusManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commissionStatus, setCommissionStatus] = useState<string>(carrier.commission_status || "not_eligible");
  const [commissionAmount, setCommissionAmount] = useState(carrier.commission_amount?.toString() || "");
  const [loadsCompleted, setLoadsCompleted] = useState(carrier.loads_completed?.toString() || "0");
  const { toast } = useToast();

  const statusOptions = [
    { value: "not_eligible", label: "Not Eligible", description: "Carrier hasn't met requirements" },
    { value: "pending", label: "Pending", description: "Awaiting first load completion" },
    { value: "confirmed_sale", label: "Confirmed Sale", description: "First load completed, commission due" },
    { value: "paid", label: "Commission Paid", description: "Commission has been paid" },
  ];
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {
        commission_status: commissionStatus as any,
        loads_completed: parseInt(loadsCompleted) || 0,
      };

      if (commissionAmount) {
        updateData.commission_amount = parseFloat(commissionAmount);
      }

      // If marking first load as completed, set the completion date
      if (parseInt(loadsCompleted) > 0 && !carrier.first_load_completed_at) {
        updateData.first_load_completed_at = new Date().toISOString();
      }

      const results=await commissionApi.updateCommissionStatus(carrier.id, updateData);
      console.log('Commission status updated:', results);
      toast({
        title: "Commission Status Updated",
        description: `Successfully updated commission status for ${carrier.company_name}`,
      });

      onUpdate?.(carrier.id, commissionStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating commission status:', error);
      toast({
        title: "Error",
        description: "Failed to update commission status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "confirmed_sale": return "text-blue-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`${getStatusColor(carrier.commission_status || "not_eligible")}`}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Commission
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Commission Status</DialogTitle>
          <DialogDescription>
            Update commission tracking for {carrier.company_name} ({carrier.mc_number})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status Display */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="space-y-1 text-sm">
              <p>Status: <span className={`font-medium ${getStatusColor(carrier.commission_status || "not_eligible")}`}>
                {statusOptions.find(s => s.value === carrier.commission_status)?.label || "Not Eligible"}
              </span></p>
              <p>Loads Completed: {carrier.loads_completed || 0}</p>
              <p>Commission Amount: ${carrier.commission_amount || 'N/A'}</p>
              {carrier.first_load_completed_at && (
                <p>First Load: {new Date(carrier.first_load_completed_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Commission Status */}
          <div className="space-y-2">
            <Label htmlFor="commission_status">Commission Status</Label>
            <Select value={commissionStatus} onValueChange={setCommissionStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commission Amount */}
          <div className="space-y-2">
            <Label htmlFor="commission_amount">Commission Amount ($)</Label>
            <Input
              id="commission_amount"
              type="number"
              step="0.01"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              placeholder="Enter commission amount"
            />
          </div>

          {/* Loads Completed */}
          <div className="space-y-2">
            <Label htmlFor="loads_completed">Loads Completed</Label>
            <Input
              id="loads_completed"
              type="number"
              value={loadsCompleted}
              onChange={(e) => setLoadsCompleted(e.target.value)}
              placeholder="Number of loads completed"
            />
          </div>

          {/* Helper Text */}
          {commissionStatus === "confirmed_sale" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This carrier has completed their first load and commission is now due to the sales agent.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommissionStatusManager;
