import * as React from "react";
import PropTypes from "prop-types";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-[#8D8DC7] text-white hover:bg-[#7A7AB5] shadow-sm",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20",
        outline:
          "border border-gray-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link: "text-[#343264] underline-offset-4 hover:text-[#343264]/80 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ]),
  size: PropTypes.oneOf(["default", "sm", "lg", "icon"]),
  asChild: PropTypes.bool,
};

export { Button, buttonVariants };


