"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

export interface GlobeMarker {
  id: string;
  location: [number, number];
  label: string;
  /** 0–1, scales the marker dot. Defaults to a fixed small size. */
  weight?: number;
  color?: string;
}

export interface GlobeArc {
  id: string;
  from: [number, number];
  to: [number, number];
}

// The brand purple (#8a237f) as cobe's 0-1 RGB triple; cobe takes raw
// numbers, so it cannot read the CSS token the rest of the app uses.
const MARKER: [number, number, number] = [0.54, 0.14, 0.5];

/**
 * Interactive globe for the ancestry section — adapted from the CDN demo
 * globe (src/components/ui/cobe-globe-cdn.tsx) with the demo-only bits
 * removed: no fabricated traffic counters, no spinning pyramid, and the
 * marker/arc colours are the brand's rather than black. Labels are the
 * real data (a region and its percentage, or a haplogroup), and every
 * marker also appears in the list beside the globe so nothing depends on
 * the globe alone being readable. The floating labels use CSS Anchor
 * Positioning, which is Chromium-only today; elsewhere the globe, arcs
 * and drag still work and the list carries the numbers.
 */
export function GlobeAncestry({
  markers,
  arcs = [],
  className = "",
  speed = 0.0025,
  initialPhi = 0.3,
}: {
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  className?: string;
  speed?: number;
  /** Starting rotation, so the relevant hemisphere faces the viewer. */
  initialPhi?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = initialPhi;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi,
        theta: 0.25,
        dark: 0,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness: 9,
        baseColor: [0.97, 0.97, 0.98],
        markerColor: MARKER,
        glowColor: [0.93, 0.93, 0.95],
        markerElevation: 0.02,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.02 + (m.weight ?? 0) * 0.06,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: MARKER,
        arcWidth: 0.6,
        arcHeight: 0.3,
        opacity: 0.85,
      });

      function animate() {
        if (!isPausedRef.current) phi += speed;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.25 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, arcs, speed, initialPhi]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        aria-label="Interactive globe — drag to rotate"
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% -6px",
            pointerEvents: "none",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 6px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <span
            className="rounded-md px-2 py-1 text-[11px] font-bold whitespace-nowrap text-white shadow-md"
            style={{ backgroundColor: m.color ?? "var(--primary)" }}
          >
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
