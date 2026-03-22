"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border rounded-lg bg-white text-slate-800 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
          "transition-all duration-200",
          error 
            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-400" 
            : "border-border",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
