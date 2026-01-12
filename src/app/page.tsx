"use client";

import FloatingImage from "./components/FloatingImage";
import { projectImages } from "./data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Floating images */}
      {projectImages.map((project) => (
        <FloatingImage
          key={project.id}
          project={project}
        />
      ))}

      {/* Main content */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div className="relative flex items-center justify-center -mt-16">
          <span className="font-(family-name:--font-pp-neue-montreal-bold) tracking-[-.13em] text-black text-[8rem] md:text-[16rem] lg:text-[26rem] select-none pointer-events-none relative z-0">
            ishaan!
          </span>
          <span className="absolute font-(family-name:--font-windsong) text-white text-[4rem] md:text-[8rem] lg:text-[18rem] select-none pointer-events-none z-10 translate-y-24 -translate-x-6">
            awasthi
          </span>
        </div>

        <div className="font-(family-name:--font-pp-neue-montreal-light) text-black text-sm md:text-2xl lg:text-4xl space-x-4 md:space-x-12 lg:space-x-18 pointer-events-auto">
          <a href="https://www.linkedin.com/in/ishaan-awasthi-2b541227b" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            linkedin
          </a>

          <a href="https://github.com/ishaan-awasthi" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            github
          </a>

          <a href="mailto:ishaanawasthi05@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            email
          </a>

          <a href="https://x.com/veryishaan" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            twitter
          </a>

          <a href="https://www.instagram.com/alsoishaan/" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            instagram
          </a>

          <a href="/everything" className="hover:underline transition-all">
            everything
          </a>
        </div>
      </div>
    </main>
  );
}
