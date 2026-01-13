import { z } from "zod";
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

// Zod schema describing allowed categories
const categorySchema = z.union([
  z.literal("Laptop"),
  z.literal("Tablet"),
  z.literal("Camera"),
  z.literal("Audio"),
  z.literal("Video"),
  z.literal("Projector"),
  z.literal("Accessories"),
  z.literal("Desktop"),
  z.literal("Printer"),
  z.literal("Scanner"),
  z.literal("Other"),
]);

export default function CategoryBadge(props) {
  // Validate props at runtime in dev – replaces PropType
  const { category } = categorySchema
    .catch("Other") // fallback if something unexpected comes through
    .transform((value) => ({ category: value }))
    .parse(props.category ?? "Other");

  const colorClass = categoryColorMap[category] || categoryColorMap.Other;

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
