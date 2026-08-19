import Image from "next/image";
import Link from "next/link";

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-[15px] leading-[26px] text-[var(--foreground)] [&_a]:text-[var(--link)] [&_a]:underline [&_h2]:mt-10 [&_h2]:text-[19px] [&_h2]:font-semibold [&_h3]:mt-7 [&_h3]:text-[16px] [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold">
      {children}
    </div>
  );
}

export function PageShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-10">
      <Link href="/" aria-label="AI Label Remover home" className="inline-block">
        <Image src="/website-logo.webp" alt="AI Label Remover" width={800} height={490} style={{ height: "44px", width: "auto" }} className="dark:invert" />
      </Link>
      <h1 className="mt-8 text-[28px] font-semibold leading-[36px] tracking-[-0.01em]">{title}</h1>
      <p className="mt-3 text-[15px] leading-[24px] text-[var(--muted)]">{intro}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
