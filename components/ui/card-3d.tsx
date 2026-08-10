"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";

interface Card3DProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * Hover-tilt card. The tilt + spotlight are mounted only for fine pointers:
 * on touch (iOS Safari) they can never fire, yet `preserve-3d` and the extra
 * layer still cost a compositing layer per card — and there are dozens.
 */
export function Card3D({
  children,
  className,
  glowColor = "rgba(200, 162, 74, 0.25)",
  ...props
}: Card3DProps) {
  const finePointer = useFinePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);
  // Spotlight rides on translate (composited) instead of rewriting the
  // `background` gradient string, which forces a full repaint every frame.
  const spotlightX = useTransform(mouseX, [-0.5, 0.5], ["-50%", "50%"]);
  const spotlightY = useTransform(mouseY, [-0.5, 0.5], ["-50%", "50%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!finePointer) {
    return (
      <motion.div
        className={cn("relative rounded-2xl group", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-2xl transition-shadow duration-300 group cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Dynamic Mouse Spotlight Glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
        <motion.div
          className="absolute inset-0"
          style={{
            x: spotlightX,
            y: spotlightY,
            background: `radial-gradient(600px circle at center, ${glowColor}, transparent 40%)`,
          }}
        />
      </div>

      {/* Card Content with 3D Depth */}
      <div className="relative z-20 [transform:translateZ(20px)]">{children}</div>
    </motion.div>
  );
}
