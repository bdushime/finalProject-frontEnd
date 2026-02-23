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
    primary: "bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white shadow-lg shadow-[#8D8DC7]/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 rounded-3xl transition-all duration-300 active:scale-95 group",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="h-10 w-10 transition-transform group-hover:scale-110" />}
      <span className="text-xl font-bold tracking-tight">{label}</span>
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

