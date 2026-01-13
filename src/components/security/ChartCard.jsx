import PropTypes from "prop-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { cn } from "@components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";

export default function ChartCard({
  title,
  description,
  children,
  className,
  filterLabel,
  filterOptions,
  onFilterChange,
  selectedFilter,
}) {
  return (
    <Card className={cn(
      "border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-gray-500 mt-1">
              {description}
            </CardDescription>
          )}
        </div>
        {filterLabel && filterOptions && (
          <Select value={selectedFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs border border-gray-500 rounded-lg">
              <SelectValue placeholder={filterLabel} />
            </SelectTrigger>
            <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  filterLabel: PropTypes.string,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onFilterChange: PropTypes.func,
  selectedFilter: PropTypes.string,
};

