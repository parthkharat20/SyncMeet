import React from "react";

export const PasswordStrengthBar = ({ password = "" }) => {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let label = "WEAK";
  let color = "var(--color-error)";
  let width = "33%";

  if (score >= 4) {
    label = "STRONG";
    color = "var(--accent-green)";
    width = "100%";
  } else if (score >= 2) {
    label = "MEDIUM";
    color = "var(--color-warning)";
    width = "66%";
  }

  return (
    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ height: "4px", width: "100%", background: "var(--surface-onyx)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width,
            background: color,
            transition: "width var(--dur-normal) var(--ease-spring), background var(--dur-normal)",
          }}
        />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", color, alignSelf: "flex-end" }}>
        STRENGTH: {label}
      </span>
    </div>
  );
};

export default PasswordStrengthBar;
