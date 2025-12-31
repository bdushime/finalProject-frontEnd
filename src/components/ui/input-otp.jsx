
import * as React from "react";
import PropTypes from "prop-types";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";

function InputOTP({ className, containerClassName, ...props }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

InputOTP.propTypes = {
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

function InputOTPGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2 sm:gap-3", className)}
      {...props}
    />
  );
}

InputOTPGroup.propTypes = { className: PropTypes.string };

function InputOTPSlot({ index, className, ...props }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots?.[index] ?? { char: "", hasFakeCaret: false, isActive: false };

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex items-center justify-center transition-all outline-none first:rounded-l-xl first:border-l last:rounded-r-xl data-[active=true]:z-10",
        className,
      )}
      style={{
        height: '3.5rem',
        width: '3.5rem',
        borderTop: '1px solid #e5e5e5',
        borderBottom: '1px solid #e5e5e5',
        borderRight: index < 5 ? '1px solid #e5e5e5' : '1px solid #e5e5e5',
        borderLeft: index > 0 ? 'none' : '1px solid #e5e5e5',
        borderRadius: index === 0 ? '0.375rem 0 0 0.375rem' : index === 5 ? '0 0.375rem 0.375rem 0' : '0',
        backgroundColor: 'white',
        color: '#333',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        fontFamily: 'Inter, Arial, Helvetica, sans-serif',
        ...(isActive && {
          borderColor: '#1864ab',
          boxShadow: '0 0 0 3px rgba(24, 100, 171, 0.1)',
          zIndex: 10
        })
      }}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

InputOTPSlot.propTypes = {
  index: PropTypes.number.isRequired,
  className: PropTypes.string,
};

function InputOTPSeparator(props) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

