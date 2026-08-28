import React from "react";

/**
 * SyncMeet Custom Brand Logo Component
 * Combines real-time synchronization nodes with a modern video communication aperture.
 *
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size - Dimension scale (xs=20px, sm=26px, md=34px, lg=42px, xl=54px)
 * @param {'full'|'mark'|'wordmark'} variant - Layout style (full: icon+text, mark: icon only, wordmark: text only)
 * @param {'blurple'|'white'|'dark'} theme - Color theme
 * @param {string} className - Additional CSS class
 * @param {object} style - Additional inline styles
 */
export const SyncMeetLogo = ({
  size = "md",
  variant = "full",
  theme = "blurple",
  className = "",
  style = {},
  ...props
}) => {
  const pixelSizes = {
    xs: { icon: 20, font: 14, gap: 7 },
    sm: { icon: 26, font: 16, gap: 8 },
    md: { icon: 32, font: 19, gap: 10 },
    lg: { icon: 40, font: 23, gap: 12 },
    xl: { icon: 52, font: 28, gap: 14 },
  }[size] || { icon: 32, font: 19, gap: 10 };

  const getColors = () => {
    switch (theme) {
      case "white":
        return {
          primary: "#ffffff",
          secondary: "#e5e7eb",
          accent: "#ffffff",
          text: "#ffffff",
          textSecondary: "#d1d5db",
        };
      case "dark":
        return {
          primary: "#090a10",
          secondary: "#1f2937",
          accent: "#374151",
          text: "#090a10",
          textSecondary: "#4b5563",
        };
      case "blurple":
      default:
        return {
          primary: "#5865f2",
          secondary: "#7289da",
          accent: "#4752c4",
          text: "#ffffff",
          textSecondary: "#5865f2",
        };
    }
  };

  const colors = getColors();

  // Custom SVG Brand Symbol
  const BrandSymbol = (
    <svg
      width={pixelSizes.icon}
      height={pixelSizes.icon}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "block" }}
      aria-label="SyncMeet Logo Mark"
    >
      <defs>
        <linearGradient id={`sm-grad-${theme}-${size}`} x1="2" y1="4" x2="34" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
      </defs>

      {/* Main Video Camera Rounded Body */}
      <rect
        x="3"
        y="6"
        width="20"
        height="24"
        rx="6"
        fill={`url(#sm-grad-${theme}-${size})`}
      />

      {/* Synchronizing Dual Lens Aperture */}
      <circle cx="13" cy="18" r="5.5" fill="#ffffff" fillOpacity="0.22" />
      <circle cx="13" cy="18" r="3" fill="#ffffff" />
      <circle cx="14.2" cy="16.8" r="1" fill={colors.primary} />

      {/* Left Sync Connection Notch */}
      <path
        d="M 3 14.5 C 4.8 14.5 5.8 15.6 5.8 18 C 5.8 20.4 4.8 21.5 3 21.5"
        stroke="#ffffff"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.85"
      />

      {/* Forward Video Projection / Sync Ray */}
      <path
        d="M 24 13 L 31 8.8 C 32 8.2 33 8.9 33 10.2 L 33 25.8 C 33 27.1 32 27.8 31 27.2 L 24 23 Z"
        fill={`url(#sm-grad-${theme}-${size})`}
      />

      {/* Forward Sync Pulse Node */}
      <circle cx="28.5" cy="18" r="1.3" fill="#ffffff" fillOpacity="0.85" />
    </svg>
  );

  if (variant === "mark") {
    return (
      <div
        className={`syncmeet-logo-mark ${className}`}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}
        {...props}
      >
        {BrandSymbol}
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        className={`syncmeet-wordmark ${className}`}
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: `${pixelSizes.font}px`,
          fontWeight: "700",
          letterSpacing: "-0.02em",
          color: colors.text,
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          ...style,
        }}
        {...props}
      >
        Sync<span style={{ color: colors.textSecondary }}>Meet</span>
      </span>
    );
  }

  // Full variant (Icon + Wordmark)
  return (
    <div
      className={`syncmeet-logo-full ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${pixelSizes.gap}px`,
        userSelect: "none",
        textDecoration: "none",
        ...style,
      }}
      {...props}
    >
      {BrandSymbol}
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: `${pixelSizes.font}px`,
          fontWeight: "700",
          letterSpacing: "-0.02em",
          color: colors.text,
          lineHeight: 1,
        }}
      >
        Sync<span style={{ color: colors.textSecondary }}>Meet</span>
      </span>
    </div>
  );
};

export default SyncMeetLogo;
