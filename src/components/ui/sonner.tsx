"use client";

import { useTheme } from "@/components/theme-provider";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      closeButton
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--z-index": "9999",
          "--offset": "1.5rem",
          "--width": "360px",
          "--timeout-bar-height": "4px",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          border: "1px solid",
          borderColor: "var(--border)",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          opacity: 1,
        },
        classNames: {
          toast: "group toast group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-sm opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          error:
            "group-[.toaster]:border-red-500 group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:text-red-300",
          success:
            "group-[.toaster]:border-green-500 group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-300",
          warning:
            "group-[.toaster]:border-yellow-500 group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-800 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
