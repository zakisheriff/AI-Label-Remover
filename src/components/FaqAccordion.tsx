"use client";

import { useId, useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const id = useId();

  const toggle = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
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
              aria-controls={`${id}-answer-${index}`}
            >
              <span>{item.q}</span>
              <span className={`shrink-0 origin-center text-[18px] text-[var(--muted)] transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? "rotate-45" : "rotate-0"}`}>
                +
              </span>
            </button>
            <div
              id={`${id}-answer-${index}`}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-[260ms] ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="mt-2.5 pb-2 text-[14px] leading-[23px] text-[var(--muted)]">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
