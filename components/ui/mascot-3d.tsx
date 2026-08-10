"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";

interface Mascot3DProps {
  src: string;
  alt: string;
  className?: string;
}

export function Mascot3D({ src, alt, className }: Mascot3DProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const prefersReducedMotion = useReducedMotion();

  // Mouse position motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid 3D movement
  const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

  // 3D Rotations and Parallax Offsets
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["18deg", "-18deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-18deg", "18deg"]);
  const shadowX = useTransform(mouseX, [-0.5, 0.5], ["-20px", "20px"]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], ["30px", "50px"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["-60px", "60px"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["-60px", "60px"]);

  // Track global mouse position across the hero. The element rect is cached and
  // the handler is coalesced into one rAF tick: the previous version called
  // getBoundingClientRect() on every mousemove event, forcing a synchronous
  // layout of the whole page dozens of times a second.
  React.useEffect(() => {
    if (!finePointer) return;

    let rect = containerRef.current?.getBoundingClientRect() ?? null;
    let frame = 0;
    let pending: { clientX: number; clientY: number } | null = null;

    const measure = () => {
      rect = containerRef.current?.getBoundingClientRect() ?? null;
    };

    const apply = () => {
      frame = 0;
      if (!pending || !rect) return;
      const currentX =
        (pending.clientX - rect.left - rect.width / 2) / (window.innerWidth / 2);
      const currentY =
        (pending.clientY - rect.top - rect.height / 2) / (window.innerHeight / 2);
      x.set(Math.max(-0.5, Math.min(0.5, currentX)));
      y.set(Math.max(-0.5, Math.min(0.5, currentY)));
      pending = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      pending = { clientX: e.clientX, clientY: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [finePointer, x, y]);

  const float = prefersReducedMotion
    ? undefined
    : { y: [-10, 10, -10], rotate: [-1.2, 1.2, -1.2] };

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center [perspective:1200px]", className)}>

      {/*
        1. Ambient light aura. Radial gradients are soft by definition, so they
        replace the old "gradient + blur-3xl" layers — a 64px blur that had to be
        re-rasterised every frame while the glow position tracked the pointer.
        The glow now moves with a composited translate instead.
      */}
      <motion.div
        className="absolute -inset-10 rounded-full opacity-60 pointer-events-none z-0 bg-[radial-gradient(closest-side,rgba(200,162,74,0.45),rgba(10,35,66,0.2)_60%,transparent_100%)]"
        style={{ x: glowX, y: glowY }}
      />

      {/* 2. Floating Particle Sparkles Accent */}
      <motion.div
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none bg-[radial-gradient(closest-side,rgba(200,162,74,0.22),transparent_100%)]"
      />

      {/* 3. 3D Gyro Interactive Card Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 cursor-pointer"
      >
        {/* Continuous Smooth Levitation Animation (Anti-Gravity Float) */}
        <motion.div
          animate={float}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative [transform:translateZ(40px)]"
        >
          {/* Main Mascot Image */}
          <Image
            src={src}
            alt={alt}
            width={480}
            height={480}
            priority
            sizes="(max-width: 1024px) 60vw, 480px"
            className="w-auto h-auto max-h-[440px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)]"
          />

          {/* Interactive Dynamic Ground Contact Shadow */}
          <motion.div
            style={{ x: shadowX, y: shadowY }}
            className="absolute bottom-2 left-1/2 -z-10 h-16 w-3/4 pointer-events-none bg-[radial-gradient(closest-side,rgba(0,0,0,0.4),transparent_100%)]"
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
