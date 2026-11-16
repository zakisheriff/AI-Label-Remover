"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassButton } from "@zakisheriff/liquid-glass";

/** Shows once the reader has scrolled past the tool, on the home page only. */
function useScrolledPastTool(active: boolean) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!active) return;

    const handleScroll = () => setIsVisible(window.scrollY > 300);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [active]);

  return isVisible;
}

/**
 * The home page's "Try now" pill. It lives inside the pinned header row rather
 * than floating on its own, so it can never land on top of the GitHub button.
 */
export function TryNowPill() {
  const isVisible = useScrolledPastTool(true);

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "pointer-events-none absolute opacity-0 -translate-y-3"
      }`}
      aria-hidden={!isVisible}
    >
      <GlassButton
        variant="tinted"
        tint="var(--accent)"
        size="sm"
        tabIndex={isVisible ? undefined : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Try now
      </GlassButton>
    </div>
  );
}

/**
 * The same pill for every other page, where there is no tool header to sit in:
 * it floats at the top right and links home.
 */
export function TryNowButton() {
  const pathname = usePathname();
  const router = useRouter();

  // The home page renders its own pill inside the pinned header.
  if (pathname === "/") return null;

  return (
    <div className="fixed top-4 right-4 z-40 sm:top-6 sm:right-6">
      <GlassButton
        variant="tinted"
        tint="var(--accent)"
        href="/"
        onClick={(event) => {
          // Keep client-side navigation for a plain click; let cmd/ctrl or
          // middle clicks fall through to the real anchor.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          router.push("/");
        }}
      >
        Try now
      </GlassButton>
    </div>
  );
}
