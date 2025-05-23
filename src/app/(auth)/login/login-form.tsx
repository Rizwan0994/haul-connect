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
// import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/auth/loading-spinner";
import { AuthAlert } from "@/components/auth/auth-alert";
import backendApiClient from "@/services/backendApi/client";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const remember = formData.get("remember") === "on";

    try {
      const response = await backendApiClient.post('/auth/login', {
        username,
        password
      });

      // Adjust this logic based on your API response structure
      if (response.data.token) {
        document.cookie = `token=${response.data.token}; path=/`;
        if (remember) {
          localStorage.setItem('token', response.data.token);
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
        router.push('/carrier-management');
      } else {
        setError('Invalid credentials');
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Login failed. Please try again.');
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
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Sign in to access your Haul Connect BPO dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <AuthAlert type="error" message={error} />
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              disabled={isLoading}
              autoComplete="username"
              aria-describedby="username-error"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline transition-colors duration-200"
                tabIndex={0}
                aria-label="Forgot password?"
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              autoComplete="current-password"
              aria-describedby="password-error"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              name="remember"
              disabled={isLoading}
              aria-label="Remember me"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Remember me
            </Label>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-label={isLoading ? "Signing in..." : "Sign in"}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled={isLoading}
              aria-label="Sign in with GitHub"
            >
              <Icons.gitHub className="mr-2 h-4 w-4" aria-hidden="true" />
              GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              <Icons.google className="mr-2 h-4 w-4" aria-hidden="true" />
              Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline transition-colors duration-200"
              tabIndex={0}
              aria-label="Sign up for an account"
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.click()}
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}