"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function TryNowButton() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHome) {
      // On subpages, the "Try now" link button is visible immediately
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // Show button after scrolling down 300px on the home page
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const baseClasses = `fixed top-4 right-4 sm:top-6 sm:right-6 z-40 cursor-pointer rounded-[35px] bg-[var(--accent)] px-5.5 py-3 text-[14px] font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[var(--accent-hover)] active:scale-95 sm:px-5 sm:py-2.5`;

  if (isHome) {
    return (
      <button
        onClick={scrollToTop}
        className={`${baseClasses} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        Try now
      </button>
    );
  }

  return (
    <Link
      href="/"
      className={`${baseClasses} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      Try now
    </Link>
  );
}
