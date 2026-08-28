import React, { useState } from "react";

export const Card = ({
  children,
  variant = "surface", // surface, indigo, glass, outline
  interactive = false,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = {
    borderRadius: "var(--radius-md)",
    padding: "var(--space-lg)",
    transition: "all var(--dur-normal) var(--ease-spring)",
    border: "var(--border-subtle)",
    position: "relative",
    cursor: onClick || interactive ? "pointer" : "default",
    transform: (onClick || interactive) && isHovered ? "translateY(-1.5px)" : "none",
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "indigo":
        return {
          background: "var(--surface-indigo)",
          boxShadow: isHovered && (onClick || interactive)
            ? "var(--shadow-elevation-2)"
            : "var(--shadow-elevation-1)",
          borderColor: isHovered && (onClick || interactive)
            ? "rgba(255, 255, 255, 0.15)"
            : "var(--border-subtle)",
        };
      case "glass":
        return {
          background: "var(--surface-glass)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "var(--shadow-elevation-2)",
          borderColor: isHovered && (onClick || interactive)
            ? "var(--border-blurple)"
            : "var(--border-subtle)",
        };
      case "outline":
        return {
          background: "transparent",
          border: "var(--border-subtle)",
          boxShadow: "none",
        };
      case "surface":
      default:
        return {
          background: "var(--surface-card)",
          boxShadow: isHovered && (onClick || interactive)
            ? "var(--shadow-elevation-2)"
            : "var(--shadow-elevation-1)",
          borderColor: isHovered && (onClick || interactive)
            ? "rgba(255, 255, 255, 0.14)"
            : "var(--border-subtle)",
        };
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...baseStyles, ...getVariantStyles(), ...style }}
      className={`syncmeet-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
