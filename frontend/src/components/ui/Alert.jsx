import React from "react";

export const Alert = ({
  children,
  variant = "error", // error, success, warning, info
  onClose,
  className = "",
  style = {},
}) => {
  const variantStyles = {
    error: {
      background: "var(--color-error-bg)",
      border: "1px solid rgba(244, 63, 94, 0.3)",
      color: "#FDA4AF",
    },
    success: {
      background: "var(--color-success-bg)",
      border: "1px solid rgba(16, 185, 129, 0.3)",
      color: "#6EE7B7",
    },
    warning: {
      background: "var(--color-warning-bg)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      color: "#FDE68A",
    },
    info: {
      background: "var(--color-info-bg)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      color: "#7DD3FC",
    },
  }[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "1.4",
        width: "100%",
        ...variantStyles,
        ...style,
      }}
      className={className}
    >
      <span>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "currentColor",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: "1",
            marginLeft: "12px",
            opacity: 0.8,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
