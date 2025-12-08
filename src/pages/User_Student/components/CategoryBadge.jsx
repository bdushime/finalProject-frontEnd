import PropTypes from "prop-types";
import { cn } from "@/components/ui/utils";

const categoryColorMap = {
    'Laptop': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Tablet': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Camera': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Audio': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Video': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Projector': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Accessories': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Desktop': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Printer': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Scanner': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
    'Other': 'bg-sky-100 text-[#0b1d3a] border-sky-200',
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

