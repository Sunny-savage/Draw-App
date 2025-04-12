"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "outlined";
  className?: string;
  onClick?: () => void;
  size?: "lg" | "sm";
  children?: ReactNode;
}

export const Button = ({
  variant,
  className,
  size,
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};
