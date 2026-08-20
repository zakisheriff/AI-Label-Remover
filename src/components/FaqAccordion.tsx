"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

type FaqItem = {
  q: string;
  a: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const toggle = (index: number) => {
    const isOpening = activeIndex !== index;

    // 1. Close current active if exists
    if (activeIndex !== null) {
      const activeContent = contentRefs.current[activeIndex];
      const activeIcon = iconRefs.current[activeIndex];
      if (activeContent) {
        gsap.to(activeContent, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.inOut",
        });
      }
      if (activeIcon) {
        gsap.to(activeIcon, {
          rotate: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }

    // 2. Open new index
    if (isOpening) {
      const newContent = contentRefs.current[index];
      const newIcon = iconRefs.current[index];
      if (newContent) {
        gsap.killTweensOf(newContent);
        gsap.fromTo(
          newContent,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
          }
        );
      }
      if (newIcon) {
        gsap.to(newIcon, {
          rotate: 45,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      setActiveIndex(index);
    } else {
      setActiveIndex(null);
    }
  };

  return (
    <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((item, index) => {
        const isOpen = activeIndex === index;
        return (
          <div key={item.q} className="py-4">
            <button
              onClick={() => toggle(index)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-[15px] font-medium focus:outline-none"
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span
                ref={(el) => {
                  iconRefs.current[index] = el;
                }}
                className="text-[var(--muted)] text-[18px] origin-center shrink-0"
              >
                +
              </span>
            </button>
            <div
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <p className="mt-2.5 pb-2 text-[14px] leading-[23px] text-[var(--muted)]">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
