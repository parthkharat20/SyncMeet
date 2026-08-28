import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

export const Alert = ({
  children,
  variant = "error", // error, success, warning, info
  onClose,
  className = "",
  style = {},
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          icon: CheckCircleOutlineIcon,
          background: "rgba(53, 237, 126, 0.12)",
          border: "1px solid rgba(53, 237, 126, 0.35)",
          color: "var(--accent-green)",
          textColor: "#e6ffed",
        };
      case "warning":
        return {
          icon: WarningAmberIcon,
          background: "rgba(240, 178, 50, 0.12)",
          border: "1px solid rgba(240, 178, 50, 0.35)",
          color: "var(--color-warning)",
          textColor: "#fff9e6",
        };
      case "info":
        return {
          icon: InfoOutlinedIcon,
          background: "rgba(0, 176, 244, 0.12)",
          border: "1px solid rgba(0, 176, 244, 0.35)",
          color: "var(--accent-cyan)",
          textColor: "#e6f8ff",
        };
      case "error":
      default:
        return {
          icon: ErrorOutlineIcon,
          background: "rgba(242, 63, 67, 0.12)",
          border: "1px solid rgba(242, 63, 67, 0.35)",
          color: "var(--color-error)",
          textColor: "#ffebee",
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: "var(--radius-sm)",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "1.4",
        width: "100%",
        background: config.background,
        border: config.border,
        color: config.textColor,
        boxShadow: "var(--shadow-elevation-1)",
        ...style,
      }}
      className={`animate-entrance ${className}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
        <IconComponent style={{ color: config.color, fontSize: "20px", flexShrink: 0 }} />
        <span>{children}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "4px",
            marginLeft: "12px",
            transition: "color var(--dur-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-white)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <CloseIcon style={{ fontSize: "16px" }} />
        </button>
      )}
    </div>
  );
};

export default Alert;
