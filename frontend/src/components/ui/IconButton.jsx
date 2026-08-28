import React, { useState } from "react";

export const IconButton = ({
  children,
  variant = "default", // default, active, off, danger, ghost
  size = "md", // sm (36px), md (48px), lg (54px)
  shape = "full", // full (round), md (14px)
  disabled = false,
  badge = null,
  onClick,
  title,
  className = "",
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const sizeDimensions = {
    sm: { width: "36px", height: "36px", fontSize: "18px" },
    md: { width: "48px", height: "48px", fontSize: "22px" },
    lg: { width: "54px", height: "54px", fontSize: "24px" },
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case "active":
        return {
          background: isHovered ? "var(--blurple-hover)" : "var(--primary-blurple)",
          color: "#ffffff",
          boxShadow: "var(--glow-blurple)",
          border: "none",
        };
      case "off":
        return {
          background: isHovered ? "rgba(242, 63, 67, 0.25)" : "rgba(242, 63, 67, 0.15)",
          color: "var(--color-error)",
          border: "1px solid rgba(242, 63, 67, 0.3)",
        };
      case "danger":
        return {
          background: isHovered ? "#db373b" : "var(--color-error)",
          color: "#ffffff",
          boxShadow: isHovered ? "0 4px 20px rgba(242, 63, 67, 0.5)" : "0 2px 10px rgba(242, 63, 67, 0.3)",
          border: "none",
        };
      case "ghost":
        return {
          background: isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
          color: isHovered ? "var(--text-white)" : "var(--text-secondary)",
          border: "none",
        };
      case "default":
      default:
        return {
          background: isHovered ? "var(--surface-indigo-hover)" : "var(--surface-indigo)",
          color: "var(--text-white)",
          border: "var(--border-subtle)",
        };
    }
  };

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: shape === "full" ? "var(--radius-pill)" : "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "all var(--dur-fast) var(--ease-spring)",
    outline: "none",
    userSelect: "none",
    flexShrink: 0,
    transform: !disabled && isActive ? "scale(0.92)" : !disabled && isHovered ? "scale(1.06)" : "scale(1)",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      title={title}
      aria-label={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        ...baseStyles,
        ...sizeDimensions,
        ...getVariantStyles(),
        ...style,
      }}
      className={`syncmeet-icon-btn ${className}`}
      {...props}
    >
      {children}
      {badge !== null && badge !== undefined && badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "var(--accent-magenta)",
            color: "#ffffff",
            borderRadius: "var(--radius-pill)",
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            fontSize: "11px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;
