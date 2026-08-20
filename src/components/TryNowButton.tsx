"use client";

import { useEffect, useState } from "react";

export function TryNowButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially in case of hard refresh down the page
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-40 cursor-pointer rounded-[35px] bg-[var(--accent)] px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[var(--accent-hover)] active:scale-95 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      Try now
    </button>
  );
}
