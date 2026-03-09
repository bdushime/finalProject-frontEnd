import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import PropTypes from "prop-types";

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default" // default | destructive
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-xl rounded-3xl p-6">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${variant === 'destructive' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {variant === 'destructive' ? <AlertTriangle className="h-7 w-7" /> : <CheckCircle className="h-7 w-7" />}
                    </div>
                    <DialogTitle className="text-xl font-bold text-[#0b1d3a]">{title}</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-xl text-slate-500 hover:text-[#0b1d3a] hover:bg-slate-50 h-11 font-semibold"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 rounded-xl h-11 font-bold shadow-lg transition-all ${variant === 'destructive'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10'
                                : 'bg-[#0b1d3a] hover:bg-[#126dd5] text-white shadow-blue-900/10'
                            }`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    variant: PropTypes.oneOf(["default", "destructive"])
};
