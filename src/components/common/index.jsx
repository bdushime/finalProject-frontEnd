import PropTypes from "prop-types";
import { forwardRef } from "react";

export const Button = forwardRef(function Button(
    { className = "", variant = "default", size = "md", style, ...props },
    ref
) {
    const baseStyle = {
        borderRadius: '0.375rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        outline: 'none',
        border: 'none',
        cursor: 'pointer'
    };

    const variantStyles = {
        outline: {
            border: '1px solid #e5e5e5',
            backgroundColor: 'white',
            color: '#1864ab',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#1864ab',
        },
        default: {
            backgroundColor: '#1864ab',
            color: 'white',
        }
    };

    const sizeStyles = {
        sm: { height: '2.25rem', padding: '0 0.75rem', fontSize: '0.875rem' },
        md: { height: '2.5rem', padding: '0 1rem', fontSize: '1rem' },
        lg: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' }
    };

    const combinedStyle = {
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style
    };

    return (
        <button
            ref={ref}
            className={className}
            style={combinedStyle}
            onMouseEnter={(e) => {
                if (variant === 'default') {
                    e.currentTarget.style.opacity = '0.9';
                } else if (variant === 'outline') {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                } else if (variant === 'ghost') {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
            }}
            onMouseLeave={(e) => {
                if (variant === 'default') {
                    e.currentTarget.style.opacity = '1';
                } else if (variant === 'outline') {
                    e.currentTarget.style.backgroundColor = 'white';
                } else if (variant === 'ghost') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
            {...props}
        />
    );
});

Button.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(["default", "outline", "ghost"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    style: PropTypes.object,
};

export const Input = forwardRef(function Input(
    { className = "", label, leftIcon, style, ...props },
    ref
) {
    const inputStyle = {
        width: '100%',
        height: '2.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #e8eaed',
        backgroundColor: 'white',
        padding: leftIcon ? '0.625rem 0.75rem 0.625rem 2.5rem' : '0.625rem 0.75rem',
        color: '#202124',
        fontSize: '0.9375rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
        ...style
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#202124',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    };

    const iconStyle = {
        position: 'absolute',
        left: '0.875rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9aa0a6',
        zIndex: 1
    };

    return (
        <label className="w-full block">
            {label && <span style={labelStyle}>{label}</span>}
            <div className="relative">
                {leftIcon && <span style={iconStyle}>{leftIcon}</span>}
                <input
                    ref={ref}
                    className={className}
                    style={inputStyle}
                    placeholder={props.placeholder}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1864ab';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 100, 171, 0.1), 0 1px 2px 0 rgba(0,0,0,0.05)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e8eaed';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
                    }}
                    {...props}
                />
            </div>
        </label>
    );
});

Input.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    leftIcon: PropTypes.node,
    style: PropTypes.object,
};

export const Textarea = forwardRef(function Textarea(
    { className = "", label, style, ...props },
    ref
) {
    const textareaStyle = {
        width: '100%',
        minHeight: '6rem',
        borderRadius: '0.375rem',
        border: '1px solid #e5e5e5',
        backgroundColor: 'white',
        padding: '0.625rem 0.75rem',
        color: '#202124',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
        ...style
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#202124',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    };

    return (
        <label className="w-full block">
            {label && <span style={labelStyle}>{label}</span>}
            <textarea
                ref={ref}
                className={className}
                style={textareaStyle}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1864ab';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 100, 171, 0.1), 0 1px 2px 0 rgba(0,0,0,0.05)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e8eaed';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
                }}
                {...props}
            />
        </label>
    );
});

Textarea.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    style: PropTypes.object,
};

export const Select = forwardRef(function Select(
    { className = "", label, options, placeholder, style, ...props },
    ref
) {
    const selectStyle = {
        width: '100%',
        height: '2.75rem',
        borderRadius: '0.375rem',
        border: '1px solid #e5e5e5',
        backgroundColor: 'white',
        padding: '0.625rem 0.75rem',
        color: '#202124',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
        ...style
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#202124',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    };

    return (
        <label className="w-full block">
            {label && <span style={labelStyle}>{label}</span>}
            <select
                ref={ref}
                className={className}
                style={selectStyle}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1864ab';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 100, 171, 0.1), 0 1px 2px 0 rgba(0,0,0,0.05)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e8eaed';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
                }}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options && options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
});

Select.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired })
    ),
    placeholder: PropTypes.string,
    style: PropTypes.object,
};
