import React, { useEffect, useRef } from "react";

/**
 * KineticMatrix — Premium 21st.dev-Style P2P Mesh Canvas
 * Visualizes real-time WebRTC peer mesh connectivity, animated topology, and node synchronization.
 * Clearly visible Blurple and cool-indigo signal pulses, pointer interaction, IntersectionObserver pause, and reduced-motion support.
 */
export const KineticMatrix = ({
  className = "",
  style = {},
  nodeSpacing = 34,
  nodeColor = "rgba(160, 175, 215, 0.65)",
  activeNodeColor = "rgba(88, 101, 242, 1.0)",
  lineColor = "rgba(88, 101, 242, 0.28)",
  pulseLineColor = "rgba(140, 165, 255, 0.95)",
  maxDistance = 70,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let isVisible = true;

    // Check reduced motion preference
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
    const spacing = isMobile ? Math.max(nodeSpacing * 1.4, 48) : nodeSpacing;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

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
      const pulseCount = isMobile ? 8 : 18;
      for (let p = 0; p < pulseCount; p++) {
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

    // IntersectionObserver to pause rendering when out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const onPointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = e.clientX - rect.left;
      pointer.targetY = e.clientY - rect.top;
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
      pointer.x += (pointer.targetX - pointer.x) * 0.14;
      pointer.y += (pointer.targetY - pointer.y) * 0.14;

      ctx.clearRect(0, 0, width, height);

      const timeSec = time * 0.001;
      const hoverRadius = isMobile ? 120 : 180;

      // ─── 1. Update & Draw Grid Connections ───
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.1;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          // Ambient gentle wave
          const wave = Math.sin(timeSec * 2.0 + node.pulsePhase) * 0.8;

          // Pointer interaction physics (repel + spring back)
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (pointer.active && dist < hoverRadius && dist > 0) {
            const force = (1 - dist / hoverRadius) * 32;
            const angle = Math.atan2(dy, dx);
            node.vx += Math.cos(angle) * force * delta * 60;
            node.vy += Math.sin(angle) * force * delta * 60;
            node.highlightTimer = 1.0;
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
          if (distDown < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(downNode.x, downNode.y);
            ctx.stroke();
          }
        }

        if (i + rows < nodes.length) {
          const rightNode = nodes[i + rows];
          const distRight = Math.hypot(node.x - rightNode.x, node.y - rightNode.y);
          if (distRight < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(rightNode.x, rightNode.y);
            ctx.stroke();
          }
        }
      }

      // ─── 2. Update & Draw Traveling Signal Pulses (WebRTC Packet Simulation) ───
      if (!prefersReducedMotion) {
        ctx.fillStyle = pulseLineColor;
        ctx.shadowColor = "rgba(88, 101, 242, 0.8)";
        ctx.shadowBlur = 6;

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

      // ─── 3. Draw Nodes with Depth and Glow ───
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearPointer = pointer.active && dist < hoverRadius;

        ctx.beginPath();
        const r = isNearPointer
          ? node.baseRadius * 2.0
          : node.highlightTimer > 0
          ? node.baseRadius * 1.5
          : node.baseRadius;

        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (isNearPointer || node.highlightTimer > 0) {
          ctx.fillStyle = activeNodeColor;
          ctx.shadowColor = "rgba(88, 101, 242, 0.85)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = nodeColor;
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
  }, [nodeSpacing, nodeColor, activeNodeColor, lineColor, pulseLineColor, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default KineticMatrix;
