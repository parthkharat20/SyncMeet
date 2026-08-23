import React from "react";
import Spinner from "./Spinner";

export const Button = ({
  children,
  variant = "primary", // primary, secondary, danger, outline, ghost
  size = "md", // sm, md, lg
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  style = {},
  ...props
}) => {
  const isInteractive = !loading && !disabled;

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-sm)",
    fontWeight: "600",
    borderRadius: "var(--radius-md)",
    cursor: isInteractive ? "pointer" : "not-allowed",
    opacity: disabled ? 0.5 : 1,
    transition: "all var(--dur-normal) var(--ease-spring)",
    border: "none",
    outline: "none",
    width: fullWidth ? "100%" : "auto",
    fontFamily: "inherit",
    userSelect: "none",
  };

  const sizeStyles = {
    sm: { padding: "6px 14px", fontSize: "13px" },
    md: { padding: "10px 20px", fontSize: "15px" },
    lg: { padding: "14px 28px", fontSize: "16px" },
  }[size];

  const variantStyles = {
    primary: {
      background: "var(--brand-gradient)",
      color: "#FFFFFF",
      boxShadow: "var(--glow-cyan)",
    },
    secondary: {
      background: "var(--surface-2)",
      color: "var(--text-primary)",
      border: "var(--border-subtle)",
    },
    danger: {
      background: "var(--color-error)",
      color: "#FFFFFF",
      boxShadow: "0 4px 16px rgba(244, 63, 94, 0.3)",
    },
    outline: {
      background: "transparent",
      color: "var(--cyan-accent)",
      border: "var(--border-cyan)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
    },
  }[variant];

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
    ...style,
  };

  return (
    <button
      type={type}
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      style={combinedStyles}
      className={`syncmeet-btn ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={16} color="currentColor" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
