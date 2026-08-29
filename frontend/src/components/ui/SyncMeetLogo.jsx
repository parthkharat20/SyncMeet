import React from "react";

/**
 * SyncMeet Custom Brand Logo Component
 * Combines interlocking geometric real-time sync apertures with a high-end optical communication node.
 *
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size - Dimension scale (xs=20px, sm=26px, md=32px, lg=42px, xl=56px)
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
    xs: { icon: 22, font: 15, gap: 8 },
    sm: { icon: 28, font: 17, gap: 9 },
    md: { icon: 34, font: 20, gap: 11 },
    lg: { icon: 44, font: 24, gap: 13 },
    xl: { icon: 56, font: 30, gap: 16 },
  }[size] || { icon: 34, font: 20, gap: 11 };

  const getColors = () => {
    switch (theme) {
      case "white":
        return {
          primary: "#ffffff",
          secondary: "#e5e7eb",
          accent: "#ffffff",
          text: "#ffffff",
          textSecondary: "#d1d5db",
          glow: "rgba(255, 255, 255, 0.4)",
        };
      case "dark":
        return {
          primary: "#090a10",
          secondary: "#1f2937",
          accent: "#374151",
          text: "#090a10",
          textSecondary: "#4b5563",
          glow: "rgba(0, 0, 0, 0.3)",
        };
      case "blurple":
      default:
        return {
          primary: "#5865f2",
          secondary: "#00b0f4",
          accent: "#7289da",
          text: "#ffffff",
          textSecondary: "#5865f2",
          glow: "rgba(88, 101, 242, 0.5)",
        };
    }
  };

  const colors = getColors();
  const gradId = `syncmeet-lens-grad-${theme}-${size}`;
  const glowGradId = `syncmeet-lens-glow-${theme}-${size}`;

  // Custom Bespoke Geometric Brand Symbol
  const BrandSymbol = (
    <svg
      width={pixelSizes.icon}
      height={pixelSizes.icon}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "block" }}
      aria-label="SyncMeet Logo Mark"
    >
      <defs>
        {/* Multi-stop Dynamic Brand Gradient */}
        <linearGradient id={gradId} x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5865f2" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#00b0f4" />
        </linearGradient>

        {/* Ambient Core Glow */}
        <radialGradient id={glowGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#00b0f4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5865f2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Rounded Hex/Shield Base */}
      <rect
        x="3"
        y="5"
        width="22"
        height="30"
        rx="8"
        fill={`url(#${gradId})`}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
      />

      {/* Optical Projector Projection Wedge (Video stream output) */}
      <path
        d="M 26 14.5 L 36 8.5 C 37.2 7.8 38 8.6 38 10 L 38 30 C 38 31.4 37.2 32.2 36 31.5 L 26 25.5 Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
      />

      {/* Left Synchronizing Flow Arc (S-Curve) */}
      <path
        d="M 3 13.5 C 6 13.5 8 15 8 18 C 8 21 6 22.5 3 22.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.95"
      />

      {/* Synchronized Core Lens Ring (Multi-layered aperture) */}
      <circle cx="14" cy="20" r="6.5" fill="#090a10" fillOpacity="0.45" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="14" cy="20" r="4" fill={`url(#${glowGradId})`} />
      <circle cx="14" cy="20" r="2" fill="#ffffff" />

      {/* Optical Specular Glint */}
      <circle cx="15.8" cy="18.2" r="1" fill="#ffffff" fillOpacity="0.9" />

      {/* Forward Sync Pulse Node */}
      <circle cx="33" cy="20" r="1.8" fill="#ffffff" />
      <circle cx="33" cy="20" r="3.2" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.6" />
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
          fontWeight: "800",
          letterSpacing: "-0.03em",
          color: colors.text,
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          ...style,
        }}
        {...props}
      >
        Sync
        <span
          style={{
            background: "linear-gradient(135deg, #5865f2 0%, #00b0f4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Meet
        </span>
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
          fontWeight: "800",
          letterSpacing: "-0.03em",
          color: colors.text,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Sync
        <span
          style={{
            background: "linear-gradient(135deg, #5865f2 0%, #00b0f4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginLeft: "1px",
          }}
        >
          Meet
        </span>
      </span>
    </div>
  );
};

export default SyncMeetLogo;
