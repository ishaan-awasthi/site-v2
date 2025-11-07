"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { ProjectImage } from "../data";

interface FloatingImageProps {
  project: ProjectImage;
}

type DepthLevel = "foreground" | "background";

export default function FloatingImage({ project }: FloatingImageProps) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipBelow, setTooltipBelow] = useState(true);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [targetY, setTargetY] = useState(0);
  const [targetX, setTargetX] = useState(0);
  const [depth, setDepth] = useState<DepthLevel>("background");
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [speedDivisor, setSpeedDivisor] = useState(25);

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080;

  // Generate stable size values only on client
  const [stableValues] = useState(() => ({
    backgroundSize: 60, // Default for SSR
    foregroundSize: 225, // Default for SSR
    backgroundBrightness: 0.91, // Default for SSR
  }));

  // Update random values after mount
  useEffect(() => {
    setMounted(true);
    stableValues.backgroundSize = 40 + Math.random() * 40;
    stableValues.foregroundSize = 150 + Math.random() * 150;
    stableValues.backgroundBrightness = 0.90 + Math.random() * 0.03;
  }, [stableValues]);

  const size = depth === "foreground" ? stableValues.foregroundSize : stableValues.backgroundSize;
  const brightness = depth === "foreground" ? 1.0 : stableValues.backgroundBrightness;
  const zIndex = depth === "foreground" ? 1 : -1;

  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    const animationLoop = async () => {
      while (isMounted) {
        // Wait 3-15 seconds before starting
        const waitTime = 3000 + Math.random() * 12000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        if (!isMounted) break;

        // Randomly choose parameters for this animation
        const chosenDepth: DepthLevel = Math.random() > 0.5 ? "foreground" : "background";
        const chosenSize = chosenDepth === "foreground" ? stableValues.foregroundSize : stableValues.backgroundSize;
        const startSide = Math.random() > 0.5 ? "left" : "right";
        // Add 10% padding from top and bottom
        const yPadding = viewportHeight * 0.1;
        const yRange = viewportHeight * 0.8;
        const y1 = yPadding + Math.random() * yRange;
        const y2 = yPadding + Math.random() * yRange;
        const startX = startSide === "left" ? -chosenSize - 50 : viewportWidth + 50;
        const endX = startSide === "left" ? viewportWidth + 50 : -chosenSize - 50;

        // Add extra delay for foreground images
        if (chosenDepth === "foreground") {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Randomly choose speed (lower divisor = faster)
        const randomSpeed = 30 + Math.random() * 20; // 30-50
        setSpeedDivisor(randomSpeed);

        // Update depth and targets
        setDepth(chosenDepth);
        setTargetX(endX);
        setTargetY(y2);
        setTooltipBelow(y1 < viewportHeight / 2);

        // Calculate duration based on random speed
        const distance = Math.abs(endX - startX);
        const duration = distance / randomSpeed;

        // Set start position
        await controls.set({
          x: startX,
          y: y1,
        });

        setCurrentPosition({ x: startX, y: y1 });
        setIsAnimating(true);

        // Animate to end position
        await controls.start({
          x: endX,
          y: y2,
          transition: {
            duration: duration,
            ease: "linear",
          },
          onUpdate: (latest: any) => {
            if (latest.x !== undefined && latest.y !== undefined) {
              setCurrentPosition({ x: latest.x, y: latest.y });
              setTooltipBelow(latest.y < viewportHeight / 2);
            }
          },
        });

        setIsAnimating(false);
      }
    };

    animationLoop();

    return () => {
      isMounted = false;
    };
  }, [mounted, controls, viewportWidth, viewportHeight, stableValues.foregroundSize, stableValues.backgroundSize]);

  // Handle resuming animation after hover ends (only for foreground)
  useEffect(() => {
    if (!isHovered && isAnimating && depth === "foreground") {
      const resumeAnimation = async () => {
        // Calculate remaining distance and duration using stored speed
        const remainingDistance = Math.sqrt(
          Math.pow(targetX - currentPosition.x, 2) +
          Math.pow(targetY - currentPosition.y, 2)
        );
        const remainingDuration = remainingDistance / speedDivisor;

        // Resume animation to target
        await controls.start({
          x: targetX,
          y: targetY,
          transition: {
            duration: Math.max(remainingDuration, 1),
            ease: "linear",
          },
          onUpdate: (latest: any) => {
            if (latest.x !== undefined && latest.y !== undefined) {
              setCurrentPosition({ x: latest.x, y: latest.y });
              setTooltipBelow(latest.y < viewportHeight / 2);
            }
          },
        });
      };

      resumeAnimation();
    }
  }, [isHovered, isAnimating, depth, controls, targetX, targetY, currentPosition.x, currentPosition.y, speedDivisor, viewportHeight]);

  if (!mounted) {
    return null; // Don't render until mounted to avoid hydration issues
  }

  return (
    <motion.a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed cursor-pointer"
      style={{
        width: size,
        height: size,
        zIndex: zIndex,
        filter: `brightness(${brightness})`,
        pointerEvents: depth === "foreground" ? "auto" : "none",
      }}
      animate={controls}
      initial={{
        x: -stableValues.backgroundSize - 50,
        y: 0,
        opacity: 1,
      }}
      onHoverStart={() => {
        if (depth === "foreground") {
          setIsHovered(true);
          controls.stop();
        }
      }}
      onHoverEnd={() => {
        if (depth === "foreground") {
          setIsHovered(false);
        }
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={`/${project.filename}`}
          alt={project.tagline}
          fill
          className="object-cover rounded-lg shadow-lg"
          sizes={`${stableValues.foregroundSize}px`}
          priority={false}
        />

        {/* Visible tooltip - only for foreground */}
        {depth === "foreground" && (
          <motion.div
            className={`absolute left-1/2 -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg whitespace-nowrap pointer-events-none ${
              tooltipBelow ? "top-full mt-4" : "bottom-full mb-4"
            }`}
            initial={{ opacity: 0, y: tooltipBelow ? -10 : 10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : tooltipBelow ? -10 : 10,
            }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: 9999 }}
          >
            <span className="text-sm font-(family-name:--font-pp-neue-montreal-light)">
              {project.tagline}
            </span>
          </motion.div>
        )}
      </div>
    </motion.a>
  );
}
