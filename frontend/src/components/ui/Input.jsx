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
  const [isFocused, setIsFocused] = useState(false);

  const resolvedType = passwordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: "6px" }} className={className}>
      {label && (
        <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {Icon && (
          <span style={{ position: "absolute", left: "12px", color: isFocused ? "var(--primary-blurple)" : "var(--text-muted)", display: "flex", alignItems: "center", transition: "color var(--dur-fast)" }}>
            <Icon style={{ fontSize: "18px" }} />
          </span>
        )}

        <input
          type={resolvedType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: Icon ? "9px 40px 9px 38px" : passwordToggle ? "9px 58px 9px 12px" : "9px 12px",
            background: "var(--surface-indigo)",
            border: error
              ? "1px solid var(--color-error)"
              : isFocused
              ? "1px solid var(--primary-blurple)"
              : "var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-white)",
            fontSize: "14px",
            fontFamily: "inherit",
            outline: "none",
            height: "38px",
            transition: "all var(--dur-fast) var(--ease-spring)",
            boxShadow: error
              ? "0 0 0 2px rgba(239, 68, 68, 0.15)"
              : isFocused
              ? "0 0 0 2px rgba(88, 101, 242, 0.15)"
              : "none",
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
              right: "10px",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              padding: "3px 6px",
              borderRadius: "4px",
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary-blurple)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {(error || helperText) && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: error ? "var(--color-error)" : "var(--text-muted)",
            marginTop: "1px",
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
