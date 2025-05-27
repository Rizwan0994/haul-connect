import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateDispatch, Dispatch } from "@/lib/dispatch-data";
import { DispatchForm, DispatchFormValues } from "./dispatch-form";
import { useToast } from "@/components/ui/use-toast";

interface DispatchEditFormProps {
  dispatch: Dispatch;
  id: string;
}

export function DispatchEditForm({ dispatch, id }: DispatchEditFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: DispatchFormValues) => {
    setIsSubmitting(true);

    try {
      // Convert dates to ISO strings for the API
      const formattedData = {
        ...data,
        booking_date: data.booking_date.toISOString(),
        pickup_date: data.pickup_date.toISOString(),
        dropoff_date: data.dropoff_date.toISOString(),
        payment: data.payment || "", // Ensure payment is always a string
      };

      // This would be an API call in a real application
      // TODO: Replace with actual API call
      updateDispatch(id, formattedData);

      toast({
        title: "Dispatch updated",
        description: "Your dispatch has been updated successfully.",
      });

      // Redirect to the dispatch details page after successful update
      navigate(`/dispatch-management/${id}`);
    } catch (error) {
      console.error("Error updating dispatch:", error);
      toast({
        title: "Error",
        description:
          "There was an error updating your dispatch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DispatchForm
      initialData={dispatch}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
