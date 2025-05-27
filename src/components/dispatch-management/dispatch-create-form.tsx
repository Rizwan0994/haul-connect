import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dispatchAPI, CreateDispatchRequest } from "@/lib/dispatch-api";
import { DispatchForm, DispatchFormValues } from "./dispatch-form";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-context";

export function DispatchCreateForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: DispatchFormValues) => {
    // if (!user) {
    //   toast({
    //     title: "Error",
    //     description: "You must be logged in to create a dispatch.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    try {
      // Convert form data to API format
      const apiData: CreateDispatchRequest = {
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

      const createdDispatch = await dispatchAPI.createDispatch(apiData);

      toast({
        title: "Dispatch created",
        description: "Your dispatch has been created successfully.",
      });

      // Redirect to the dispatch list after successful creation
      navigate("/dispatch-management");
    } catch (error: any) {
      console.error("Error creating dispatch:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error creating your dispatch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <DispatchForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
}
