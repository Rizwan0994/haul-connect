import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dispatchAPI, Dispatch, UpdateDispatchRequest } from "@/lib/dispatch-api";
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

  const handleSubmit = async (data: DispatchFormValues) => {
    setIsSubmitting(true);

    try {
      // Convert form data to API format
      const apiData: UpdateDispatchRequest = {
        department: data.department,
        booking_date: data.booking_date.toISOString(),
        load_no: data.load_no,
        pickup_date: data.pickup_date.toISOString(),
        dropoff_date: data.dropoff_date.toISOString(),
        carrier_id: parseInt(data.carrier), // Convert carrier string to number
        origin: data.origin,
        destination: data.destination,
        brokerage_company: data.brokerage_company,
        brokerage_agent: data.brokerage_agent,
        agent_ph: data.agent_ph,
        agent_email: data.agent_email,
        load_amount: data.load_amount,
        charge_percent: data.charge_percent,
        status: data.status,
        payment: data.payment || "",
        dispatcher: data.dispatcher,
        invoice_status: data.invoice_status,
        payment_method: data.payment_method,
      };

      const updatedDispatch = await dispatchAPI.updateDispatch(parseInt(id), apiData);

      toast({
        title: "Dispatch updated",
        description: "Your dispatch has been updated successfully.",
      });

      // Redirect to the dispatch details page after successful update
      navigate(`/dispatch-management/${id}`);
    } catch (error: any) {
      console.error("Error updating dispatch:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error updating your dispatch. Please try again.",
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
