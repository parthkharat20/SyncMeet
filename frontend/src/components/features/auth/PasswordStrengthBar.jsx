import React from "react";

export const PasswordStrengthBar = ({ password = "" }) => {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let label = "Weak";
  let color = "var(--color-error)";
  let width = "33%";

  if (score >= 4) {
    label = "Strong";
    color = "var(--color-success)";
    width = "100%";
  } else if (score >= 2) {
    label = "Medium";
    color = "var(--color-warning)";
    width = "66%";
  }

  return (
    <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ height: "4px", width: "100%", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width,
            background: color,
            transition: "width var(--dur-normal) var(--ease-spring), background var(--dur-normal)",
          }}
        />
      </div>
      <span style={{ fontSize: "12px", fontWeight: "600", color, alignSelf: "flex-end" }}>
        Strength: {label}
      </span>
    </div>
  );
};

export default PasswordStrengthBar;
