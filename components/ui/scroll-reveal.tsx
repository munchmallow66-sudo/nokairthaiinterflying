"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

/**
 * Entrance reveal on scroll. Deliberately animates ONLY transform + opacity:
 * WebKit rasterises `filter: blur()` on every frame, so animating a blur here
 * (43 instances across the site) is what made Safari scrolling stutter. Same
 * reason `once` is true — re-running the reveal on every scroll pass meant the
 * whole page kept re-compositing forever.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 35,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, {
    margin: "-60px 0px -60px 0px",
    once: true,
  });

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { y: distance, x: 0 };
    }
  };

  const initial = prefersReducedMotion
    ? { opacity: 1, x: 0, y: 0 }
    : { opacity: 0, ...getInitialPosition(), scale: 0.96 };
  const settled = { opacity: 1, x: 0, y: 0, scale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView || prefersReducedMotion ? settled : initial}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }
      }
      // will-change only while the reveal is pending; a permanent hint keeps a
      // compositing layer alive for every section on the page.
      style={
        isInView || prefersReducedMotion
          ? undefined
          : { willChange: "transform, opacity" }
      }
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
