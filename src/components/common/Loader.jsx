import React from "react";

function Spinner({ size = "md", className = "" }) {
  const sizeClass =
    size === "sm" ? "h-4 w-4 border-2" : size === "lg" ? "h-9 w-9 border-[2.5px]" : "h-7 w-7 border-2";

  return (
    <div
      className={`rounded-full border-slate-200/90 border-t-blue-500 animate-spin motion-reduce:animate-none ${sizeClass} ${className}`}
      style={{ animationDuration: "0.75s" }}
      aria-label="Loading"
      role="status"
    />
  );
}

const Loader = ({ variant = "full", className = "" }) => {
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full items-center justify-center py-10 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="md" />
    </div>
  );
};

export default Loader;
