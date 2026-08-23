import React from "react";

export const Card = ({
  children,
  variant = "surface", // surface, glass, glow
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const baseStyles = {
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    transition: "all var(--dur-normal) var(--ease-spring)",
    border: "var(--border-subtle)",
  };

  const variantStyles = {
    surface: {
      background: "var(--surface-1)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    },
    glass: {
      background: "var(--surface-glass)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
    },
    glow: {
      background: "var(--surface-1)",
      border: "var(--border-cyan)",
      boxShadow: "var(--glow-cyan)",
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      style={{ ...baseStyles, ...variantStyles, ...style }}
      className={`syncmeet-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
