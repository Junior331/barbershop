"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/utils";
import { IButton } from "./@types";
import { baseClasses, sizeClasses, variantClasses } from "./variants";

export const Button = React.forwardRef<HTMLButtonElement, IButton>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      leftIcon ? "gap-2" : "",
      className
    );

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <div className="">{leftIcon}</div>}
        {children}
        {!loading && rightIcon && <div className="">{rightIcon}</div>}
      </button>
    );
  }
);
