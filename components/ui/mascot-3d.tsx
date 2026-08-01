"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Mascot3DProps {
  src: string;
  alt: string;
  className?: string;
}

export function Mascot3D({ src, alt, className }: Mascot3DProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

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
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["20%", "80%"]);

  // Track global mouse position across hero
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const currentX = (e.clientX - rect.left - rect.width / 2) / (width / 2);
      const currentY = (e.clientY - rect.top - rect.height / 2) / (height / 2);

      x.set(Math.max(-0.5, Math.min(0.5, currentX)));
      y.set(Math.max(-0.5, Math.min(0.5, currentY)));
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [x, y]);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center [perspective:1200px]", className)}>
      
      {/* 1. Dynamic Reactive Ambient Light Aura */}
      <motion.div
        className="absolute -inset-10 rounded-full blur-3xl opacity-60 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(200, 162, 74, 0.45), rgba(10, 35, 66, 0.2) 60%, transparent 80%)`,
        }}
      />

      {/* 2. Floating Particle Sparkles Accent */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-6 -right-6 w-32 h-32 bg-tif-gold/20 rounded-full blur-2xl pointer-events-none"
      />

      {/* 3. 3D Gyro Interactive Card Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 cursor-pointer"
      >
        {/* Continuous Smooth Levitation Animation (Anti-Gravity Float) */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [-1.2, 1.2, -1.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative [transform:translateZ(40px)]"
        >
          {/* Main Mascot Image */}
          <Image
            src={src}
            alt={alt}
            width={480}
            height={480}
            priority
            className="w-auto h-auto max-h-[440px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] hover:scale-[1.04] transition-transform duration-500"
          />

          {/* Interactive Dynamic Ground Contact Shadow */}
          <motion.div
            style={{
              x: shadowX,
              y: shadowY,
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-xl rounded-full -z-10 pointer-events-none"
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
