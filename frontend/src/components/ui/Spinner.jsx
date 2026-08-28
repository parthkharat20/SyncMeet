import React from "react";

export const Spinner = ({ size = 20, color = "var(--primary-blurple)" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default Spinner;
