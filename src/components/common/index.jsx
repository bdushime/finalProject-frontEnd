import PropTypes from "prop-types";
import { forwardRef } from "react";

export const Button = forwardRef(function Button(
    { className = "", variant = "default", size = "md", ...props },
    ref
) {
    const variantClass =
        variant === "outline"
            ? "border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 hover:bg-white/90 dark:hover:bg-neutral-900"
            : variant === "ghost"
            ? "bg-transparent hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70"
            : "bg-neutral-900 text-white hover:opacity-95 dark:bg-white dark:text-neutral-900 shadow-lg shadow-blue-500/10";
    const sizeClass = size === "sm" ? "h-9 px-3 text-sm" : size === "lg" ? "h-12 px-6 text-base" : "h-10 px-4";

    return (
        <button ref={ref} className={`rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${sizeClass} ${variantClass} ${className}`} {...props} />
    );
});

Button.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(["default", "outline", "ghost"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export const Input = forwardRef(function Input(
    { className = "", label, leftIcon, ...props },
    ref
) {
    return (
        <label className="w-full block">
            {label && <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
            <div className="relative">
                {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{leftIcon}</span>}
                <input
                    ref={ref}
                    className={`w-full h-10 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 ${
                        leftIcon ? "pl-9" : ""
                    } ${className}`}
                    {...props}
                />
            </div>
        </label>
    );
});

Input.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    leftIcon: PropTypes.node,
};

export const Textarea = forwardRef(function Textarea(
    { className = "", label, ...props },
    ref
) {
    return (
        <label className="w-full block">
            {label && <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
            <textarea
                ref={ref}
                className={`w-full min-h-24 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
                {...props}
            />
        </label>
    );
});

Textarea.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
};

export const Select = forwardRef(function Select(
    { className = "", label, options, placeholder, ...props },
    ref
) {
    return (
        <label className="w-full block">
            {label && <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
            <select
                ref={ref}
                className={`w-full h-10 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options && options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
});

Select.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired })
    ),
    placeholder: PropTypes.string,
};


