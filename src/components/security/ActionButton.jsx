import PropTypes from "prop-types";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@components/ui/utils";

/**
 * Big tappable action card on the Security dashboard hero.
 *
 *   - primary   → brand purple gradient with glow + light icon chip
 *   - secondary → translucent slate over the dark hero, stronger contrast,
 *                 white icon chip with a subtle outline so it reads on the
 *                 navy background.
 *
 * Both variants get an icon chip on the top-left, a label at the bottom,
 * and a corner arrow that nudges on hover — the typical "this is clickable"
 * affordance without being noisy.
 */
export default function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "primary",
  className,
}) {
  const variants = {
    primary: {
      shell:
        "bg-gradient-to-br from-[#9B9BD0] via-[#8D8DC7] to-[#6B6BB0] text-white shadow-xl shadow-[#8D8DC7]/30 hover:shadow-2xl hover:shadow-[#8D8DC7]/40",
      chip: "bg-white/20 ring-1 ring-white/30 text-white backdrop-blur-sm",
      sheen:
        "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25)_0%,transparent_55%)]",
      arrow: "bg-white/15 ring-1 ring-white/20 text-white",
    },
    secondary: {
      shell:
        "bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-slate-950/80 text-white border border-white/10 backdrop-blur-md hover:from-slate-800 hover:to-slate-900",
      chip: "bg-white/10 ring-1 ring-white/20 text-white backdrop-blur-sm",
      sheen:
        "bg-[radial-gradient(circle_at_top_right,rgba(141,141,199,0.25)_0%,transparent_60%)]",
      arrow: "bg-white/10 ring-1 ring-white/20 text-white",
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 sm:p-7 transition-all duration-300 active:scale-[0.97] group text-left",
        "flex flex-col items-start justify-between min-h-[160px] sm:min-h-[180px]",
        v.shell,
        className
      )}
    >
      {/* Sheen overlay — fades softly under the icon */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 pointer-events-none opacity-90 transition-opacity duration-300 group-hover:opacity-100",
          v.sheen
        )}
      />

      {/* Top row: icon chip + arrow indicator */}
      <div className="relative z-10 w-full flex items-start justify-between">
        {Icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
              v.chip
            )}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1",
            v.arrow
          )}
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Bottom: label */}
      <span className="relative z-10 text-lg sm:text-2xl font-extrabold tracking-tight leading-tight mt-4">
        {label}
      </span>
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
