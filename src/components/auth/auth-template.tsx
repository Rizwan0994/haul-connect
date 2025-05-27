import React from "react";
import { Icons } from "@/components/icons";
import { Link } from "react-router-dom";

interface AuthTemplateProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showFeatures?: boolean;
  features?: string[];
}

export function AuthTemplate({
  children,
  title,
  description,
  showFeatures = true,
  features = [
    "Streamlined workflow management",
    "Real-time performance tracking",
    "Comprehensive reporting tools",
  ],
}: AuthTemplateProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-y-auto py-8">
      {/* Pattern background with improved opacity */}
      <div
        className="fixed inset-0 bg-[url('/images/auth-pattern.svg')] opacity-5 dark:opacity-10 
                 animate-[pulse_10s_ease-in-out_infinite]"
        aria-hidden="true"
      ></div>

      {/* Gradient overlay with subtle animation */}
      <div
        className="fixed inset-0 bg-gradient-to-bl from-primary/5 via-primary/3 to-transparent
                dark:from-primary/10 dark:via-primary/5 dark:to-transparent transition-all duration-700"
        aria-hidden="true"
      ></div>

      {/* Logo placement for better branding */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/"
          className="flex items-center space-x-2 text-primary"
          tabIndex={0}
          aria-label="Go to homepage"
        >
          <Icons.logo className="h-8 w-8" />
          <span className="font-bold text-xl hidden sm:inline-block">
            Haul Connect
          </span>
        </Link>
      </div>

      <main className="grid w-full max-w-[1040px] gap-6 p-4 md:grid-cols-2 md:gap-8 relative z-10 my-8">
        {/* Left section - Auth form with improved spacing */}
        <div className="flex flex-col justify-center space-y-4 max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-visible">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          </div>
          {children}
        </div>

        {/* Right section - Features with improved styling and animation */}
        {showFeatures && (
          <div className="hidden md:flex md:items-center md:justify-center">
            <div className="relative h-full w-full transition-all duration-500 hover:scale-[1.02]">
              <div
                className="absolute inset-0 bg-background/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl 
                          overflow-hidden border border-border/50 shadow-lg transition-all duration-300"
              >
                <div
                  className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-5 dark:opacity-10"
                  aria-hidden="true"
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="max-w-md text-center">
                    <h2
                      className="mb-4 text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                      aria-label="Haul Connect BPO"
                    >
                      Haul Connect BPO
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                      Our platform helps you manage operations, boost
                      productivity, and grow your business efficiently.
                    </p>
                    <div className="space-y-4">
                      {/* Feature items with enhanced hover effects and accessibility */}
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 transition-all duration-300 hover:translate-x-1"
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full 
                                      bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30"
                          >
                            <Icons.check
                              className="h-5 w-5 text-primary"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-left text-muted-foreground">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
