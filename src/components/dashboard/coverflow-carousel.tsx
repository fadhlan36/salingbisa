"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CoverflowCarouselProps {
  children: React.ReactNode[];
  seeAllHref?: string;
}

const TWEEN_FACTOR_BASE = 0.52;

// Membatasi angka dalam rentang [min, max]
function numberWithinRange(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

export default function CoverflowCarousel({
  children,
  seeAllHref = "/dashboard/explore",
}: CoverflowCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  // Card "See All" ditambahkan otomatis sebagai item terakhir
  const seeAllCard = (
    <Link
      href={seeAllHref}
      className="flex h-full min-h-[220px] w-60 sm:w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center transition-colors hover:bg-slate-100"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <ArrowRight className="h-5 w-5" />
      </div>
      <span className="text-sm font-bold text-slate-800">See All</span>
      <span className="text-xs text-slate-500">
        Lihat semua rekomendasi lainnya
      </span>
    </Link>
  );

  const items = [...children, seeAllCard];
  const totalItems = items.length;

  // Kumpulkan referensi DOM tiap slide, supaya style bisa diupdate langsung
  // tanpa lewat React re-render (jauh lebih smooth saat drag terus-menerus).
  const setTweenNodes = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    tweenNodes.current = emblaApi
      .slideNodes()
      .map((slideNode) =>
        slideNode.querySelector<HTMLElement>(".coverflow-item"),
      )
      .filter((node): node is HTMLElement => node !== null);
  }, []);

  const setTweenFactor = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  // Dipanggil setiap kali posisi scroll berubah (termasuk saat masih
  // di-drag, bukan cuma setelah berhenti/settle) supaya style selalu
  // sinkron dengan posisi asli, tidak ada efek "loncat" di akhir drag.
  const tweenScale = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      const diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (!slidesInView.includes(slideIndex)) return;

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
        const scale = numberWithinRange(tweenValue, 0.75, 1.05).toFixed(3);
        const opacity = numberWithinRange(tweenValue, 0.4, 1).toFixed(3);
        const grayscale = numberWithinRange(1 - tweenValue, 0, 0.9).toFixed(3);

        const node = tweenNodes.current[slideIndex];
        if (!node) return;

        node.style.transform = `scale(${scale})`;
        node.style.opacity = opacity;
        node.style.filter = `grayscale(${Number(grayscale) * 100}%)`;
        node.style.zIndex = String(Math.round(tweenValue * 20));
      });
    });
  }, []);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    setTweenNodes(api);
    setTweenFactor(api);
    tweenScale(api);
    onSelect();

    api
      .on("select", onSelect)
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("reInit", onSelect)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);

    return () => {
      api
        .off("select", onSelect)
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("reInit", onSelect)
        .off("scroll", tweenScale)
        .off("slideFocus", tweenScale);
    };
  }, [api, onSelect, setTweenNodes, setTweenFactor, tweenScale]);

  return (
    <div className="w-full flex flex-col items-center py-6">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: false,
          containScroll: false,
          startIndex: Math.floor(children.length / 2),
        }}
        className="w-full max-w-5xl overflow-hidden py-4"
      >
        <CarouselContent className="-ml-4 sm:-ml-8 flex items-center">
          {items.map((child, index) => (
            <CarouselItem
              key={index}
              className="pl-4 sm:pl-8 basis-auto select-none"
            >
              <div
                className="coverflow-item will-change-transform cursor-grab active:cursor-grabbing"
                style={{
                  transform: "scale(0.75)",
                  opacity: 0.4,
                  filter: "grayscale(90%)",
                }}
                onClick={() => {
                  // Kartu "See All" (item terakhir) sudah jadi <Link> sendiri,
                  // jadi tidak perlu di-scrollTo saat diklik.
                  if (index === totalItems - 1) return;
                  api?.scrollTo(index);
                }}
              >
                {child}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicator Dots */}
      <div className="flex items-center gap-2 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "w-7 bg-[#4f39f6]"
                : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
