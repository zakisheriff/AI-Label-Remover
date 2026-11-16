"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassButton } from "@zakisheriff/liquid-glass";

export function TryNowButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHome) return;

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

  const show = isHome ? isVisible : true;

  const wrapperClasses = `fixed top-4 right-4 sm:top-6 sm:right-6 z-40 transition-all duration-300 ${
    show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
  }`;

  return (
    <div className={wrapperClasses}>
      {isHome ? (
        <GlassButton variant="filled" tint="var(--accent)" onClick={scrollToTop}>
          Try now
        </GlassButton>
      ) : (
        <GlassButton
          variant="filled"
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
      )}
    </div>
  );
}
