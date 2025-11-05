import { ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabItem = {
	value: string;
	label: ReactNode;
	content: ReactNode;
	icon?: ReactNode;
};

type ReusableTabsProps = {
	items: TabItem[];
	defaultValue?: string;
	className?: string;
	listClassName?: string;
	contentClassName?: string;
};

export default function ReusableTabs({
	items,
	defaultValue,
	className = "space-y-4",
	listClassName = "flex flex-wrap gap-2 p-1 overflow-x-auto",
	contentClassName = "space-y-4",
}: ReusableTabsProps) {
	const initial = defaultValue ?? items[0]?.value ?? "";
	const [value, setValue] = useState(initial);

	return (
		<Tabs defaultValue={value} className={className}>
			<TabsList className={listClassName}>
				{items.map((it) => (
					<TabsTrigger key={it.value} value={it.value}>
						<span className="inline-flex items-center gap-2">
							{it.icon}
							{it.label}
						</span>
					</TabsTrigger>
				))}
			</TabsList>
			{items.map((it) => (
				<TabsContent key={it.value} value={it.value} className={contentClassName}>
					{it.content}
				</TabsContent>
			))}
		</Tabs>
	);
}




