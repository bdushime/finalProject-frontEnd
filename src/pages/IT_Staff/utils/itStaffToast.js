import { toast as sonnerToast } from "sonner";

const defaultOptions = {
  duration: 4000,
  classNames: {
    toast:
      "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg !gap-3",
    title: "text-sm font-semibold text-slate-900",
    description: "text-xs text-slate-500",
    actionButton: "rounded-lg bg-[#0b1d3a] text-white text-xs font-medium",
    cancelButton: "rounded-lg border border-slate-200 text-slate-600 text-xs",
  },
};

function mergeOptions(options = {}) {
  return {
    ...defaultOptions,
    ...options,
    classNames: {
      ...defaultOptions.classNames,
      ...options.classNames,
    },
  };
}

/** Consistent toast styling for all IT Staff pages */
export const itStaffToast = {
  success: (message, options) =>
    sonnerToast.success(message, mergeOptions(options)),
  error: (message, options) => sonnerToast.error(message, mergeOptions(options)),
  warning: (message, options) =>
    sonnerToast.warning(message, mergeOptions(options)),
  info: (message, options) => sonnerToast.info(message, mergeOptions(options)),
  message: (message, options) =>
    sonnerToast.message(message, mergeOptions(options)),
};
