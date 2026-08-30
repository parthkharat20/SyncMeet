import React from "react";

/**
 * SyncMeet Premium 3D Brand Logo Component
 * Multi-layer isometric optical camera prism with glowing synchronized nodes and high-precision typography.
 *
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size - Dimension scale
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
    xs: { icon: 24, font: 15, gap: 8 },
    sm: { icon: 30, font: 17, gap: 9 },
    md: { icon: 36, font: 20, gap: 11 },
    lg: { icon: 46, font: 25, gap: 13 },
    xl: { icon: 58, font: 31, gap: 16 },
  }[size] || { icon: 36, font: 20, gap: 11 };

  const getColors = () => {
    switch (theme) {
      case "white":
        return {
          primary: "#ffffff",
          secondary: "#e5e7eb",
          text: "#ffffff",
          textSecondary: "#d1d5db",
          glow: "rgba(255, 255, 255, 0.5)",
        };
      case "dark":
        return {
          primary: "#090a10",
          secondary: "#1f2937",
          text: "#090a10",
          textSecondary: "#4b5563",
          glow: "rgba(0, 0, 0, 0.3)",
        };
      case "blurple":
      default:
        return {
          primary: "#5865f2",
          secondary: "#00b0f4",
          text: "#ffffff",
          textSecondary: "#5865f2",
          glow: "rgba(88, 101, 242, 0.6)",
        };
    }
  };

  const colors = getColors();
  const gradPrimary = `sm-grad-pri-${theme}-${size}`;
  const gradLens = `sm-grad-lens-${theme}-${size}`;
  const gradBevel = `sm-grad-bev-${theme}-${size}`;
  const filterGlow = `sm-filter-glow-${theme}-${size}`;

  // Bespoke 3D Optical Camera Prism & Sync Nodes
  const BrandSymbol = (
    <svg
      width={pixelSizes.icon}
      height={pixelSizes.icon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        display: "block",
        filter: "drop-shadow(0 4px 12px rgba(88, 101, 242, 0.35))",
        transition: "transform 250ms ease, filter 250ms ease",
      }}
      className="syncmeet-brand-icon"
      aria-label="SyncMeet Brand Mark"
    >
      <defs>
        {/* Main Isometric Prism Gradient */}
        <linearGradient id={gradPrimary} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5865f2" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#00b0f4" />
        </linearGradient>

        {/* 3D Top Bevel Highlight Gradient */}
        <linearGradient id={gradBevel} x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#5865f2" stopOpacity="0" />
        </linearGradient>

        {/* Core Luminous Aperture Gradient */}
        <radialGradient id={gradLens} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor="#00b0f4" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#5865f2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#090a10" stopOpacity="0.95" />
        </radialGradient>

        {/* Specular Ambient Glow Filter */}
        <filter id={filterGlow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── 3D Camera Body / Housing ── */}
      <rect
        x="4"
        y="6"
        width="26"
        height="36"
        rx="10"
        fill={`url(#${gradPrimary})`}
        stroke="rgba(255, 255, 255, 0.28)"
        strokeWidth="1.2"
      />

      {/* 3D Top-Left Bevel Highlight Facet */}
      <path
        d="M 6 16 C 6 10.48 10.48 6 16 6 L 24 6 C 27.31 6 30 8.69 30 12 L 30 14 C 27 11 20 10 14 14 C 9 17.5 7 24 6 30 Z"
        fill={`url(#${gradBevel})`}
      />

      {/* ── 3D Projection Cone / Lens Projector ── */}
      <path
        d="M 30 17 L 42 10 C 43.4 9.2 44.5 10.1 44.5 11.8 L 44.5 36.2 C 44.5 37.9 43.4 38.8 42 38 L 30 31 Z"
        fill={`url(#${gradPrimary})`}
        stroke="rgba(255, 255, 255, 0.24)"
        strokeWidth="1.2"
      />

      {/* Projection Cone Facet Shadow for Depth */}
      <path
        d="M 30 24 L 44.5 24 L 44.5 36.2 C 44.5 37.9 43.4 38.8 42 38 L 30 31 Z"
        fill="rgba(0, 0, 0, 0.22)"
      />

      {/* ── Synchronized Real-Time Aperture ── */}
      {/* Outer Orbit Ring */}
      <circle
        cx="17"
        cy="24"
        r="8.5"
        fill="#090a10"
        fillOpacity="0.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeOpacity="0.9"
      />

      {/* Core Radiant Iris */}
      <circle cx="17" cy="24" r="5.5" fill={`url(#${gradLens})`} />

      {/* Center Specular Glint Core */}
      <circle cx="17" cy="24" r="2.2" fill="#ffffff" />
      <circle cx="19" cy="22" r="1.1" fill="#ffffff" fillOpacity="0.95" />

      {/* Synchronized Orbital Sync Wave Nodes */}
      <path
        d="M 6 15 C 9.5 15 11.5 17 11.5 20.5 C 11.5 24 9.5 26 6 26"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.95"
      />

      {/* Front Stream Projection Nodes */}
      <circle cx="39" cy="24" r="2.2" fill="#ffffff" />
      <circle cx="39" cy="24" r="4" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.65" />
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
          letterSpacing: "-0.035em",
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
            marginLeft: "0.5px",
          }}
        >
          Meet
        </span>
      </span>
    );
  }

  // Full variant (Icon + Wordmark + Glowing Tag)
  return (
    <div
      className={`syncmeet-logo-full ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${pixelSizes.gap}px`,
        userSelect: "none",
        textDecoration: "none",
        cursor: "pointer",
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
          letterSpacing: "-0.035em",
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
            marginLeft: "0.5px",
          }}
        >
          Meet
        </span>
      </span>
    </div>
  );
};

export default SyncMeetLogo;
