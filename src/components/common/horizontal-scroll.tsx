"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface HorizontalScrollProps {
  children: React.ReactNode;
  scrollAmount?: number;
}

export default function HorizontalScroll({
  children,
  scrollAmount = 320,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateButtons = () => {
    const container = scrollRef.current;

    if (!container) return;

    setShowLeft(container.scrollLeft > 5);

    setShowRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 5,
    );
  };

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateButtons();

    const container = scrollRef.current;

    container?.addEventListener("scroll", updateButtons);

    window.addEventListener("resize", updateButtons);

    return () => {
      container?.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [children]);

  return (
    <div className="relative overflow-visible">
      {showLeft && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-2 inset-y-0 my-auto z-20 rounded-full shadow-md bg-background border cursor-pointer"
          onClick={() => scroll("left")}
        >
          <ChevronLeft />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-visible scroll-smooth scrollbar-hide py-2 px-1"
      >
        {children}
      </div>

      {showRight && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-2 inset-y-0 my-auto z-20 rounded-full shadow-md bg-background border cursor-pointer"
          onClick={() => scroll("right")}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}
