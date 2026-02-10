"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { projectImages } from "./data";

type GridItem = {
  type: "image" | "color";
  image?: typeof projectImages[0];
  color?: string;
};

const BRIGHT_COLORS = ["#FF0000", "#00FF00", "#00FFFF", "#FFFF00", "#FF00FF", "#FFA500"]; // red, green, aqua, yellow, magenta, orange

// 6x4 grid: edge indices (16 squares) = top row, bottom row, left col middle, right col middle
const EDGE_INDICES = [0, 1, 2, 3, 4, 5, 6, 11, 12, 17, 18, 19, 20, 21, 22, 23];

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [emailPosition, setEmailPosition] = useState<{ left: number; top: number; width: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const gridDataRef = useRef<GridItem[]>([]);

  useEffect(() => {
    gridDataRef.current = grid;
  }, [grid]);

  useEffect(() => {
    const items: GridItem[] = [];
    const totalSquares = 24; // 6x4 grid
    const imageIndices = new Set<number>();

    // Shuffle edge indices and pick positions for images (only on edges, max 10 images)
    const shuffledEdges = [...EDGE_INDICES].sort(() => Math.random() - 0.5);
    const numImages = Math.min(projectImages.length, EDGE_INDICES.length);
    for (let i = 0; i < numImages; i++) {
      imageIndices.add(shuffledEdges[i]);
    }

    // Shuffle images for random assignment to those positions
    const shuffledImages = [...projectImages].sort(() => Math.random() - 0.5);
    const imagePositions = Array.from(imageIndices);

    // Create grid items: middle 8 are always colors; edges are image or color
    for (let i = 0; i < totalSquares; i++) {
      if (imageIndices.has(i)) {
        const imageArrayIndex = imagePositions.indexOf(i);
        items.push({
          type: "image",
          image: shuffledImages[imageArrayIndex],
        });
      } else {
        items.push({
          type: "color",
          color: BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)],
        });
      }
    }

    setGrid(items);
  }, []);

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = gridEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) {
        hoveredIndexRef.current = null;
      } else {
        const col = Math.min(5, Math.max(0, Math.floor((x / rect.width) * 6)));
        const row = Math.min(3, Math.max(0, Math.floor((y / rect.height) * 4)));
        hoveredIndexRef.current = row * 6 + col;
      }

      if (rafIdRef.current == null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          const idx = hoveredIndexRef.current;
          setHoveredIndex(idx);
          const items = gridDataRef.current;
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
          }
          if (idx != null && idx < items.length && items[idx]?.type === "image") {
            tooltipTimeoutRef.current = setTimeout(() => setTooltipIndex(idx), 1000);
          } else {
            setTooltipIndex(null);
          }
        });
      }
    };

    const onMouseLeave = () => {
      hoveredIndexRef.current = null;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setHoveredIndex(null);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
      setTooltipIndex(null);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    gridEl.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      gridEl.removeEventListener("mouseleave", onMouseLeave);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [grid.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-6 grid-rows-4 h-screen w-screen"
      >
        {grid.length > 0 && grid.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const showTooltip = tooltipIndex === index && item.type === "image";

          return (
            <div
              key={index}
              className="relative w-full h-full overflow-visible transition-all duration-300"
              style={{
                opacity: isHovered ? 0.6 : 0,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {item.type === "image" && item.image ? (
                <a
                  href={item.image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <Image
                    src={`/${item.image.filename}`}
                    alt={item.image.tagline}
                    fill
                    className="object-cover"
                    sizes="16.67vw"
                  />
                </a>
              ) : (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              
              {/* Hover overlay: full blur covering whole image */}
              {showTooltip && item.image && (
                <>
                  <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-none z-20 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
                    aria-hidden
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-2">
                    <span
                      className="font-(family-name:--font-pp-neue-montreal-light) text-white text-[10px] text-center max-w-[50%] leading-tight opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
                      style={{ wordBreak: "break-word" }}
                    >
                      {item.image.tagline}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div className="relative flex items-center justify-center -mt-16">
          <Image
            src="/name.svg"
            alt="ishaan awasthi"
            width={1018}
            height={305}
            className="w-[80vw] max-w-[1018px] h-auto select-none pointer-events-none"
            priority
          />
        </div>



        <div className="font-(family-name:--font-pp-neue-montreal-light) text-black text-sm md:text-2xl lg:text-4xl space-x-4 md:space-x-12 lg:space-x-18 pointer-events-auto relative">
          <a href="https://www.linkedin.com/in/ishaan-awasthi-2b541227b" target="_blank" rel="noopener noreferrer" className="relative transition-all hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em]">
            linkedin
          </a>

          <a href="https://github.com/ishaan-awasthi" target="_blank" rel="noopener noreferrer" className="relative transition-all hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em]">
            github
          </a>

          <a
            ref={emailLinkRef}
            href="mailto:ishaanawasthi05@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`relative hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em] ${emailCopied ? "opacity-0 pointer-events-none" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (emailLinkRef.current) {
                const rect = emailLinkRef.current.getBoundingClientRect();
                const parentRect = emailLinkRef.current.parentElement?.getBoundingClientRect();
                if (parentRect) {
                  setEmailPosition({
                    left: rect.left - parentRect.left,
                    top: rect.top - parentRect.top,
                    width: rect.width,
                  });
                }
              }
              navigator.clipboard.writeText("ishaanawasthi05@gmail.com");
              setEmailCopied(true);
              if (emailTimeoutRef.current) {
                clearTimeout(emailTimeoutRef.current);
              }
              emailTimeoutRef.current = setTimeout(() => {
                setEmailCopied(false);
                setEmailPosition(null);
              }, 2000);
            }}
          >
            email
          </a>

          {emailCopied && emailPosition && (
            <span
              className="absolute pointer-events-auto flex items-center justify-center"
              style={{
                left: `${emailPosition.left}px`,
                top: `${emailPosition.top}px`,
                width: `${emailPosition.width}px`,
              }}
            >
              copied!
            </span>
          )}

          <a href="https://x.com/veryishaan" target="_blank" rel="noopener noreferrer" className="relative transition-all hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em]">
            twitter
          </a>

          <a href="https://www.instagram.com/veryishaan/" target="_blank" rel="noopener noreferrer" className="relative transition-all hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em]">
            instagram
          </a>

          <a href="/everything" className="relative transition-all hover:before:content-['('] hover:after:content-[')'] before:absolute before:-left-[0.5em] after:absolute after:-right-[0.5em]">
            everything
          </a>
        </div>
        


      </div>
    </main>
  );
}
