
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
import { LoadingSpinner } from "@/components/auth/loading-spinner";
import { AuthAlert } from "@/components/auth/auth-alert";
import backendApiClient from "@/services/backendApi/client";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    try {
      await backendApiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/80 bg-background/60 dark:bg-gray-900/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <AuthAlert type="error" message={error} />}
          {success && (
            <AuthAlert
              type="success"
              message="Reset instructions have been sent to your email"
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Send reset instructions'}
          </Button>
          <div className="text-sm text-center">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="text-primary underline-offset-4 hover:underline transition-colors duration-200"
            >
              Back to login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
