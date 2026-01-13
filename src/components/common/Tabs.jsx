import PropTypes from "prop-types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReusableTabs({
    items,
    defaultValue,
    className = "space-y-4",
    listClassName = "flex flex-wrap gap-2 p-1 overflow-x-auto",
    contentClassName = "space-y-4",
}) {
    const initial = defaultValue ?? (items[0] ? items[0].value : "");
    const [value] = useState(initial);

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

ReusableTabs.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.node.isRequired,
            content: PropTypes.node.isRequired,
            icon: PropTypes.node,
        })
    ).isRequired,
    defaultValue: PropTypes.string,
    className: PropTypes.string,
    listClassName: PropTypes.string,
    contentClassName: PropTypes.string,
};


