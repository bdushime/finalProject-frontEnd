import React, { createContext, useContext, useMemo, useState } from "react";

type TabsCtx = {
	value: string;
	setValue: (v: string) => void;
};

const Ctx = createContext<TabsCtx | null>(null);

type TabsProps = { defaultValue: string; className?: string; children: React.ReactNode };
export function Tabs({ defaultValue, className = "", children }: TabsProps) {
	const [value, setValue] = useState(defaultValue);
	const ctx = useMemo(() => ({ value, setValue }), [value]);
	return (
		<div className={className}>
			<Ctx.Provider value={ctx}>{children}</Ctx.Provider>
		</div>
	);
}

export function TabsList({ className = "", children }: { className?: string; children: React.ReactNode }) {
	return <div className={`inline-flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
	const ctx = useContext(Ctx)!;
	const isActive = ctx.value === value;
	return (
		<button
			onClick={() => ctx.setValue(value)}
			className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
				isActive ? "bg-white text-white dark:bg-neutral-900 shadow" : "text-neutral-600 dark:text-neutral-300"
			}`}
		>
			{children}
		</button>
	);
}

export function TabsContent({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
	const ctx = useContext(Ctx)!;
	if (ctx.value !== value) return null;
	return <div className={className}>{children}</div>;
}


