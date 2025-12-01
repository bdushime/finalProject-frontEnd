import { z } from "zod";
import { cn } from "@/components/ui/utils";

const categoryColorMap = {
  Laptop: "bg-indigo-600 text-white border-indigo-700",
  Tablet: "bg-blue-600 text-white border-blue-700",
  Camera: "bg-purple-600 text-white border-purple-700",
  Audio: "bg-green-600 text-white border-green-700",
  Video: "bg-pink-600 text-white border-pink-700",
  Projector: "bg-red-600 text-white border-red-700",
  Accessories: "bg-gray-600 text-white border-gray-700",
  Desktop: "bg-cyan-600 text-white border-cyan-700",
  Printer: "bg-yellow-600 text-white border-yellow-700",
  Scanner: "bg-orange-600 text-white border-orange-700",
  Other: "bg-gray-600 text-white border-gray-700",
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