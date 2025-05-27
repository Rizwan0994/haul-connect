import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDispatch } from "@/lib/dispatch-data";
import { DispatchForm, DispatchFormValues } from "./dispatch-form";
import { useToast } from "@/components/ui/use-toast";

export function DispatchCreateForm() {
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
      createDispatch(formattedData);

      toast({
        title: "Dispatch created",
        description: "Your dispatch has been created successfully.",
      });

      // Redirect to the dispatch list after successful creation
      navigate("/dispatch-management");
    } catch (error) {
      console.error("Error creating dispatch:", error);
      toast({
        title: "Error",
        description:
          "There was an error creating your dispatch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <DispatchForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
}
