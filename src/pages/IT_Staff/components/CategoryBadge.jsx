import PropTypes from "prop-types";
import { EquipmentCategory } from "../enums/EquipmentCategort";
import { categoryColors } from "../utils/categoryColors";
import { cn } from "@/components/ui/utils";

export function CategoryBadge({ category }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border",
        categoryColors[category]
      )}
    >
      {category}
    </span>
  );
}

CategoryBadge.propTypes = {
  category: PropTypes.oneOf(Object.values(EquipmentCategory)),
};

