import React, { useState } from "react";

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  type = "text",
  passwordToggle = false,
  fullWidth = true,
  value,
  onChange,
  placeholder,
  className = "",
  style = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = passwordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: "6px" }} className={className}>
      {label && (
        <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", letterSpacing: "0.2px" }}>
          {label}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Icon && (
          <span style={{ position: "absolute", left: "14px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            <Icon style={{ fontSize: "18px" }} />
          </span>
        )}

        <input
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: Icon ? "12px 42px 12px 40px" : passwordToggle ? "12px 42px 12px 14px" : "12px 14px",
            background: "var(--surface-2)",
            border: error ? "1px solid var(--color-error)" : "var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "15px",
            fontFamily: "inherit",
            outline: "none",
            transition: "all var(--dur-normal) var(--ease-spring)",
            boxShadow: error ? "0 0 8px rgba(244, 63, 94, 0.25)" : "none",
            ...style,
          }}
          {...props}
        />

        {passwordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              color: "var(--cyan-accent)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {(error || helperText) && (
        <span
          style={{
            fontSize: "12px",
            color: error ? "var(--color-error)" : "var(--text-muted)",
            marginTop: "2px",
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
