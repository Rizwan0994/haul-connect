"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/auth/loading-spinner";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTerms = formData.get("acceptTerms") === "on";

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions to register.");
      setIsLoading(false);
      return;
    }

    try {
      // This is where you would handle registration logic
      console.log("Registration attempt:", {
        fullName,
        email,
        password,
        acceptTerms,
      });

      // Simulate registration delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes - redirect to login page
      router.push("/login");
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
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
    <Card className="border-border/80 bg-background/60 dark:bg-gray-900/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create your Haul Connect BPO account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <CardContent className="space-y-3">
          {error && (
            <div
              className="bg-destructive/10 text-destructive border border-destructive/30 p-2 rounded-md text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-300"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading}
                autoComplete="name"
                aria-describedby="fullName-error"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
                aria-describedby="email-error"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby="password-error"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                aria-describedby="confirmPassword-error"
                className="h-9"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Password must be at least 8 characters long and include uppercase,
            lowercase, number, and special character.
          </p>

          <div className="flex items-center space-x-2 mt-1 mb-2">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              disabled={isLoading}
              aria-label="Accept terms and conditions"
            />
            <Label
              htmlFor="acceptTerms"
              className="text-xs font-medium leading-none cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              I accept the{" "}
              <Link
                href="/terms"
                className="font-medium text-primary underline-offset-4 hover:underline transition-colors duration-200"
                target="_blank"
                tabIndex={0}
                aria-label="Terms and conditions (opens in a new tab)"
              >
                terms and conditions
              </Link>
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-3">
          <Button
            type="submit"
            className="w-full h-9"
            disabled={isLoading}
            aria-label={isLoading ? "Creating account..." : "Create account"}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <Separator className="my-1" />

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              className="w-full h-9"
              type="button"
              disabled={isLoading}
              aria-label="Sign up with GitHub"
            >
              <Icons.gitHub className="mr-2 h-3 w-3" aria-hidden="true" />
              GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full h-9"
              type="button"
              disabled={isLoading}
              aria-label="Sign up with Google"
            >
              <Icons.google className="mr-2 h-3 w-3" aria-hidden="true" />
              Google
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline transition-colors duration-200"
              tabIndex={0}
              aria-label="Sign in to your account"
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
