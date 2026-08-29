import React, { useMemo, useId } from "react";
import { cn } from "../../utils/cn";

/**
 * ── The Corridor ────────────────────────────────────────────────
 * Two rails of cards ride from far behind the screen toward the
 * viewer. Perspective alone does the work that looks like two
 * animations: as a card's z grows it gets bigger *and* its screen x
 * sweeps outward from the vanishing point, because the projection
 * scales position and size by the same factor.
 *
 * 1. Depth is authored as apparent size geometrically.
 * 2. Rails open early with fan > 1 and hold.
 * 3. Neither end of the loop is on screen (railBirth is negative).
 * ───────────────────────────────────────────────────────────────
 */

const DEFAULT_PATH = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.8,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

/** Sample the path once so the CSS keyframes trace the real curve. */
function generateKeyframes(dir, name, p) {
  const steps = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;
    const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
    const z = p.perspective * (1 - 1 / scale);
    const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export function ImageStreamHero({
  images = [],
  cards = 9,
  speed = 18,
  axis = 55,
  path = {},
  children,
  className = "",
  style = {},
  ...props
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const rightKeyframe = `ish-r-${id}`;
  const leftKeyframe = `ish-l-${id}`;
  const cardClass = `ish-c-${id}`;

  const p = useMemo(() => ({ ...DEFAULT_PATH, ...path }), [path]);

  const css = useMemo(
    () =>
      `${generateKeyframes(1, rightKeyframe, p)}${generateKeyframes(-1, leftKeyframe, p)}` +
      `@media(prefers-reduced-motion:reduce){.${cardClass}{animation-play-state:paused !important}}`,
    [rightKeyframe, leftKeyframe, cardClass, p]
  );

  return (
    <div
      className={cn("image-stream-hero-container relative overflow-hidden", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        containerType: "inline-size",
        ...style,
      }}
      {...props}
    >
      <style>{css}</style>

      {/* 3D Perspective Viewport */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
        >
          {[
            { name: rightKeyframe, dir: 1 },
            { name: leftKeyframe, dir: -1 },
          ].map(({ name }) =>
            Array.from({ length: cards }, (_, i) => {
              const img = images[i % Math.max(images.length, 1)];
              return (
                <div
                  key={`${name}-${i}`}
                  className={cn(cardClass, "absolute overflow-hidden shadow-2xl")}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: `${axis}%`,
                    width: `${p.cardWidth}cqw`,
                    height: `${p.cardHeight}cqw`,
                    marginLeft: `${-p.cardWidth / 2}cqw`,
                    marginTop: `${-p.cardHeight / 2}cqw`,
                    borderRadius: `${p.cardRadius}cqw`,
                    animation: `${name} ${speed}s linear infinite`,
                    animationDelay: `${-(i * speed) / cards}s`,
                    backfaceVisibility: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(88, 101, 242, 0.2)",
                    background: "var(--surface-indigo)",
                    overflow: "hidden",
                  }}
                >
                  {img ? (
                    <img
                      src={img.src}
                      alt={img.alt || ""}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        userSelect: "none",
                      }}
                      draggable={false}
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Foreground Content Layer */}
      <div style={{ position: "relative", zIndex: 10, height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

export default ImageStreamHero;
