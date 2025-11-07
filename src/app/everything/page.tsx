"use client";

import { useState } from "react";
import Link from "next/link";

interface Item {
  name: string;
  tooltip: string;
  url: string;
}

// Parse stuff.txt content
const items: Item[] = [
  {
    name: "aband1d",
    tooltip: "find new adventures to explore",
    url: "https://aband1d.com",
  },
  {
    name: "sdcompute",
    tooltip: "a democratized mini supercomputer",
    url: "https://sdcompute.co",
  },
  {
    name: "zenbuddies",
    tooltip: "pitched my app to congress",
    url: "https://www.congressionalappchallenge.us/24-ca14/",
  },
  {
    name: "human capital",
    tooltip: "a dystopian fintech satire that won calhacks",
    url: "https://www.youtube.com/watch?v=t7M319EIn4k&t=2s",
  },
  {
    name: "warriorhacks",
    tooltip: "a new kind of high school hackathon",
    url: "https://warriorhacks.org/",
  },
  {
    name: "oddity",
    tooltip: "an indie rock album about graduating high school",
    url: "https://open.spotify.com/album/0BFrHdIbibaEccqQizGVtP?si=BcAFW0Y-T-qm_Wd39fEdtg",
  },
  {
    name: "poetry",
    tooltip: "poems and writings",
    url: "https://instagram.com/veryishaan",
  },
  {
    name: "COOK",
    tooltip: "a programming language where code looks like recipes",
    url: "https://github.com/ishaan-awasthi/COOK",
  },
  {
    name: "tahoe grad trip",
    tooltip: "a grad trip vlog went wrong",
    url: "https://www.youtube.com/watch?v=_Hy_ZZT1wsY",
  },
  {
    name: "model t",
    tooltip: "a very random car edit",
    url: "https://www.youtube.com/watch?v=9SjjspYzBmE",
  },
];

function ItemLink({ item }: { item: Item }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black underline hover:opacity-70 transition-opacity"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.name}
      </a>

      {isHovered && (
        <div className="absolute left-full -top-1 ml-4 bg-black/90 text-white px-4 py-2 rounded-lg whitespace-nowrap z-50">
          <span className="text-sm font-(family-name:--font-pp-neue-montreal-light)">
            {item.tooltip}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Everything() {
  return (
    <main className="min-h-screen p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-black underline hover:opacity-70 transition-opacity mb-8 inline-block font-(family-name:--font-pp-neue-montreal-light)"
        >
          ← back
        </Link>

        <h1 className="font-(family-name:--font-pp-neue-montreal-bold) text-6xl mb-12 text-black">
          everything
        </h1>

        <div className="space-y-4 font-(family-name:--font-pp-neue-montreal-light) text-xl">
          {items.map((item, index) => (
            <div key={index}>
              <ItemLink item={item} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
