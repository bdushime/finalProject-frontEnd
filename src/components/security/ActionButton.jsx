import PropTypes from "prop-types";
import { cn } from "@components/ui/utils";

export default function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "primary",
  className,
}) {
  const variants = {
    primary: "bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white",
    secondary: "bg-[#1A2240] hover:bg-[#0A1128] text-white",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="h-8 w-8" />}
      <span className="text-lg font-semibold">{label}</span>
    </button>
  );
}

ActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  className: PropTypes.string,
};

