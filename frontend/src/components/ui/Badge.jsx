import React from "react";

export const Badge = ({
  children,
  variant = "blurple", // blurple, green, magenta, cyan, success, error, warning, info, neutral
  dot = false,
  className = "",
  style = {},
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "green":
      case "success":
        return {
          background: "rgba(34, 197, 94, 0.1)",
          color: "var(--accent-green)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          dotColor: "var(--accent-green)",
        };
      case "magenta":
        return {
          background: "rgba(236, 72, 189, 0.1)",
          color: "var(--accent-magenta)",
          border: "1px solid rgba(236, 72, 189, 0.25)",
          dotColor: "var(--accent-magenta)",
        };
      case "cyan":
      case "info":
        return {
          background: "rgba(0, 176, 244, 0.1)",
          color: "var(--accent-cyan)",
          border: "1px solid rgba(0, 176, 244, 0.25)",
          dotColor: "var(--accent-cyan)",
        };
      case "warning":
        return {
          background: "rgba(245, 158, 11, 0.1)",
          color: "var(--color-warning)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          dotColor: "var(--color-warning)",
        };
      case "error":
        return {
          background: "rgba(239, 68, 68, 0.1)",
          color: "var(--color-error)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          dotColor: "var(--color-error)",
        };
      case "neutral":
        return {
          background: "rgba(255, 255, 255, 0.06)",
          color: "var(--text-secondary)",
          border: "var(--border-subtle)",
          dotColor: "var(--text-secondary)",
        };
      case "blurple":
      default:
        return {
          background: "rgba(88, 101, 242, 0.12)",
          color: "#99a3ff",
          border: "1px solid rgba(88, 101, 242, 0.28)",
          dotColor: "var(--primary-blurple)",
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 9px",
        borderRadius: "var(--radius-pill)",
        fontSize: "12px",
        fontWeight: "600",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
        background: currentStyles.background,
        color: currentStyles.color,
        border: currentStyles.border,
        ...style,
      }}
      className={className}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: currentStyles.dotColor,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
