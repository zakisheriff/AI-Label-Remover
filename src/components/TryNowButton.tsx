"use client";

import { usePathname, useRouter } from "next/navigation";
import { GlassButton } from "@zakisheriff/liquid-glass";

/**
 * The "Try now" pill for every page other than the home page, where there is
 * no tool to scroll back to. The home page renders TopAction instead, which
 * morphs between "Star on GitHub" and this same filled blue pill.
 */
export function TryNowButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  return (
    <div className="fixed top-4 right-4 z-40 sm:top-6 sm:right-6">
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
    </div>
  );
}
