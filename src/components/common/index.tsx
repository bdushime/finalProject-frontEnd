import { ButtonHTMLAttributes, DetailedHTMLProps, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

// Button
type BtnProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	variant?: "default" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
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

// Input
type InpProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
	label?: string;
	leftIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InpProps>(function Input(
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

// Textarea
type TxtProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & {
	label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TxtProps>(function Textarea(
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

// Select (basic HTML select for now)
type SelProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
	label?: string;
	options?: { label: string; value: string }[];
	placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelProps>(function Select(
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
				{options?.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</label>
	);
});


