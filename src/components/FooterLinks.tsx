"use client";

import { useState } from "react";
import { InfoModal } from "@/components/InfoModal";

export function FooterLinks() {
  const [activeModal, setActiveModal] = useState<"disclaimer" | "privacy" | null>(null);

  return (
    <>
      Full detail on the{" "}
      <button
        type="button"
        onClick={() => setActiveModal("disclaimer")}
        className="text-[var(--link)] underline cursor-pointer hover:opacity-70 font-normal inline border-none bg-transparent p-0"
      >
        Disclaimer
      </button>{" "}
      page, and on{" "}
      <button
        type="button"
        onClick={() => setActiveModal("privacy")}
        className="text-[var(--link)] underline cursor-pointer hover:opacity-70 font-normal inline border-none bg-transparent p-0"
      >
        Privacy
      </button>
      .

      <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}
