import React from "react";

export const Badge = ({
  children,
  variant = "cyan", // cyan, success, error, warning, info
  className = "",
  style = {},
}) => {
  const variantStyles = {
    cyan: {
      background: "rgba(6, 182, 212, 0.15)",
      color: "var(--cyan-accent)",
      border: "var(--border-cyan)",
    },
    success: {
      background: "var(--color-success-bg)",
      color: "var(--color-success)",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
    error: {
      background: "var(--color-error-bg)",
      color: "var(--color-error)",
      border: "1px solid rgba(244, 63, 94, 0.3)",
    },
    warning: {
      background: "var(--color-warning-bg)",
      color: "var(--color-warning)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    },
    info: {
      background: "var(--color-info-bg)",
      color: "var(--color-info)",
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
  }[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "var(--radius-pill)",
        fontSize: "12px",
        fontWeight: "600",
        fontFamily: "var(--font-mono, inherit)",
        letterSpacing: "0.2px",
        ...variantStyles,
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
};

export default Badge;
