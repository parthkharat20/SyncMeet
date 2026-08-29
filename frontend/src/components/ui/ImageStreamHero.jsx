import React, { useMemo, useId } from "react";
import { cn } from "../../utils/cn";

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

export const DEFAULT_STREAM_IMAGES = [
  {
    src: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Collaboration seascape profile silhouette",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
  },
  {
    src: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure team portrait at dusk",
  },
  {
    src: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
    alt: "Crimson aura gradient",
  },
  {
    src: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Side-profile portrait against a deep backdrop",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
    alt: "Flowing hue gradient",
  },
  {
    src: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Creative brainstorming figure with vibrant clouds",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
  },
  {
    src: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with freedom and creativity",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
    alt: "Layered hero gradient",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
    alt: "Second flowing hue gradient",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-05.png`,
    alt: "Deep moon-toned gradient",
  },
];

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
  images = DEFAULT_STREAM_IMAGES,
  cards = 9,
  speed = 18,
  axis = 50,
  path = {},
  opacity = 1,
  vignette = true,
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
          opacity,
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
                  className={cn(cardClass, "absolute overflow-hidden")}
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
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(88, 101, 242, 0.25)",
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

      {/* High-Contrast Vignette Overlay for Background Depth */}
      {vignette && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(9, 10, 16, 0.72) 0%, rgba(9, 10, 16, 0.88) 60%, rgba(9, 10, 16, 0.98) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      {/* Foreground Content Layer */}
      {children && (
        <div style={{ position: "relative", zIndex: 10, height: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default ImageStreamHero;
