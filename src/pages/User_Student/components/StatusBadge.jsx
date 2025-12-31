import PropTypes from "prop-types";
import { cn } from "@/components/ui/utils";

const statusConfig = {
    active: {
        label: 'Active',
        className: 'bg-sky-50 text-[#0b1d3a] border border-sky-100',
    },
    pending: {
        label: 'Pending',
        className: 'bg-slate-100 text-[#0b1d3a] border border-slate-200',
    },
    overdue: {
        label: 'Overdue',
        className: 'bg-rose-50 text-rose-700 border border-rose-100',
    },
    returned: {
        label: 'Returned',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
};

export function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full",
                config.className
            )}
        >
            {config.label}
        </span>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['active', 'pending', 'overdue', 'returned', 'rejected']),
};


