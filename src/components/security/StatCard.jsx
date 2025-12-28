import PropTypes from "prop-types";
import { Card, CardContent } from "@components/ui/card";
import { cn } from "@components/ui/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  comparison,
  change,
  changeType,
  className,
}) {
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";

  return (
    <Card className={cn(
      "border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl",
      className
    )}>
      <CardContent className="p-2 flex flex-col justify-between">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {comparison && (
          <p className="text-xs text-gray-500 mb-2">Compared to ({comparison})</p>
        )}
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive && <TrendingUp className="h-4 w-4 text-[#BEBEE0]" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-[#343264]" />}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive && "text-[#BEBEE0]",
                isNegative && "text-[#343264]",
                !isPositive && !isNegative && "text-gray-600"
              )}
            >
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  comparison: PropTypes.string,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(["positive", "negative", "neutral"]),
  className: PropTypes.string,
};

