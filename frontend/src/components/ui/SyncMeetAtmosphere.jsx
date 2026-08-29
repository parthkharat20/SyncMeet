import React, { useEffect, useRef } from "react";

/**
 * SyncMeetAtmosphere — Global Immersive 3D & Network Topology Background
 * 
 * Provides a unified, full-viewport animated communication environment across the entire application.
 * 
 * Variants:
 * - 'landing': Maximum immersion, interactive pointer repulsion, dynamic packet pulses.
 * - 'auth': Medium immersion, calm, trusted atmosphere.
 * - 'dashboard': Subtle, clean workspace hierarchy.
 * - 'history': Subtle/calm, minimal movement.
 * - 'lobby': Medium-low, perimeter atmosphere around camera preview.
 * - 'meeting': Very subtle, subordinate backdrop where video participants remain 100% the focus.
 */
export const SyncMeetAtmosphere = ({
  variant = "landing",
  className = "",
  style = {},
}) => {
  const canvasRef = useRef(null);

  // Variant Configuration
  const config = {
    landing: {
      nodeSpacing: 38,
      nodeColor: "rgba(165, 180, 225, 0.7)",
      activeNodeColor: "rgba(88, 101, 242, 1.0)",
      lineColor: "rgba(88, 101, 242, 0.32)",
      pulseColor: "rgba(140, 170, 255, 0.95)",
      pulseCount: 16,
      maxDistance: 74,
      glowBlur: 10,
      opacity: 1.0,
      interactive: true,
      radialGlowIntensity: 0.22,
    },
    auth: {
      nodeSpacing: 44,
      nodeColor: "rgba(145, 165, 215, 0.55)",
      activeNodeColor: "rgba(88, 101, 242, 0.85)",
      lineColor: "rgba(88, 101, 242, 0.22)",
      pulseColor: "rgba(130, 160, 255, 0.85)",
      pulseCount: 10,
      maxDistance: 70,
      glowBlur: 8,
      opacity: 0.85,
      interactive: true,
      radialGlowIntensity: 0.18,
    },
    dashboard: {
      nodeSpacing: 50,
      nodeColor: "rgba(130, 150, 200, 0.45)",
      activeNodeColor: "rgba(88, 101, 242, 0.75)",
      lineColor: "rgba(88, 101, 242, 0.18)",
      pulseColor: "rgba(120, 150, 245, 0.75)",
      pulseCount: 8,
      maxDistance: 68,
      glowBlur: 6,
      opacity: 0.7,
      interactive: true,
      radialGlowIntensity: 0.14,
    },
    history: {
      nodeSpacing: 52,
      nodeColor: "rgba(120, 140, 190, 0.4)",
      activeNodeColor: "rgba(88, 101, 242, 0.65)",
      lineColor: "rgba(88, 101, 242, 0.15)",
      pulseColor: "rgba(110, 140, 240, 0.65)",
      pulseCount: 6,
      maxDistance: 66,
      glowBlur: 4,
      opacity: 0.6,
      interactive: false,
      radialGlowIntensity: 0.12,
    },
    lobby: {
      nodeSpacing: 48,
      nodeColor: "rgba(135, 155, 205, 0.5)",
      activeNodeColor: "rgba(88, 101, 242, 0.8)",
      lineColor: "rgba(88, 101, 242, 0.2)",
      pulseColor: "rgba(130, 160, 250, 0.8)",
      pulseCount: 8,
      maxDistance: 70,
      glowBlur: 6,
      opacity: 0.75,
      interactive: true,
      radialGlowIntensity: 0.16,
    },
    meeting: {
      nodeSpacing: 60,
      nodeColor: "rgba(100, 120, 170, 0.25)",
      activeNodeColor: "rgba(88, 101, 242, 0.4)",
      lineColor: "rgba(88, 101, 242, 0.08)",
      pulseColor: "rgba(100, 130, 230, 0.4)",
      pulseCount: 4,
      maxDistance: 62,
      glowBlur: 2,
      opacity: 0.35,
      interactive: false,
      radialGlowIntensity: 0.06,
    },
  }[variant] || {
    nodeSpacing: 42,
    nodeColor: "rgba(150, 170, 215, 0.6)",
    activeNodeColor: "rgba(88, 101, 242, 0.9)",
    lineColor: "rgba(88, 101, 242, 0.25)",
    pulseColor: "rgba(135, 165, 250, 0.85)",
    pulseCount: 10,
    maxDistance: 70,
    glowBlur: 6,
    opacity: 0.8,
    interactive: true,
    radialGlowIntensity: 0.16,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let isVisible = true;

    // Accessibility check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pointer state
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let nodes = [];
    let pulses = [];

    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? Math.max(config.nodeSpacing * 1.35, 48) : config.nodeSpacing;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          nodes.push({
            col: i,
            row: j,
            originX: i * spacing,
            originY: j * spacing,
            x: i * spacing,
            y: j * spacing,
            vx: 0,
            vy: 0,
            pulsePhase: Math.random() * Math.PI * 2,
            baseRadius: isMobile ? 1.8 : 2.2,
            highlightTimer: 0,
          });
        }
      }

      // Initialize periodic packet pulses along connections
      pulses = [];
      const pulseTotal = isMobile ? Math.max(Math.floor(config.pulseCount / 2), 3) : config.pulseCount;
      for (let p = 0; p < pulseTotal; p++) {
        const fromIdx = Math.floor(Math.random() * nodes.length);
        pulses.push({
          fromIndex: fromIdx,
          progress: Math.random(),
          speed: 0.35 + Math.random() * 0.45,
          dir: Math.random() > 0.5 ? "down" : "right",
        });
      }
    };

    resize();

    // Visibility Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    const onPointerMove = (e) => {
      if (prefersReducedMotion || !config.interactive) return;
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseleave", onPointerLeave);

    let lastTime = performance.now();

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth pointer physics
      if (config.interactive && !prefersReducedMotion) {
        pointer.x += (pointer.targetX - pointer.x) * 0.14;
        pointer.y += (pointer.targetY - pointer.y) * 0.14;
      }

      ctx.clearRect(0, 0, width, height);

      const timeSec = time * 0.001;
      const hoverRadius = isMobile ? 120 : 180;

      // ─── 1. Update & Draw Grid Connections ───
      ctx.strokeStyle = config.lineColor;
      ctx.lineWidth = 1.1;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          // Pointer interaction physics (repel + spring back)
          if (config.interactive && pointer.active) {
            const dx = node.x - pointer.x;
            const dy = node.y - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hoverRadius && dist > 0) {
              const force = (1 - dist / hoverRadius) * 28;
              const angle = Math.atan2(dy, dx);
              node.vx += Math.cos(angle) * force * delta * 60;
              node.vy += Math.sin(angle) * force * delta * 60;
              node.highlightTimer = 1.0;
            }
          }

          // Spring return to original grid coordinate
          const ox = node.originX - node.x;
          const oy = node.originY - node.y;
          node.vx += ox * 0.1;
          node.vy += oy * 0.1;

          // Damping
          node.vx *= 0.82;
          node.vy *= 0.82;

          node.x += node.vx;
          node.y += node.vy;

          if (node.highlightTimer > 0) {
            node.highlightTimer = Math.max(0, node.highlightTimer - delta * 2);
          }
        }

        // Draw connections to neighboring nodes (Down & Right)
        if (i % rows < rows - 1) {
          const downNode = nodes[i + 1];
          const distDown = Math.hypot(node.x - downNode.x, node.y - downNode.y);
          if (distDown < config.maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(downNode.x, downNode.y);
            ctx.stroke();
          }
        }

        if (i + rows < nodes.length) {
          const rightNode = nodes[i + rows];
          const distRight = Math.hypot(node.x - rightNode.x, node.y - rightNode.y);
          if (distRight < config.maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(rightNode.x, rightNode.y);
            ctx.stroke();
          }
        }
      }

      // ─── 2. Update & Draw Traveling Signal Pulses ───
      if (!prefersReducedMotion && pulses.length > 0) {
        ctx.fillStyle = config.pulseColor;
        ctx.shadowColor = "rgba(88, 101, 242, 0.8)";
        ctx.shadowBlur = config.glowBlur;

        for (let p = 0; p < pulses.length; p++) {
          const pulse = pulses[p];
          pulse.progress += pulse.speed * delta;

          if (pulse.progress >= 1.0) {
            pulse.progress = 0;
            pulse.fromIndex = Math.floor(Math.random() * nodes.length);
            pulse.dir = Math.random() > 0.5 ? "down" : "right";
          }

          const fromNode = nodes[pulse.fromIndex];
          if (!fromNode) continue;

          let targetNode = null;
          if (pulse.dir === "down" && pulse.fromIndex % rows < rows - 1) {
            targetNode = nodes[pulse.fromIndex + 1];
          } else if (pulse.dir === "right" && pulse.fromIndex + rows < nodes.length) {
            targetNode = nodes[pulse.fromIndex + rows];
          }

          if (targetNode) {
            const px = fromNode.x + (targetNode.x - fromNode.x) * pulse.progress;
            const py = fromNode.y + (targetNode.y - fromNode.y) * pulse.progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
      }

      // ─── 3. Draw Nodes with Depth & Glow ───
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearPointer = config.interactive && pointer.active && dist < hoverRadius;

        ctx.beginPath();
        const r = isNearPointer
          ? node.baseRadius * 2.0
          : node.highlightTimer > 0
          ? node.baseRadius * 1.5
          : node.baseRadius;

        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (isNearPointer || node.highlightTimer > 0) {
          ctx.fillStyle = config.activeNodeColor;
          ctx.shadowColor = "rgba(88, 101, 242, 0.85)";
          ctx.shadowBlur = config.glowBlur + 4;
        } else {
          ctx.fillStyle = config.nodeColor;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [variant, config]);

  return (
    <div
      className={`syncmeet-global-atmosphere ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        background: "var(--canvas)",
        opacity: config.opacity,
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Layer 1: Canvas Topology & Signal Mesh */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* Layer 2: Subtle Blurple Atmospheric Light Field */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "600px",
          background: `radial-gradient(ellipse at 50% 30%, rgba(88, 101, 242, ${config.radialGlowIntensity}) 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Secondary Ambient Depth Light */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "800px",
          height: "500px",
          background: `radial-gradient(ellipse at 50% 50%, rgba(0, 176, 244, ${config.radialGlowIntensity * 0.6}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Global Radial Vignette for High Foreground Contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(9, 10, 16, 0.40) 0%, rgba(9, 10, 16, 0.88) 75%, rgba(9, 10, 16, 0.98) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default SyncMeetAtmosphere;
