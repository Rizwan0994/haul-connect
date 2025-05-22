"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "@/components/auth/loading-spinner";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    setEmail(email);

    try {
      // This is where you would handle password reset logic
      console.log("Password reset request for:", email);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes - show success message
      setSuccess(true);
    } catch (error) {
      setError("Failed to send password reset email. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Form will handle submission
    }
  };

  return (
    <Card className="border-border/80 bg-background/60 dark:bg-gray-900/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      {success ? (
        <CardContent className="space-y-4">
          <div
            className="bg-success/10 text-success border border-success/30 p-4 rounded-md flex items-start space-x-3 animate-in fade-in slide-in-from-top-1 duration-300"
            role="alert"
          >
            <CheckCircle2 className="h-5 w-5 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;ve sent a password reset link to {email}. Please check
                your inbox and spam folder.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setSuccess(false)}
            >
              Try another email
            </Button>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="bg-destructive/10 text-destructive border border-destructive/30 p-3 rounded-md text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-300"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
                aria-describedby="email-error"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label={
                isLoading ? "Sending reset link..." : "Send reset link"
              }
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline transition-colors duration-200"
                tabIndex={0}
                aria-label="Back to sign in"
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
              >
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
