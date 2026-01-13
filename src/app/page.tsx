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

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [emailPosition, setEmailPosition] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    const items: GridItem[] = [];
    const totalSquares = 24; // 6x4 grid
    const imageIndices = new Set<number>();
    
    // Randomly select positions for images (we have 10 images, so use all of them)
    while (imageIndices.size < projectImages.length && imageIndices.size < totalSquares) {
      const randomIndex = Math.floor(Math.random() * totalSquares);
      imageIndices.add(randomIndex);
    }
    
    // Shuffle images for random assignment
    const shuffledImages = [...projectImages].sort(() => Math.random() - 0.5);
    const imagePositions = Array.from(imageIndices);
    
    // Create grid items
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Grid */}
      <div className="grid grid-cols-6 grid-rows-4 h-screen w-screen">
        {grid.length > 0 && grid.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const showTooltip = tooltipIndex === index && item.type === "image";
          
          const handleMouseEnter = () => {
            setHoveredIndex(index);
            if (item.type === "image") {
              // Clear any existing timeout
              if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
              }
              // Set tooltip after 1 second
              tooltipTimeoutRef.current = setTimeout(() => {
                setTooltipIndex(index);
              }, 1000);
            }
          };
          
          const handleMouseLeave = () => {
            setHoveredIndex(null);
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = null;
            }
            setTooltipIndex(null);
          };
          
          return (
            <div
              key={index}
              className="relative w-full h-full overflow-visible transition-all duration-300"
              style={{
                opacity: isHovered ? 0.6 : 0,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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
              
              {/* Subtle tooltip */}
              {showTooltip && item.image && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-black/70 text-white text-[10px] px-2 py-1 backdrop-blur-sm w-full h-full flex items-center justify-center opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                    <span className="font-(family-name:--font-pp-neue-montreal-light) text-center">
                      {item.image.tagline}
                    </span>
                  </div>
                </div>
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
