import { EquipmentCategory } from "../enums/EquipmentCategort";
import { categoryColors } from "../utils/categoryColors";
import { cn } from "@/components/ui/utils"; // shadcn helper

type Props = {
  category: EquipmentCategory;
};

export function CategoryBadge({ category }: Props) {
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
