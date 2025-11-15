import PropTypes from "prop-types";
import { cn } from "@/components/ui/utils";

const statusConfig = {
    active: {
        label: 'Active',
        className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    },
    pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    overdue: {
        label: 'Overdue',
        className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    },
    returned: {
        label: 'Returned',
        className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400',
    },
};

export function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border",
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

