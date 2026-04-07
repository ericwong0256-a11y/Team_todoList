import type { PropsWithChildren } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AppLogo } from "@/components/ui/AppLogo";

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  /** Wider card for longer forms (e.g. register) */
  wide?: boolean;
  footer?: { label: string; href: string; linkText: string };
}>;

export function AuthPageChrome({ title, subtitle, children, wide, footer }: Props) {
  return (
    <main className="app-page">
      <div className="app-backdrop" aria-hidden />
      <div className="app-grid-bg" aria-hidden />
      <div
        className={`relative mx-auto flex min-h-screen flex-col justify-center px-4 py-14 sm:px-6 ${wide ? "max-w-lg" : "max-w-md"}`}
      >
        <div className="mb-10 text-center">
          <div className="mb-8 flex justify-center">
            <AppLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
        </div>
        <div className="app-card-elevated p-6 sm:p-8">{children}</div>
        {footer ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            {footer.label}{" "}
            <Link href={footer.href as Route} className="font-medium text-cyan-400/95 transition hover:text-cyan-300">
              {footer.linkText}
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
