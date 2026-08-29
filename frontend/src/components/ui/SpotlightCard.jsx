import React, { useState, useRef } from "react";

/**
 * SpotlightCard — Interactive 3D Perspective Card with Cursor Spotlight Reflection
 * Provides smooth pointer-driven 3D tilt, depth transforms, and dynamic specular illumination.
 */
export const SpotlightCard = ({
  children,
  className = "",
  style = {},
  spotlightColor = "rgba(88, 101, 242, 0.18)",
  borderColor = "rgba(88, 101, 242, 0.4)",
  tiltDegree = 5,
  interactive = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltDegree;
    const rotateY = ((x - centerX) / centerX) * tiltDegree;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        position: "relative",
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: isHovered
          ? "transform 80ms ease-out, box-shadow 200ms ease"
          : "transform 350ms var(--ease-spring), box-shadow 350ms ease",
        transformStyle: "preserve-3d",
        boxShadow: isHovered
          ? "0 20px 48px rgba(0, 0, 0, 0.65), 0 0 24px rgba(88, 101, 242, 0.15)"
          : "var(--shadow-elevation-1)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      className={`spotlight-card ${className}`}
      {...props}
    >
      {/* 3D Cursor Specular Spotlight Layer */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle 320px at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
            zIndex: 1,
          }}
          aria-hidden="true"
        />
      )}

      {/* 3D Border Glow Reflection */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            inset: "-1px",
            borderRadius: "inherit",
            padding: "1px",
            background: `radial-gradient(circle 240px at ${mousePos.x}px ${mousePos.y}px, ${borderColor}, transparent 70%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            pointerEvents: "none",
            zIndex: 2,
          }}
          aria-hidden="true"
        />
      )}

      {/* Foreground Content */}
      <div style={{ position: "relative", zIndex: 3, height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
