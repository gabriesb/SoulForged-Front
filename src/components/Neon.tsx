import React from "react";

export const bg = "bg-[#0A0A0F]";
export const panel = "bg-[#11111A] border border-[#2A0134] shadow-2xl rounded-2xl";

export function NeonButton({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    variant === "primary"
      ? "bg-[#E100FF] hover:bg-[#B800D6] text-white"
      : "bg-transparent border border-[#6a0dad] hover:border-[#E100FF] text-gray-200";
  return (
    <button
      {...props}
      className={`py-3 rounded-md font-bold transition ${base} ${className}`}
    />
  );
}

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full mt-1 p-3 ${bg} border border-[#6a0dad] focus:outline-none focus:border-[#E100FF] text-white rounded-md ${className}`}
    />
  );
}
