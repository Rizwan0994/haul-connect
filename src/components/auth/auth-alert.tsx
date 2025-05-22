"use client";

import { AlertCircle, CheckCircle2, LucideIcon } from "lucide-react";

interface AuthAlertProps {
  type: "error" | "success";
  title?: string;
  message: string;
}

export function AuthAlert({ type, title, message }: AuthAlertProps) {
  const Icon: LucideIcon = type === "error" ? AlertCircle : CheckCircle2;

  const styles = {
    error: {
      container:
        "bg-destructive/10 text-destructive border border-destructive/30",
      icon: "text-destructive",
    },
    success: {
      container: "bg-success/10 text-success border border-success/30",
      icon: "text-success",
    },
  };

  return (
    <div
      className={`${styles[type].container} p-3 rounded-md flex items-start space-x-2 animate-in fade-in slide-in-from-top-1 duration-300`}
      role="alert"
    >
      <Icon className={`h-4 w-4 ${title ? "mt-0.5" : ""}`} aria-hidden="true" />
      <div>
        {title && <h3 className="font-medium">{title}</h3>}
        <p className={`${title ? "text-sm text-muted-foreground mt-1" : ""}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
