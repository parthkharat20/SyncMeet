import React, { useState } from "react";
import Spinner from "./Spinner";

export const Button = ({
  children,
  variant = "primary", // primary (blurple), secondary (raised dark), danger (red), outline, ghost, white
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
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isInteractive = !loading && !disabled;

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "600",
    borderRadius: size === "lg" ? "var(--radius-md)" : "var(--radius-sm)",
    cursor: isInteractive ? "pointer" : "not-allowed",
    opacity: disabled ? 0.45 : 1,
    transition: "all var(--dur-fast) var(--ease-spring)",
    border: "none",
    outline: "none",
    width: fullWidth ? "100%" : "auto",
    fontFamily: "inherit",
    userSelect: "none",
    textDecoration: "none",
    transform: isInteractive && isActive ? "scale(0.98)" : isInteractive && isHovered ? "translateY(-1px)" : "none",
  };

  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: "13px", height: "32px" },
    md: { padding: "8px 16px", fontSize: "14px", height: "38px" },
    lg: { padding: "10px 22px", fontSize: "15px", height: "44px" },
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          background: isHovered ? "var(--surface-indigo-hover)" : "var(--surface-indigo)",
          color: "var(--text-primary)",
          border: "var(--border-subtle)",
        };
      case "danger":
        return {
          background: isHovered ? "#dc2626" : "var(--color-error)",
          color: "#ffffff",
          boxShadow: isHovered ? "0 2px 10px rgba(239, 68, 68, 0.3)" : "none",
        };
      case "outline":
        return {
          background: isHovered ? "rgba(88, 101, 242, 0.08)" : "transparent",
          color: "var(--primary-blurple)",
          border: "1px solid rgba(88, 101, 242, 0.4)",
        };
      case "ghost":
        return {
          background: isHovered ? "rgba(255, 255, 255, 0.06)" : "transparent",
          color: isHovered ? "var(--text-white)" : "var(--text-secondary)",
        };
      case "white":
        return {
          background: isHovered ? "#f3f4f6" : "#ffffff",
          color: "var(--text-dark)",
          fontWeight: "600",
        };
      case "green":
        return {
          background: isHovered ? "var(--green-hover)" : "var(--accent-green)",
          color: "var(--text-dark)",
          fontWeight: "600",
        };
      case "primary":
      default:
        return {
          background: isHovered ? "var(--blurple-hover)" : "var(--primary-blurple)",
          color: "var(--on-primary)",
          boxShadow: isHovered ? "0 2px 12px rgba(88, 101, 242, 0.3)" : "none",
        };
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles,
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={combinedStyles}
      className={`syncmeet-btn ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={14} color="currentColor" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
