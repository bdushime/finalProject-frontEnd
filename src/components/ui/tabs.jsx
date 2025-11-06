import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";

const Ctx = createContext(null);

export function Tabs({ defaultValue, className = "", children }) {
    const [value, setValue] = useState(defaultValue);
    const ctx = useMemo(() => ({ value, setValue }), [value]);
    return (
        <div className={className}>
            <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
        </div>
    );
}

Tabs.propTypes = {
    defaultValue: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
};

export function TabsList({ className = "", children }) {
    return <div className={`inline-flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 ${className}`}>{children}</div>;
}

TabsList.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export function TabsTrigger({ value, children }) {
    const ctx = useContext(Ctx);
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

TabsTrigger.propTypes = {
    value: PropTypes.string.isRequired,
    children: PropTypes.node,
};

export function TabsContent({ value, children, className = "" }) {
    const ctx = useContext(Ctx);
    if (ctx.value !== value) return null;
    return <div className={className}>{children}</div>;
}

TabsContent.propTypes = {
    value: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
};


