"use client";

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
      });
    }

    if (variant === "success") {
      return sonnerToast.success(title, {
        description,
      });
    }

    return sonnerToast(title, {
      description,
    });
  };

  return { toast };
}

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
}
