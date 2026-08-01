"use client";

import * as React from "react";
import { motion, useInView, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 35,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    margin: "-60px 0px -60px 0px",
    once: false, // Triggers every time user scrolls up or down!
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

  const initial = getInitialPosition();

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...initial,
        scale: 0.96,
        filter: "blur(8px)",
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              ...initial,
              scale: 0.96,
              filter: "blur(8px)",
            }
      }
      transition={{
        duration: 0.85,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("will-change-[transform,opacity,filter]", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
