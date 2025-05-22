"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // This is where you would handle password reset submission
      console.log(
        "Password reset with token:",
        token,
        "new password:",
        password
      );

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success state
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setError(
        "Failed to reset password. The token may be invalid or expired."
      );
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
        <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
        <CardDescription>
          Create a new password for your account
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
              <h3 className="font-medium">Password reset successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your password has been reset. You will be redirected to the
                login page shortly.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 pt-2">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
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
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby="password-error"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long and include
                uppercase, lowercase, number, and special character.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby="confirmPassword-error"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label={
                isLoading ? "Resetting password..." : "Reset password"
              }
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Resetting password...
                </>
              ) : (
                "Reset password"
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
