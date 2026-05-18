import React, { createContext, useCallback, useContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ItStaffConfirmContext = createContext(null);

const initialDialog = {
  open: false,
  title: "",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
  resolve: null,
};

export function ItStaffConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(initialDialog);

  const confirm = useCallback((options) => {
    const opts = typeof options === "string" ? { description: options } : options || {};
    return new Promise((resolve) => {
      setDialog({
        open: true,
        title: opts.title || "Please confirm",
        description: opts.description || "",
        confirmText: opts.confirmText || "Confirm",
        cancelText: opts.cancelText || "Cancel",
        variant: opts.variant || "default",
        resolve,
      });
    });
  }, []);

  const finish = (result) => {
    setDialog((current) => {
      current.resolve?.(result);
      return initialDialog;
    });
  };

  return (
    <ItStaffConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        open={dialog.open}
        onOpenChange={(open) => {
          if (!open) finish(false);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              {dialog.title}
            </AlertDialogTitle>
            {dialog.description ? (
              <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                {dialog.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2 sm:justify-end">
            <AlertDialogCancel
              className="rounded-lg border-slate-200 text-slate-700"
              onClick={() => finish(false)}
            >
              {dialog.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                dialog.variant === "destructive"
                  ? "rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  : "rounded-lg bg-[#0b1d3a] text-white hover:bg-[#1a2f55]"
              }
              onClick={() => finish(true)}
            >
              {dialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ItStaffConfirmContext.Provider>
  );
}

export function useItStaffConfirm() {
  const ctx = useContext(ItStaffConfirmContext);
  if (!ctx) {
    throw new Error("useItStaffConfirm must be used within ItStaffConfirmProvider");
  }
  return ctx;
}
