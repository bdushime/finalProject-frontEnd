import PropTypes from "prop-types";
import { cn } from "@/components/ui/utils";

const categoryColorMap = {
    'Laptop': 'bg-indigo-600 text-white border-indigo-700',
    'Tablet': 'bg-blue-600 text-white border-blue-700',
    'Camera': 'bg-purple-600 text-white border-purple-700',
    'Audio': 'bg-green-600 text-white border-green-700',
    'Video': 'bg-pink-600 text-white border-pink-700',
    'Projector': 'bg-red-600 text-white border-red-700',
    'Accessories': 'bg-gray-600 text-white border-gray-700',
    'Desktop': 'bg-cyan-600 text-white border-cyan-700',
    'Printer': 'bg-yellow-600 text-white border-yellow-700',
    'Scanner': 'bg-orange-600 text-white border-orange-700',
    'Other': 'bg-gray-600 text-white border-gray-700',
};

export function CategoryBadge({ category }) {
    const colorClass = categoryColorMap[category] || categoryColorMap['Other'];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border",
                colorClass
            )}
        >
            {category}
        </span>
    );
}

CategoryBadge.propTypes = {
    category: PropTypes.string,
};

